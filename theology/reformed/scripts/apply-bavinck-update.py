#!/usr/bin/env python3
"""Replace the existing Bavinck book entry in data/books.json and validate JSON.
Run this script from the repository root after copying this pack's files into the repo.
"""
import json
from pathlib import Path

ROOT = Path.cwd()
books_path = ROOT / 'data' / 'books.json'
replacement_path = ROOT / 'data' / 'books.bavinck.replacement.json'
quotes_path = ROOT / 'data' / 'quotes' / 'bavinck-reformed-dogmatics.json'

books = json.loads(books_path.read_text(encoding='utf-8'))
replacement = json.loads(replacement_path.read_text(encoding='utf-8'))

if not isinstance(books, list):
    raise SystemExit('data/books.json must be a JSON array')

found = False
for i, item in enumerate(books):
    if item.get('id') == replacement['id']:
        books[i] = replacement
        found = True
        break

if not found:
    books.append(replacement)

books_path.write_text(json.dumps(books, ensure_ascii=False, indent=2) + '
', encoding='utf-8')
json.loads(books_path.read_text(encoding='utf-8'))
json.loads(replacement_path.read_text(encoding='utf-8'))
json.loads(quotes_path.read_text(encoding='utf-8'))
print('Updated data/books.json with Bavinck replacement entry.')
