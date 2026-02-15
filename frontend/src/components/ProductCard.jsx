import React from 'react';
import { Link } from 'react-router-dom';
import { Ruler } from 'lucide-react';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden group">
            <div className="relative h-64 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        Sin imagen
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {product.category || 'Cortinas'}
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    <Link to={`/product/${product.id}`}>
                        {product.name}
                    </Link>
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {product.description_short || 'Cortina de alta calidad fabricada a medida.'}
                </p>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-500 text-sm">
                        <Ruler className="w-4 h-4 mr-1" />
                        <span>A medida</span>
                    </div>
                    <span className="text-lg font-bold text-primary-600">
                        Desde ${(parseFloat(product.base_price_m2)).toLocaleString('es-CL')}/m²
                    </span>
                </div>

                <Link
                    to={`/product/${product.id}`}
                    className="mt-4 w-full block text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg transition-colors"
                >
                    Cotizar
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
