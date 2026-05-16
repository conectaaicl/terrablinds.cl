#!/usr/bin/env python3
"""Fix Guardar Estado DB to use the SQL from Preparar Upsert."""
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

# Print full current query of Guardar Estado DB
g = nodes['Guardar Estado DB']
current_query = g['parameters'].get('query', '')
print('=== CURRENT Guardar Estado DB QUERY ===')
print(repr(current_query))
print()
print('LENGTH:', len(current_query))

# Print Preparar Upsert jsCode to understand what it outputs
p = nodes['Preparar Upsert']
print('\n=== PREPARAR UPSERT full jsCode ===')
print(p['parameters'].get('jsCode', ''))
