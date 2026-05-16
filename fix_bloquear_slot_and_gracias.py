#!/usr/bin/env python3
"""Fix Bloquear Slot (reads ctx from wrong node) + Step Handler (gracias = goodbye)."""
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

# ── FIX 1: Bloquear Slot ──────────────────────────────────────────────────────
# Was reading $('Preparar Upsert').first().json.ctx.phone  → ctx doesn't exist there
# Fix: read from $('Step Handler') which has .phone and .blockSlot directly
bs = nodes['Bloquear Slot']
old_q = bs['parameters']['query']
print('OLD Bloquear Slot query:', old_q[:120])

new_bs_query = (
    '={{ '
    '"UPDATE wa_visit_slots SET disponible = FALSE, reservado_para = \'" + '
    '$("Step Handler").first().json.phone + "\' '
    'WHERE disponible = TRUE AND fecha = \'" + '
    '($("Step Handler").first().json.blockSlot ? $("Step Handler").first().json.blockSlot.fecha : "1970-01-01") + '
    '"\'::date AND hora = \'" + '
    '($("Step Handler").first().json.blockSlot ? $("Step Handler").first().json.blockSlot.hora : "00:00") + '
    '"\'::time" '
    '}}'
)
bs['parameters']['query'] = new_bs_query
print('NEW Bloquear Slot query:', new_bs_query[:120])

# ── FIX 2: Step Handler — detect farewell words, reply with goodbye ───────────
sh = nodes['Step Handler']
code = sh['parameters']['jsCode']

# The farewell check goes right after the 'fin' buttonId check
# Current code has this pattern:
old_snip = "else if(buttonId==='fin'){nextStep='nuevo';updateData={step:'nuevo'};sendMessage={type:'text',text:{body:'Hasta luego! Cuando necesites escribe *hola* y estare aqui.'}};}'"
# Actually find the exact string
fin_old = "else if(buttonId==='fin'){nextStep='nuevo';updateData={step:'nuevo'};sendMessage={type:'text',text:{body:'Hasta luego! Cuando necesites escribe *hola* y estare aqui.'}};}"
farewell_new = (
    "else if(buttonId==='fin'){nextStep='nuevo';updateData={step:'nuevo'};"
    "sendMessage={type:'text',text:{body:'Hasta luego! Cuando necesites escribe *hola* y estare aqui.'}};}\n"
    "else if(!buttonId&&/^(gracias|ok gracias|muchas gracias|perfecto|listo|excelente|genial|de acuerdo|ok|chao|adios|adiós|bye|hasta luego|hasta pronto|todo bien)$/i.test(messageText.trim())){"
    "nextStep='nuevo';updateData={step:'nuevo'};"
    "sendMessage={type:'text',text:{body:'De nada! Cuando necesites mas informacion o quieras cotizar, escríbeme. ¡Hasta pronto!'}};"
    "}"
)

if fin_old in code:
    code = code.replace(fin_old, farewell_new)
    print('\nFarewell detection: ADDED')
else:
    # Try to find it differently
    idx = code.find("else if(buttonId==='fin')")
    if idx >= 0:
        # Find the closing }; of that block
        block_end = code.find('};}\n', idx)
        if block_end > 0:
            old_block = code[idx:block_end+4]
            print('Found fin block:', old_block[:80])
            code = code.replace(old_block, old_block + '\n' +
                "else if(!buttonId&&/^(gracias|ok gracias|muchas gracias|perfecto|listo|excelente|genial|de acuerdo|ok|chao|adios|adiós|bye|hasta luego|hasta pronto|todo bien)$/i.test(messageText.trim())){"
                "nextStep='nuevo';updateData={step:'nuevo'};"
                "sendMessage={type:'text',text:{body:'De nada! Cuando necesites mas informacion o quieras cotizar, escríbeme. ¡Hasta pronto!'}};}"
            )
            print('Farewell detection: ADDED (via index)')
        else:
            print('WARNING: could not find end of fin block')
    else:
        print('WARNING: could not find fin buttonId check')

sh['parameters']['jsCode'] = code

# ── SAVE ──────────────────────────────────────────────────────────────────────
wf['nodes'] = list(nodes.values())
payload = {
    'name': wf['name'],
    'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {}),
    'staticData': wf.get('staticData')
}

api('POST', f'/workflows/{WF_ID}/deactivate')
result = api('PUT', f'/workflows/{WF_ID}', payload)
api('POST', f'/workflows/{WF_ID}/activate')
print('\nActive:', result.get('active', '?'))

# ── VERIFY ────────────────────────────────────────────────────────────────────
wf2   = api('GET', f'/workflows/{WF_ID}')
nodes2 = {n['name']: n for n in wf2['nodes']}

saved_bs_q = nodes2['Bloquear Slot']['parameters']['query']
print('Saved Bloquear Slot query:', saved_bs_q[:120])

saved_code = nodes2['Step Handler']['parameters']['jsCode']
has_farewell = 'gracias|ok gracias' in saved_code
print('Farewell check in Step Handler:', has_farewell)
print('\nAll fixes applied OK' if (saved_bs_q == new_bs_query and has_farewell) else 'WARNING: check output')
