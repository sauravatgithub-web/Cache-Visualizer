import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

import { Button } from './ui/button';
import { Card } from './ui/card';

export default function CacheBox(cacheConfig) {
    const [cacheData, setCacheData] = useState([]);
    const [memoryData, setMemoryData] = useState([]);
    const [transition, setTransition] = useState(null);
    const [address, setAddress] = useState('');
    const [operation, setOperation] = useState('read');
    const [log, setLog] = useState([]);

    const handleRequest = async () => {
        try {
            const res = await axios.post('/api/cache/request', { address, operation });
            setCacheData(res.data.cache);
            setMemoryData(res.data.memory);
            setTransition(res.data.transition);
            setLog((prev) => [...prev, { address, operation, hit: res.data.hit }]);
        } catch (err) {
            console.error('Error sending request:', err);
        }
    };

    return (
        <motion.div
            key="sim"
            className="absolute w-full left-0 right-0"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            {/* Simulation view remains unchanged */}
            <div className="grid grid-cols-3 gap-4 w-full">
                <div className="col-span-1">
                    <Card className="p-4 h-full">
                        <h3 className="font-bold mb-2">Cache Blocks</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {cacheData.map((block, i) => (
                                <motion.div
                                    key={i}
                                    className={`p-2 border rounded shadow text-sm ${block.state === transition?.to ? 'border-blue-500 font-bold' : 'border-gray-300'}`}
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <div>Tag: {block.tag}</div>
                                    <div>State: {block.state}</div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="col-span-2 space-y-4">
                    <Card className="p-4">
                        <h3 className="font-bold mb-2">State Diagram</h3>
                        <div className="flex items-center space-x-4">
                            {['Invalid', 'Shared', 'Exclusive', 'Modified'].map((state, i) => (
                                <div
                                    key={i}
                                    className={`px-3 py-1 rounded ${transition?.to === state ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200'}`}
                                >
                                    {state}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4 space-y-2">
                        <h3 className="font-bold">Send Request</h3>
                        <div className="flex gap-2">
                            <input
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="border px-3 py-2 rounded w-full"
                            />
                            <select
                                value={operation}
                                onChange={(e) => setOperation(e.target.value)}
                                className="border px-2 py-2 rounded"
                            >
                                <option value="read">Read</option>
                                <option value="write">Write</option>
                            </select>
                            <Button onClick={handleRequest}>Submit</Button>
                        </div>

                        <div className="mt-4 max-h-40 overflow-auto bg-gray-50 p-2 rounded text-sm">
                            {log.map((entry, i) => (
                                <div key={i} className="border-b py-1">
                                    {entry.operation.toUpperCase()} {entry.address} → {entry.hit ? 'Hit' : 'Miss'}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="col-span-3">
                    <Card className="p-4">
                        <h3 className="font-bold mb-2">Main Memory</h3>
                        <div className="grid grid-cols-6 gap-2">
                            {memoryData.map((val, i) => (
                                <div key={i} className="p-2 bg-white border text-xs rounded shadow">
                                    Addr {i}: {val}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    )
}