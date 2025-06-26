export default function CacheConfigDialog({ config, onClose }) {
    const stopPropagation = (e) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                onClick={stopPropagation}
                className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg transition-all"
            >
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold focus:outline-none"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6 border-b pb-2">
                    🧠 Cache Configuration
                </h2>

                <div className="grid grid-cols-1 gap-4 text-sm sm:text-base text-gray-700">
                    {[
                        ['Cache Type', config.cacheType],
                        ['Cache Size', `${config.cacheSize} bytes`],
                        ['Block Size', `${config.blockSize} bytes`],
                        ['Word Size', `${config.wordSize} bytes`],
                        ['Associativity (Ways)', config.associativity],
                        ['Write Policy (Hit)', config.writePolicyOnHit],
                        ['Write Policy (Miss)', config.writePolicyOnMiss],
                        ['Replacement Policy', config.replacementPolicy],
                    ].map(([label, value]) => (
                        <div key={label} className="flex justify-between border-b pb-1">
                            <span className="font-medium text-gray-600">{label}</span>
                            <span className="text-blue-600 font-semibold">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}