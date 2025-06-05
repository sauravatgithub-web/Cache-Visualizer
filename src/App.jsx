import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import CacheBox from './components/CacheBox';

export default function CacheVisualizerApp() {
  const [showConfig, setShowConfig] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [cacheType, setCacheType] = useState('Direct Mapped');

  // Add controlled states for form inputs:
  const [cacheSize, setCacheSize] = useState('');
  const [blockSize, setBlockSize] = useState('');
  const [writePolicyHit, setWritePolicyHit] = useState('WRITE-THROUGH');
  const [writePolicyMiss, setWritePolicyMiss] = useState('WRITE-ALLOCATE');
  const [associativity, setAssociativity] = useState('');
  const [replacementPolicy, setReplacementPolicy] = useState('RANDOM');

  // Hold config to pass to CacheBox
  const [cacheConfig, setCacheConfig] = useState(null);

  const handleCacheSelect = () => setShowConfig(true);

  const handleSubmitConfig = async () => {
    // Construct config object
    const config = {
      cacheType,
      cacheSize: Number(cacheSize),
      blockSize: Number(blockSize),
      writePolicyHit,
      writePolicyMiss,
      associativity: Number(associativity),
      replacementPolicy,
    };

    // Call API to configure cache (simulate with a delay here)
    try {
      // Replace this with your real API call
      const response = await fakeApiConfigureCache(config);

      // Save API response or config to state
      setCacheConfig(response);
      setIsConfigured(true);
    } catch (err) {
      alert('Failed to configure cache: ' + err.message);
    }
  };

  // Fake API function for demo - replace with actual API call
  async function fakeApiConfigureCache(config) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(config), 1000);
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 text-xl font-semibold shadow">Cache Visualizer</nav>

      <main className="p-10 container mx-auto relative overflow-hidden min-h-[600px]">
        <AnimatePresence mode="wait">
          {!isConfigured ? (
            <motion.div
              key="config"
              className="absolute w-full max-w-2xl mx-auto left-0 right-0"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <Card className="p-8 bg-white rounded-xl shadow-md">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Select Cache Configuration</h2>
                <div className="mb-6 text-center">
                  <label className="block text-gray-700 font-semibold mb-4">Cache Type</label>
                  <div className="flex flex-wrap justify-center gap-4">
                    {['Direct Mapped', 'Set Associative', 'Fully Associative'].map((type) => {
                      const isSelected = cacheType === type;
                      const isDisabled = showConfig && !isSelected;
                      return (
                        <button
                          key={type}
                          disabled={isDisabled}
                          onClick={() => setCacheType(type)}
                          className={`px-4 py-2 min-w-[150px] border rounded-md transition-all duration-200
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Cache Size (blocks)</label>
                        <input
                          type="number"
                          value={cacheSize}
                          onChange={(e) => setCacheSize(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Block Size (bytes)</label>
                        <input
                          type="number"
                          value={blockSize}
                          onChange={(e) => setBlockSize(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Write Policy (Hit)</label>
                        <select
                          value={writePolicyHit}
                          onChange={(e) => setWritePolicyHit(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="WRITE-THROUGH">Write-Through</option>
                          <option value="WRITE-BACK">Write-Back</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Write Policy (Miss)</label>
                        <select
                          value={writePolicyMiss}
                          onChange={(e) => setWritePolicyMiss(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="WRITE-ALLOCATE">Write Allocate</option>
                          <option value="WRITE-NO-ALLOCATE">Write No Allocate</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Associativity (Ways)</label>
                        <input
                          type="number"
                          value={associativity}
                          onChange={(e) => setAssociativity(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Replacement Policy</label>
                        <select
                          value={replacementPolicy}
                          onChange={(e) => setReplacementPolicy(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
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
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md" onClick={handleCacheSelect}>Next →</Button>
                  ) : (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md"
                      onClick={handleSubmitConfig}
                      disabled={!cacheSize || !blockSize || !associativity} // simple validation
                    >
                      Start Simulation
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : (
            <CacheBox config={cacheConfig} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}