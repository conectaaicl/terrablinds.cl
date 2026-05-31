#!/usr/bin/env python3
import os

# ── Fix 1: Center the hero in index.html
index_path = '/var/www/amav2/backend/templates/index.html'
content = open(index_path).read()

# Center hero-content and all its children
content = content.replace(
    '  .hero-content {\n    position: relative; max-width: 660px;\n  }',
    '  .hero-content {\n    position: relative; max-width: 660px; margin: 0 auto; text-align: center;\n  }'
)

content = content.replace(
    '  .hero-ctas { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }',
    '  .hero-ctas { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; justify-content: center; }'
)

content = content.replace(
    '  .hero-trust {\n    display: flex; flex-wrap: wrap; gap: 20px;\n    margin-top: 40px; padding-top: 32px;\n    border-top: 1px solid var(--border-soft);\n  }',
    '  .hero-trust {\n    display: flex; flex-wrap: wrap; gap: 20px;\n    margin-top: 40px; padding-top: 32px;\n    border-top: 1px solid var(--border-soft);\n    justify-content: center;\n  }'
)

content = content.replace(
    '  .hero-sub {\n    font-size: 17px; color: var(--muted); line-height: 1.75;\n    max-width: 480px; margin-bottom: 36px;\n  }',
    '  .hero-sub {\n    font-size: 17px; color: var(--muted); line-height: 1.75;\n    max-width: 480px; margin: 0 auto 36px; \n  }'
)

open(index_path, 'w').write(content)
print('Fix 1: hero centered in index.html')

