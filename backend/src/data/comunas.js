// Fuente de datos por comuna para el prerender. El frontend tiene una copia ESM
// en frontend/src/data/comunas.js — mantener ambas iguales al editar.
const COMUNAS = [
  {
    slug: "las-condes",
    nombre: "Las Condes",
    descripcion: "Instalamos cortinas roller, persianas y toldos en Las Condes. Visita técnica a domicilio, fabricación premium y garantía de instalación.",
    intro: "Llevamos nuestros productos directamente a tu hogar o departamento en Las Condes. Fabricación a medida, materiales importados y equipo técnico con experiencia en la zona.",
    destacados: ["Instalación en departamentos y casas", "Roller blackout y sunscreen disponibles", "Motorización para proyectos premium", "Presupuesto sin compromiso en 24 h"],
    contexto: "Las Condes concentra edificios de departamentos con ventanales de piso a cielo orientados al poniente. El sol de la tarde entra directo, así que las combinaciones más pedidas son screen para el living y blackout para los dormitorios.",
  },
  {
    slug: "providencia",
    nombre: "Providencia",
    descripcion: "Cortinas roller, persianas y toldos en Providencia. Instalación profesional en departamentos y oficinas con garantía incluida.",
    intro: "Providencia tiene una alta concentración de edificios y departamentos modernos. Medimos, fabricamos e instalamos en tu unidad sin que tengas que salir.",
    destacados: ["Especialistas en departamentos", "Roller y venecianas para oficinas", "Instalación limpia sin escombros", "Visita técnica coordinada a tu horario"],
    contexto: "En Providencia conviven departamentos de los años 70 con torres nuevas y muchas oficinas. El ruido y la luz de calle son la queja habitual: el blackout resuelve los dormitorios y el screen permite trabajar sin reflejo en pantallas.",
  },
  {
    slug: "vitacura",
    nombre: "Vitacura",
    descripcion: "Cortinas roller premium, persianas y toldos en Vitacura. Productos de alta gama con instalación experta en hogares y condominios.",
    intro: "En Vitacura trabajamos con familias que buscan calidad y diseño. Materiales importados y terminaciones premium que se adaptan a los estándares más exigentes.",
    destacados: ["Materiales importados de primera línea", "Motorización y domótica disponible", "Asesoría en color y textura", "Garantía de 48 meses en instalación"],
    contexto: "Vitacura tiene casas con terrazas amplias y departamentos de gran formato. Aquí lo más solicitado es la motorización integrada a domótica y los toldos retráctiles para terrazas que se usan todo el año.",
  },
  {
    slug: "lo-barnechea",
    nombre: "Lo Barnechea",
    descripcion: "Instalación de cortinas roller, persianas y toldos en Lo Barnechea. Cobertura en condominios, parcelas y casas de la zona cordillerana.",
    intro: "Cubrimos toda Lo Barnechea, incluyendo condominios en altura y casas con grandes ventanales. El entorno cordillerano requiere materiales resistentes — tenemos la solución correcta.",
    destacados: ["Cobertura en condominios cerrados", "Toldos para terrazas y piscinas", "Roller sunscreen ideal para sol cordillerano", "Transporte a zonas altas sin costo adicional"],
    contexto: "La precordillera de Lo Barnechea recibe radiación más intensa y variaciones fuertes de temperatura. Recomendamos screen de factor de apertura bajo y persianas exteriores de aluminio, que aíslan del calor antes de que llegue al vidrio.",
  },
  {
    slug: "nunoa",
    nombre: "Nunoa",
    nombreDisplay: "Ñuñoa",
    descripcion: "Cortinas roller, persianas y toldos en Ñuñoa. Instalación en apartamentos, casas y locales comerciales de toda la comuna.",
    intro: "Ñuñoa combina arquitectura moderna y patrimonial. Adaptamos nuestras soluciones al estilo de cada espacio sin alterar las estructuras existentes.",
    destacados: ["Instalación sin dañar marcos ni ventanas", "Soluciones para ventanas antiguas y modernas", "Persianas venecianas y roller", "Atención en toda la comuna"],
    contexto: "Ñuñoa mezcla casas antiguas con marcos de madera y edificios nuevos. Para las casas patrimoniales usamos fijaciones que no dañan los marcos originales; en los departamentos nuevos la instalación es estándar y rápida.",
  },
  {
    slug: "la-reina",
    nombre: "La Reina",
    descripcion: "Cortinas roller y persianas en La Reina. Instalación profesional con visita técnica a domicilio y presupuesto sin compromiso.",
    intro: "La Reina es una comuna residencial con casas de buen tamaño. Instalamos desde una habitación hasta proyectos completos, con los mismos estándares de calidad en cada caso.",
    destacados: ["Proyectos de una habitación o casa completa", "Presupuesto detallado antes de iniciar", "Instalación en 1 día para proyectos estándar", "Financiamiento disponible"],
    contexto: "La Reina es residencial, con casas de dos pisos y jardín. Los proyectos típicos son de casa completa: roller duo en el living, blackout en dormitorios y toldo en la terraza, instalados en una sola jornada.",
  },
  {
    slug: "maipu",
    nombre: "Maipu",
    nombreDisplay: "Maipú",
    descripcion: "Cortinas roller, persianas y toldos en Maipú. Instalación a domicilio en la Región Metropolitana.",
    intro: "Maipú tiene la mayor cantidad de viviendas nuevas en la RM. Conocemos las tipologías más comunes y tenemos soluciones estándar listas para instalación rápida.",
    destacados: ["Precios competitivos para toda la familia", "Instalación rápida en nuevos departamentos", "Paquetes para casa completa con descuento", "Cobertura en todo Maipú"],
    contexto: "Maipú es la comuna con más viviendas nuevas de la Región Metropolitana. Conocemos las medidas de ventana de los proyectos más repetidos, lo que nos permite cotizar rápido y entregar en menos días.",
  },
  {
    slug: "la-florida",
    nombre: "La Florida",
    descripcion: "Cortinas roller y persianas en La Florida. Fabricación a medida e instalación profesional con garantía en toda la comuna.",
    intro: "Desde departamentos en el eje Vicuña Mackenna hasta casas en los cerros, llegamos a todos los sectores de La Florida con el mismo nivel de servicio.",
    destacados: ["Cobertura en todos los sectores de La Florida", "Roller blackout para dormitorios", "Persianas exteriores para seguridad", "Garantía de instalación incluida"],
    contexto: "La Florida va desde los edificios del eje Vicuña Mackenna hasta casas en la precordillera. En el sector alto se piden persianas exteriores por seguridad y protección solar; en los departamentos, roller blackout y screen.",
  },
  {
    slug: "san-miguel",
    nombre: "San Miguel",
    descripcion: "Cortinas roller, persianas y toldos en San Miguel. Instalación profesional en hogares y locales comerciales con garantía.",
    intro: "San Miguel está en pleno proceso de renovación urbana con muchos edificios nuevos. Somos el aliado ideal para proyectos de departamentos y locales comerciales.",
    destacados: ["Instalación en edificios nuevos", "Sin perforaciones en algunos modelos", "Cortinas para locales comerciales", "Atención rápida en la zona"],
    contexto: "San Miguel vive una renovación con torres nuevas cerca del Metro. Muchos departamentos son de arriendo, así que ofrecemos sistemas de fijación sin perforar que se retiran sin dejar marcas.",
  },
  {
    slug: "penalolen",
    nombre: "Penalolen",
    nombreDisplay: "Peñalolén",
    descripcion: "Cortinas roller, persianas y toldos en Peñalolén. Visita técnica gratuita y presupuesto personalizado.",
    intro: "Peñalolén combina sectores residenciales consolidados y nuevos condominios. Llevamos nuestra oferta completa a toda la comuna sin costo de traslado.",
    destacados: ["Sin costo de visita técnica", "Roller, venecianas y toldos disponibles", "Cobertura en condominios cerrados", "Presupuesto en 24 horas"],
    contexto: "Peñalolén tiene condominios nuevos hacia la cordillera con ventanales grandes y mucha exposición al sol de la mañana. Ahí el screen es la solución más pedida; en los sectores consolidados, roller blackout y venecianas.",
  },
  {
    slug: "colina",
    nombre: "Colina",
    nombreDisplay: "Colina y Chicureo",
    descripcion: "Cortinas roller, persianas exteriores y toldos en Colina y Chicureo. Instalación en casas y condominios de la zona norte de Santiago.",
    intro: "Chicureo y Colina concentran casas amplias con ventanales grandes y terrazas muy expuestas al sol. Trabajamos con telas screen de alto factor de protección y persianas exteriores que soportan la radiación directa.",
    destacados: ["Cobertura en condominios de Chicureo, Piedra Roja y Las Brisas", "Screen de alta protección UV para ventanales grandes", "Persianas exteriores y toldos para terrazas", "Visita técnica sin costo de traslado"],
    contexto: "La zona norte tiene veranos más calurosos que el centro de Santiago y casas con orientación abierta. Las persianas exteriores y los toldos retráctiles bajan varios grados la temperatura interior sin depender del aire acondicionado.",
  },
  {
    slug: "macul",
    nombre: "Macul",
    descripcion: "Cortinas roller, persianas y toldos a medida en Macul. Instalación a domicilio en casas y departamentos de la comuna.",
    intro: "Macul combina sectores residenciales consolidados con edificios nuevos cerca del Metro Línea 5. Medimos, fabricamos e instalamos a medida en tu casa o departamento, sin que tengas que salir.",
    destacados: ["Instalación en casas y departamentos", "Roller screen y blackout a medida", "Cobertura en toda la comuna de Macul", "Visita técnica sin costo de traslado"],
    contexto: "Macul tiene casas de dos pisos con patio en sus sectores consolidados y edificios nuevos hacia Avenida Quilín y el eje del Metro. En las casas, el roller screen y las persianas exteriores controlan el sol de la tarde; en los departamentos, el blackout resuelve los dormitorios y el duo funciona bien en el living.",
  },
  {
    slug: "la-cisterna",
    nombre: "La Cisterna",
    descripcion: "Cortinas roller, persianas y toldos a medida en La Cisterna. Instalación a domicilio en casas, departamentos y locales de la comuna.",
    intro: "La Cisterna es un punto de conexión del sur de Santiago, con mucho comercio y edificios nuevos alrededor de la estación intermodal. Llevamos la medición y la instalación a tu casa, departamento o local, sin que tengas que trasladarte.",
    destacados: ["Instalación en casas, departamentos y locales comerciales", "Roller blackout y screen a medida", "Cobertura en toda la comuna de La Cisterna", "Visita técnica sin costo de traslado"],
    contexto: "La Cisterna concentra edificios nuevos cerca de la estación intermodal y casas en sus barrios residenciales. Muchos departamentos son de arriendo, así que ofrecemos sistemas de fijación sin perforar; en las casas y locales, el screen y el blackout controlan la luz y dan privacidad frente a calles de alto tránsito.",
  },
  {
    slug: "santiago-centro",
    nombre: "Santiago Centro",
    descripcion: "Cortinas roller, persianas y toldos a medida en Santiago Centro. Instalación a domicilio en departamentos, oficinas y locales.",
    intro: "Santiago Centro concentra torres de departamentos, oficinas y locales comerciales. Medimos, fabricamos e instalamos a medida en tu unidad, coordinando el ingreso con la administración del edificio cuando hace falta.",
    destacados: ["Instalación en departamentos y oficinas", "Roller screen y blackout a medida", "Sistemas sin perforar para arriendos", "Visita técnica sin costo de traslado"],
    contexto: "En Santiago Centro predominan los departamentos en altura con ventanales expuestos al ruido y la luz de la calle. El roller screen deja trabajar sin reflejo en pantallas y el blackout resuelve el descanso en dormitorios que dan a avenidas de alto tránsito. Muchas unidades son de arriendo, por eso ofrecemos fijaciones que no dañan los marcos.",
  },
  {
    slug: "estacion-central",
    nombre: "Estación Central",
    descripcion: "Cortinas roller, persianas y toldos a medida en Estación Central. Instalación a domicilio en departamentos nuevos y casas de la comuna.",
    intro: "Estación Central vive un fuerte crecimiento de edificios nuevos junto al eje de la Alameda y el Metro. Llevamos la medición y la instalación a tu departamento o casa, sin que tengas que trasladarte.",
    destacados: ["Instalación en departamentos nuevos y casas", "Roller blackout y screen a medida", "Sistemas sin perforar para arriendos", "Visita técnica sin costo de traslado"],
    contexto: "Estación Central tiene muchos departamentos nuevos de formato compacto cerca de la Alameda y el Metro. En espacios chicos, el roller ocupa poco y controla bien la luz; el blackout es clave en dormitorios que enfrentan la avenida, y el screen mantiene la vista sin el calor de la tarde.",
  },
  {
    slug: "puente-alto",
    nombre: "Puente Alto",
    descripcion: "Cortinas roller, persianas y toldos a medida en Puente Alto. Instalación a domicilio en casas, villas y departamentos de la comuna.",
    intro: "Puente Alto es una de las comunas más grandes de Santiago, con villas, casas y nuevos condominios en el sector sur-oriente. Medimos, fabricamos e instalamos a medida en tu hogar, en toda la comuna.",
    destacados: ["Instalación en casas, villas y departamentos", "Roller screen y blackout a medida", "Cobertura en toda la comuna de Puente Alto", "Visita técnica sin costo de traslado"],
    contexto: "Puente Alto combina villas y casas de uno y dos pisos con condominios nuevos hacia la precordillera. En las casas con patio, el roller screen y las persianas exteriores controlan el sol de la tarde; en los departamentos, el blackout resuelve los dormitorios y el duo funciona bien en el living.",
  },
];

function getComunaBySlug(slug) {
  return COMUNAS.find(c => c.slug === slug) || null;
}

function displayName(c) {
  return c.nombreDisplay || c.nombre;
}

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Comunas nombradas en un texto (título de un post, típicamente).
function findComunas(text) {
  const t = norm(text);
  return COMUNAS.filter(c => {
    const names = [c.nombre, c.nombreDisplay].filter(Boolean).map(norm);
    if (c.slug === "colina") names.push("chicureo");
    return names.some(n => t.includes(n));
  });
}

module.exports = { COMUNAS, getComunaBySlug, displayName, findComunas };
