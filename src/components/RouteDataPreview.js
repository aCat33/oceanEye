import React from 'react';
import { X, FileJson } from './Icons';

const RouteDataPreview = ({ ship, onClose }) => {
    if (!ship || !ship.plannedRoute) return null;

    const geoJson = {
        type: "Feature",
        properties: {
            shipId: ship.id,
            shipName: ship.name,
            imo: ship.imo
        },
        geometry: {
            type: "LineString",
            coordinates: ship.plannedRoute.map(p => [p[1], p[0]])
        }
    };

    const csvContent = "Sequence,Latitude,Longitude\n" + 
        ship.plannedRoute.map((p, i) => `${i+1},${p[0].toFixed(6)},${p[1].toFixed(6)}`).join("\n");

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50">
                    <h3 className="font-bold text-white flex items-center gap-2"><FileJson size={18} className="text-blue-400"/> 计划航线数据预览 ({ship.name})</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Standard GeoJSON</span>
                            <button onClick={() => navigator.clipboard.writeText(JSON.stringify(geoJson, null, 2))} className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-blue-300 border border-slate-600 transition-colors">复制 JSON</button>
                        </div>
                        <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] text-green-400 font-mono overflow-x-auto">
                            {JSON.stringify(geoJson, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">CSV Format (Lat, Lon)</span>
                            <button onClick={() => navigator.clipboard.writeText(csvContent)} className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-blue-300 border border-slate-600 transition-colors">复制 CSV</button>
                        </div>
                        <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] text-blue-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {csvContent}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteDataPreview;
