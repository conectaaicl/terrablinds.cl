import React, { useState, useEffect } from 'react';
import { Calculator, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

const ProductCalculator = ({ product }) => {
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [toast, setToast] = useState(null);
    const [addedPulse, setAddedPulse] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const colors = Array.isArray(product?.colors) ? product.colors.filter(Boolean) : [];

    useEffect(() => {
        calculatePrice();
    }, [width, height, product]);

    // Auto-select first color if only one option
    useEffect(() => {
        if (colors.length === 1) setSelectedColor(colors[0]);
    }, [product]);

    const calculatePrice = () => {
        if (!product) { setTotalPrice(0); return; }

        if (product.is_unit_price) {
            const qty = parseFloat(width);
            if (!qty || isNaN(qty)) { setTotalPrice(0); return; }
            setTotalPrice(qty * parseFloat(product.price_unit));
            return;
        }

        if (!width || !height) { setTotalPrice(0); return; }
        const w = parseFloat(width);
        const h = parseFloat(height);
        if (isNaN(w) || isNaN(h)) return;

        // Validate min/max if defined
        if (product.min_width && w < parseFloat(product.min_width)) { setTotalPrice(0); return; }
        if (product.max_width && w > parseFloat(product.max_width)) { setTotalPrice(0); return; }
        if (product.min_height && h < parseFloat(product.min_height)) { setTotalPrice(0); return; }
        if (product.max_height && h > parseFloat(product.max_height)) { setTotalPrice(0); return; }

        const area = (w / 100) * (h / 100);
        const finalArea = area < 1.0 ? 1.0 : area;
        setTotalPrice(Math.round(finalArea * parseFloat(product.base_price_m2)));
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const buildCartItem = () => ({
        productId: product.id,
        productName: product.name,
        name: product.name,
        image: product.images?.[0] || product.image,
        images: product.images,
        color: selectedColor || null,
        width: product.is_unit_price ? 0 : parseFloat(width),
        height: product.is_unit_price ? 0 : parseFloat(height),
        quantity: product.is_unit_price ? parseFloat(width) : 1,
        price: totalPrice,
        displayDetails: product.is_unit_price
            ? `${width} unidades${selectedColor ? ` — ${selectedColor}` : ''}`
            : `${width}x${height}cm${selectedColor ? ` — ${selectedColor}` : ''}`
    });

    const handleAddToCart = () => {
        if (isDisabled) return;
        addToCart(buildCartItem());
        showToast('Producto agregado a la cotización', 'success');
        setAddedPulse(true);
        setTimeout(() => setAddedPulse(false), 600);
    };

    const handleBuyNow = () => {
        if (isDisabled) return;
        addToCart(buildCartItem());
        navigate('/cart');
    };

    const getValidationMessage = () => {
        if (!product) return '';
        if (!product.is_unit_price) {
            const w = parseFloat(width);
            const h = parseFloat(height);
            if (width && product.min_width && w < parseFloat(product.min_width))
                return `Ancho mínimo: ${product.min_width} cm`;
            if (width && product.max_width && w > parseFloat(product.max_width))
                return `Ancho máximo: ${product.max_width} cm`;
            if (height && product.min_height && h < parseFloat(product.min_height))
                return `Alto mínimo: ${product.min_height} cm`;
            if (height && product.max_height && h > parseFloat(product.max_height))
                return `Alto máximo: ${product.max_height} cm`;
        }
        return '';
    };

    const validationMsg = getValidationMessage();
    const isDisabled = !totalPrice || totalPrice <= 0;

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-6 text-primary-600">
                    <Calculator className="w-6 h-6 mr-2" />
                    <h3 className="text-xl font-bold">Cotizador Online</h3>
                </div>

                <div className="space-y-4">
                    {/* Dimension inputs */}
                    {!product.is_unit_price ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ancho (cm)
                                        {product.min_width && product.max_width && (
                                            <span className="text-xs text-gray-400 ml-1">({product.min_width}–{product.max_width})</span>
                                        )}
                                    </label>
                                    <input type="number" value={width} onChange={(e) => setWidth(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Ej: 150"
                                        min={product.min_width || 1}
                                        max={product.max_width || undefined} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alto (cm)
                                        {product.min_height && product.max_height && (
                                            <span className="text-xs text-gray-400 ml-1">({product.min_height}–{product.max_height})</span>
                                        )}
                                    </label>
                                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Ej: 200"
                                        min={product.min_height || 1}
                                        max={product.max_height || undefined} />
                                </div>
                            </div>
                            {validationMsg && (
                                <p className="text-sm text-red-500">{validationMsg}</p>
                            )}
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (Unidades)</label>
                            <input type="number" value={width} onChange={(e) => setWidth(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Ej: 1" min="1" />
                        </div>
                    )}

                    {/* Color selector */}
                    {colors.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color / Tela
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color === selectedColor ? '' : color)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                                            selectedColor === color
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        {selectedColor === color && <Check className="inline w-3 h-3 mr-1" />}
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price display */}
                    <div className="pt-4 border-t border-gray-100 mt-6">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-gray-600">Precio Estimado:</span>
                            <span className="text-3xl font-bold text-gray-900">
                                ${totalPrice.toLocaleString('es-CL')}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-6">*Precio referencial. Área mínima facturada: 1 m².</p>

                        {product.lead_time_days && (
                            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-4">
                                Plazo de fabricación estimado: {product.lead_time_days} días hábiles
                            </p>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={isDisabled}
                                className={`w-full py-3 font-bold rounded-lg transition-all flex justify-center items-center border-2 ${
                                    isDisabled
                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                        : `border-primary-600 text-primary-600 hover:bg-primary-50 ${addedPulse ? 'scale-95' : ''}`
                                }`}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Agregar a Cotización
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={isDisabled}
                                className={`w-full py-4 font-bold rounded-lg transition-all flex justify-center items-center shadow-lg ${
                                    isDisabled
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-xl'
                                }`}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                COMPRAR AHORA
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductCalculator;
