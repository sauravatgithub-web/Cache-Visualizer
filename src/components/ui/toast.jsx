import { useEffect } from 'react';

export function Toast({ message, onClose, type = 'info' }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: (
            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    };

    const closeIcon = (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    const bgColors = {
        success: 'bg-green-50 border-green-400',
        info: 'bg-blue-50 border-blue-400',
        error: 'bg-red-50 border-red-400',
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 animate-fade-in-up">
            <div className={`border-l-4 p-4 rounded-md shadow-md w-80 flex items-start gap-3 ${bgColors[type]}`}>
                {icons[type]}
                <div className="text-sm text-gray-900 flex-1">{message}</div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition mt-0.5">
                    {closeIcon}
                </button>
            </div>
        </div>
    );
}