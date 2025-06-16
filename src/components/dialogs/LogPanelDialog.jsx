import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export default function LogPanel({ show, setShow, log }) {
    const panelRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShow(false);
            }
        };
        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show]);

    if (!show) return null;

    return (
        <motion.div
            ref={panelRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 p-0 border-l border-gray-200 rounded-l-xl overflow-hidden"
        >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800">🧾 Cache Logs</h3>
                <Button variant="ghost" size="sm" onClick={() => setShow(false)}>✕</Button>
            </div>

            {/* Log content */}
            <div className="px-4 py-3 space-y-2 overflow-y-auto h-[calc(100%-56px)]">
                {log.length === 0 ? (
                    <p className="text-gray-500 italic text-center pt-10">No cache logs yet.</p>
                ) : (
                    log.map((entry, i) => (
                        <div
                            key={i}
                            className="rounded border border-blue-600 px-3 py-2 bg-gray-50 hover:bg-white shadow-sm transition"
                        >
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span>{entry.operation.toUpperCase()} Addr: {entry.address}</span>
                                <span className={entry.hit ? 'text-green-600' : 'text-red-500'}>
                                    {entry.hit ? '✅' : '❌'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 flex justify-between">
                                <span>Block: {entry.accessedBlock}</span>
                                <span>Tag: {entry.tag}</span>
                            </div>
                            <div className="text-xs text-gray-400 italic">{entry.transition}</div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}