#!/usr/bin/env python3
"""Fix Preparar Upsert - replace entire last 2 lines with correct JS."""
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
code  = nodes['Preparar Upsert']['parameters']['jsCode']

# Replace everything from const iCols= to the end with correct version
cutpoint = code.find('\nconst iCols=')
if cutpoint < 0:
    cutpoint = code.find('const iCols=')
    if cutpoint < 0:
        print('ERROR: cannot find iCols line')
        print(repr(code[-300:]))
        exit(1)

prefix = code[:cutpoint]
new_tail = """
const iCols=vals.map(v=>v[0]).join(','),iVals=vals.map(v=>v[1]).join(','),uSets=vals.filter(v=>v[0]!=='phone').map(v=>v[0]+'='+v[1]).join(',');
const uSetsFull=uSets ? uSets+',updated_at='+now : 'updated_at='+now;
const sql='INSERT INTO wa_conversation_state ('+iCols+',updated_at) VALUES ('+iVals+','+now+') ON CONFLICT (phone) DO UPDATE SET '+uSetsFull+';';
return [{json:{sql,phone}}];"""

code = prefix + new_tail
print('New tail:')
print(code[-250:])


nodes['Preparar Upsert']['parameters']['jsCode'] = code
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

wf2    = api('GET', f'/workflows/{WF_ID}')
nodes2 = {n['name']: n for n in wf2['nodes']}
saved  = nodes2['Preparar Upsert']['parameters']['jsCode']
print('Has uSetsFull:', 'uSetsFull' in saved)
print('Workflow active:', wf2.get('active'))
print('Last 200:', saved[-200:])
