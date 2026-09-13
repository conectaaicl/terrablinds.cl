import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Search, Package, ArrowRight, Zap, X, ArrowUpDown, Check } from 'lucide-react';
import api from '../api';

const DEFAULT_HERO = [
    { img: '/assets/catalog/catalog-hero1.webp', label: 'Cortinas Roller',  sub: 'Blackout · Screen · Duo' },
    { img: '/assets/catalog/catalog-hero2.webp', label: 'Persianas Ext.',   sub: 'Aluminio · Exteriores' },
    { img: '/assets/catalog/catalog-hero3.webp', label: 'Toldos',           sub: 'Retráctiles · Terraza' },
];

const COMPARADOR = [
    {
        name: 'Blackout',
        badge: 'Oscuridad total',
        items: ['Bloquea 100% la luz', 'Ideal dormitorios y home theater', 'Alta privacidad', 'Aislante térmico'],
    },
    {
        name: 'Screen',
        badge: 'Vista exterior',
        items: ['Filtra UV sin perder vista', 'Ahorra energía AC', 'Reduce deslumbramiento', 'Colores naturales interiores'],
    },
    {
        name: 'Duo / Zebra',
        badge: 'Lo mejor de ambos',
        items: ['Control de luz preciso', 'Estética moderna premium', 'Privacidad graduable', 'Ideal living y oficinas'],
    },
];

const SORTS = [
    { key: 'destacados', label: 'Destacados' },
    { key: 'precio-asc', label: 'Menor precio' },
    { key: 'precio-desc', label: 'Mayor precio' },
    { key: 'nombre', label: 'Nombre A-Z' },
];

const priceOf = (p) => parseFloat(p.base_price_m2 || 0);

