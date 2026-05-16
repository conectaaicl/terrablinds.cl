#!/usr/bin/env python3
"""Fix two bugs:
1. 'hola' / greetings don't restart the bot when state is mid-flow
2. Preparar Envio WA sends empty body when sendMessage is null → WA rejects
"""
import json, urllib.request, subprocess

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

# ── Fix 1: Step Handler — add greeting restart at top ─────────────────────────
sh_code = nodes['Step Handler']['parameters']['jsCode']

# Insert after the farewell detection, before currentStep==='nuevo' check
# Current pattern: else if(!buttonId&&/^(gracias|ok|...farewell)$/.test){...}
# We add: else if(!buttonId && /^hola/.test()){restart}
# before: else if(currentStep==='nuevo'||!currentStep)

old_nuevo = "else if(currentStep==='nuevo'||!currentStep){"
new_greeting = (
    "else if(!buttonId&&/^(hola|buenos dias|buenas tardes|buenas noches|buenas|hi|hey|inicio|menu|start)$/i.test(messageText.trim())){"
    "nextStep='tipo_producto';updateData={step:'tipo_producto',medidas_lista:'[]'};"
    "sendMessage=menuProductos(getGreeting());}"
    "\n"
)

if old_nuevo in sh_code:
    sh_code = sh_code.replace(old_nuevo, new_greeting + old_nuevo)
    print('Fix 1 (greeting restart): OK')
else:
    print('ERROR Fix 1: nuevo marker not found')
    exit(1)

# Also add else branch to datos_visita for when all fields already set
# Current datos_visita ends with: else if(!state.direccion){...horario...}
# We add: else{ show horario directly }
old_datos_end = (
    "else if(!state.direccion){"
    "const pts=messageText.split(','),dir=pts[0].trim(),com=(pts[1]||'').trim();"
    "nextStep='seleccion_horario';"
    "updateData={direccion:dir,comuna:com,step:'seleccion_horario'};"
    "const slots=buildSlots(6);"
    "if(slots.length>0){"
    "sendMessage={type:'interactive',interactive:{type:'list',body:{text:'Selecciona un horario\\n\\nDireccion: '+dir+(com?', '+com:'')},action:{button:'Ver horarios',sections:[{title:'Horarios disponibles',rows:slots}]}}};"
    "}else{"
    "sendMessage={type:'text',text:{body:'Para coordinar horario contactanos al +56 9 5527 6636.'}};"
    "}}"
)
new_datos_end = (
    old_datos_end +
    "else{"
    "const slots=buildSlots(6);"
    "if(slots.length>0){"
    "nextStep='seleccion_horario';updateData={step:'seleccion_horario'};"
    "sendMessage={type:'interactive',interactive:{type:'list',body:{text:'Selecciona un horario para tu visita:'},action:{button:'Ver horarios',sections:[{title:'Horarios disponibles',rows:slots}]}}};"
    "}else{"
    "sendMessage={type:'text',text:{body:'Para coordinar horario contactanos al +56 9 5527 6636.'}};"
    "}}"
)

if old_datos_end in sh_code:
    sh_code = sh_code.replace(old_datos_end, new_datos_end)
    print('Fix 1b (datos_visita else fallback): OK')
else:
    print('WARNING Fix 1b: datos_visita pattern not found exactly — skipping (non-critical)')

nodes['Step Handler']['parameters']['jsCode'] = sh_code

# ── Fix 2: Preparar Envío WA — null guard ─────────────────────────────────────
pew_code = nodes['Preparar Envío WA']['parameters']['jsCode']

old_pew = (
    "const payload = {\n"
    "  messaging_product: 'whatsapp',\n"
    "  recipient_type: 'individual',\n"
    "  to: phone,\n"
    "  ...msg\n"
    "};"
)
new_pew = (
    "if(!msg||!msg.type){return[];}\n"
    "const payload = {\n"
    "  messaging_product: 'whatsapp',\n"
    "  recipient_type: 'individual',\n"
    "  to: phone,\n"
    "  ...msg\n"
    "};"
)

if old_pew in pew_code:
    pew_code = pew_code.replace(old_pew, new_pew)
    print('Fix 2 (null guard in Preparar Envio WA): OK')
else:
    # Try compact version
    alt = "const payload = {\n  messaging_product: 'whatsapp',"
    if alt in pew_code:
        idx = pew_code.find('const payload = {')
        pew_code = pew_code[:idx] + "if(!msg||!msg.type){return[];}\n" + pew_code[idx:]
        print('Fix 2 (null guard): OK via prefix insert')
    else:
        print('WARNING Fix 2: payload pattern not found exactly')
        print(repr(pew_code[pew_code.find('const payload'):pew_code.find('const payload')+120]))

nodes['Preparar Envío WA']['parameters']['jsCode'] = pew_code

# ── Validate Step Handler syntax ─────────────────────────────────────────────
with open('/tmp/sh_fix_hola.js', 'w') as f:
    f.write(sh_code)
result = subprocess.run(['node', '--check', '/tmp/sh_fix_hola.js'],
                       capture_output=True, text=True)
if result.returncode != 0:
    print('SYNTAX ERROR in Step Handler:', result.stderr[:400])
    exit(1)
print('Step Handler syntax: OK')

# ── Save ──────────────────────────────────────────────────────────────────────
wf['nodes'] = list(nodes.values())
payload_wf = {
    'name': wf['name'], 'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {}),
    'staticData': wf.get('staticData')
}
api('POST', f'/workflows/{WF_ID}/deactivate')
api('PUT',  f'/workflows/{WF_ID}', payload_wf)
api('POST', f'/workflows/{WF_ID}/activate')

wf2 = api('GET', f'/workflows/{WF_ID}')
print('Workflow active:', wf2.get('active'))
print('Has hola restart:', 'hola|buenos dias' in nodes['Step Handler']['parameters']['jsCode'])
print('Has null guard:', 'if(!msg||!msg.type)' in nodes['Preparar Envío WA']['parameters']['jsCode'])
