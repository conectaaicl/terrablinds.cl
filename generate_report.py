"""
Generador de reporte PDF - Ecosistema ConectaAI
Sistemas: suite, osw, seo, conectaai
"""
from fpdf import FPDF
from fpdf.enums import XPos, YPos
from datetime import datetime
import os

OUTPUT = r"C:\Users\Admin\terrablinds.cl\Reporte_ConectaAI_Sistemas.pdf"

# ── Paleta de colores ──────────────────────────────────────────────────────────
C_BG       = (7,   11,  18)   # #070b12
C_CARD     = (15,  23,  42)   # dark card
C_ACCENT   = (99,  102, 241)  # indigo
C_GREEN    = (52,  211, 153)
C_RED      = (248, 113, 113)
C_GOLD     = (234, 179, 8)
C_WHITE    = (255, 255, 255)
C_GRAY     = (148, 163, 184)
C_DARK     = (71,  85,  105)
C_TEXT     = (226, 232, 240)

SYSTEMS = [
    {
        "name": "suite.conectaai.cl",
        "title": "Suite de Gestión Empresarial",
        "color": (99, 102, 241),
        "icon": "S",
        "stack": "NestJS · React · PostgreSQL · Docker",
        "port": "3000",
        "description": (
            "Plataforma integral de gestión empresarial multi-módulo que centraliza "
            "todas las operaciones de negocio en una sola interfaz. Diseñada para "
            "equipos que necesitan visibilidad total sobre ventas, inventario, "
            "finanzas y relaciones con clientes."
        ),
        "modules": [
            ("Dashboard",       "Indicadores en tiempo real, KPIs y métricas de negocio"),
            ("CRM",             "Gestión de clientes, pipeline de ventas y seguimiento"),
            ("Ventas",          "Órdenes, cotizaciones web y procesamiento de transacciones"),
            ("Inventario",      "Control de stock, movimientos y alertas de reposición"),
            ("Finanzas",        "Flujo de caja, reportes financieros e integración SII"),
            ("Deliveries",      "Gestión de despachos y logística de entregas"),
            ("Proyectos",       "Planificación y seguimiento de proyectos y clientes"),
            ("Configuración",   "Usuarios, roles, permisos y ajustes del sistema"),
        ],
        "stats": [
            ("Módulos activos", "8"),
            ("Stack", "Full-stack TS"),
            ("Base de datos", "PostgreSQL"),
            ("Integración", "SII Chile"),
        ],
        "highlight": "Integración nativa con SII Chile para facturación electrónica y reportes tributarios.",
    },
    {
        "name": "osw.conectaai.cl",
        "title": "OmniFlow - Automatización WhatsApp & CRM",
        "color": (34, 197, 94),
        "icon": "O",
        "stack": "FastAPI · Next.js · PostgreSQL · n8n · Evolution API",
        "port": "3002 / 8002",
        "description": (
            "Centro de automatización de comunicaciones empresariales vía WhatsApp. "
            "Integra con n8n para workflows avanzados y con Meta Business Platform "
            "como Tech Provider verificado. Gestiona múltiples cuentas de clientes "
            "desde un único panel multi-tenant."
        ),
        "modules": [
            ("Bot WhatsApp",    "Respuestas automáticas, menús interactivos y flujos de conversación"),
            ("CRM integrado",   "Contactos, historial de conversaciones y etiquetas"),
            ("n8n Workflows",   "Automatizaciones visuales sin código con 200+ integraciones"),
            ("Multi-tenant",    "Aislamiento de datos por cliente con paneles independientes"),
            ("Meta Business",   "Integración oficial como Tech Provider de Meta"),
            ("Canales",         "WhatsApp Business API, webhooks y notificaciones"),
            ("Analíticas",      "Métricas de mensajes, respuestas y conversiones"),
            ("Campañas",        "Envío masivo de mensajes con templates aprobados por Meta"),
        ],
        "stats": [
            ("Tenants activos", "4+"),
            ("Proveedor", "Meta Tech Provider"),
            ("Workflows", "n8n integrado"),
            ("Mensajería", "WhatsApp Business API"),
        ],
        "highlight": "Certificado como Meta Tech Provider - acceso a la API oficial de WhatsApp Business sin restricciones.",
    },
    {
        "name": "seo.conectaai.cl",
        "title": "SEO/SEM UltraPRO - Plataforma de Posicionamiento",
        "color": (234, 179, 8),
        "icon": "E",
        "stack": "FastAPI · SQLite · Python · Google Search Console API",
        "port": "8009",
        "description": (
            "Plataforma profesional de gestión SEO y SEM que automatiza el análisis, "
            "monitoreo y optimización del posicionamiento en buscadores. Conecta "
            "directamente con Google Search Console y ofrece auditorías automáticas, "
            "rastreo de rankings y reportes ejecutivos."
        ),
        "modules": [
            ("Rank Tracker",    "Monitoreo diario de posiciones por keyword y dominio"),
            ("Crawler",         "Auditoría técnica: errores, redirects, meta tags, Core Web Vitals"),
            ("Analytics",       "Datos de tráfico, CTR, impresiones y clics desde GSC"),
            ("Alertas",         "Notificaciones automáticas ante caídas de posición o errores"),
            ("Reportes",        "Generación de informes ejecutivos en PDF con gráficas"),
            ("Snapshots",       "Historial de posiciones y evolución temporal"),
            ("Google Search",   "Integración directa con Google Search Console API"),
            ("Reparación",      "Sugerencias automáticas de corrección de errores técnicos"),
        ],
        "stats": [
            ("API versión", "3.0.0"),
            ("Integración", "Google Search Console"),
            ("Auditoría", "Automática"),
            ("Reportes", "PDF ejecutivos"),
        ],
        "highlight": "Integración nativa con Google Search Console API para datos de ranking en tiempo real.",
    },
    {
        "name": "conectaai.cl",
        "title": "ConectaAI - Plataforma Principal Multi-módulo",
        "color": (99, 102, 241),
        "icon": "C",
        "stack": "FastAPI · Next.js · PostgreSQL · Docker · WhatsApp · IA",
        "port": "3005 / 8003 / 8006",
        "description": (
            "El núcleo del ecosistema ConectaAI: plataforma SaaS multi-módulo que "
            "integra gestión de condominios, reconocimiento facial, pagos, "
            "automatización WhatsApp e inteligencia artificial. Arquitectura "
            "multi-backend con separación de dominio por función."
        ),
        "modules": [
            ("Condominios",         "Gestión completa de edificios, unidades, residentes y RFID"),
            ("CRM / Ventas",        "Pipeline de ventas, leads, deals y seguimiento comercial"),
            ("WhatsApp Bot",        "Automatización de comunicaciones vía Evolution API"),
            ("Reconocimiento Facial", "Control de acceso biométrico con cámaras IP"),
            ("Pagos",               "Integración con Flow.cl y Mercado Pago para cobros"),
            ("Bodegas",             "Gestión de espacios de almacenamiento en condominios"),
            ("Google Calendar",     "Sincronización de citas y reservas con Google Calendar"),
            ("IA / Chat",           "Asistente inteligente integrado en workflows del sistema"),
        ],
        "stats": [
            ("Backends", "5 microservicios"),
            ("Módulos", "Sistema completo"),
            ("Pagos", "Flow.cl + Mercado Pago"),
            ("Acceso", "Facial + RFID"),
        ],
        "highlight": "Arquitectura multi-backend con 5 microservicios especializados para máxima escalabilidad y disponibilidad.",
    },
]


class PDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*C_DARK)
        self.cell(0, 10, f"ConectaAI - Informe Confidencial  |  Pagina {self.page_no()}", align="C")

    def filled_rect(self, x, y, w, h, r, g, b):
        self.set_fill_color(r, g, b)
        self.rect(x, y, w, h, style="F")

    def cover_page(self):
        # Background
        self.filled_rect(0, 0, 210, 297, *C_BG)

        # Top accent bar
        self.filled_rect(0, 0, 210, 3, *C_ACCENT)

        # Logo text
        self.set_xy(0, 60)
        self.set_font("Helvetica", "B", 42)
        self.set_text_color(*C_WHITE)
        self.cell(210, 20, "ConectaAI", align="C")

        self.set_xy(0, 82)
        self.set_font("Helvetica", "", 16)
        self.set_text_color(*C_GRAY)
        self.cell(210, 10, "Ecosistema de Soluciones Digitales", align="C")

        # Divider
        self.set_xy(55, 100)
        self.filled_rect(55, 100, 100, 2, *C_ACCENT)

        # Report title
        self.set_xy(0, 110)
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(*C_WHITE)
        self.cell(210, 12, "Informe Ejecutivo de Sistemas", align="C")

        self.set_xy(0, 124)
        self.set_font("Helvetica", "", 13)
        self.set_text_color(*C_GRAY)
        self.cell(210, 8, "Suite · OmniFlow · SEO/SEM Pro · Plataforma Principal", align="C")

        # Date box
        self.filled_rect(65, 145, 80, 22, 15, 23, 42)
        self.set_xy(65, 148)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*C_ACCENT)
        self.cell(80, 7, "Fecha del Informe", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_x(65)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*C_TEXT)
        self.cell(80, 7, datetime.now().strftime("%d de %B de %Y"), align="C")

        # System count boxes
        y = 185
        boxes = [
            ("4", "Sistemas\nActivos"),
            ("5+", "Tecnologias\nPrincipales"),
            ("20+", "Modulos\nFuncionales"),
            ("100%", "Alojamiento\nPropio VPS"),
        ]
        box_w = 40
        gap = 5
        start_x = (210 - (box_w * 4 + gap * 3)) / 2
        for i, (num, label) in enumerate(boxes):
            bx = start_x + i * (box_w + gap)
            self.filled_rect(bx, y, box_w, 38, 15, 23, 42)
            self.set_xy(bx, y + 5)
            self.set_font("Helvetica", "B", 20)
            self.set_text_color(*C_ACCENT)
            self.cell(box_w, 12, num, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.set_x(bx)
            self.set_font("Helvetica", "", 8)
            self.set_text_color(*C_GRAY)
            for ln in label.split("\n"):
                self.cell(box_w, 5, ln, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
                self.set_x(bx)

        # Footer tag
        self.set_xy(0, 260)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(*C_DARK)
        self.cell(210, 6, "Documento confidencial - uso interno", align="C")
        self.set_xy(0, 267)
        self.cell(210, 6, "62.169.17.214  |  Chile", align="C")

    def system_page(self, sys, index):
        # Background
        self.filled_rect(0, 0, 210, 297, *C_BG)
        self.filled_rect(0, 0, 210, 3, *sys["color"])

        # Number badge
        self.filled_rect(15, 12, 16, 16, *sys["color"])
        self.set_xy(15, 13)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*C_WHITE)
        self.cell(16, 14, sys["icon"], align="C")

        # System URL
        self.set_xy(35, 13)
        self.set_font("Helvetica", "", 9)
        r, g, b = sys["color"]
        self.set_text_color(r, g, b)
        self.cell(0, 7, sys["name"])

        # Title
        self.set_xy(35, 20)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(*C_WHITE)
        self.cell(0, 8, sys["title"])

        # Stack pill
        self.set_xy(15, 32)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*C_GRAY)
        self.cell(0, 5, "Stack:  " + sys["stack"])

        # Divider
        self.filled_rect(15, 40, 180, 1, *sys["color"])

        # Description
        self.set_xy(15, 45)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*C_GRAY)
        self.multi_cell(180, 6, sys["description"])

        # ── Stats row ─────────────────────────────────────────────────────────
        y_stats = 80
        stat_w = 42
        stat_gap = 4
        start_x = 15
        for si, (label, val) in enumerate(sys["stats"]):
            sx = start_x + si * (stat_w + stat_gap)
            self.filled_rect(sx, y_stats, stat_w, 22, 15, 23, 42)
            self.set_xy(sx, y_stats + 3)
            self.set_font("Helvetica", "B", 11)
            r2, g2, b2 = sys["color"]
            self.set_text_color(r2, g2, b2)
            self.cell(stat_w, 8, val, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.set_x(sx)
            self.set_font("Helvetica", "", 7)
            self.set_text_color(*C_DARK)
            self.cell(stat_w, 5, label, align="C")

        # ── Modules section ───────────────────────────────────────────────────
        y_mod = 112
        self.set_xy(15, y_mod)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*C_WHITE)
        self.cell(0, 6, "Modulos y Funcionalidades")

        self.filled_rect(15, y_mod + 7, 180, 1, 30, 41, 59)

        y_cur = y_mod + 12
        col_w = 87
        for mi, (mod_name, mod_desc) in enumerate(sys["modules"]):
            col = mi % 2
            row = mi // 2
            mx = 15 + col * (col_w + 6)
            my = y_cur + row * 22

            # Module card bg
            self.filled_rect(mx, my, col_w, 20, 15, 23, 42)

            # Color dot
            self.filled_rect(mx + 4, my + 7, 4, 4, *sys["color"])

            # Module name
            self.set_xy(mx + 12, my + 3)
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(*C_WHITE)
            self.cell(col_w - 14, 5, mod_name)

            # Module description
            self.set_xy(mx + 12, my + 9)
            self.set_font("Helvetica", "", 7)
            self.set_text_color(*C_GRAY)
            self.multi_cell(col_w - 14, 4, mod_desc)

        # ── Highlight box ─────────────────────────────────────────────────────
        y_hl = y_cur + 4 * 22 + 4
        r3, g3, b3 = sys["color"]
        self.filled_rect(15, y_hl, 180, 26, int(r3 * 0.12), int(g3 * 0.12), int(b3 * 0.12 + 10))
        # Border left accent
        self.filled_rect(15, y_hl, 3, 26, *sys["color"])

        self.set_xy(22, y_hl + 4)
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(*sys["color"])
        self.cell(0, 5, "PUNTO DESTACADO")

        self.set_xy(22, y_hl + 10)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*C_TEXT)
        self.multi_cell(170, 5, sys["highlight"])

    def summary_page(self):
        self.filled_rect(0, 0, 210, 297, *C_BG)
        self.filled_rect(0, 0, 210, 3, *C_GREEN)

        self.set_xy(0, 18)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*C_WHITE)
        self.cell(210, 10, "Resumen Ejecutivo del Ecosistema", align="C")

        self.set_xy(0, 30)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*C_GRAY)
        self.cell(210, 6, "ConectaAI  -  Infraestructura propia en VPS Europeo  |  IP: 62.169.17.214", align="C")

        self.filled_rect(15, 42, 180, 1, 30, 41, 59)

        # Architecture overview
        y = 52
        self.set_xy(15, y)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*C_WHITE)
        self.cell(0, 7, "Arquitectura General")

        arch_items = [
            ("Infraestructura",  "VPS Europeo dedicado (62.169.17.214), Docker Compose para todos los servicios"),
            ("Frontend",         "Next.js (App Router) y React con Vite - interfaces modernas y responsivas"),
            ("Backend",          "FastAPI (Python) y NestJS (TypeScript) - APIs REST de alto rendimiento"),
            ("Base de datos",    "PostgreSQL 16 para datos relacionales, SQLite para servicios ligeros"),
            ("Mensajeria",       "WhatsApp Business API via Evolution API - comunicacion directa con clientes"),
            ("Automatizacion",   "n8n self-hosted con 200+ conectores para workflows sin codigo"),
            ("SSL/Proxy",        "Nginx como reverse proxy con SSL de Cloudflare en todos los dominios"),
            ("Correo",           "mail.conectaai.cl - servidor SMTP propio via MailSaaS"),
        ]

        for i, (key, val) in enumerate(arch_items):
            row_y = y + 12 + i * 13
            bg = (15, 23, 42) if i % 2 == 0 else (12, 18, 32)
            self.filled_rect(15, row_y, 180, 12, *bg)

            self.set_xy(18, row_y + 3)
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(*C_ACCENT)
            self.cell(42, 5, key)

            self.set_xy(62, row_y + 3)
            self.set_font("Helvetica", "", 8)
            self.set_text_color(*C_TEXT)
            self.cell(130, 5, val)

        # Value proposition
        y2 = y + 12 + len(arch_items) * 13 + 10
        self.filled_rect(15, y2, 180, 1, 30, 41, 59)

        self.set_xy(15, y2 + 6)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*C_WHITE)
        self.cell(0, 7, "Propuesta de Valor")

        props = [
            ("Ecosistema integrado",   "Todos los sistemas comparten infraestructura y se complementan entre si"),
            ("100% propio",             "Sin dependencia de terceros - datos, codigo e infraestructura bajo control"),
            ("Multi-cliente",           "Arquitectura multi-tenant lista para escalar a nuevos clientes"),
            ("Automatizacion total",    "Flujos de trabajo automatizados reducen intervenciones manuales al minimo"),
            ("IA integrada",            "Capacidades de inteligencia artificial incorporadas en los procesos clave"),
        ]

        for i, (title, desc) in enumerate(props):
            row_y = y2 + 16 + i * 15
            # Color accent
            self.filled_rect(15, row_y, 3, 13, *C_GREEN)
            self.filled_rect(18, row_y, 177, 13, 15, 23, 42)

            self.set_xy(22, row_y + 2)
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(*C_GREEN)
            self.cell(0, 5, title)

            self.set_xy(22, row_y + 7)
            self.set_font("Helvetica", "", 8)
            self.set_text_color(*C_GRAY)
            self.cell(0, 5, desc)

        # Bottom tagline
        self.set_xy(0, 272)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*C_ACCENT)
        self.cell(210, 7, "\"Tecnologia conectada. Negocios que crecen.\"", align="C")
        self.set_xy(0, 280)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*C_DARK)
        self.cell(210, 5, "conectaai.cl  |  soporte@conectaai.cl  |  +56 9 9810 1891", align="C")


def main():
    pdf = PDF()
    pdf.set_auto_page_break(auto=False)
    pdf.set_margins(0, 0, 0)

    # Cover
    pdf.add_page()
    pdf.cover_page()

    # One page per system
    for i, sys in enumerate(SYSTEMS):
        pdf.add_page()
        pdf.system_page(sys, i)

    # Summary
    pdf.add_page()
    pdf.summary_page()

    pdf.output(OUTPUT)
    print(f"PDF generado: {OUTPUT}")
    print(f"Paginas: {pdf.page}")


if __name__ == "__main__":
    main()