# ── Fix 2: Write todos.html with sidebar
todos_html = '''{% extends "base.html" %}
{% block title %}Todos los productos — AMA Lencería{% endblock %}

{% block extra_styles %}
<style>
  .page-hero {
    padding: 44px 0 36px; background: var(--cream);
    text-align: center; border-bottom: 1px solid var(--border-soft);
  }
  .page-hero-icon { font-size: 40px; margin-bottom: 10px; }
  .page-hero h1 {
    font-family: \'Cormorant Garamond\', serif;
    font-size: clamp(26px, 4vw, 40px); font-weight: 700;
    color: var(--dark); margin-bottom: 6px;
  }
  .page-hero-sub { font-size: 13px; color: var(--muted); }
  .breadcrumb-bar {
    display: flex; align-items: center; justify-content: center;
    gap: 6px; font-size: 12px; color: var(--muted); margin-bottom: 14px;
  }
  .breadcrumb-bar a { color: var(--muted); transition: color .2s; }
  .breadcrumb-bar a:hover { color: var(--rose); }
  .breadcrumb-bar span { color: var(--border); }

  .page-layout {
    display: grid; grid-template-columns: 220px 1fr;
    gap: 36px; padding: 40px 0 72px; align-items: start;
  }
  .page-sidebar {
    position: sticky; top: 80px; background: var(--white);
    border: 1px solid var(--border-soft); border-radius: var(--r); overflow: hidden;
  }
  .sidebar-head {
    padding: 14px 16px; border-bottom: 1px solid var(--border-soft);
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
  }
  .sidebar-nav { padding: 8px; }
  .sidebar-link {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 10px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; color: var(--muted);
    transition: all .2s; margin-bottom: 2px;
  }
  .sidebar-link:hover { background: var(--rose-light); color: var(--rose); }
  .sidebar-link.active { background: var(--rose-light); color: var(--rose); font-weight: 600; }
  .sidebar-link-icon { font-size: 14px; flex-shrink: 0; }
  .sidebar-divider { height: 1px; background: var(--border-soft); margin: 6px 8px; }
  .sidebar-wa {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    margin: 8px; padding: 10px 12px; background: #25d366; color: #fff;
    border-radius: var(--r-sm); font-size: 12px; font-weight: 600; transition: background .2s;
  }
  .sidebar-wa:hover { background: #1ea855; }
  .sidebar-wa svg { width: 14px; height: 14px; flex-shrink: 0; }
  .page-content { min-width: 0; }

  @media (max-width: 768px) {
    .page-layout { grid-template-columns: 1fr; gap: 16px; }
    .page-sidebar { position: static; display: flex; flex-wrap: wrap; align-items: center; padding: 8px; gap: 4px; }
    .sidebar-head { display: none; }
    .sidebar-nav { display: flex; flex-wrap: wrap; gap: 4px; padding: 0; flex: 1; }
    .sidebar-link { padding: 5px 9px; font-size: 12px; margin-bottom: 0; }
    .sidebar-divider { display: none; }
    .sidebar-wa { margin: 4px; padding: 6px 11px; font-size: 12px; }
  }
</style>
{% endblock %}

{% block content %}

<div class="page-hero">
  <div class="breadcrumb-bar">
    <a href="/">Inicio</a>
    <span>/</span>
    <span>Colección completa</span>
  </div>
  <div class="page-hero-icon">🛍️</div>
  <h1>Colección completa</h1>
  <p class="page-hero-sub">{{ products|length }} producto{% if products|length != 1 %}s{% endif %} disponibles · Seleccionados con criterio</p>
</div>

<div class="container">
  <div class="page-layout">

    <aside class="page-sidebar">
      <div class="sidebar-head">Categorías</div>
      <nav class="sidebar-nav">
        <a href="/" class="sidebar-link">
          <span class="sidebar-link-icon">🏠</span> Inicio
        </a>
        <a href="/productos" class="sidebar-link active">
          <span class="sidebar-link-icon">🛍️</span> Todos los productos
        </a>
        <div class="sidebar-divider"></div>
        {% for cat in categories %}
        <a href="/categoria/{{ cat.slug }}" class="sidebar-link">
          <span class="sidebar-link-icon">{{ cat.icon }}</span> {{ cat.name }}
        </a>
        {% endfor %}
      </nav>
      <div class="sidebar-divider"></div>
      <a href="https://wa.me/{{ s.wa_number or \'593978873309\' }}?text=Hola,%20quiero%20asesoría%20sobre%20sus%20productos" target="_blank" class="sidebar-wa">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </a>
    </aside>

    <div class="page-content">
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">
        <a href="/productos" class="cat-chip active">🛍️ Todos</a>
        {% for cat in categories %}
        <a href="/categoria/{{ cat.slug }}" class="cat-chip">{{ cat.icon }} {{ cat.name }}</a>
        {% endfor %}
      </div>

      {% if products %}
      <div class="products-grid">
        {% for p in products %}
        <a href="/producto/{{ p.id }}" class="product-card">
          <div class="product-img">
            {% if p.stock == 0 %}
              <div class="agotado-overlay"><span>Agotado</span></div>
              <span class="agotado-badge">Agotado</span>
            {% elif p.stock > 0 and p.stock <= 5 %}
              <span class="stock-badge stock-low">Últimas {{ p.stock }}</span>
            {% elif p.stock > 5 %}
              <span class="stock-badge stock-ok">{{ p.stock }} disp.</span>
            {% endif %}
            {% if p.image %}
            <img src="/static/uploads/{{ p.image }}" alt="{{ p.name }}" loading="lazy">
            {% else %}
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;color:var(--muted)">
              {{ p.category_obj.icon if p.category_obj else "🛍️" }}
            </div>
            {% endif %}
            {% if p.featured %}<span class="product-badge">⭐ Popular</span>{% endif %}
          </div>
          <div class="product-info">
            {% if p.category_obj %}<div class="product-category">{{ p.category_obj.name }}</div>{% endif %}
            <div class="product-name">{{ p.name }}</div>
            <div class="product-desc">{{ p.description[:75] }}{% if p.description|length > 75 %}…{% endif %}</div>
            <div class="product-footer">
              <div class="product-price"><small>$</small> {{ "%.2f"|format(p.price) }}</div>
              <span class="btn-wa">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Comprar
              </span>
            </div>
          </div>
        </a>
        {% endfor %}
      </div>
      {% else %}
      <div style="text-align:center;padding:80px 20px;color:var(--muted)">
        <div style="font-size:56px;margin-bottom:16px">🛍️</div>
        <p style="font-size:18px;font-weight:600;color:var(--dark)">Próximamente más productos</p>
      </div>
      {% endif %}
    </div>
  </div>
</div>

{% endblock %}
'''

open('/var/www/amav2/backend/templates/todos.html', 'w').write(todos_html)
print('Fix 2: todos.html rewritten with sidebar + centered hero')

print('All done')
