#!/usr/bin/env python3
"""Fix Preparar Upsert: empty uSets causes 'DO UPDATE SET ,updated_at=' syntax error."""
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

code = nodes['Preparar Upsert']['parameters']['jsCode']
print('Code len:', len(code))

old_sql = "const sql='INSERT INTO wa_conversation_state ('+iCols+',updated_at) VALUES ('+iVals+','+now+') ON CONFLICT (phone) DO UPDATE SET '+uSets+',updated_at='+now+';"
new_sql = "const uSetsFull=uSets?uSets+',updated_at='+now:'updated_at='+now;const sql='INSERT INTO wa_conversation_state ('+iCols+',updated_at) VALUES ('+iVals+','+now+') ON CONFLICT (phone) DO UPDATE SET '+uSetsFull+';'"

if old_sql in code:
    code = code.replace(old_sql, new_sql + "';")
    print('Fixed: uSetsFull conditional')
else:
    print('Trying without trailing semicolons...')
    idx = code.find("const sql='INSERT INTO wa_conversation_state")
    if idx >= 0:
        end = code.find("';", idx) + 2
        found = code[idx:end]
        print('Found:', found[:120])
        code = code.replace(found, new_sql + "';")
        print('Fixed via search')
    else:
        print('ERROR: could not find sql line')
        exit(1)

nodes['Preparar Upsert']['parameters']['jsCode'] = code
wf['nodes'] = list(nodes.values())
payload = {
    'name': wf['name'], 'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {}),
    'staticData': wf.get('staticData')
}
api('POST', f'/workflows/{WF_ID}/deactivate')
api('PUT', f'/workflows/{WF_ID}', payload)
api('POST', f'/workflows/{WF_ID}/activate')

wf2    = api('GET', f'/workflows/{WF_ID}')
nodes2 = {n['name']: n for n in wf2['nodes']}
saved  = nodes2['Preparar Upsert']['parameters']['jsCode']
print('Has uSetsFull:', 'uSetsFull' in saved)
print('No bad SET comma:', 'DO UPDATE SET \',updated_at' not in saved)
print('Workflow active:', wf2.get('active'))
