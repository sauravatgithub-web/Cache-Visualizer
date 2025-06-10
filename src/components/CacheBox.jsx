import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios'; // Make sure axios is imported
import { Button } from './ui/button';
import { Card } from './ui/card';

const initialMemoryData = [
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
  const [address, setAddress] = useState('');
  const [operation, setOperation] = useState('READ');
  const [data, setData] = useState('0');
  const [log, setLog] = useState([]);
  const [lastAccessed, setLastAccessed] = useState(null);
  const [updatedRow, setUpdatedRow] = useState(null);
  
  const totalBlocks = Math.floor(cacheConfig.cacheSize / cacheConfig.blockSize);
  const associativity = cacheConfig.associativity || 1;
  const totalLines = Math.ceil(totalBlocks / associativity);
  
  const [cacheData, setCacheData] = useState(
    Array.from({ length: totalLines }, () =>
      Array.from({ length: associativity }, () => ({
        tag: '-',
        state: 'Invalid',
        data: Array(cacheConfig.blockSize / 4).fill('-'),
      }))
    )
  );
  const [mainMemory, setMainMemory] = useState(cacheConfig.mainMemory);

  const stateColors = {
    Invalid: 'bg-red-200 text-gray-500',
    MissPending: 'bg-yellow-200 text-yellow-800',
    Valid: 'bg-green-200 text-green-800',
    Modified: 'bg-orange-200 text-red-800',
  };

  const handleRequest = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/cache/request', {
        address: parseInt(address, 10),
        action: operation,
        data: [parseInt(data, 10)],
      });

      console.log(response);

      const {
        cacheFinal,
        memoryIndex,
        memoryData,
        type,
        index,
        tag,
        offset,
        block,
        data: responseData,
        hit,
        oldState,
        newState,
      } = response.data;

      const way = 0;

      hit && setCacheData(prev => {
        const updated = prev.map(row => [...row]);
        if (
          index >= 0 &&
          index < updated.length &&
          way >= 0 &&
          way < updated[index].length
        ) {
          updated[index][way] = {
            tag,
            state: newState,
            data: cacheFinal,
          };
        }
        return updated;
      });

      setLastAccessed(block);
      setUpdatedRow(memoryIndex);

      // Update only the changed memory row
      setMainMemory(prev => {
        const updated = [...prev];
        if (memoryIndex >= 0 && memoryIndex < updated.length) {
          updated[memoryIndex] = memoryData;
        }
        return updated;
      });

      setTimeout(() => setUpdatedRow(null), 1000);

      if (type === 'READ') {
        alert(`Data at address ${address}: ${responseData}`);
      } else {
        alert(`Wrote ${data} to address ${address}`);
      }

      setLog(prev => [
        ...prev,
        {
          address,
          operation,
          hit,
          accessedBlock: block,
          tag,
          index,
          data: responseData,
          transition: `${oldState} → ${newState}`,
        },
      ]);
    } catch (err) {
      console.error('Error in API request:', err);
      alert('Error: Could not reach backend or invalid response.');
    }
  };


  useEffect(() => {
    if (operation === 'READ') setData('');
    else setData('0');
  }, [operation]);

  return (
    <motion.div
      key="sim"
      className="absolute w-full h-full left-0 right-0 overflow-y-auto"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="flex w-full h-full">
        {/* Cache Panel */}
        <div className="w-[65%] h-full px-4 py-3 overflow-y-auto">
          <Card className="p-4 h-full flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Cache Blocks</h3>
            <div className="flex flex-col gap-4">
              {cacheData.map((lineBlocks, lineIndex) => (
                <div key={lineIndex} className="flex gap-3 w-full">
                  {lineBlocks.map((block, i) => {
                    // console.log(block);
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
                        className={`rounded-xl shadow border p-2 flex flex-col transition-transform duration-200 ease-in-out ${isAccessed ? 'ring-2 ring-blue-600 scale-105' : ''
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
                          {block?.data?.map((val, idx) => (
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
        <div className="w-[35%] h-full pr-4 py-3 flex flex-col gap-4 overflow-y-auto">
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
                <option value="READ">Read</option>
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
                  className={`border-b py-1 ${entry.hit ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {entry.operation.toUpperCase()} {entry.address} →{' '}
                  {entry.hit ? 'Hit' : 'Miss'} (Block {entry.accessedBlock})
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Main Memory</h3>
            <div className="flex flex-col gap-1 text-sm">
              {mainMemory.map((row, i) => (
                <div key={i} className={`flex gap-1 items-center ${updatedRow === i ? 'bg-yellow-100' : ''}`}>
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