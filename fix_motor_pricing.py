#!/usr/bin/env python3
"""Fix motorization pricing in Step Handler."""
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

# ── Fix 1: replace subtipo_motor block ───────────────────────────────────────
start_marker = "else if(currentStep==='subtipo_motor'){"
end_marker   = "else if(currentStep==='subtipo_cierres')"

si = code.find(start_marker)
ei = code.find(end_marker)
if si < 0 or ei < 0:
    # subtipo_mot_roller was already inserted between them
    end_marker2 = "else if(currentStep==='subtipo_mot_roller')"
    ei2 = code.find(end_marker2)
    if si >= 0 and ei2 >= 0:
        ei = ei2
        print('Using subtipo_mot_roller as end marker')
    else:
        print(f'ERROR: si={si} ei={ei} ei2={ei2}')
        exit(1)

old_block = code[si:ei]
print('Old subtipo_motor block length:', len(old_block))

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
    "]}]}}};}}"
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
    "\n"
)

code = code[:si] + new_subtipo_motor + code[ei:]
print('Fix 1 (subtipo_motor): OK')

# ── Fix 2: ensure subtipo_mot_roller step exists ──────────────────────────────
if "currentStep==='subtipo_mot_roller'" not in code:
    anchor = "\nelse if(currentStep==='subtipo_cierres')"
    new_step = (
        "\nelse if(currentStep==='subtipo_mot_roller'){"
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
    if anchor in code:
        code = code.replace(anchor, new_step + anchor)
        print('Fix 2 (subtipo_mot_roller step): OK (new)')
    else:
        print('ERROR Fix 2: anchor not found')
        exit(1)
else:
    print('Fix 2 (subtipo_mot_roller step): already present')

# ── Fix 3: svc_cotizar — handle mot_persianas / mot_metalicas ────────────────
svc_marker = "if(buttonId==='svc_cotizar')"
si3 = code.find(svc_marker)
if si3 < 0:
    print('ERROR Fix 3: svc_cotizar not found')
    exit(1)

# Find the end of this if block — look for the next else if on same level
# The block ends before "else if(buttonId==='svc_visita')"
end_svc = code.find("else if(buttonId==='svc_visita')", si3)
if end_svc < 0:
    print('ERROR Fix 3: svc_visita not found')
    exit(1)

old_svc_block = code[si3:end_svc]
print('Old svc_cotizar block:', repr(old_svc_block[:120]))

new_svc_block = (
    "if(buttonId==='svc_cotizar'){"
    "if(state.subtipo==='mot_persianas'){"
    "nextStep='cotizar_nombre';updateData={step:'cotizar_nombre',tipo_email:'cotizacion',precio_calculado:145000};"
    "sendMessage={type:'text',text:{body:'Motor para Persianas TerraBlinds\\n\\n"
    "*Precio del motor: $145.000*\\n(No incluye la persiana)\\n\\n"
    "Para enviarte la cotizacion necesito tu nombre completo:'}};"
    "}else if(state.subtipo==='mot_metalicas'){"
    "nextStep='cotizar_nombre';updateData={step:'cotizar_nombre',tipo_email:'cotizacion',precio_calculado:580000};"
    "sendMessage={type:'text',text:{body:'Motores para Cortinas Metalicas TerraBlinds\\n\\n"
    "*Motores desde $580.000*\\n(Precio final segun medidas y modelo)\\n\\n"
    "Para enviarte la cotizacion necesito tu nombre completo:'}};"
    "}else{"
    "nextStep='cotizar_medidas';updateData={step:'cotizar_medidas',medidas_lista:'[]'};"
    "sendMessage={type:'text',text:{body:'Cotizador TerraBlinds\\n\\n"
    "Dime las medidas en cm:\\n*ancho x alto*\\n\\nEjemplo: _150x200_'}};"
    "}}"
    "\n  "
)

code = code[:si3] + new_svc_block + code[end_svc:]
print('Fix 3 (svc_cotizar split): OK')

# ── Fix 4: cotizar_medidas — add $130,000 motor surcharge ────────────────────
# Find the pKey line inside cotizar_medidas
pkey_marker = "const pKey=PMAP[state.subtipo]||PMAP[state.producto]||null;"
pi = code.find(pkey_marker)
if pi < 0:
    print('ERROR Fix 4: pKey line not found')
    exit(1)

# Find "let bodyTxt=" which is a few lines below
bodyTxt_marker = "let bodyTxt="
bi = code.find(bodyTxt_marker, pi)
if bi < 0:
    print('ERROR Fix 4: bodyTxt not found after pKey')
    exit(1)

# Find end of the bodyTxt assignment — it ends before the sendMessage= line
sendMsg_marker = "sendMessage={type:'interactive',interactive:{type:'button',body:{text:bodyTxt}"
sm = code.find(sendMsg_marker, bi)
if sm < 0:
    print('ERROR Fix 4: sendMessage marker not found')
    exit(1)

old_calc_block = code[pi:sm]
print('Old calc block:', repr(old_calc_block[:150]))

new_calc_block = (
    "const pKey=PMAP[state.subtipo]||PMAP[state.producto]||null;\n"
    "    const res=pKey?calcPrecio(pKey,dims.w,dims.h):null;\n"
    "    const motorAdd=(state.producto==='motorizacion'&&res&&res.total>0)?130000:0;\n"
    "    const precioFinal=res?(res.total+motorAdd):null;\n"
    "    const medidas=getMedidas();\n"
    "    const num=medidas.length+1;\n"
    "    const med={n:num,w:Math.round(dims.w*100),h:Math.round(dims.h*100),"
    "m2:(dims.w*dims.h).toFixed(2),precio:precioFinal,modelo:state.subtipo||state.producto||'producto'};\n"
    "    medidas.push(med);\n"
    "    updateData={ancho:dims.w,alto:dims.h,medidas_lista:JSON.stringify(medidas),step:'cotizar_mas'};\n"
    "    if(precioFinal)updateData.precio_calculado=precioFinal;\n"
    "    nextStep='cotizar_mas';\n"
    "    let bodyTxt;\n"
    "    if(res&&res.total>0){\n"
    "      if(motorAdd>0){\n"
    "        bodyTxt='Ventana '+num+': *'+med.w+' x '+med.h+' cm*\\nSuperficie: '+med.m2+' m2\\n"
    "Cortina: '+clp(res.total)+' + Motor: $130.000\\n*Total: '+clp(precioFinal)+'* + IVA\\n\\nTienes mas ventanas a cotizar?';\n"
    "      }else{\n"
    "        bodyTxt='Ventana '+num+': *'+med.w+' x '+med.h+' cm*\\nSuperficie: '+med.m2+' m2\\n"
    "Precio estimado: *'+clp(res.total)+'* + IVA\\n\\nTienes mas ventanas a cotizar?';\n"
    "      }\n"
    "    }else{\n"
    "      bodyTxt='Ventana '+num+': *'+med.w+' x '+med.h+' cm* registrada\\n"
    "Precio: consultar (depende del proyecto)\\n\\nTienes mas ventanas a cotizar?';\n"
    "    }\n"
    "    "
)

code = code[:pi] + new_calc_block + code[sm:]
print('Fix 4 (motor surcharge in cotizar_medidas): OK')

# ── Save ──────────────────────────────────────────────────────────────────────
nodes['Step Handler']['parameters']['jsCode'] = code
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
saved  = nodes2['Step Handler']['parameters']['jsCode']
print('\n=== VERIFICATION ===')
print('Has subtipo_mot_roller step :', "currentStep==='subtipo_mot_roller'" in saved)
print('Has $145,000 motor persianas :', '145000' in saved)
print('Has $580,000 metalicas       :', '580000' in saved)
print('Has motorAdd logic           :', 'motorAdd' in saved)
print('Workflow active              :', wf2.get('active'))
