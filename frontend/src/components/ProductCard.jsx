import React from 'react';
import { Link } from 'react-router-dom';
import { Ruler, ShoppingCart, ArrowRight } from 'lucide-react';

const baseUrl = import.meta.env.VITE_API_URL;

const ProductCard = ({ product }) => {
    const getImageUrl = (img) => {
        if (!img) return '';
        return img.startsWith('http') ? img : `${baseUrl}${img}`;
    };

    const price = parseFloat(product.base_price_m2 || 0);
    const hasImage = Array.isArray(product.images) && product.images.length > 0;
    const href = `/product/${product.id}`;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 overflow-hidden group flex flex-col">
            <Link to={href} className="relative aspect-[4/3] overflow-hidden bg-gray-100 block">
                {hasImage ? (
                    <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    // Sin foto todavía: rótulo tipográfico de marca en vez de un icono de "roto".
                    <div
                        className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center"
                        style={{ background: 'linear-gradient(135deg,#0b2a55,#06101f)' }}
                    >
                        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-300">TerraBlinds</span>
                        <span className="text-white font-extrabold text-base leading-tight">{product.name}</span>
                        <span className="text-[10px] text-blue-200/70">Fabricado a medida</span>
                    </div>
                )}

                <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gray-200">
                        {product.category || 'Cortinas'}
                    </span>
                </div>

                <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg">
                        Ver detalles <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </Link>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 line-clamp-2">
                    <Link to={href} className="hover:text-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                        {product.name}
                    </Link>
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                    {product.short_description || 'Fabricado a medida para tus espacios.'}
                </p>

                <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Ruler className="w-3.5 h-3.5" />
                        <span>A medida</span>
                    </div>
                    {price > 0 ? (
                        <div className="text-right">
                            <span className="text-[10px] text-gray-400 block">Desde</span>
                            <span className="text-base font-black text-blue-700">
                                ${price.toLocaleString('es-CL')}<span className="text-xs font-semibold text-blue-500">/m²</span>
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm font-semibold text-gray-500">Precio a consultar</span>
                    )}
                </div>

                <Link
                    to={href}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                    <ShoppingCart className="w-4 h-4" /> Cotizar a medida
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
