#!/usr/bin/env python3
"""
Fix email node output format:
- Preparar Email: return {email, subject, html} directly (not {url,method,body})
  AND return [] (empty) when no email to send so Enviar never fires on skip
- Enviar Email: already reads $json.email, $json.subject, $json.html — correct
"""
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

# Fix 1: return [] instead of {skip:true} so Enviar never fires without email
old_skip = 'if(!se.tipo)return[{json:{skip:true}}];'
new_skip  = 'if(!se.tipo)return[];'
code = code.replace(old_skip, new_skip)
print('Skip fix:', old_skip in code or new_skip in code)

# Fix 2: Change final return to use {email, subject, html} format
# Old: return[{json:{url:MAIL_API,method:'POST',headers:{...},body:JSON.stringify(payload)}}];
# New: return[{json:{email:toEmail, subject, html}}];
old_return = "const payload={to:toEmail,from:FROM,subject,html,replyTo:ADMIN};\nreturn[{json:{url:MAIL_API,method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+MAIL_KEY},body:JSON.stringify(payload)}}];"
new_return = "return[{json:{email:toEmail, subject, html}}];"

if old_return in code:
    code = code.replace(old_return, new_return)
    print('Return format fix: OK (exact match)')
else:
    # Try to find and replace the last return statement
    idx = code.rfind('return[{json:{url:MAIL_API')
    if idx >= 0:
        end = code.find('}];', idx) + 3
        old_block = code[idx:end]
        print('Found old return block:', old_block[:80])
        code = code.replace(old_block, new_return)
        print('Return format fix: OK (partial match)')
    else:
        # Try another variant
        idx2 = code.rfind('const payload=')
        if idx2 >= 0:
            end2 = code.find('}];', idx2) + 3
            old_block2 = code[idx2:end2]
            print('Found payload block:', old_block2[:100])
            code = code.replace(old_block2, new_return)
            print('Return format fix: OK (payload match)')
        else:
            print('WARNING: could not find return statement to fix')
            print('Last 200 chars:', code[-200:])

# Remove the toEmail guard that's now handled by the empty return
old_guard = "\nif(!toEmail)return[{json:{skip:true}}];"
new_guard = "\nif(!toEmail)return[];"
code = code.replace(old_guard, new_guard)

nodes['Preparar Email Confirmacion']['parameters']['jsCode'] = code
print('Code length:', len(code))
print('Last 120 chars:', code[-120:])

wf['nodes'] = list(nodes.values())
payload_wf = {
    'name': wf['name'], 'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {}),
    'staticData': wf.get('staticData')
}
api('POST', f'/workflows/{WF_ID}/deactivate')
result = api('PUT', f'/workflows/{WF_ID}', payload_wf)
api('POST', f'/workflows/{WF_ID}/activate')
print('Active:', result.get('active'))

# Verify
wf2   = api('GET', f'/workflows/{WF_ID}')
nodes2 = {n['name']: n for n in wf2['nodes']}
saved = nodes2['Preparar Email Confirmacion']['parameters']['jsCode']
print('Has correct skip (return[]):', 'if(!se.tipo)return[];' in saved)
print('Returns email/subject/html:', 'email:toEmail' in saved or 'email: toEmail' in saved)
print('No old payload format:', 'const payload=' not in saved)
