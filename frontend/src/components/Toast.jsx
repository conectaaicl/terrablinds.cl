import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ICONS = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />
};

const Toast = ({ message, type = 'success', onClose, duration = 3500 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed top-6 right-6 z-[9999] animate-fade-in-up">
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl flex items-center gap-3 px-5 py-4 min-w-[280px] max-w-sm">
                {ICONS[type]}
                <p className="flex-1 text-sm font-medium text-gray-800">{message}</p>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
