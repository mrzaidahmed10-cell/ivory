import os, shutil, glob
root = os.path.dirname(os.path.abspath(__file__))
src, out = f'{root}/src', f'{root}/dist'
os.makedirs(out, exist_ok=True)
css = open(f'{src}/style.css').read().strip()
js = '\n'.join(open(f).read().strip() for f in sorted(glob.glob(f'{src}/js/*.js')))
html = open(f'{src}/template.html').read()
html = html.replace('/*CSS*/', css).replace('/*JS*/', js.replace('</script', '<\\/script'))
open(f'{out}/index.html', 'w').write(html)
for f in ['_worker.js', 'sw.js', 'manifest.json', '_headers', 'icon.svg', 'icon-180.png', 'icon-512.png']:
    shutil.copy(f'{src}/{f}', f'{out}/{f}')
print('built', len(html), 'bytes')
