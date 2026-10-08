#!/usr/bin/env python3
"""Kelime paketlerini denetler.

GitHub her kayıtta (push) bunu çalıştırır; Actions sekmesindeki yeşil tik her
şeyin yolunda olduğunu, kırmızı çarpı bir hatayı gösterir. Yerelde:

    python3 tools/validate.py

Kurallar uygulamanın okuma kurallarıyla aynıdır. Hata = uygulama o paketi ya
da kelimeyi kullanamaz. Uyarı = çalışır ama eksik (ör. bir dilde çeviri yok).
"""
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
LANGUAGES = ['tr', 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'zh']
ID_PATTERN = re.compile(r'^[a-z0-9][a-z0-9_-]*$')
SUPPORTED_SCHEMA = 1
IN_ACTIONS = os.environ.get('GITHUB_ACTIONS') == 'true'

errors = 0
warnings = 0


def report(kind, file, message, line=None):
    global errors, warnings
    if kind == 'error':
        errors += 1
    else:
        warnings += 1
    if IN_ACTIONS:
        location = f'file={file}' + (f',line={line}' if line else '')
        print(f'::{kind} {location}::{message}')
    else:
        label = 'HATA' if kind == 'error' else 'uyarı'
        where = f'{file}:{line}' if line else file
        print(f'{label}: {where}: {message}')


def load_json(path):
    full = os.path.join(ROOT, path)
    try:
        with open(full, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        report('error', path, 'dosya bulunamadı')
    except json.JSONDecodeError as e:
        report('error', path, f'JSON bozuk: {e.msg} (sütun {e.colno}). '
               'Genellikle eksik/fazla virgül ya da tırnak işaretidir.', e.lineno)
    return None


def check_text(value, file, where, require_all_languages=True):
    """Dil kodu → metin haritası. Geçerliyse True."""
    if not isinstance(value, dict) or not value:
        report('error', file, f'{where}: dil → metin şeklinde olmalı, ör. {{"tr": "...", "en": "..."}}')
        return False
    usable = {k: v for k, v in value.items() if isinstance(v, str) and v.strip()}
    if not usable:
        report('error', file, f'{where}: boş')
        return False
    unknown = sorted(set(value) - set(LANGUAGES))
    if unknown:
        report('warning', file, f'{where}: tanınmayan dil kodu {unknown} (geçerli: {", ".join(LANGUAGES)})')
    missing = [lang for lang in LANGUAGES if lang not in usable]
    if missing and require_all_languages:
        report('warning', file, f'{where} ({first(usable)}): eksik dil {missing}')
    return True


def first(text):
    return text.get('tr') or text.get('en') or next(iter(text.values()))


def check_pack(path, expected_id):
    pack = load_json(path)
    if pack is None:
        return
    if not isinstance(pack, dict):
        report('error', path, 'paket bir JSON nesnesi olmalı ({ ... })')
        return
    pack_id = str(pack.get('id', '')).strip()
    if not ID_PATTERN.match(pack_id):
        report('error', path, f'geçersiz id "{pack_id}": küçük harf, rakam, - ve _ kullanın')
    elif pack_id != expected_id:
        report('error', path, f'id "{pack_id}", index.json\'daki "{expected_id}" ile aynı olmalı')
    check_text(pack.get('name'), path, 'name')
    if 'drawable' in pack and not isinstance(pack['drawable'], bool):
        report('error', path, 'drawable true ya da false olmalı')

    words = pack.get('words')
    if not isinstance(words, list) or not words:
        report('error', path, 'words listesi boş ya da yok')
        return
    valid = 0
    seen = {}
    for i, item in enumerate(words):
        where = f'words[{i}]'
        if not isinstance(item, dict):
            report('error', path, f'{where}: nesne olmalı')
            continue
        if not check_text(item.get('word'), path, f'{where}.word'):
            continue
        clues = item.get('clues', [])
        if not isinstance(clues, list):
            report('error', path, f'{where}.clues: liste olmalı')
            clues = []
        clues = clues + ([item['clue']] if 'clue' in item else [])
        word = first(item['word'])
        if not clues:
            report('error', path, f'{where} ({word}): ipucu yok (clues ya da clue)')
            continue
        if not all(check_text(c, path, f'{where} ({word}) ipucu') for c in clues):
            continue
        key = (item['word'].get('en') or word).strip().lower()
        if key in seen:
            report('warning', path, f'{where} ({word}): {seen[key]} ile aynı kelime')
        seen[key] = where
        valid += 1
    if valid == 0:
        report('error', path, 'geçerli kelime yok; uygulama bu paketi kullanamaz')


def main():
    index = load_json('index.json')
    if index is None:
        return
    if not isinstance(index, dict) or not isinstance(index.get('packs'), list):
        report('error', 'index.json', '{"schemaVersion": 1, "packs": [...]} biçiminde olmalı')
        return
    version = index.get('schemaVersion')
    if not isinstance(version, int):
        report('error', 'index.json', 'schemaVersion bir tam sayı olmalı')
    elif version > SUPPORTED_SCHEMA:
        report('warning', 'index.json',
               f'schemaVersion {version}: uygulamanın bugünkü sürümleri bu güncellemeyi yok sayar')

    ids = set()
    listed_files = set()
    for i, entry in enumerate(index['packs']):
        if not isinstance(entry, dict):
            report('error', 'index.json', f'packs[{i}]: nesne olmalı')
            continue
        pack_id = str(entry.get('id', '')).strip()
        if not ID_PATTERN.match(pack_id):
            report('error', 'index.json', f'packs[{i}]: geçersiz id "{pack_id}"')
            continue
        if pack_id in ids:
            report('error', 'index.json', f'"{pack_id}" iki kez yazılmış')
        ids.add(pack_id)
        file = str(entry.get('file') or f'packs/{pack_id}.json').strip()
        listed_files.add(os.path.normpath(file))
        if entry.get('enabled', True) is False:
            continue
        check_pack(file, pack_id)

    packs_dir = os.path.join(ROOT, 'packs')
    if os.path.isdir(packs_dir):
        for name in sorted(os.listdir(packs_dir)):
            if name.endswith('.json') and os.path.normpath(f'packs/{name}') not in listed_files:
                report('warning', f'packs/{name}', 'index.json\'da yok; uygulama bu dosyayı görmez')

    print(f'{len(ids)} paket denetlendi: {errors} hata, {warnings} uyarı.')


if __name__ == '__main__':
    main()
    sys.exit(1 if errors else 0)
