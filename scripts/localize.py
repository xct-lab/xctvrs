"""Generate complete French/English pages from the reviewed public English build."""
from html.parser import HTMLParser
from html import escape
from pathlib import Path
import json
import shutil


def localize(output, source_dir):
    translations = json.loads((source_dir / 'i18n/fr.json').read_text())
    sources = [p for p in output.rglob('*.html') if p.relative_to(output).parts[0] not in ('en', 'fr')]
    missing = set()

    class Translate(HTMLParser):
        def __init__(self, language, path):
            super().__init__(convert_charrefs=True)
            self.language = language
            self.path = path
            self.parts = []

        def text(self, value):
            key = value.strip()
            if not key or self.language == 'en':
                return value
            if key not in translations:
                missing.add(key)
                return value
            return value.replace(key, translations[key], 1)

        def handle_decl(self, decl):
            self.parts.append('<!' + decl + '>')

        def handle_starttag(self, tag, attrs):
            a = dict(attrs)
            if tag == 'html':
                a['lang'] = 'fr-CA' if self.language == 'fr' else 'en-CA'
            for key in ('aria-label', 'alt'):
                if key in a:
                    a[key] = self.text(a[key])
            if tag == 'meta' and a.get('name') == 'description':
                a['content'] = self.text(a['content'])
            if tag == 'link' and a.get('rel') == 'canonical':
                a['href'] = 'https://xctvrs.ca/' + self.language + self.path
            if tag == 'a' and a.get('href', '').startswith('/'):
                a['href'] = '/' + self.language + a['href']
            self.parts.append('<' + tag + ''.join(' ' + k + ('' if v is None else '="' + escape(v, quote=True) + '"') for k, v in a.items()) + '>')

        def handle_endtag(self, tag):
            if tag == 'head':
                for language in ('fr', 'en'):
                    self.parts.append(f'<link rel="alternate" hreflang="{language}-CA" href="https://xctvrs.ca/{language}{self.path}">')
                self.parts.append(f'<link rel="alternate" hreflang="x-default" href="https://xctvrs.ca{self.path}">')
            if tag == 'header':
                self.parts.append(self.switcher())
            # The small 404 page has no header, so it gets a language switch in main.
            if tag == 'main' and self.path == '/404':
                self.parts.append(self.switcher())
            self.parts.append('</' + tag + '>')

        def switcher(self):
            label = 'Langue' if self.language == 'fr' else 'Language'
            return '<nav class="language-switch" aria-label="' + label + '">' + ''.join(
                f'<a href="/{lang}{self.path}?lang={lang}" lang="{lang}" hreflang="{lang}-CA"' + (' aria-current="true"' if lang == self.language else '') + '>' + name + '</a>'
                for lang, name in [('fr', 'Français'), ('en', 'English')]
            ) + '</nav>'

        def handle_data(self, data):
            self.parts.append(escape(self.text(data), quote=False))

        def handle_comment(self, data):
            self.parts.append('<!--' + data + '-->')

    generated = []
    for original in sources:
        relative = original.relative_to(output)
        path = '/' if str(relative) == 'index.html' else '/404' if str(relative) == '404.html' else '/' + relative.parent.as_posix() + '/'
        for language in ('en', 'fr'):
            parser = Translate(language, path)
            parser.feed(original.read_text())
            destination = output / language / relative
            generated.append((destination, ''.join(parser.parts)))
    if missing:
        raise ValueError('Missing French translations: ' + repr(sorted(missing)))
    for destination, markup in generated:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(markup)
    shutil.copy2(source_dir / 'language-worker.js', output / '_worker.js')
    (output / '_routes.json').write_text(json.dumps({'version': 1, 'include': ['/*'], 'exclude': ['/assets/*']}) + '\n')
    print(f'Built {len(generated)} localized pages; no missing translations.')
