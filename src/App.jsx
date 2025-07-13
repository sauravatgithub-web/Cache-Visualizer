import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import CacheBox from './components/CacheBox';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import CacheConfigDialog from './components/dialogs/CacheConfigDialog';
import LogPanel from './components/dialogs/LogPanelDialog';
import { setTransitions } from './assets/cacheStates';
import FlowDiagramDialog from './components/dialogs/FlowDiagramDialog';

const server = import.meta.env.VITE_SERVER_BASE_URL;


export default function CacheVisualizerApp() {
  const [showConfig, setShowConfig] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [cacheType, setCacheType] = useState('Direct Mapped');
  const [showDialog, setShowDialog] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [log, setLog] = useState([]);

  const [inputCacheSize, setInputCacheSize] = useState('');
  const [inputBlockSize, setInputBlockSize] = useState('');
  const [inputWordSize, setInputWordSize] = useState('');
  const [cacheSize, setCacheSize] = useState('');
  const [blockSize, setBlockSize] = useState('');
  const [wordSize, setWordSize] = useState('4');
  const [writePolicyOnHit, setWritePolicyOnHit] = useState('WRITE-THROUGH');
  const [writePolicyOnMiss, setWritePolicyOnMiss] = useState('WRITE-ALLOCATE');
  const [associativity, setAssociativity] = useState('');
  const [replacementPolicy, setReplacementPolicy] = useState('RANDOM');

  const [cacheConfig, setCacheConfig] = useState(null);

  useEffect(() => {
    if(cacheType === 'Direct Mapped') {
      setAssociativity('1');
    } 
    else if(cacheType === 'Fully Associative') {
      const size = Number(cacheSize);
      const block = Number(blockSize);
      if(size > 0 && block > 0) {
        setAssociativity(Math.floor(size / block).toString());
      } 
      else {
        setAssociativity('');
      }
    }
  }, [cacheType, cacheSize, blockSize]);

  const computedStats = useMemo(() => {
    const C = Number(cacheSize);
    const B = Number(blockSize);
    const W = Number(wordSize);
    const M = 64 * W;

    if(!C || !B || !W) return null;

    const numWordsPerBlock = B / W;
    const numBitsPerWord = Math.floor(Math.log2(W));
    const numBitsPerBlock = Math.floor(Math.log2(B));
    const numBlocksInCache = C / B;
    const numWordsInCache = C / W;
    const bitsForIndex = Math.floor(Math.log2(numBlocksInCache));
    const bitsInPhysAddr = Math.floor(Math.log2(64) + Math.log2(W));
    const blocksInMem = Number(M / B);

    return {
      wordSize: W,
      blockSize: B,
      numWordsPerBlock,
      numBitsPerWord,
      numBitsPerBlock,
      numBlocksInCache,
      numWordsInCache,
      bitsForIndex,
      memSize: M,
      numWordsInMem: 64,
      bitsInPhysAddr,
      blocksInMem,
    };
  }, [cacheSize, blockSize, wordSize]);

  const handleSubmitConfig = async () => {
    const config = {
      cacheType: cacheType === 'Direct Mapped' ? 'DIRECT' : cacheType === 'Fully Associative' ? 'ASSOCIATIVE' : 'SET-ASSOCIATIVE',
      cacheSize: Number(cacheSize),
      blockSize: Number(blockSize),
      wordSize: Number(wordSize),
      writePolicyOnHit,
      writePolicyOnMiss,
      ways: Number(associativity),
      replacementPolicy,
    };

    try {
      // console.log(config);
      const response = await axios.post(`${server}/api/cache/configure`, config);
      const { message, mainMemory } = response.data;

      const chunkedMemory = [];
      for(let i = 0; i < mainMemory.length; i += (blockSize / wordSize)) {
        chunkedMemory.push(mainMemory.slice(i, i + (blockSize / wordSize)));
      }
      setTransitions(writePolicyOnHit, writePolicyOnMiss);

      setCacheConfig({
        message,
        mainMemory: chunkedMemory,
        cacheSize,
        blockSize,
        wordSize,
        associativity,
        writePolicyOnHit,
        writePolicyOnMiss,
        replacementPolicy,
        cacheType,
      });
      setIsConfigured(true);
    } 
    catch(error) {
      console.error('Error submitting config:', error);
      alert('Failed to submit cache configuration. Please check server logs.');
    }
  };

  const toLowerPowerOfTwo = (num) => {
    if (num <= 0) return '';
    return 2 ** Math.floor(Math.log2(num));
  };


  return (
    <div className="min-h-screen bg-gray-100 overflow-auto scrollbar-hide">
      <nav className="bg-blue-600 text-white p-4 text-xl font-semibold shadow flex justify-between items-center">
        <span>Cache Visualizer</span>
        {isConfigured && (
          <div className="flex gap-x-2">
            <button onClick={() => setShowFlow(true)} className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md text-sm">Show Flow Diagram</button>
            <button onClick={() => setShowLog(true)} className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md text-sm">Show Logs</button>
            <button onClick={() => setShowDialog(true)} className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-md text-sm">Configuration</button>
          </div>
        )}
      </nav>

      <main className="p-10 container mx-auto relative overflow-auto min-h-[600px] scrollbar-hide">
        <AnimatePresence mode="wait">
          {!isConfigured ? (
            <motion.div
              key="config"
              className="absolute w-full max-w-5xl mx-auto left-0 right-0"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <div className="flex flex-wrap md:flex-nowrap gap-6 items-start min-h-[530px]">

                <Card className="p-8 bg-white rounded-xl shadow-md flex-1 min-w-[300px] h-[530px] overflow-auto">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Select Cache Configuration</h2>

                  <div className="mb-6 text-center">
                    <label className="block text-gray-700 font-semibold mb-4">Cache Type</label>
                    <div className="flex justify-center gap-2 flex-wrap md:flex-nowrap">
                      {['Direct Mapped', 'Set Associative', 'Fully Associative'].map((type) => {
                        const isSelected = cacheType === type;
                        const isDisabled = showConfig && !isSelected;
                        return (
                          <button
                            key={type}
                            disabled={isDisabled}
                            onClick={() => setCacheType(type)}
                            className={`px-4 py-2 w-[140px] md:w-[160px] whitespace-nowrap border rounded-md transition-all duration-200
                              ${isSelected ? 'bg-blue-600 text-white border-blue-600' : ''}
                              ${isDisabled ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' : ''}
                              ${!isSelected && !showConfig ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-400' : ''}`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {showConfig && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Cache Size (bytes)</label>
                          <input 
                            type="number" 
                            value={inputCacheSize} 
                            onChange={(e) => setInputCacheSize(e.target.value)} 
                            onBlur={() => {
                              const val = Number(inputCacheSize);
                              if(!val) {
                                setCacheSize('');
                                setInputCacheSize('');
                              } 
                              else {
                                const corrected = toLowerPowerOfTwo(val).toString();
                                setCacheSize(corrected);
                                setInputCacheSize(corrected);
                              }
                            }}
                            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Block Size (bytes)</label>
                          <input 
                            type="number" 
                            value={inputBlockSize} 
                            onChange={(e) => setInputBlockSize(e.target.value)} 
                            onBlur={() => {
                              const val = Number(inputBlockSize);
                              if(!val) {
                                setBlockSize('');
                                setInputBlockSize('');
                              } 
                              else {
                                const corrected = toLowerPowerOfTwo(val).toString();
                                setBlockSize(corrected);
                                setInputBlockSize(corrected);
                              }
                            }}
                            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Word Size (bytes)</label>
                          <input 
                            type="number" 
                            value={inputWordSize} 
                            onChange={(e) => setInputWordSize(e.target.value)} 
                            onBlur={() => {
                              const val = Number(inputWordSize);
                              if(!val) {
                                setWordSize('');
                                setInputWordSize('');
                              } 
                              else {
                                const corrected = toLowerPowerOfTwo(val).toString();
                                setWordSize(corrected);
                                setInputWordSize(corrected);
                              }
                            }}
                            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Write Policy (Hit)</label>
                          <select value={writePolicyOnHit} onChange={(e) => setWritePolicyOnHit(e.target.value)} className="w-full border rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500">
                            <option value="WRITE-THROUGH">Write-Through</option>
                            <option value="WRITE-BACK">Write-Back</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Write Policy (Miss)</label>
                          <select value={writePolicyOnMiss} onChange={(e) => setWritePolicyOnMiss(e.target.value)} className="w-full border rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500">
                            <option value="WRITE-ALLOCATE">Write Allocate</option>
                            <option value="WRITE-NO-ALLOCATE">Write No Allocate</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Associativity (Ways)</label>
                          <input type="number" value={associativity} onChange={(e) => setAssociativity(e.target.value)} className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500" disabled={cacheType !== 'Set Associative'} />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Replacement Policy</label>
                          <select value={replacementPolicy} onChange={(e) => setReplacementPolicy(e.target.value)} className="w-full border rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500">
                            <option value="RANDOM">Random</option>
                            <option value="FIFO">FIFO</option>
                            <option value="LFU">LFU</option>
                            <option value="LRU">LRU</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-between mt-4">
                    {showConfig && (
                      <Button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md" onClick={() => setShowConfig(false)}>← Back</Button>
                    )}
                    {!showConfig ? (
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md" onClick={() => setShowConfig(true)}>Next →</Button>
                    ) : (
                      <Button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md" onClick={handleSubmitConfig} disabled={!cacheSize || !blockSize || !wordSize || (cacheType === 'Set Associative' && !associativity)}>Start Simulation</Button>
                    )}
                  </div>
                </Card>

                <div className={`p-6 rounded-xl flex-1 min-w-[300px] text-sm transition-all duration-300 h-[530px] overflow-y-auto
                  ${computedStats ? 'bg-white border border-blue-500 text-gray-800 shadow-md' : 'bg-gray-100 border border-gray-300 text-gray-500'}`}>

                  {!computedStats ? (
                    <div className="h-full flex items-center justify-center text-center min-h-[480px]">
                      Enter cache size, block size and word size to see calculations here.
                    </div>
                  ) : (
                    <div className="space-y-4 h-full">
                      
                      <div>
                        <h3 className="text-blue-600 font-semibold text-base mb-1">🧱 Block & Word Details</h3>
                        <div className="space-y-1">
                          <p><span className="font-medium">Word Size</span> (W): {computedStats.wordSize}B</p>
                          <p><span className="font-medium">Block Size</span> (B): {computedStats.blockSize}B</p>
                          <p><span className="font-medium">Words/Block</span>: B/W = {computedStats.numWordsPerBlock}</p>
                          <p><span className="font-medium">Bits/Word</span>: log₂(W) = {computedStats.numBitsPerWord} bits</p>
                          <p><span className="font-medium">Bits/Block</span>: log₂(B) = {computedStats.numBitsPerBlock} bits</p>
                        </div>
                      </div>

                      <hr />

                      <div>
                        <h3 className="text-green-600 font-semibold text-base mb-1">📦 Cache Details</h3>
                        <div className="space-y-1">
                          <p><span className="font-medium">Cache Size</span> (C): {cacheSize}B</p>
                          <p><span className="font-medium">Blocks in Cache</span>: C/B = {computedStats.numBlocksInCache}</p>
                          <p><span className="font-medium">Words in Cache</span>: C/W = {computedStats.numWordsInCache}</p>
                          <p><span className="font-medium">Bits for Index</span>: log₂(Blocks) = {computedStats.bitsForIndex}</p>
                        </div>
                      </div>

                      <hr />

                      <div>
                        <h3 className="text-purple-600 font-semibold text-base mb-1">🧠 Memory Info</h3>
                        <div className="space-y-1">
                          <p><span className="font-medium">Main Memory Size</span> (M): {computedStats.memSize}B</p>
                          <p><span className="font-medium">Words in Memory</span>: 64</p>
                          <p><span className="font-medium">Bits in Physical Address</span>: log₂(64) + log₂(W) = {computedStats.bitsInPhysAddr}</p>
                          <p><span className="font-medium">Blocks in Memory</span>: M/B = {computedStats.blocksInMem}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          ) : (
            <CacheBox cacheConfig={cacheConfig} setLog={setLog} />
          )}
        </AnimatePresence>

        {showDialog && <CacheConfigDialog config={cacheConfig} onClose={() => setShowDialog(false)} />}
        {showLog && <LogPanel show={showLog} setShow={setShowLog} log={log} onClose={() => setShowLog(false)} />}
        {showFlow && <FlowDiagramDialog writePolicyOnHit={writePolicyOnHit} writePolicyOnMiss={writePolicyOnMiss} onClose={() => setShowFlow(false)} />}
      </main>
    </div>
  );
}