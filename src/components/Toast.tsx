import React, { useEffect } from 'react';
import { Check, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    onClose,
    duration = 3000
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <Check size={18} className="text-green-400" />,
        info: <Info size={18} className="text-blue-400" />,
        error: <AlertTriangle size={18} className="text-red-400" />,
    };

    const bgColors = {
        success: 'bg-gray-900 border-green-500/30',
        info: 'bg-gray-900 border-blue-500/30',
        error: 'bg-gray-900 border-red-500/30',
    };

    return (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl animate-in fade-in slide-in-from-bottom-4 ${bgColors[type]}`}>
            {icons[type]}
            <span className="text-sm font-medium text-gray-200">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-gray-500 hover:text-gray-300 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
};
