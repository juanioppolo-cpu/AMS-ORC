import { useState, useEffect } from "react";
import { Plug, Save, CheckCircle2, ChevronRight, X } from "lucide-react";
import { loadIntegrations, saveIntegrations } from "../../app/storage";

const INTEGRATION_TYPES = [
    { id: "catapult", name: "Catapult GPS", description: "Connect to Catapult Openfield API to sync GPS data.", icon: "gps" },
    { id: "vald", name: "VALD Performance", description: "Sync ForceDecks, NordBord, and ForceFrame data.", icon: "activity" },
    { id: "custom_encoder", name: "Custom Encoder", description: "Generic API connection for external linear encoders.", icon: "zap" }
];

export default function Integrations() {
    const [integrations, setIntegrations] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // Modal state
    const [tempKey, setTempKey] = useState("");
    const [tempSecret, setTempSecret] = useState("");

    useEffect(() => {
        const data = loadIntegrations();
        setIntegrations(data || []);
    }, []);

    const handleOpenEdit = (typeId) => {
        const existing = integrations.find(i => i.id === typeId);
        setTempKey(existing?.apiKey || "");
        setTempSecret(existing?.apiSecret || "");
        setEditingId(typeId);
    };

    const handleSave = () => {
        if (!editingId) return;

        const updated = [...integrations];
        const index = updated.findIndex(i => i.id === editingId);

        const newIntegration = {
            id: editingId,
            apiKey: tempKey,
            apiSecret: tempSecret,
            connectedAt: new Date().toISOString()
        };

        if (index >= 0) {
            if (!tempKey && !tempSecret) {
                // Remove integration if fields are cleared
                updated.splice(index, 1);
            } else {
                updated[index] = newIntegration;
            }
        } else {
            if (tempKey || tempSecret) {
                updated.push(newIntegration);
            }
        }

        setIntegrations(updated);
        saveIntegrations(updated);
        setEditingId(null);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'gps': return <Plug size={24} className="text-blue-500" />;
            case 'activity': return <CheckCircle2 size={24} className="text-green-500" />;
            case 'zap': return <Plug size={24} className="text-amber-500" />;
            default: return <Plug size={24} className="text-gray-500" />;
        }
    };

    return (
        <div className="container p-4 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Plug className="text-slate-600" />
                    API Integrations
                </h1>
                <p className="text-slate-500">
                    Connect third-party platforms to automatically sync data into AMS.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {INTEGRATION_TYPES.map(type => {
                    const isConnected = integrations.some(i => i.id === type.id && (i.apiKey || i.apiSecret));

                    return (
                        <div key={type.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5 flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg shrink-0">
                                    {getIcon(type.icon)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 text-lg mb-1">{type.name}</h3>
                                    <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
                                        {type.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {isConnected ? 'Connected' : 'Not Connected'}
                                        </span>
                                        <button
                                            onClick={() => handleOpenEdit(type.id)}
                                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                                        >
                                            {isConnected ? 'Configure' : 'Connect'}
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Configuration Modal */}
            {
                editingId && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-semibold text-lg text-slate-800">
                                    Configure {INTEGRATION_TYPES.find(t => t.id === editingId)?.name}
                                </h3>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                                    <input
                                        type="password"
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                        placeholder="Enter API Key"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">API Secret / Client Secret</label>
                                    <input
                                        type="password"
                                        value={tempSecret}
                                        onChange={(e) => setTempSecret(e.target.value)}
                                        placeholder="Enter API Secret (Optional)"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    These credentials will be stored securely and used to authenticate requests to the provider's API.
                                    Leave blank and save to disconnect.
                                </p>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    <Save size={18} />
                                    Save Connection
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
