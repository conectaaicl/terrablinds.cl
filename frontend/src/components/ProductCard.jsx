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

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                        <ShoppingCart className="w-10 h-10" />
                        <span className="text-xs">Sin imagen</span>
                    </div>
                )}
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gray-200">
                        {product.category || 'Cortinas'}
                    </span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link
                        to={`/product/${product.id}`}
                        className="flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:bg-blue-50 transition-colors"
                    >
                        Ver detalles <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                    {product.short_description || 'Fabricado a medida para tus espacios.'}
                </p>

                {/* Price + measure */}
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

                {/* CTA */}
                <Link
                    to={`/product/${product.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-blue-200"
                >
                    <ShoppingCart className="w-4 h-4" /> Cotizar a medida
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
