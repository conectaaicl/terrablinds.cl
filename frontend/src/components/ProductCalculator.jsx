import React, { useState, useEffect } from 'react';
import { Calculator, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCalculator = ({ product }) => {
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        calculatePrice();
    }, [width, height, product]);

    const calculatePrice = () => {
        if (!product) {
            setTotalPrice(0);
            return;
        }

        if (product.is_unit_price) {
            const qty = parseFloat(width);
            if (!qty || isNaN(qty)) {
                setTotalPrice(0);
                return;
            }
            setTotalPrice(qty * product.price_unit);
            return;
        }

        if (!width || !height) {
            setTotalPrice(0);
            return;
        }

        const w = parseFloat(width);
        const h = parseFloat(height);

        if (isNaN(w) || isNaN(h)) return;

        const area = (w / 100) * (h / 100);
        const minArea = 1.0;
        const finalArea = area < minArea ? minArea : area;
        const price = finalArea * product.base_price_m2;
        setTotalPrice(Math.round(price));
    };

    const handleAddToCart = () => {
        const details = product.is_unit_price
            ? `${width} unidades`
            : `${width}x${height}cm`;

        const cartItem = {
            productId: product.id,
            productName: product.name,
            name: product.name,
            image: product.images?.[0] || product.image,
            images: product.images,
            width: product.is_unit_price ? 0 : parseFloat(width),
            height: product.is_unit_price ? 0 : parseFloat(height),
            quantity: product.is_unit_price ? parseFloat(width) : 1,
            price: totalPrice,
            displayDetails: details
        };

        addToCart(cartItem);
    };

    const isDisabled = !totalPrice || totalPrice <= 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center mb-6 text-primary-600">
                <Calculator className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold">Cotizador Online</h3>
            </div>

            <div className="space-y-4">
                <div>
                    {!product.is_unit_price ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (cm)</label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Ej: 150"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alto (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Ej: 200"
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (Unidades)</label>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Ej: 1"
                            />
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 mt-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-gray-600">Precio Estimado:</span>
                        <span className="text-3xl font-bold text-gray-900">
                            ${totalPrice.toLocaleString('es-CL')}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">*Precio referencial, incluye IVA.</p>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={isDisabled}
                            style={{
                                backgroundColor: isDisabled ? '#e5e7eb' : '#ffffff',
                                borderWidth: '2px',
                                borderColor: isDisabled ? '#d1d5db' : '#2563eb',
                                color: isDisabled ? '#9ca3af' : '#2563eb',
                                cursor: isDisabled ? 'not-allowed' : 'pointer'
                            }}
                            className="w-full py-3 font-bold rounded-lg transition-colors flex justify-center items-center hover:bg-blue-50"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Agregar a Cotización
                        </button>

                        <button
                            onClick={() => {
                                handleAddToCart();
                                alert('✅ Producto agregado al carrito');
                                setTimeout(() => {
                                    navigate('/cart');
                                }, 300);
                            }}
                            disabled={isDisabled}
                            style={{
                                backgroundColor: isDisabled ? '#9ca3af' : '#2563eb',
                                color: isDisabled ? '#d1d5db' : '#ffffff',
                                cursor: isDisabled ? 'not-allowed' : 'pointer'
                            }}
                            className="w-full py-4 font-bold rounded-lg transition-all flex justify-center items-center shadow-lg hover:shadow-xl"
                        >
                            <span className="mr-2 text-xl">🛒</span> COMPRAR AHORA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCalculator;
