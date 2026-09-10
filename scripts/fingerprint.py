"""Give changed CSS a new URL so browsers cannot reuse an older design."""
from hashlib import sha256


def fingerprint(output):
    source = output / 'assets/site.css'
    data = source.read_bytes()
    name = 'site.' + sha256(data).hexdigest()[:12] + '.css'
    (source.parent / name).write_bytes(data)
    for page in output.rglob('*.html'):
        page.write_text(page.read_text().replace('/assets/site.css', '/assets/' + name))
    print('Stylesheet URL: /assets/' + name)
