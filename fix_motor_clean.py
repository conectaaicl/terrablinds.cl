#!/usr/bin/env python3
"""Clean fix: remove all duplicate motor blocks, rewrite them correctly."""
import json, urllib.request, re

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

# The code is mostly one-per-line separated by \n
# Split into lines for easier manipulation
lines = code.split('\n')
print(f'Total lines: {len(lines)}')
for i,l in enumerate(lines):
    if 'subtipo_motor' in l or 'subtipo_mot_roller' in l:
        print(f'  Line {i}: {l[:80]}')

# Strategy: remove ALL lines containing subtipo_motor or subtipo_mot_roller blocks
# and replace with clean versions inserted at the right position
# "Right position" = after subtipo_toldos block, before subtipo_cierres block

# Find anchor lines
toldos_line  = next((i for i,l in enumerate(lines) if "currentStep==='subtipo_toldos'" in l), -1)
cierres_line = next((i for i,l in enumerate(lines) if "currentStep==='subtipo_cierres'" in l), -1)
print(f'subtipo_toldos at line {toldos_line}, subtipo_cierres at line {cierres_line}')

# Remove all lines that are subtipo_motor or subtipo_mot_roller blocks
clean_lines = []
for i, l in enumerate(lines):
    if "currentStep==='subtipo_motor'" in l or "currentStep==='subtipo_mot_roller'" in l:
        print(f'  Removing line {i}')
        continue
    clean_lines.append(l)

# Find new position for cierres (after removal some lines shifted)
new_cierres_line = next((i for i,l in enumerate(clean_lines) if "currentStep==='subtipo_cierres'" in l), -1)
print(f'After cleanup, subtipo_cierres at line {new_cierres_line}')

# The correct new blocks
new_subtipo_mot_roller = (
    "else if(currentStep==='subtipo_mot_roller'){"
    "const MRMAP={mot_r_screen:'roller_screen',mot_r_blackout:'roller_blackout',"
    "mot_r_duo_tras:'roller_duo_traslucido',mot_r_duo_black:'roller_duo_blackout',mot_r_dual:'roller_dual'};"
    "const MRNAME={mot_r_screen:'Roller Screen Motorizado',mot_r_blackout:'Roller Blackout Motorizado',"
    "mot_r_duo_tras:'Roller Duo Traslucido Motorizado',mot_r_duo_black:'Roller Duo Blackout Motorizado',"
    "mot_r_dual:'Roller Dual Motorizado'};"
    "if(MRMAP[buttonId]){nextStep='servicio';"
    "updateData={step:'servicio',subtipo:MRMAP[buttonId]};"
    "sendMessage=menuServicios(MRNAME[buttonId]);}"
    "else{sendMessage={type:'interactive',interactive:{type:'list',body:{text:"
    "'Selecciona el tipo de Roller Motorizado:'},action:{button:'Ver tipos',sections:[{title:'Tipos de Roller',rows:["
    "{id:'mot_r_screen',title:'Roller Screen',description:'$35.000/m2 + motor $130.000'},"
    "{id:'mot_r_blackout',title:'Roller Blackout',description:'$38.000/m2 + motor $130.000'},"
    "{id:'mot_r_duo_tras',title:'Roller Duo Traslucido',description:'$46.000/m2 + motor $130.000'},"
    "{id:'mot_r_duo_black',title:'Roller Duo Blackout',description:'$52.000/m2 + motor $130.000'},"
    "{id:'mot_r_dual',title:'Roller Dual',description:'$78.000/m2 + motor $130.000'}"
    "]}]}}}};}"
)

new_subtipo_motor = (
    "else if(currentStep==='subtipo_motor'){"
    "if(buttonId==='mot_roller'){nextStep='subtipo_mot_roller';"
    "updateData={step:'subtipo_mot_roller',subtipo:'mot_roller'};"
    "sendMessage={type:'interactive',interactive:{type:'list',body:{text:"
    "'Roller Motorizado\\n\\nSelecciona el tipo de cortina.\\nIncluye cortina + motor ($130.000):'},"
    "action:{button:'Ver tipos',sections:[{title:'Tipos de Roller',rows:["
    "{id:'mot_r_screen',title:'Roller Screen Motorizado',description:'$35.000/m2 + motor $130.000'},"
    "{id:'mot_r_blackout',title:'Roller Blackout Motorizado',description:'$38.000/m2 + motor $130.000'},"
    "{id:'mot_r_duo_tras',title:'Roller Duo Traslucido Motor',description:'$46.000/m2 + motor $130.000'},"
    "{id:'mot_r_duo_black',title:'Roller Duo Blackout Motor',description:'$52.000/m2 + motor $130.000'},"
    "{id:'mot_r_dual',title:'Roller Dual Motorizado',description:'$78.000/m2 + motor $130.000'}"
    "]}]}}};}"
    "else if(buttonId==='mot_persianas'){nextStep='servicio';"
    "updateData={step:'servicio',subtipo:'mot_persianas'};"
    "sendMessage=menuServicios('Persianas Motorizadas');}"
    "else if(buttonId==='mot_metalicas'){nextStep='servicio';"
    "updateData={step:'servicio',subtipo:'mot_metalicas'};"
    "sendMessage=menuServicios('Cortinas Metalicas');}"
    "else{sendMessage={type:'interactive',interactive:{type:'list',body:{text:'Tipo de motorizacion:'},"
    "action:{button:'Ver tipos',sections:[{title:'Motorizacion',rows:["
    "{id:'mot_roller',title:'Roller Motorizado',description:'Cortina + motor desde $130.000'},"
    "{id:'mot_persianas',title:'Persianas Motorizadas',description:'Motor $145.000'},"
    "{id:'mot_metalicas',title:'Cortinas Metalicas',description:'Motores desde $580.000'}"
    "]}]}}}};}"
)

# Insert both new blocks BEFORE subtipo_cierres
clean_lines.insert(new_cierres_line, new_subtipo_motor)
clean_lines.insert(new_cierres_line, new_subtipo_mot_roller)

# Rebuild code
new_code = '\n'.join(clean_lines)

# Verify with node syntax check by writing to file
with open('/tmp/sh_new.js', 'w') as f:
    f.write(new_code)

import subprocess
result = subprocess.run(['node', '--check', '/tmp/sh_new.js'],
                       capture_output=True, text=True)
if result.returncode != 0:
    print('SYNTAX ERROR:', result.stderr[:500])
    exit(1)
print('Syntax OK!')

# Verify all checks
checks = [
    ("subtipo_mot_roller appears once", new_code.count("currentStep==='subtipo_mot_roller'") == 1),
    ("subtipo_motor appears once",      new_code.count("currentStep==='subtipo_motor'") == 1),
    ("145000 present",                  '145000' in new_code),
    ("580000 present",                  '580000' in new_code),
    ("motorAdd present",                'motorAdd' in new_code),
]
for label, ok in checks:
    print(f'  {"OK" if ok else "FAIL"}: {label}')
    if not ok:
        exit(1)

# Save to n8n
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
