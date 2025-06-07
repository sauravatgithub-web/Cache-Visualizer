import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';

const memoryData = [
  [18, 52, 86, 120],
  [154, 188, 222, 240],
  [17, 34, 51, 68],
  [85, 102, 119, 136],
  [153, 170, 187, 204],
  [221, 238, 255, 0],
  [10, 27, 44, 61],
  [78, 95, 106, 123],
];

export default function CacheBox({ cacheConfig }) {
  const [cacheData, setCacheData] = useState([]);
  const [address, setAddress] = useState('');
  const [operation, setOperation] = useState('read');
  const [data, setData] = useState('0');
  const [log, setLog] = useState([]);
  const [lastAccessed, setLastAccessed] = useState(null);

  const totalBlocks = Math.floor(cacheConfig.cacheSize / cacheConfig.blockSize);
  const associativity = cacheConfig.associativity || 1;
  const totalLines = Math.ceil(totalBlocks / associativity);

  const blocksToRender =
    cacheData.length > 0
      ? cacheData
      : Array.from({ length: totalBlocks }, () => ({
          tag: '-',
          state: 'Invalid',
          data: ['-', '-', '-', '-'],
        }));

  const cacheLines = [];
  for (let i = 0; i < totalLines; i++) {
    cacheLines.push(blocksToRender.slice(i * associativity, (i + 1) * associativity));
  }

  const stateColors = {
    Invalid : 'bg-red-200 text-gray-500',
    MissPending : 'bg-yellow-200 text-yellow-800',
    Valid : 'bg-green-200 text-green-800',
    Modified : 'bg-orange-200 text-red-800',
  };

  const handleRequest = async () => {
    try {
      const res = await axios.post('/api/cache/request', {
        address,
        operation,
        data: operation === 'write' ? data : undefined,
      });
      setCacheData(res.data.cache);
      setLastAccessed(res.data.accessedBlock);
      setLog((prev) => [
        ...prev,
        {
          address,
          operation,
          hit: res.data.hit,
          accessedBlock: res.data.accessedBlock,
        },
      ]);
    } catch (err) {
      console.error('Error sending request:', err);
    }
  };

  useEffect(() => {
    if (operation === 'read') setData('');
    else setData('0');
  }, [operation]);

  return (
    <motion.div
      key="sim"
      className="absolute w-full h-full left-0 right-0 overflow-hidden"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="flex w-full h-full">
        {/* Cache Panel */}
        <div className="w-[65%] h-full px-4 py-3">
          <Card className="p-4 h-full flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Cache Blocks</h3>
            <div className="flex flex-col gap-4">
              {cacheLines.map((lineBlocks, lineIndex) => (
                <div key={lineIndex} className="flex gap-3 w-full">
                  {lineBlocks.map((block, i) => {
                    const blockIndex = lineIndex * associativity + i;
                    const isAccessed = blockIndex === lastAccessed;
                    const stateColor = stateColors[block.state] || 'bg-gray-200';
                    return (
                      <motion.div
                        key={blockIndex}
                        layout
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-xl shadow border p-2 flex flex-col transition-transform duration-200 ease-in-out ${
                          isAccessed ? 'ring-2 ring-blue-600 scale-105' : ''
                        }`}
                        style={{ flex: 1, minWidth: 0, maxWidth: `${100 / associativity}%` }}
                      >
                        <div className={`text-center font-medium border-b py-1 rounded-t ${stateColor}`}>
                          {block.state}
                        </div>
                        <div className="text-center py-1 border-b text-sm text-gray-700">
                          {block.tag}
                        </div>
                        <div className="grid grid-cols-4 gap-1 pt-2">
                          {block.data.map((val, idx) => (
                            <div
                              key={idx}
                              className="text-center border rounded px-1 py-0.5 bg-white text-sm truncate"
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Request and Memory Panel */}
        <div className="w-[35%] h-full pr-4 py-3 flex flex-col gap-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Send Request</h3>
            <div className="flex flex-col gap-2">
              <input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring"
              />
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="border px-2 py-2 rounded focus:outline-none focus:ring"
              >
                <option value="read">Read</option>
                <option value="write">Write</option>
              </select>
              {operation === 'write' && (
                <input
                  placeholder="Data to Write"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring"
                />
              )}
              <Button onClick={handleRequest}>Submit</Button>
            </div>
            <div className="mt-4 text-sm text-gray-700">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className={`border-b py-1 ${
                    entry.hit ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {entry.operation.toUpperCase()} {entry.address} →{' '}
                  {entry.hit ? 'Hit' : 'Miss'} (Block {entry.accessedBlock})
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Main Memory</h3>
            <div className="flex flex-col gap-1 text-sm">
              {memoryData.map((row, i) => (
                <div key={i} className="flex gap-1 items-center">
                  <div className="w-14 font-medium text-gray-700">Addr {i}</div>
                  {row.map((val, j) => (
                    <div
                      key={j}
                      className="flex-1 border rounded px-2 py-1 text-center bg-white truncate"
                    >
                      {val}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
