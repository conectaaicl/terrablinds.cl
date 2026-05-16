#!/usr/bin/env python3
"""Remove duplicate subtipo_cierres block."""
import json, urllib.request

N8N_API = 'http://127.0.0.1:5678/api/v1'
N8N_KEY = 'n8n_api_81f165083b2718697b35a9bfc5f75263ba645082b7fc6ff0'
WF_ID   = 'n8WMvyVqVj2Q9Ya0'

def api(method, path, data=None):
    url  = N8N_API + path
    body = json.dumps(data).encode() if data else None
    req  = urllib.request.Request(url, data=body, method=method,
           headers={'X-N8N-API-KEY': N8N_KEY, 'Content-Type':'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

wf    = api('GET', f'/workflows/{WF_ID}')
nodes = {n['name']: n for n in wf['nodes']}
code  = nodes['Step Handler']['parameters']['jsCode']

lines = code.split('\n')
print(f'Total lines: {len(lines)}')

# Find all subtipo_cierres lines
cierres_lines = [i for i,l in enumerate(lines) if "currentStep==='subtipo_cierres'" in l]
print(f'subtipo_cierres at lines: {cierres_lines}')

if len(cierres_lines) < 2:
    print('No duplicate found, nothing to do.')
    exit(0)

# Remove all but the first occurrence
# Also remove the empty lines directly after duplicates
to_remove = set()
for idx in cierres_lines[1:]:  # keep first, remove rest
    to_remove.add(idx)
    # Remove empty lines immediately after
    if idx+1 < len(lines) and lines[idx+1].strip() == '':
        to_remove.add(idx+1)

print(f'Removing lines: {sorted(to_remove)}')
clean_lines = [l for i,l in enumerate(lines) if i not in to_remove]
new_code = '\n'.join(clean_lines)

# Verify
cierres_after = new_code.count("currentStep==='subtipo_cierres'")
print(f'subtipo_cierres count after: {cierres_after}')
if cierres_after != 1:
    print('ERROR: expected exactly 1')
    exit(1)

# Syntax check
import subprocess, tempfile, os
tmp = tempfile.mktemp(suffix='.js')
with open(tmp, 'w') as f:
    f.write(new_code)
res = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
os.unlink(tmp)
if res.returncode != 0:
    print('SYNTAX ERROR:', res.stderr[:400])
    exit(1)
print('Syntax OK!')

# Save
nodes['Step Handler']['parameters']['jsCode'] = new_code
wf['nodes'] = list(nodes.values())
payload = {
    'name': wf['name'], 'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {}),
    'staticData': wf.get('staticData')
}
api('POST', f'/workflows/{WF_ID}/deactivate')
api('PUT',  f'/workflows/{WF_ID}', payload)
api('POST', f'/workflows/{WF_ID}/activate')
print('Saved and activated!')

wf2 = api('GET', f'/workflows/{WF_ID}')
print('Workflow active:', wf2.get('active'))
