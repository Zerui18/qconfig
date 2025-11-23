import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div
                className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDestructive
                                ? 'bg-red-600 hover:bg-red-500'
                                : 'bg-purple-600 hover:bg-purple-500'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