const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cfg, setCfg] = useState({});
    const [sortOpen, setSortOpen] = useState(false);

    // URL is the single source of truth, so a filtered view can be shared or bookmarked.
    const category = searchParams.get('category') || 'all';
    const subcategory = searchParams.get('sub') || 'all';
    const search = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'destacados';

    const setParam = (key, value, resets = []) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all' || value === '') next.delete(key);
        else next.set(key, value);
        resets.forEach(r => next.delete(r));
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        api.get('/api/config/public').then(res => {
            const d = Object.fromEntries(Object.entries(res.data).filter(([, v]) => v !== '' && v !== null && v !== undefined));
            setCfg(d);
        }).catch(() => {});

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get('/api/products');
                const baseUrl = import.meta.env.VITE_API_URL;
                const data = res.data.map(p => {
                    if (typeof p.images === 'string') try { p.images = JSON.parse(p.images); } catch (e) { p.images = []; }
                    if (typeof p.features === 'string') try { p.features = JSON.parse(p.features); } catch (e) { p.features = []; }
                    if (Array.isArray(p.images)) {
                        p.images = p.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`);
                    }
                    return p;
                });
                setProducts(data);
            } catch (err) {
                setError('No se pudieron cargar los productos.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const categories = useMemo(
        () => [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
        [products]
    );

    const subcategories = useMemo(() => {
        if (category === 'all') return [];
        return [...new Set(
            products.filter(p => p.category === category).map(p => p.subcategory).filter(Boolean)
        )].sort();
    }, [products, category]);

    const countFor = (cat) => products.filter(p => p.category === cat).length;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = products.filter(p => {
            if (category !== 'all' && p.category !== category) return false;
            if (subcategory !== 'all' && p.subcategory !== subcategory) return false;
            if (q) {
                const haystack = `${p.name} ${p.short_description || ''} ${p.category || ''}`.toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });

        if (sort === 'nombre') {
            list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
        } else if (sort === 'precio-asc' || sort === 'precio-desc') {
            // Products without a price sit at the end either way, never above priced ones.
            const dir = sort === 'precio-asc' ? 1 : -1;
            list = [...list].sort((a, b) => {
                const pa = priceOf(a), pb = priceOf(b);
                if (!pa && !pb) return 0;
                if (!pa) return 1;
                if (!pb) return -1;
                return (pa - pb) * dir;
            });
        } else {
            // Destacados: los que tienen foto primero — una tarjeta con imagen vende más.
            list = [...list].sort((a, b) => (b.images?.length ? 1 : 0) - (a.images?.length ? 1 : 0));
        }
        return list;
    }, [products, category, subcategory, search, sort]);

    const hasFilters = category !== 'all' || subcategory !== 'all' || search !== '' || sort !== 'destacados';
    const clearAll = () => setSearchParams({}, { replace: true });
    const sortLabel = SORTS.find(s => s.key === sort)?.label || 'Destacados';

    return (
        <Layout>
            <SEO
                title="Catálogo de Productos"
                description="Cortinas roller, blackout, sunscreen, persianas y más. Precios por m² con instalación experta a todo Chile."
                path="/catalog"
            />

            {/* ── Hero ── */}
            <div style={{ background: 'linear-gradient(135deg,#06101f,#0b2a55)' }} className="text-white py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase text-blue-300 border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 rounded-full mb-5">
                                Fabricación a medida · Santiago y todo Chile
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
                                {cfg.catalog_title || <>Catálogo <span style={{ color: '#3b82f6' }}>TerraBlinds</span></>}
                            </h1>
                            <p className="text-blue-100/80 text-lg leading-relaxed mb-8 max-w-lg">
                                {cfg.catalog_subtitle || 'Cortinas roller, blackout, screen, duo, persianas, toldos y más. Todo fabricado a medida para tus espacios.'}
                            </p>
                            <div className="flex gap-3 flex-wrap">
                                <Link to="/quote" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors">
                                    Cotizar ahora <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl text-sm transition-colors text-white/80 hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}>
                                    Hablar con un asesor
                                </Link>
                            </div>
                        </div>

                        {(() => {
                            const cards = DEFAULT_HERO.map((d, i) => ({
                                img:   cfg[`catalog_hero${i + 1}_image`] || d.img,
                                label: cfg[`catalog_hero${i + 1}_label`] || d.label,
                                sub:   cfg[`catalog_hero${i + 1}_sub`]   || d.sub,
                            }));
                            return (
                                <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-2.5" style={{ height: '320px' }}>
                                    <div className="row-span-2 relative rounded-2xl overflow-hidden shadow-2xl">
                                        <img src={cards[0].img} alt={cards[0].label} className="w-full h-full object-cover object-center" />
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%,rgba(3,9,18,0.88))' }} />
                                        <div className="absolute bottom-0 left-0 p-4">
                                            <p className="text-white font-bold text-sm">{cards[0].label}</p>
                                            <p className="text-blue-200 text-[10px]">{cards[0].sub}</p>
                                        </div>
                                    </div>
                                    {cards.slice(1).map((c, i) => (
                                        <div key={i} className="relative rounded-2xl overflow-hidden shadow-xl">
                                            <img src={c.img} alt={c.label} className="w-full h-full object-cover object-center" />
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%,rgba(3,9,18,0.82))' }} />
                                            <div className="absolute bottom-0 left-0 p-3">
                                                <p className="text-white font-bold text-xs">{c.label}</p>
                                                <p className="text-blue-200 text-[9px]">{c.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* ── Toolbar: búsqueda + categorías + orden, todo pegado arriba ── */}
            <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4">
                    {/* fila 1: buscar + orden */}
                    <div className="flex items-center gap-3 pt-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="search"
                                value={search}
                                onChange={e => setParam('q', e.target.value)}
                                placeholder="Buscar cortina, persiana, toldo..."
                                aria-label="Buscar productos"
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
                            />
                            {search && (
                                <button
                                    onClick={() => setParam('q', '')}
                                    aria-label="Limpiar búsqueda"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="relative shrink-0">
                            <button
                                onClick={() => setSortOpen(o => !o)}
                                aria-expanded={sortOpen}
                                aria-haspopup="listbox"
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:text-blue-700 transition"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="hidden sm:inline">{sortLabel}</span>
                            </button>
                            {sortOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                                    <ul
                                        role="listbox"
                                        className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-20 py-1"
                                    >
                                        {SORTS.map(s => (
                                            <li key={s.key}>
                                                <button
                                                    role="option"
                                                    aria-selected={sort === s.key}
                                                    onClick={() => { setParam('sort', s.key); setSortOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                                                        sort === s.key ? 'text-blue-700 font-bold bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {s.label}
                                                    {sort === s.key && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>

                    {/* fila 2: categorías */}
                    <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
                        <button
                            onClick={() => setParam('category', 'all', ['sub'])}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                category === 'all'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                            Todos {!loading && `(${products.length})`}
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setParam('category', cat, ['sub'])}
                                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                    category === cat
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {cat} ({countFor(cat)})
                            </button>
                        ))}
                        {hasFilters && (
                            <button
                                onClick={clearAll}
                                className="shrink-0 ml-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <X className="w-3 h-3" /> Limpiar
                            </button>
                        )}
                    </div>

                    {/* fila 3: subcategorías, solo si la categoría elegida las tiene */}
                    {subcategories.length > 0 && (
                        <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none">
                            <button
                                onClick={() => setParam('sub', 'all')}
                                className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                    subcategory === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Todas
                            </button>
                            {subcategories.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => setParam('sub', sub)}
                                    className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                        subcategory === sub ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Grilla ── */}
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-10">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                    <div className="aspect-[4/3] bg-gray-200" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                        <div className="h-9 bg-gray-200 rounded-xl mt-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
                            <Package className="w-10 h-10 text-red-300 mx-auto mb-3" />
                            <p className="text-red-500 font-semibold">{error}</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <>
                            <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
                                <p className="text-gray-500 text-sm">
                                    <strong className="text-gray-900 font-bold">{filtered.length}</strong>{' '}
                                    producto{filtered.length !== 1 ? 's' : ''}
                                    {category !== 'all' && <> en <strong className="text-gray-700">{category}</strong></>}
                                    {search && <> para “<strong className="text-gray-700">{search}</strong>”</>}
                                </p>
                                <p className="text-gray-400 text-xs">Orden: {sortLabel}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filtered.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 px-6">
                            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-700 font-bold mb-1">
                                {search ? <>Nada coincide con “{search}”</> : 'Sin productos en este filtro'}
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                Fabricamos a medida: si no lo ves aquí, igual podemos hacerlo.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {hasFilters && (
                                    <button onClick={clearAll} className="px-5 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                        Ver todo el catálogo
                                    </button>
                                )}
                                <Link to="/quote" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                                    Pedir cotización a medida
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Comparador ── */}
            <section style={{ background: 'linear-gradient(135deg,#06101f,#0a2851)' }} className="py-20 px-4 text-white">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-10">
                        <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase text-blue-300 border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 rounded-full mb-4">
                            ¿Cuál elegir?
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ letterSpacing: '-0.03em' }}>
                            Blackout · Screen · <span style={{ color: '#60a5fa' }}>Duo Zebra</span>
                        </h2>
                        <p className="text-blue-100/70 max-w-xl mx-auto text-sm leading-relaxed">
                            Tres tipos de cortina roller para cada necesidad. Compara y elige el que mejor se adapta a tu espacio.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {COMPARADOR.map(({ name, badge, items }) => (
                            <div key={name} className="rounded-2xl p-6 flex flex-col gap-3"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">{badge}</span>
                                <h3 className="text-xl font-extrabold text-white">{name}</h3>
                                <ul className="space-y-2 mt-1">
                                    {items.map(it => (
                                        <li key={it} className="flex items-start gap-2 text-[12px] text-blue-100/80">
                                            <Zap className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                                            {it}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 text-center">
                        <Link to="/quote" className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-900/50">
                            Cotizar mi cortina ideal <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CTA final ── */}
            {!loading && filtered.length > 0 && (
                <div className="bg-gray-50 px-4 pb-16">
                    <div className="container mx-auto max-w-4xl">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
                            <h3 className="text-xl font-bold mb-2">¿No encuentras lo que buscas?</h3>
                            <p className="text-blue-200 text-sm mb-5">Cotiza cualquier producto personalizado o consulta con nuestro equipo.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link to="/quote" className="px-6 py-2.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm">
                                    Cotización personalizada
                                </Link>
                                <Link to="/contact" className="px-6 py-2.5 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm">
                                    Hablar con un asesor
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Catalog;
