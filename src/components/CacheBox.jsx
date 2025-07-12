import { useState, useEffect } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { motion } from 'framer-motion';
import axios from 'axios'; 

import { Card } from './ui/card';
import { Toast } from './ui/toast';
import CacheFSM from './dialogs/CacheFSMdialog';
import RequestDialog from './dialogs/RequestDialog'; 

import { cacheMaps } from '../assets/cacheStates';
import { inputLabels } from '../assets/cacheStates';


export default function CacheBox({ cacheConfig, setLog }) {
  const [address, setAddress] = useState('');
  const [operation, setOperation] = useState('READ');
  const [data, setData] = useState('0');
  const [accessedIndex, setAccessedIndex] = useState(null);
  const [lastAccessed, setLastAccessed] = useState(null);
  const [updatedRow, setUpdatedRow] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const totalBlocks = Math.floor(cacheConfig.cacheSize / cacheConfig.blockSize);
  const associativity = cacheConfig.associativity || 1;
  const totalLines = Math.ceil(totalBlocks / associativity);

  const [path, setPath] = useState();
  const [label, setLabel] = useState();
  const [showFSM, setShowFSM] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  console.log(cacheConfig);

  const [cacheData, setCacheData] = useState(
    Array.from({ length: totalLines }, () =>
      Array.from({ length: associativity }, () => ({
        tag: '-',
        state: 'INVALID',
        data: Array(cacheConfig.blockSize / cacheConfig.wordSize).fill('-'),
      }))
    )
  );
  const [mainMemory, setMainMemory] = useState(cacheConfig.mainMemory);

  const stateColors = {
    INVALID: 'bg-red-200 text-gray-500',
    MISS_PENDING: 'bg-yellow-200 text-yellow-800',
    VALID: 'bg-green-200 text-green-800',
    MODIFIED: 'bg-orange-200 text-red-800',
  };

  const triggerTransition = () => {
    setShowTransition(true); 
    setTimeout(() => {
      setShowTransition(false); 
      setPath(null);    // Clear FSM transition path
      setLabel(null); 
    }, 5000); 
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
        removedTag,
        offset,
        block,
        data: responseData,
        hit,
        oldState,
        newState,
      } = response.data;

      if (removedTag !== -1) {
        setCacheData(prev => {
          const updated = prev.map(row => [...row]);
          const idx = updated[index].findIndex(block => block.tag === removedTag);
          updated[index][idx] = {
            tag: '-',
            state: "INVALID",
            data: Array(cacheConfig.blockSize / 4).fill('-'),
          }
          return updated;
        });
      }

      const inputLabel = (type == "READ") ? inputLabels[2] : inputLabels[1];
      setPath([cacheMaps[oldState], cacheMaps[newState]]);
      setLabel([inputLabel]);
      triggerTransition();

      // setShowFSM(true);
      // setTimeout(() => setShowFSM(false), 4000); // auto-close after 2s

      // setTimeout(() => {
      //   setPath(null);
      //   setLabel(null);
      // }, 4000); // Clear highlight after 1.5 seconds

      setCacheData(prev => {
        const updated = prev.map(row => [...row]);
        let way = 0;
        if (!hit && oldState === "INVALID") {
          for (let i = 0; i < cacheConfig.associativity; i++) {
            if (updated[index][i].state === "INVALID") {
              way = i;
              break;
            }
          }
        }
        if (hit && oldState === "VALID") {
          for (let i = 0; i < cacheConfig.associativity; i++) {
            if (updated[index][i].tag === tag) {
              way = i;
              break;
            }
          }
        }

        updated[index][way] = {
          tag: tag,
          state: newState,
          data: (newState === "INVALID") ? Array(cacheConfig.blockSize / 4).fill('-') : cacheFinal,
        };

        return updated;
      });

      setAccessedIndex(index);
      setLastAccessed(
        cacheConfig.cacheType === 'Direct Mapped'
          ? 0
          : cacheData[index].findIndex((block) => block.tag === tag)
      );

      setUpdatedRow(memoryIndex);

      setTimeout(() => setUpdatedRow(null), 1000);

      const message =
        type === 'READ'
          ? `Data at address ${address}: ${hit ? responseData : "NOT FOUND"}`
          : `Wrote ${data} to address ${hit ? address : "NOT FOUND"}`;

      setToastMessage(message);

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
    const socket = new ReconnectingWebSocket('ws://localhost:8080/ws/cache');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received from backend:', data);

      setCacheData(prev => {
        const updated = prev.map(row => [...row]);
        let way = 0;
        if (data.oldState === "MISS_PENDING") {
          for (let i = 0; i < cacheConfig.associativity; i++) {
            if (updated[data.index][i].state === "MISS_PENDING") {
              way = i;
              break;
            }
          }

          updated[data.index][way] = {
            tag: data.tag,
            state: data.newState,
            data: data.cacheFinal,
          };
        }

        return updated;
      });

      const inputLabel = (data.type == "READ") ? inputLabels[3] : inputLabels[4];
      setPath([cacheMaps[data.oldState], cacheMaps[data.newState]]);
      setLabel([inputLabel]);
      triggerTransition();

      setUpdatedRow(data.memoryIndex / 4);

      // Update only the changed memory row
      setMainMemory(prev => {
        const updated = [...prev];
        if (data.memoryIndex >= 0 && data.memoryIndex < updated.length) {
          const row = Math.floor(data.memoryIndex / 4);
          const col = data.memoryIndex % 4;
          updated[row][col] = data.memoryData[0];
        }
        return updated;
      });

      // if (data.type === 'READ') setToastMessage(`Data at address ${data.address}:`, data.hit ? `${data.responseData}` : "NOT FOUND");
      // else setToastMessage(`Wrote ${data.data} to address`, data.hit ? `${data.address}` : "NOT FOUND");  

      setLog(prev => [
        ...prev,
        {
          address: data.memoryIndex * 4,
          operation: data.type,
          hit: data.hit,
          accessedBlock: data.block,
          tag: data.tag,
          index: data.index,
          data: data.data,
          transition: `${data.oldState} → ${data.newState}`,
        },
      ]);

    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    if (operation === 'READ') setData('');
    else setData('0');
  }, [operation]);

  return (
    <motion.div
      key="sim"
      className="absolute w-full h-full left-0 right-0"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <button
        onClick={() => setShowDrawer(true)}
        className="fixed right-4 bottom-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 z-50"
        title="Send Request"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l11 2-11 2v4l18-6L3 6v4z" />
        </svg>
      </button>

      {/* Side Drawer */}
      {showDrawer && (
        <RequestDialog
          show={showDrawer}
          onClose={() => setShowDrawer(false)}
          address={address}
          setAddress={setAddress}
          operation={operation}
          setOperation={setOperation}
          data={data}
          setData={setData}
          onSubmit={() => {
            handleRequest();
            setShowDrawer(false);
          }}
        />
      )}

      <div className="flex w-full h-full">
        {/* Cache Panel */}
        <div className="w-[65%] h-full px-4 py-3">
          <Card className="p-4 h-full flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Cache Blocks</h3>
            <div className="flex flex-col gap-4">
              {cacheData.map((lineBlocks, lineIndex) => (
                <div key={lineIndex} className="flex gap-3 w-full">
                  {lineBlocks.map((block, i) => {
                    const blockIndex = lineIndex * associativity + i;
                    const isAccessed = lineIndex === accessedIndex && i === lastAccessed;
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
                        <div className={`grid grid-cols-${block.data.length} gap-1 pt-2`}>
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

        {/* State Machine and Memory Panel */}
        <div className="w-[35%] h-full pr-4 py-3 flex flex-col gap-4">
          <Card className="p-4 shadow-xl border-2 border-grey">
            <h4 className="text-md font-semibold text-gray-700 mb-2">State Transition</h4>

            <div className="overflow-x-auto cursor-pointer" onClick={() => setShowFSM(true)}>
              <CacheFSM path={path} label={label} showTransitions={showTransition} />
            </div>
          </Card>

          {showFSM && (
            <CacheFSM
              path={path}
              label={label}
              showTransitions={false}
              onClose={() => setShowFSM(false)}
            />
          )}

          <Card className="p-4 flex-1">
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
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </motion.div>
  );
}