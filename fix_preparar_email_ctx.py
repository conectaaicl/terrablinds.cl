#!/usr/bin/env python3
"""Fix Preparar Email Confirmacion: read ctx from Step Handler, not from $json (Bloquear Slot output)."""
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

code = nodes['Preparar Email Confirmacion']['parameters']['jsCode']
print('Old first line:', code[:80])

# The fix: replace the first line that reads ctx from $json
# Old: const ctx=$json.ctx||$json,se=ctx.sendEmail||{};
# New: read ctx from Step Handler output (which always has ctx with sendEmail)
old_first = 'const ctx=$json.ctx||$json,se=ctx.sendEmail||{};'
new_first = 'const sh=$("Step Handler").first().json,ctx=sh.ctx||sh,se=ctx.sendEmail||{};'

if old_first in code:
    code = code.replace(old_first, new_first)
    print('Fixed: ctx now reads from Step Handler')
else:
    print('WARNING: could not find expected first line, trying partial...')
    # Try to find the pattern
    idx = code.find('const ctx=')
    if idx >= 0:
        end = code.find(';', idx) + 1
        old_line = code[idx:end]
        print('Found:', old_line)
        code = code.replace(old_line, new_first)
        print('Fixed via partial match')
    else:
        print('ERROR: could not find ctx assignment')

nodes['Preparar Email Confirmacion']['parameters']['jsCode'] = code
print('New first line:', code[:120])

wf['nodes'] = list(nodes.values())
payload = {
    'name': wf['name'], 'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {}),
    'staticData': wf.get('staticData')
}
api('POST', f'/workflows/{WF_ID}/deactivate')
result = api('PUT', f'/workflows/{WF_ID}', payload)
api('POST', f'/workflows/{WF_ID}/activate')
print('Active:', result.get('active'))

# Verify
wf2   = api('GET', f'/workflows/{WF_ID}')
nodes2 = {n['name']: n for n in wf2['nodes']}
saved = nodes2['Preparar Email Confirmacion']['parameters']['jsCode']
print('Has Step Handler ref:', '$("Step Handler")' in saved)
print('Old ref gone:', 'const ctx=$json.ctx||$json' not in saved)
print('OK' if '$("Step Handler")' in saved else 'FAILED')
