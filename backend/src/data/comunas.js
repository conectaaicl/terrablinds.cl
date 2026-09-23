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
    extendido: [
      "Las Condes abarca desde el eje de Apoquindo y El Golf hasta los condominios de San Carlos de Apoquindo. La mayor densidad de edificios está entre Apoquindo y Manquehue, con torres de vidrio que dominan el sector financiero. Más al oriente, Los Presidentes, El Rodeo y Quebrada de Macul tienen ventanales amplios con vista a la cordillera.",
      "La orientación poniente de la mayoría de los edificios de El Golf implica que el sol entra directo durante toda la tarde, calentando los interiores y generando reflejos en pantallas de trabajo. Los pisos altos lo sienten con mayor intensidad porque no hay edificios vecinos que den sombra. En verano, un ambiente sin protección solar puede subir 6 a 8 grados en pocas horas.",
      "Para el living recomendamos roller screen en tela de apertura 3–5 %, que reduce el calor y los reflejos sin eliminar la vista a la cordillera. En dormitorios, el blackout con doble capa completa el oscurecimiento. Muchos proyectos en Las Condes incluyen motorización Somfy con control desde el celular, especialmente en ventanales de piso a cielo donde la cortina es difícil de alcanzar a mano.",
    ],
  },
  {
    slug: "providencia",
    nombre: "Providencia",
    descripcion: "Cortinas roller, persianas y toldos en Providencia. Instalación profesional en departamentos y oficinas con garantía incluida.",
    intro: "Providencia tiene una alta concentración de edificios y departamentos modernos. Medimos, fabricamos e instalamos en tu unidad sin que tengas que salir.",
    destacados: ["Especialistas en departamentos", "Roller y venecianas para oficinas", "Instalación limpia sin escombros", "Visita técnica coordinada a tu horario"],
    contexto: "En Providencia conviven departamentos de los años 70 con torres nuevas y muchas oficinas. El ruido y la luz de calle son la queja habitual: el blackout resuelve los dormitorios y el screen permite trabajar sin reflejo en pantallas.",
    extendido: [
      "Providencia tiene tres sectores con necesidades distintas: el eje de Av. Providencia y Santa María (edificios de oficinas y departamentos sobre locales comerciales), el sector Pedro de Valdivia y Los Leones (residencial de los años 70 y 80), y el límite con Barrio Italia (casas recicladas y edificios nuevos). Cada uno requiere un enfoque diferente de medición e instalación.",
      "Los departamentos sobre Av. Providencia conviven con ruido constante de tráfico. El blackout en dormitorios resuelve tanto la luz como el molesto resplandor nocturno de los letreros comerciales. Las oficinas en pisos medios de Pedro de Valdivia Norte piden screen de apertura técnica para trabajar cómodo frente a pantallas sin apagar las luces del techo.",
      "En departamentos de arriendo —la mayoría en el sector Los Leones— ofrecemos sistemas de fijación sin perforar que se retiran sin dejar marcas en los marcos. El arrendatario puede llevarse el roller al siguiente departamento, lo que hace la inversión mucho más atractiva. Para oficinas, el roller screen en tela técnica de 3 % bloquea el calor sin oscurecer el espacio.",
    ],
  },
  {
    slug: "vitacura",
    nombre: "Vitacura",
    descripcion: "Cortinas roller premium, persianas y toldos en Vitacura. Productos de alta gama con instalación experta en hogares y condominios.",
    intro: "En Vitacura trabajamos con familias que buscan calidad y diseño. Materiales importados y terminaciones premium que se adaptan a los estándares más exigentes.",
    destacados: ["Materiales importados de primera línea", "Motorización y domótica disponible", "Asesoría en color y textura", "Garantía de 48 meses en instalación"],
    contexto: "Vitacura tiene casas con terrazas amplias y departamentos de gran formato. Aquí lo más solicitado es la motorización integrada a domótica y los toldos retráctiles para terrazas que se usan todo el año.",
    extendido: [
      "Vitacura concentra las casas de mayor valor por metro cuadrado en Santiago. El sector de El Tranque, San Damián y Los Dominicos tiene propiedades con terrazas orientadas al oriente y piscinas. Los edificios de Vitacura son menos frecuentes, pero las torres de Av. Bicentenario tienen ventanales de gran formato que exigen soluciones premium.",
      "Las terrazas de Vitacura son muy solicitadas durante primavera y verano. Una orientación norte o poniente implica radiación directa durante 6 a 8 horas diarias. Un toldo retráctil bien calculado puede bajar 10 grados la temperatura de la terraza y permite usar el espacio exterior casi todo el año sin la molestia del calor.",
      "Los proyectos en Vitacura suelen combinar roller motorizado en ventanales del living y dormitorios, toldo retráctil de brazo articulado para la terraza y pérgola bioclimática en espacios de doble uso. Trabajamos con telas importadas de España y Bélgica con certificación de resistencia UV, que es lo que los clientes de esta zona exigen para proyectos de largo plazo.",
    ],
  },
  {
    slug: "lo-barnechea",
    nombre: "Lo Barnechea",
    descripcion: "Instalación de cortinas roller, persianas y toldos en Lo Barnechea. Cobertura en condominios, parcelas y casas de la zona cordillerana.",
    intro: "Cubrimos toda Lo Barnechea, incluyendo condominios en altura y casas con grandes ventanales. El entorno cordillerano requiere materiales resistentes — tenemos la solución correcta.",
    destacados: ["Cobertura en condominios cerrados", "Toldos para terrazas y piscinas", "Roller sunscreen ideal para sol cordillerano", "Transporte a zonas altas sin costo adicional"],
    contexto: "La precordillera de Lo Barnechea recibe radiación más intensa y variaciones fuertes de temperatura. Recomendamos screen de factor de apertura bajo y persianas exteriores de aluminio, que aíslan del calor antes de que llegue al vidrio.",
    extendido: [
      "Lo Barnechea cubre desde La Dehesa (condominios y casas a 800 msnm) hasta El Arrayán y El Manzano (sobre los 1.000 msnm). Los condominios más grandes están en La Reserva y La Dehesa, con casas de superficies entre 200 y 600 m². El acceso puede ser complejo en horario punta, por eso coordinamos las visitas con anticipación para no hacer esperar al cliente.",
      "La altitud de Lo Barnechea implica una radiación UV hasta 25 % más intensa que en el centro de Santiago. La oscilación térmica también es mayor: noches frescas aunque en verano el mediodía sea caluroso. Las telas screen con factor de apertura 1–3 % son la elección habitual para ventanales grandes orientados al norte y poniente en esta zona.",
      "Para las casas de La Dehesa recomendamos persianas de aluminio exteriores en ventanales grandes: bloquean el calor antes de que entre al vidrio y resisten el viento que baja de la cordillera. En interiores, el roller motorizado con screen de alta densidad es el estándar. En terrazas y sectores de piscina, el toldo retráctil extiende la temporada de uso en al menos un mes respecto a no tener protección.",
    ],
  },
  {
    slug: "nunoa",
    nombre: "Nunoa",
    nombreDisplay: "Ñuñoa",
    descripcion: "Cortinas roller, persianas y toldos en Ñuñoa. Instalación en apartamentos, casas y locales comerciales de toda la comuna.",
    intro: "Ñuñoa combina arquitectura moderna y patrimonial. Adaptamos nuestras soluciones al estilo de cada espacio sin alterar las estructuras existentes.",
    destacados: ["Instalación sin dañar marcos ni ventanas", "Soluciones para ventanas antiguas y modernas", "Persianas venecianas y roller", "Atención en toda la comuna"],
    contexto: "Ñuñoa mezcla casas antiguas con marcos de madera y edificios nuevos. Para las casas patrimoniales usamos fijaciones que no dañan los marcos originales; en los departamentos nuevos la instalación es estándar y rápida.",
    extendido: [
      "Ñuñoa es una de las comunas urbanísticamente más diversas de Santiago. Barrio Italia —en el límite con Providencia— concentra casas patrimoniales de principios del siglo XX. El sector de Villa Frei y Plaza Ñuñoa tiene edificios de los años 60-70, y el eje de Irarrázaval incorpora nuevas torres de departamentos año a año.",
      "Las casas patrimoniales de Ñuñoa tienen marcos de madera originales que no admiten perforaciones estándar sin riesgo de dañar la estructura. Usamos sistemas de fijación que se montan sobre el marco exterior sin anclar la madera. En los edificios nuevos del eje Irarrázaval, los departamentos tienen ventanales amplios orientados al poniente con sol fuerte de la tarde.",
      "En las casas históricas el roller de montaje en pared con soporte sin perforar en madera es la solución correcta. En los edificios nuevos, el roller duo es el más pedido: en una sola pieza ofrece translúcido de día y blackout de noche sin necesidad de doble barra. Para los locales de Barrio Italia con mucho sol de la tarde, el screen de alta densidad evita el reflejo en pantallas y artículos expuestos.",
    ],
  },
  {
    slug: "la-reina",
    nombre: "La Reina",
    descripcion: "Cortinas roller y persianas en La Reina. Instalación profesional con visita técnica a domicilio y presupuesto sin compromiso.",
    intro: "La Reina es una comuna residencial con casas de buen tamaño. Instalamos desde una habitación hasta proyectos completos, con los mismos estándares de calidad en cada caso.",
    destacados: ["Proyectos de una habitación o casa completa", "Presupuesto detallado antes de iniciar", "Instalación en 1 día para proyectos estándar", "Financiamiento disponible"],
    contexto: "La Reina es residencial, con casas de dos pisos y jardín. Los proyectos típicos son de casa completa: roller duo en el living, blackout en dormitorios y toldo en la terraza, instalados en una sola jornada.",
    extendido: [
      "La Reina es residencial casi en su totalidad, con casas de uno y dos pisos en sectores como Las Flores, Parque Cousiño y Los Alcázares. Las propiedades tienen jardín y muchas cuentan con piscina. Los edificios son escasos y concentrados en el eje de Av. Ossa. La demanda más alta son proyectos de casa completa donde cubrimos todos los ambientes en una sola visita.",
      "Las casas de La Reina tienen doble exposición solar. Las ventanas del norte reciben sol de mediodía durante todo el año, útil en invierno pero que calienta en exceso en verano. Las ventanas del poniente capturan el sol fuerte de la tarde. Las terrazas con piscina orientadas al norte son las más calurosas en diciembre y enero, y donde un toldo marca la mayor diferencia de temperatura.",
      "Los proyectos de casa completa en La Reina combinan roller blackout en dormitorios, roller duo en living-comedor, screen en la oficina o estudio, y toldo de brazos articulados para la terraza. Instalamos todo en una sola jornada de trabajo cuando la casa tiene entre cuatro y seis ambientes. Antes de iniciar entregamos un presupuesto detallado por ambiente para que el cliente decida el alcance con claridad.",
    ],
  },
  {
    slug: "maipu",
    nombre: "Maipu",
    nombreDisplay: "Maipú",
    descripcion: "Cortinas roller, persianas y toldos en Maipú. Instalación a domicilio en la Región Metropolitana.",
    intro: "Maipú tiene la mayor cantidad de viviendas nuevas en la RM. Conocemos las tipologías más comunes y tenemos soluciones estándar listas para instalación rápida.",
    destacados: ["Precios competitivos para toda la familia", "Instalación rápida en nuevos departamentos", "Paquetes para casa completa con descuento", "Cobertura en todo Maipú"],
    contexto: "Maipú es la comuna con más viviendas nuevas de la Región Metropolitana. Conocemos las medidas de ventana de los proyectos más repetidos, lo que nos permite cotizar rápido y entregar en menos días.",
    extendido: [
      "Maipú supera los 600.000 habitantes y es la comuna con mayor cantidad de viviendas nuevas de la Región Metropolitana. Sectores como Rinconada de Maipú, El Bosque Norte y Tres Poniente concentran conjuntos de casas nuevas de dos y tres pisos. El centro, cerca del Metro, tiene edificios de departamentos de formato compacto con alta demanda de arriendo.",
      "Los conjuntos habitacionales del sector Rinconada tienen muchas viviendas orientadas al poniente, con el sol de la tarde entrando directo al living durante los meses cálidos. En los departamentos del centro, el ruido del tráfico y la iluminación nocturna de la calle son el principal problema para el descanso. El blackout en dormitorios que dan a avenidas transitadas cambia radicalmente la calidad del sueño.",
      "Conocemos las medidas estándar de las ventanas de los proyectos más instalados en Maipú, lo que nos permite cotizar en muchos casos sin visita previa y entregar más rápido. Para las casas nuevas, el paquete más pedido es roller screen para el living y blackout para dormitorios. Para departamentos en arriendo, el sistema sin perforar es el que más conviene al arrendatario.",
    ],
  },
  {
    slug: "la-florida",
    nombre: "La Florida",
    descripcion: "Cortinas roller y persianas en La Florida. Fabricación a medida e instalación profesional con garantía en toda la comuna.",
    intro: "Desde departamentos en el eje Vicuña Mackenna hasta casas en los cerros, llegamos a todos los sectores de La Florida con el mismo nivel de servicio.",
    destacados: ["Cobertura en todos los sectores de La Florida", "Roller blackout para dormitorios", "Persianas exteriores para seguridad", "Garantía de instalación incluida"],
    contexto: "La Florida va desde los edificios del eje Vicuña Mackenna hasta casas en la precordillera. En el sector alto se piden persianas exteriores por seguridad y protección solar; en los departamentos, roller blackout y screen.",
    extendido: [
      "La Florida se divide en dos zonas con características muy distintas. El sector bajo, desde Vicuña Mackenna hasta la Autopista Central, concentra edificios de departamentos junto a las estaciones del Metro. El sector alto, desde Lo Cañas hacia la precordillera, tiene casas con jardín y condominios como El Desarrollo y Los Pinos, con propiedades que tienen ventanales grandes y vista despejada sobre Santiago.",
      "El sector alto de La Florida recibe más radiación que el sector bajo por la altitud. Las casas de Los Pinos y El Desarrollo tienen ventanales orientados al poniente con vista directa a la ciudad, lo que implica sol de tarde muy intenso en los meses de verano. La seguridad es también un factor relevante: las persianas exteriores de aluminio son populares porque al cerrar refuerzan visualmente la protección de la ventana.",
      "En el sector alto recomendamos roller screen de alta densidad (apertura 1–3 %) o persianas exteriores de aluminio orientable. En los departamentos del sector bajo, el blackout en dormitorios y el screen en el living son el par más instalado. Para locales comerciales cerca de La Florida Center y el eje Vicuña Mackenna, el screen de banda ancha en la vitrina controla el reflejo sin impedir la visibilidad desde afuera.",
    ],
  },
  {
    slug: "san-miguel",
    nombre: "San Miguel",
    descripcion: "Cortinas roller, persianas y toldos en San Miguel. Instalación profesional en hogares y locales comerciales con garantía.",
    intro: "San Miguel está en pleno proceso de renovación urbana con muchos edificios nuevos. Somos el aliado ideal para proyectos de departamentos y locales comerciales.",
    destacados: ["Instalación en edificios nuevos", "Sin perforaciones en algunos modelos", "Cortinas para locales comerciales", "Atención rápida en la zona"],
    contexto: "San Miguel vive una renovación con torres nuevas cerca del Metro. Muchos departamentos son de arriendo, así que ofrecemos sistemas de fijación sin perforar que se retiran sin dejar marcas.",
    extendido: [
      "San Miguel vive una transformación urbana acelerada. Cerca de las estaciones de Metro Línea 2 —El Llano, San Miguel y Lo Ovalle— han surgido decenas de torres de departamentos desde 2015. El sector sur, hacia Av. Departamental, conserva el tejido de casas más antiguo. La conectividad del Metro hace que la mayoría de los departamentos nuevos sean de arriendo.",
      "Los departamentos nuevos de San Miguel son muchas veces compactos —entre 40 y 55 m²— con un solo ambiente orientado hacia la fachada. El problema principal varía según la orientación del edificio, pero en los que dan a avenidas el ruido nocturno y la iluminación de letreros son los más frecuentes. El blackout completo es fundamental para dormitorios que miran hacia calles con tráfico o comercio.",
      "Para los departamentos de arriendo el sistema más pedido es el roller sin perforar, que se monta con presión o con soportes adhesivos de alta resistencia. El arrendatario puede instalarlo y retirarlo sin dejar marcas, y llevar el producto al siguiente departamento. Para locales comerciales del entorno, el roller screen en la vitrina elimina el reflejo sobre mostradores y pantallas sin oscurecer el espacio.",
    ],
  },
  {
    slug: "penalolen",
    nombre: "Penalolen",
    nombreDisplay: "Peñalolén",
    descripcion: "Cortinas roller, persianas y toldos en Peñalolén. Visita técnica gratuita y presupuesto personalizado.",
    intro: "Peñalolén combina sectores residenciales consolidados y nuevos condominios. Llevamos nuestra oferta completa a toda la comuna sin costo de traslado.",
    destacados: ["Sin costo de visita técnica", "Roller, venecianas y toldos disponibles", "Cobertura en condominios cerrados", "Presupuesto en 24 horas"],
    contexto: "Peñalolén tiene condominios nuevos hacia la cordillera con ventanales grandes y mucha exposición al sol de la mañana. Ahí el screen es la solución más pedida; en los sectores consolidados, roller blackout y venecianas.",
    extendido: [
      "Peñalolén tiene dos sectores con perfiles distintos. El sector alto —San Luis, Hacienda de Peñalolén, El Golf de Peñalolén— concentra condominios de nivel alto con casas amplias y piscinas. El sector bajo —Lo Hermida, La Faena, Peñalolén Centro— es más urbano, con casas de uno y dos pisos en tejido consolidado y alta densidad.",
      "Los condominios del sector alto de Peñalolén tienen orientación oriente: miran hacia la precordillera y reciben el sol de la mañana con bastante intensidad. A diferencia del sol de la tarde, el sol de la mañana puede despertar temprano a quien no tiene protección adecuada. El screen de apertura 5–10 % permite que entre la luz natural sin causar reflejo en pantallas ni elevar la temperatura del cuarto.",
      "En el sector alto recomendamos screen liviano para dormitorios orientados al oriente y blackout completo para dormitorios principales. En el sector bajo, el par roller screen más blackout en living y dormitorios es el más instalado. Los toldos para terrazas del sector alto son muy populares en los meses de verano, cuando el calor seco hace insoportable salir sin sombra.",
    ],
  },
  {
    slug: "colina",
    nombre: "Colina",
    nombreDisplay: "Colina y Chicureo",
    descripcion: "Cortinas roller, persianas exteriores y toldos en Colina y Chicureo. Instalación en casas y condominios de la zona norte de Santiago.",
    intro: "Chicureo y Colina concentran casas amplias con ventanales grandes y terrazas muy expuestas al sol. Trabajamos con telas screen de alto factor de protección y persianas exteriores que soportan la radiación directa.",
    destacados: ["Cobertura en condominios de Chicureo, Piedra Roja y Las Brisas", "Screen de alta protección UV para ventanales grandes", "Persianas exteriores y toldos para terrazas", "Visita técnica sin costo de traslado"],
    contexto: "La zona norte tiene veranos más calurosos que el centro de Santiago y casas con orientación abierta. Las persianas exteriores y los toldos retráctiles bajan varios grados la temperatura interior sin depender del aire acondicionado.",
    extendido: [
      "La zona norte de Santiago —Chicureo, Colina, Piedra Roja y Las Brisas— ha crecido sostenidamente en la última década. Los condominios de Chicureo tienen casas de gran superficie, entre 300 y 700 m², con jardines amplios, piscinas y terrazas cubiertas. El clima es más seco y caluroso que en Santiago centro, con veranos que superan los 35 °C con regularidad.",
      "A diferencia del centro de Santiago, la zona norte recibe radiación intensa tanto en la mañana como en la tarde. Las casas con piscina y terraza orientadas al norte o poniente son las más expuestas. Un toldo retráctil bien calculado puede reducir 12 a 15 grados la temperatura de la terraza durante las horas pico del verano y es el producto que más se instala en esta zona.",
      "Los proyectos en Chicureo y Colina combinan toldo retráctil de 6 a 10 metros para cubrir la terraza y el sector de piscina, persianas exteriores de aluminio en los ventanales más expuestos, y roller motorizado al interior. Muchos clientes integran la motorización con su sistema de domótica existente. Cubrimos toda la zona norte —Piedra Roja, Las Brisas, Los Trapenses— sin costo adicional de traslado.",
    ],
  },
  {
    slug: "macul",
    nombre: "Macul",
    descripcion: "Cortinas roller, persianas y toldos a medida en Macul. Instalación a domicilio en casas y departamentos de la comuna.",
    intro: "Macul combina sectores residenciales consolidados con edificios nuevos cerca del Metro Línea 5. Medimos, fabricamos e instalamos a medida en tu casa o departamento, sin que tengas que salir.",
    destacados: ["Instalación en casas y departamentos", "Roller screen y blackout a medida", "Cobertura en toda la comuna de Macul", "Visita técnica sin costo de traslado"],
    contexto: "Macul tiene casas de dos pisos con patio en sus sectores consolidados y edificios nuevos hacia Avenida Quilín y el eje del Metro. En las casas, el roller screen y las persianas exteriores controlan el sol de la tarde; en los departamentos, el blackout resuelve los dormitorios y el duo funciona bien en el living.",
    extendido: [
      "Macul combina dos texturas urbanas bien diferenciadas. El sector oriente, hacia Avenida Quilín y el límite con La Reina, tiene casas de dos pisos con jardín y calles arborizadas. El sector poniente, cercano al Metro Línea 5, ha tenido mayor densificación con edificios nuevos. El barrio del Estadio Nacional, en el límite con Ñuñoa, mezcla casas antiguas con proyectos inmobiliarios recientes.",
      "Las casas de Macul con fachada poniente reciben el sol más fuerte de la tarde. En verano, los dormitorios orientados al poniente acumulan calor desde las 15:00, lo que dificulta el descanso. El roller blackout con tela de oscurecimiento completo bloquea tanto la luz como parte del calor radiante del cristal, bajando la temperatura percibida en el cuarto.",
      "En las casas del sector consolidado, el producto más instalado es el roller blackout en dormitorios más el duo para el living. Los edificios nuevos cerca del Metro demandan sistemas de fijación sin perforar para arriendos. Para los locales comerciales de Av. Quilín y Vicuña Mackenna, el screen de banda ancha en la vitrina controla el reflejo y protege los productos expuestos del sol directo.",
    ],
  },
  {
    slug: "la-cisterna",
    nombre: "La Cisterna",
    descripcion: "Cortinas roller, persianas y toldos a medida en La Cisterna. Instalación a domicilio en casas, departamentos y locales de la comuna.",
    intro: "La Cisterna es un punto de conexión del sur de Santiago, con mucho comercio y edificios nuevos alrededor de la estación intermodal. Llevamos la medición y la instalación a tu casa, departamento o local, sin que tengas que trasladarte.",
    destacados: ["Instalación en casas, departamentos y locales comerciales", "Roller blackout y screen a medida", "Cobertura en toda la comuna de La Cisterna", "Visita técnica sin costo de traslado"],
    contexto: "La Cisterna concentra edificios nuevos cerca de la estación intermodal y casas en sus barrios residenciales. Muchos departamentos son de arriendo, así que ofrecemos sistemas de fijación sin perforar; en las casas y locales, el screen y el blackout controlan la luz y dan privacidad frente a calles de alto tránsito.",
    extendido: [
      "La Cisterna es un nodo de conectividad en el sur de Santiago. La estación intermodal —Metro, Metrobus y conexiones intercomunales— concentra tráfico peatonal y comercial intenso. El sector residencial se desarrolla desde Av. Pedro Aguirre Cerda hacia el sur, con casas en tejido consolidado y algunos edificios nuevos sobre el eje del Metro.",
      "Los departamentos nuevos de La Cisterna que dan hacia calles de alto tránsito combinan el problema de la luz con el del ruido. El blackout en dormitorios y el screen en el living permiten vivir con privacidad frente a calles transitadas sin perder la ventilación natural. En los locales comerciales del entorno de la estación, el screen evita el reflejo solar en mostradores y pantallas, mejorando la experiencia del cliente.",
      "Para los edificios con alta rotación de arrendatarios, el sistema sin perforar es el más solicitado. Para las casas del sector residencial, el paquete completo —blackout y screen— cubre toda la vivienda en una sola visita. Para los locales comerciales, el roller screen interior y el roller metálico exterior son la combinación más robusta para el control de luz en espacios de atención al público.",
    ],
  },
  {
    slug: "santiago-centro",
    nombre: "Santiago Centro",
    descripcion: "Cortinas roller, persianas y toldos a medida en Santiago Centro. Instalación a domicilio en departamentos, oficinas y locales.",
    intro: "Santiago Centro concentra torres de departamentos, oficinas y locales comerciales. Medimos, fabricamos e instalamos a medida en tu unidad, coordinando el ingreso con la administración del edificio cuando hace falta.",
    destacados: ["Instalación en departamentos y oficinas", "Roller screen y blackout a medida", "Sistemas sin perforar para arriendos", "Visita técnica sin costo de traslado"],
    contexto: "En Santiago Centro predominan los departamentos en altura con ventanales expuestos al ruido y la luz de la calle. El roller screen deja trabajar sin reflejo en pantallas y el blackout resuelve el descanso en dormitorios que dan a avenidas de alto tránsito. Muchas unidades son de arriendo, por eso ofrecemos fijaciones que no dañan los marcos.",
    extendido: [
      "Santiago Centro es el corazón urbano de la capital, con una mezcla de edificios históricos reconvertidos, torres nuevas de vivienda y alta concentración de oficinas y locales. Barrios como Lastarria, República y el eje de Av. Libertador Bernardo O'Higgins concentran gran parte del parque residencial. Las tipologías van desde el departamento compacto para estudiantes hasta el piso amplio en edificio histórico.",
      "Los departamentos en el centro conviven con avenidas iluminadas durante toda la noche. La contaminación lumínica de Santiago Centro es de las más altas de la ciudad: letreros LED, alumbrado público intenso y tráfico nocturno hacen que el blackout sea indispensable en dormitorios. Los ventanales orientados al norte reciben sol directo de mediodía durante gran parte del año, lo que eleva la temperatura interior.",
      "Para departamentos en arriendo —que representan la mayoría del parque habitacional del centro— el sistema sin perforar es casi obligatorio. Para oficinas en pisos altos, el screen de apertura 3 % es el estándar: controla el calor y el reflejo sin oscurecer el espacio de trabajo. Para edificios históricos con marcos de madera o aluminio antiguo, adaptamos la fijación al soporte existente sin dañar la estructura original.",
    ],
  },
  {
    slug: "estacion-central",
    nombre: "Estación Central",
    descripcion: "Cortinas roller, persianas y toldos a medida en Estación Central. Instalación a domicilio en departamentos nuevos y casas de la comuna.",
    intro: "Estación Central vive un fuerte crecimiento de edificios nuevos junto al eje de la Alameda y el Metro. Llevamos la medición y la instalación a tu departamento o casa, sin que tengas que trasladarte.",
    destacados: ["Instalación en departamentos nuevos y casas", "Roller blackout y screen a medida", "Sistemas sin perforar para arriendos", "Visita técnica sin costo de traslado"],
    contexto: "Estación Central tiene muchos departamentos nuevos de formato compacto cerca de la Alameda y el Metro. En espacios chicos, el roller ocupa poco y controla bien la luz; el blackout es clave en dormitorios que enfrentan la avenida, y el screen mantiene la vista sin el calor de la tarde.",
    extendido: [
      "Estación Central creció rápidamente en la última década alrededor del eje de la Alameda y la Terminal de Buses San Borja. Los departamentos nuevos son compactos —muchos entre 30 y 50 m²— con un perfil de arriendo estudiantil y trabajador. La cercanía a la USACH y el acceso a múltiples líneas de Metro hacen de esta comuna una de las que más unidades nuevas incorpora por año en la ciudad.",
      "Los edificios sobre la Alameda tienen exposición directa al ruido y al sol de la tarde (orientación poniente). En espacios compactos, el calor puede concentrarse rápidamente y la diferencia entre tener o no protección solar es inmediata. El roller blackout en dormitorios que dan a la avenida cambia radicalmente la calidad del descanso para quien trabaja y estudia.",
      "La alta rotación de arrendatarios en Estación Central hace que el sistema sin perforar sea el producto que más instalamos en la zona. Para departamentos con ventana única, un roller duo permite pasar de translúcido de día a blackout de noche en una sola pieza, sin doble barra ni doble instalación. Para dormitorios que dan a la Alameda, la tela de triple capa es la mejor inversión para aislar de la luz y el ruido de fondo.",
    ],
  },
  {
    slug: "puente-alto",
    nombre: "Puente Alto",
    descripcion: "Cortinas roller, persianas y toldos a medida en Puente Alto. Instalación a domicilio en casas, villas y departamentos de la comuna.",
    intro: "Puente Alto es una de las comunas más grandes de Santiago, con villas, casas y nuevos condominios en el sector sur-oriente. Medimos, fabricamos e instalamos a medida en tu hogar, en toda la comuna.",
    destacados: ["Instalación en casas, villas y departamentos", "Roller screen y blackout a medida", "Cobertura en toda la comuna de Puente Alto", "Visita técnica sin costo de traslado"],
    contexto: "Puente Alto combina villas y casas de uno y dos pisos con condominios nuevos hacia la precordillera. En las casas con patio, el roller screen y las persianas exteriores controlan el sol de la tarde; en los departamentos, el blackout resuelve los dormitorios y el duo funciona bien en el living.",
    extendido: [
      "Puente Alto es la comuna con más habitantes de Chile, con cerca de 700.000 personas. Su tejido urbano va desde villas de los años 80 —Villa España, Villa Macul, Villa El Sereno— hasta condominios nuevos en el sector cordillerano, como Bajos del Manzano y Los Quillayes. El eje de Av. Concha y Toro conecta el centro con los sectores más alejados.",
      "Las casas de Puente Alto orientadas al poniente pueden calentarse considerablemente desde las 14:00 en verano. Los condominios del sector cordillerano tienen ventanales con vista que capturan el sol de la tarde. En las villas más antiguas, la mayoría de las ventanas ya tiene marcos de aluminio en buen estado que son compatibles con sistemas de roller estándar sin modificaciones.",
      "En las villas de Puente Alto, el par blackout más screen es el más instalado. En los condominios del sector alto, la motorización es más frecuente que en el resto de la comuna. Para las casas con terraza y jardín, el toldo de brazos articulados es la solución de verano más pedida. Cubrimos toda la extensión de Puente Alto en una sola visita técnica, sin costo adicional de traslado por la distancia.",
    ],
  },
];

function getComunaBySlug(slug) {
  return COMUNAS.find(c => c.slug === slug) || null;
}

function displayName(c) {
  return c.nombreDisplay || c.nombre;
}

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
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
