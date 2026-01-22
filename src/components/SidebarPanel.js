import React from 'react';
import { 
    Layers, Navigation, X, Ship, Droplet, AlertOctagon, AlertTriangle,
    Wind, Target, RouteIcon, History, FileJson, Activity, Briefcase, ChevronRight, ChevronUp
} from './Icons';
import CrewList from './CrewList';
import ProductionChart from './ProductionChart';

const SidebarPanel = ({ selectedCluster, setSelectedCluster, handleLocateItem, highlightedItemId, startPlayback, setPreviewDataId }) => {
    if (!selectedCluster || !selectedCluster.items) return null;

    return (
        <div className="absolute top-4 right-4 bottom-4 w-96 bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md z-[1000] flex flex-col rounded-lg animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 rounded-t-lg">
                <h3 className="font-bold text-white flex items-center gap-2">
                    {selectedCluster.isCluster ? <Layers size={16}/> : <Navigation size={16}/>} 
                    {selectedCluster.isCluster ? `区域目标 (${selectedCluster.items.length})` : '目标详情'}
                </h3>
                <button onClick={() => setSelectedCluster(null)} className="text-slate-400 hover:text-white">
                    <X size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {selectedCluster.items.map((item) => {
                    if (!item) return null;
                    const isExpanded = highlightedItemId === item.id;
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => handleLocateItem(item)} 
                            className={`rounded border transition-all cursor-pointer overflow-hidden ${
                                isExpanded 
                                    ? 'bg-slate-800 border-yellow-500/50 shadow-lg ring-1 ring-yellow-500/20' 
                                    : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                            }`}
                        >
                            <div className="p-3 flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 p-1.5 rounded-full ${
                                        item.isAlarm 
                                            ? 'bg-red-600 animate-pulse text-white' 
                                            : (item.type==='rig'?'bg-orange-500/20 text-orange-400':'bg-blue-500/20 text-blue-400')
                                    }`}>
                                        {item.isAlarm ? <AlertOctagon size={16}/> : (item.type==='rig'?<Droplet size={16}/>:<Ship size={16}/>)}
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${isExpanded ? 'text-yellow-400' : 'text-slate-200'}`}>
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                                        {item.isAlarm && (
                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-400 font-bold">
                                                <AlertTriangle size={10} /> 偏离 {item.xte ? item.xte.toFixed(1) : '0.0'} NM
                                            </div>
                                        )}
                                        {!isExpanded && !item.isAlarm && (
                                            <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
                                                <span>{item.lat.toFixed(2)}N, {item.lon.toFixed(2)}E</span>
                                                {item.type==='ship' ? <span>{item.speed} kn</span> : <span className={item.status==='正常'?'text-green-400':'text-yellow-400'}>{item.status}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-slate-500">
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="px-3 pb-3 pt-0 border-t border-slate-700/50 bg-slate-900/30">
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-400 mt-3">
                                        <div className="col-span-2 flex justify-between py-1 border-b border-slate-700/50">
                                            <span>坐标</span>
                                            <span className="text-slate-300 font-mono">
                                                {item.lat.toFixed(4)}N, {item.lon.toFixed(4)}E
                                            </span>
                                        </div>
                                        {item.type === 'ship' ? (
                                            <>
                                                <div className="col-span-2 bg-slate-800/80 p-2 rounded border border-slate-700 mb-2">
                                                    <div className="flex items-center gap-2 font-bold text-slate-300 mb-1">
                                                        <RouteIcon size={12}/> 航线监控
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span>状态:</span>
                                                        {item.isAlarm ? (
                                                            <span className="text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                <AlertTriangle size={10}/> 严重偏航 ({item.xte ? item.xte.toFixed(1) : '0.0'} NM)
                                                            </span>
                                                        ) : (
                                                            <span className="text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">正常</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Wind size={12}/> <span className="text-slate-300">{item.speed} kn</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Navigation size={12}/> <span className="text-slate-300">{item.course}°</span>
                                                </div>
                                                <div className="col-span-2 flex items-center gap-2">
                                                    <Target size={12}/> 目的: <span className="text-slate-300">{item.destination}</span>
                                                </div>
                                                <div className="col-span-2 mt-2 space-y-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); startPlayback(item.id); }} 
                                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                                    >
                                                        <History size={14} /> 历史航迹回放
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setPreviewDataId(item.id); }} 
                                                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600"
                                                    >
                                                        <FileJson size={14} /> 查看航线数据
                                                    </button>
                                                    <CrewList crew={item.crewList} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="col-span-2 flex justify-between items-center">
                                                    <span className="flex items-center gap-2"><Activity size={12}/> 状态</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        item.status==='正常'?'bg-green-500/20 text-green-400':'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 flex items-center gap-2">
                                                    <Briefcase size={12}/> <span className="text-slate-300">{item.operator}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Droplet size={12}/> 日产: <span className="text-slate-300">{item.dailyOutput}</span>
                                                </div>
                                                <div className="col-span-2 mt-1">
                                                    <ProductionChart data={item.productionHistory} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SidebarPanel;
