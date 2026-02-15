export const MOCK_PRODUCTS = [
    // --- ROLLER ---
    {
        id: 101,
        name: "Roller Blackout Premium - Blanco",
        category: "Roller Blackout",
        description_short: "Oscuridad total y aislación térmica.",
        base_price_m2: 24990,
        images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 102,
        name: "Roller Blackout Premium - Gris",
        category: "Roller Blackout",
        description_short: "Elegancia y oscuridad 100%.",
        base_price_m2: 24990,
        images: ["https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 103,
        name: "Roller Sunscreen 5% - White",
        category: "Roller Sunscreen",
        description_short: "Visibilidad y filtro UV.",
        base_price_m2: 22990,
        images: ["https://images.unsplash.com/photo-1505691938895-1758d7bab58d?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 104,
        name: "Roller Sunscreen 3% - Grey",
        category: "Roller Sunscreen",
        description_short: "Control solar intermedio.",
        base_price_m2: 24990,
        images: ["https://images.unsplash.com/photo-1617104424032-b91c9add3ffa?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 105,
        name: "Roller Doble (Blackout + Sunscreen)",
        category: "Roller Doble",
        description_short: "Dos cortinas en un solo sistema.",
        base_price_m2: 45990,
        images: ["https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80"]
    },

    // --- ROLLER DUO (ZEBRA) ---
    {
        id: 201,
        name: "Roller Duo Blackout - Dark Grey",
        category: "Roller Duo Blackout",
        description_short: "Franjas opacas para mayor privacidad.",
        base_price_m2: 34990,
        images: ["https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 202,
        name: "Roller Duo Traslúcido - Lino",
        category: "Roller Duo Traslúcido",
        description_short: "Franjas semitransparentes decorativas.",
        base_price_m2: 32990,
        images: ["https://images.unsplash.com/photo-1594040226829-d9260ee9587c?auto=format&fit=crop&w=800&q=80"]
    },

    // --- CORTINAS ---
    {
        id: 301,
        name: "Cortina Vertical Tela 89mm",
        category: "Cortinas Verticales",
        description_short: "Ideal para grandes ventanales.",
        base_price_m2: 28990,
        images: ["https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 302,
        name: "Cortina Tradicional Lino",
        category: "Cortinas Tradicionales",
        description_short: "Caída natural y elegante.",
        base_price_m2: 35990,
        images: ["https://images.unsplash.com/photo-1505691938895-1758d7bab58d?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 303,
        name: "Cortina Tradicional Blackout",
        category: "Cortinas Tradicionales",
        description_short: "Oscuridad y confort.",
        base_price_m2: 38990,
        images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"]
    },

    // --- DOMOTICA (Unit Pricing) ---
    {
        id: 401,
        name: "Motor Tubolar Roller WiFi",
        category: "Domotica Motor Roller",
        description_short: "Motor inteligente para roller.",
        price_unit: 85000,
        is_unit_price: true,
        images: ["https://images.unsplash.com/photo-1558002038-1091a1661116?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 402,
        name: "Motor Persiana Exterior",
        category: "Domotica Motor Persiana",
        description_short: "Potencia y control para exteriores.",
        price_unit: 120000,
        is_unit_price: true,
        images: ["https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 403,
        name: "Control Remoto 1 Canal",
        category: "Domotica Control Remoto",
        description_short: "Mando básico.",
        price_unit: 15000,
        is_unit_price: true,
        images: ["https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 404,
        name: "Control Remoto 15 Canales",
        category: "Domotica Control Remoto",
        description_short: "Controla múltiples cortinas.",
        price_unit: 25000,
        is_unit_price: true,
        images: ["https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 405,
        name: "Hub Cerebro Inteligente",
        category: "Domotica Hub",
        description_short: "Conexión a App y Asistentes de Voz.",
        price_unit: 45000,
        is_unit_price: true,
        images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"]
    },

    // --- EXTERIOR ---
    {
        id: 501,
        name: "Persiana Exterior 45mm",
        category: "Persianas Exterior",
        description_short: "Seguridad y control térmico.",
        base_price_m2: 110000,
        images: ["https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80"]
    },

    // --- TOLDOS ---
    {
        id: 601,
        name: "Toldo Vertical Screen",
        category: "Toldos",
        description_short: "Cierre de terrazas.",
        base_price_m2: 55000,
        images: ["https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80"]
    },
    {
        id: 602,
        name: "Toldo Retráctil",
        category: "Toldos",
        description_short: "Sombra proyectante.",
        base_price_m2: 75000,
        images: ["https://images.unsplash.com/photo-1617104424032-b91c9add3ffa?auto=format&fit=crop&w=800&q=80"]
    }
];
