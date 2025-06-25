import { Button } from '../ui/button';
import { motion } from 'framer-motion';

export default function RequestDialog ({
  show,
  onClose,
  address,
  setAddress,
  operation,
  setOperation,
  data,
  setData,
  onSubmit
}) {
  if (!show) return null;
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <motion.div
      initial={{ x: 200 }}
      animate={{ x: 0 }}
      exit={{ x: 200 }}
      transition={{ duration: 0.3 }}
      className="fixed top-20 right-0 w-96 bg-white shadow-xl z-50 p-6 border-l border-gray-300 rounded-l-md"
    >
      <div 
        className="flex justify-between items-center mb-4"
        onClick={stopPropagation}
      >
        <h3 className="text-lg font-semibold text-gray-800">Send Request</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="number"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border px-3 py-2 rounded w-full focus:outline-none focus:ring"
        />
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring"
        >
          <option value="READ">Read</option>
          <option value="WRITE">Write</option>
        </select>
        {operation === 'WRITE' && (
          <input
            type="number"
            placeholder="Data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring"
          />
        )}
        <Button onClick={onSubmit}>
          Submit
        </Button>
      </div>
    </motion.div>
  );
}