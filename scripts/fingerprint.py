"""Give changed CSS a new URL so browsers cannot reuse an older design."""
from hashlib import sha256


def fingerprint(output):
    source = output / 'assets/site.css'
    data = source.read_bytes()
    name = 'site.' + sha256(data).hexdigest()[:12] + '.css'
    (source.parent / name).write_bytes(data)
    script = source.parent / 'appearance.js'
    script_name = 'appearance.' + sha256(script.read_bytes()).hexdigest()[:12] + '.js'
    (source.parent / script_name).write_bytes(script.read_bytes())
    for page in output.rglob('*.html'):
        markup = page.read_text().replace('/assets/site.css', '/assets/' + name)
        markup = markup.replace('<link rel="stylesheet"', '<script src="/assets/' + script_name + '"></script><link rel="stylesheet"', 1)
        page.write_text(markup)
    print('Stylesheet URL: /assets/' + name)
