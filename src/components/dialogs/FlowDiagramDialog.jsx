import { useState, useEffect } from "react";

export default function FlowDiagramDialog({ writePolicyOnHit, writePolicyOnMiss, onClose }) {
    const [selected, setSelected] = useState("access"); // default to access

    const basePath = "/flowDiagram";
    const policyKey = (writePolicyOnHit == "WRITE-THROUGH")
                    ? (writePolicyOnMiss == "WRITE-ALLOCATE") ? "write_through_allocate" : "write_through_no_allocate"
                    : (writePolicyOnMiss == "WRITE-ALLOCATE") ? "write_back_allocate" : "write_back_no_allocate";
    const diagrams = {
        access: `${basePath}/${policyKey}_access.png`,
        fill: `${basePath}/${policyKey}_fill.png`,
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-[90%] max-h-[90vh] overflow-y-auto p-6 relative">
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Cache Flow Diagrams</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 text-2xl font-bold"
                    >
                        &times;
                    </button>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={() => setSelected("access")}
                        className={`px-4 py-2 rounded-lg transition font-medium ${selected === "access"
                                ? "bg-blue-700 text-white ring-2 ring-blue-400"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        Access Algorithm
                    </button>
                    <button
                        onClick={() => setSelected("fill")}
                        className={`px-4 py-2 rounded-lg transition font-medium ${selected === "fill"
                                ? "bg-green-700 text-white ring-2 ring-green-400"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                    >
                        Fill Algorithm
                    </button>
                </div>

                <div className="flex justify-center">
                    <img
                        src={diagrams[selected]}
                        alt={`${selected} diagram`}
                        className="max-w-full max-h-[65vh] rounded-lg border border-gray-300"
                    />
                </div>
            </div>
        </div>
    );
}