import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';

function imgSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://terrablinds.cl${url.startsWith('/') ? '' : '/'}${url}`;
}

const ProductCard = ({ product }) => {
  const image = imgSrc(product.images?.[0] || product.image_url || product.image || '');
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
            <span className="text-primary-300 text-4xl font-display font-bold">{product.name?.[0] || 'T'}</span>
          </div>
        )}
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-semibold rounded-full shadow-sm">
              <Tag className="w-3 h-3" />{product.category}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">{product.short_description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          {product.base_price > 0 ? (
            <span className="font-bold text-primary-700 text-sm">
              Desde ${Number(product.base_price).toLocaleString('es-CL')}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Precio a cotizar</span>
          )}
          <span className="flex items-center gap-1 text-primary-600 text-sm font-semibold group-hover:gap-2 transition-all">
            Ver <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
