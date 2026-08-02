// ─────────────────────────────────────────────────────────────────────────
// CIUDADES — Agregar nueva ciudad aquí
//
// Instrucciones:
//   1. Copia un bloque existente (p.ej. 'maipu') y cambia los datos
//   2. El slug debe ser en minúsculas y guiones (ej: 'san-bernardo')
//   3. Agrega la URL en backend/src/routes/seo.routes.js (para el sitemap)
//   4. Ejecuta: npm run build  y luego  docker compose build frontend && up -d frontend
// ─────────────────────────────────────────────────────────────────────────

const CIUDADES = {
  'santiago': {
    nombre: 'Santiago',
    slug: 'santiago',
    zona: 'Santiago Centro, Ñuñoa, Recoleta, Independencia y comunas aledañas',
    region: 'Región Metropolitana',
    descripcion: 'Somos líderes en fabricación e instalación de cortinas roller y persianas en Santiago. Atendemos hogares y empresas en todo el Gran Santiago con medición sin costo, fabricación propia y garantía de instalación.',
    destacados: [
      'Atención en toda la Región Metropolitana',
      'Más de 500 proyectos instalados en Santiago',
      'Técnicos propios en sector norte, sur, oriente y poniente',
      'Visita de medición sin costo a domicilio',
    ],
    faq: [
      { q: '¿Instalan en todo Santiago?', a: 'Sí, cubrimos todas las comunas del Gran Santiago incluyendo el centro y la periferia. El traslado no tiene costo adicional.' },
      { q: '¿Cuánto tarda la instalación en Santiago?', a: 'Una vez fabricadas (5-7 días hábiles), la instalación en Santiago toma entre 1 y 3 horas según la cantidad de ventanas.' },
      { q: '¿Dan garantía de instalación?', a: 'Sí, todas nuestras instalaciones en Santiago tienen 12 meses de garantía en materiales y mano de obra.' },
      { q: '¿Puedo pedir una cotización online para Santiago?', a: 'Sí, completa el formulario de cotización y un asesor de Santiago te contacta en menos de 24 horas.' },
    ],
    waMsg: 'Hola! Quisiera cotizar cortinas para mi hogar en Santiago',
  },
  'providencia': {
    nombre: 'Providencia',
    slug: 'providencia',
    zona: 'Providencia, Ñuñoa y sector oriente',
    region: 'Región Metropolitana',
    descripcion: 'En Providencia instalamos cortinas roller, persianas y toldos a medida en departamentos y casas del sector oriente. Trabajamos con acabados premium ideales para los interiores modernos y de diseño de la zona.',
    destacados: [
      'Especialistas en departamentos y edificios de Providencia',
      'Acabados premium para interiores de diseño',
      'Instalación discreta y sin daños a muros',
      'Cortinas blackout y sunscreen para alta densidad urbana',
    ],
    faq: [
      { q: '¿Instalan en edificios de Providencia?', a: 'Sí, tenemos amplia experiencia en instalación en departamentos y torres de Providencia, coordinando con la administración si es necesario.' },
      { q: '¿Qué cortinas recomiendas para Providencia?', a: 'Para el sector oriente recomendamos roller sunscreen para mantener la vista al exterior con filtro solar, o blackout para dormitorios en edificios con mucha iluminación exterior.' },
      { q: '¿Hacen medición en Providencia?', a: 'Sí, la visita de medición es sin costo. Nuestro técnico va a tu departamento o casa en Providencia en el horario que elijas.' },
    ],
    waMsg: 'Hola! Quisiera cotizar cortinas para mi departamento en Providencia',
  },
  'las-condes': {
    nombre: 'Las Condes',
    slug: 'las-condes',
    zona: 'Las Condes, Vitacura, Lo Barnechea y sector oriente alto',
    region: 'Región Metropolitana',
    descripcion: 'Las Condes es una de nuestras comunas de mayor actividad. Instalamos cortinas roller, persianas de madera, toldos y sistemas de automatización en casas, departamentos y oficinas del sector oriente alto de Santiago.',
    destacados: [
      'Amplia experiencia en casas y departamentos de alto estándar',
      'Sistemas de motorización y domótica disponibles',
      'Materiales premium: telas blackout, screen y decorativas',
      'Proyectos residenciales y corporativos en el sector oriente',
    ],
    faq: [
      { q: '¿Instalan motorización en Las Condes?', a: 'Sí, ofrecemos cortinas motorizadas con WiFi, control por app y compatibles con Alexa y Google Home para hogares en Las Condes.' },
      { q: '¿Trabajan con empresas en Las Condes?', a: 'Sí, tenemos experiencia en proyectos corporativos: oficinas, clínicas y locales comerciales en toda la zona de Las Condes.' },
      { q: '¿Cuánto cuesta instalar cortinas en Las Condes?', a: 'Depende del tipo y cantidad. Solicita una cotización online o agenda una visita sin costo para recibir un presupuesto exacto.' },
    ],
    waMsg: 'Hola! Quisiera cotizar cortinas para mi casa en Las Condes',
  },
  'maipu': {
    nombre: 'Maipú',
    slug: 'maipu',
    zona: 'Maipú, Pudahuel, Cerrillos y sector poniente',
    region: 'Región Metropolitana',
    descripcion: 'Instalamos cortinas roller y persianas en toda la zona poniente de Santiago, incluyendo Maipú. Ofrecemos los mejores precios del sector con fabricación propia y garantía de calidad en materiales y mano de obra.',
    destacados: [
      'Cobertura en toda la zona poniente de Santiago',
      'Precios directos de fábrica sin intermediarios',
      'Instaladores propios con experiencia en Maipú',
      'Cortinas roller para casas, condominios y locales',
    ],
    faq: [
      { q: '¿Tienen instaladores en Maipú?', a: 'Sí, contamos con técnicos en la zona poniente que atienden Maipú y comunas cercanas sin costo de traslado adicional.' },
      { q: '¿Qué cortinas son mejores para las casas de Maipú?', a: 'Para casas con mucha luz solar en la zona poniente recomendamos sunscreen o blackout según la orientación de las ventanas.' },
      { q: '¿Cuánto demora el pedido en Maipú?', a: 'Desde la medición, la fabricación tarda 5-7 días hábiles. Luego coordinamos la instalación en Maipú en el horario que te convenga.' },
    ],
    waMsg: 'Hola! Quisiera cotizar cortinas para mi casa en Maipú',
  },
  'colina': {
    nombre: 'Colina',
    slug: 'colina',
    zona: 'Colina, Chicureo, Valle Grande y sector norte',
    region: 'Región Metropolitana',
    descripcion: 'Atendemos Colina, Chicureo y los condominios del sector norte de Santiago. Con el crecimiento de la zona hemos instalado cientos de proyectos en casas, condominios cerrados y oficinas de la zona.',
    destacados: [
      'Especialistas en condominios cerrados de Chicureo y Colina',
      'Amplia experiencia en casas nuevas y en entrega',
      'Cortinas, toldos y cierres de terraza para exterior',
      'Instalación en proyectos inmobiliarios y constructoras',
    ],
    faq: [
      { q: '¿Llegan a Chicureo y Colina?', a: 'Sí, tenemos cobertura en toda la zona norte incluyendo Chicureo, Valle Grande, Los Trapenses y el centro de Colina.' },
      { q: '¿Trabajan con constructoras en Colina?', a: 'Sí, tenemos acuerdos con proyectos inmobiliarios para equipar las unidades antes de la entrega a los propietarios.' },
      { q: '¿Tienen cierres de terraza para casas en Colina?', a: 'Sí, instalamos cierres de terraza en PVC y cristal, ideales para los patios y jardines de las casas de Chicureo y Colina.' },
    ],
    waMsg: 'Hola! Quisiera cotizar cortinas para mi casa en Colina / Chicureo',
  },
  'vitacura': {
    nombre: 'Vitacura',
    slug: 'vitacura',
    zona: 'Vitacura, Lo Curro y Las Condes alto',
    region: 'Región Metropolitana',
    descripcion: 'En Vitacura nos especializamos en proyectos de alta gama. Instalamos cortinas roller con telas importadas, persianas de madera natural, sistemas motorizados y toldos de diseño para casas de estándar premium.',
    destacados: [
      'Telas importadas y materiales de primera línea',
      'Motorización completa con app y domótica',
      'Diseño personalizado para cada proyecto',
      'Asesoría de interiorismo incluida en la visita',
    ],
    faq: [
      { q: '¿Tienen productos premium para Vitacura?', a: 'Sí, importamos telas de alta gama y trabajamos con acabados de aluminio anodizado y sistemas de motorización silenciosa para proyectos en Vitacura.' },
      { q: '¿Ofrecen asesoría de diseño?', a: 'Sí, en la visita de medición nuestro asesor te ayuda a elegir el tipo de cortina, tela y color que mejor complementa tu decoración.' },
      { q: '¿Cuánto cuesta un proyecto de cortinas en Vitacura?', a: 'Cada proyecto es único. Agenda una visita sin costo para recibir una cotización detallada según tus ventanas y preferencias.' },
    ],
    waMsg: 'Hola! Quisiera cotizar cortinas premium para mi casa en Vitacura',
  },
  'vina-del-mar': {
    nombre: 'Viña del Mar',
    slug: 'vina-del-mar',
    zona: 'Viña del Mar, Valparaíso, Concón y V Región',
    region: 'Valparaíso',
    descripcion: 'Llegamos a Viña del Mar y la V Región con el mismo estándar de calidad que en Santiago. Instalamos cortinas roller, persianas y toldos a medida en departamentos frente al mar, casas y proyectos residenciales de la zona costera.',
    destacados: [
      'Materiales resistentes al ambiente marino y humedad costera',
      'Instalación en departamentos con vista al mar',
      'Toldos y cortinas para terrazas costeras',
      'Visita de medición sin costo en Viña y Valparaíso',
    ],
    faq: [
      { q: '¿Instalan en Viña del Mar y Valparaíso?', a: 'Sí, cubrimos toda la zona costera de la V Región: Viña del Mar, Valparaíso, Concón, Quilpué y Villa Alemana.' },
      { q: '¿Qué materiales resisten el ambiente marino?', a: 'Usamos telas tratadas contra la humedad y perfiles de aluminio anodizado que resisten la corrosión del aire salino de la costa.' },
      { q: '¿Con qué frecuencia van a Viña del Mar?', a: 'Coordinamos visitas semanales a la V Región. Al agendar te confirmamos la fecha disponible más próxima.' },
    ],
    waMsg: 'Hola! Quisiera cotizar cortinas para mi departamento en Viña del Mar',
  },
  'concon': {
    nombre: 'Concón',
    slug: 'concon',
    zona: 'Concón, Quintero, Ventanas y costa norte de Valparaíso',
    region: 'Valparaíso',
    descripcion: 'Instalamos cortinas y persianas en Concón y la costa norte de la V Región. Tenemos amplia experiencia en departamentos y casas de veraneo, con materiales especialmente seleccionados para el ambiente costero.',
    destacados: [
      'Materiales especiales para ambientes costeros',
      'Experiencia en propiedades de veraneo y segunda vivienda',
      'Toldos para terrazas con vista al mar',
      'Coordinación de instalación para propietarios no residentes',
    ],
    faq: [
      { q: '¿Instalan en propiedades de veraneo en Concón?', a: 'Sí, coordinamos la instalación con los propietarios incluso si no residen en Concón. Confirmamos el trabajo con fotos y videollamada.' },
      { q: '¿Qué toldos recomiendan para terrazas en Concón?', a: 'Para la costa recomendamos toldos con lona acrílica resistente al agua y al sol, ideales para el clima de Concón y la V Región.' },
      { q: '¿Cubren Quintero y Ventanas también?', a: 'Sí, atendemos toda la costa norte de Valparaíso incluyendo Quintero, La Greda y Ventanas.' },
    ],
    waMsg: 'Hola! Quisiera cotizar cortinas para mi casa en Concón',
  },
};

export default CIUDADES;
