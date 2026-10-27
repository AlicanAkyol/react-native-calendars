"""Prepare the recorded native fixture in an existing, disposable RN app."""
import json
from pathlib import Path
import shutil
import subprocess
import sys

here = Path(__file__).resolve().parent
repository = here.parent
app = Path(sys.argv[1]).resolve()
destination = app / 'calendar-evidence'
config_path = app / 'metro.calendar.config.js'
modules = repository / 'node_modules'
if not (app / 'node_modules/react-native').is_dir() or not modules.is_dir():
    raise SystemExit('Install the RN app and calendar repository dependencies first.')
if destination.exists() or config_path.exists():
    raise SystemExit('Refusing to overwrite an existing fixture or Metro config.')
destination.mkdir()
for label, revision in [
    ('Before', '808c6e100511f9adf65b1adec5e5830210f27ef4'),
    ('After', '614e81f'),
]:
    target = destination / ('calendars' + label)
    target.mkdir()
    archive = subprocess.Popen(
        ['git', '-C', str(repository), 'archive', revision, 'src'],
        stdout=subprocess.PIPE,
    )
    subprocess.run(['tar', '-x', '-C', str(target)], stdin=archive.stdout, check=True)
    archive.stdout.close()
    if archive.wait() != 0:
        raise SystemExit('Could not export the recorded revision.')
    (target / 'package.json').write_text(json.dumps({
        'name': 'calendars' + label,
        'main': 'src/index.ts',
    }))
shutil.copyfile(here / 'App.tsx', destination / 'App.tsx')
template = (here / 'metro.config.template.js').read_text()
config_path.write_text(template.replace('__CALENDAR_MODULES__', json.dumps(str(modules))))
print('Prepared', destination)
print('Have your root App re-export ./calendar-evidence/App and use', config_path.name)
