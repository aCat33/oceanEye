import React, { useState } from 'react';
import { Users, ChevronUp, ChevronDown } from './Icons';

const CrewList = ({ crew }) => {
    const [expanded, setExpanded] = useState(false);
    if (!crew) return null;
    const displayList = expanded ? crew : crew.slice(0, 2);
    return (
        <div className="mt-2 bg-slate-900/50 rounded border border-slate-700 overflow-hidden">
            <div className="p-2 bg-slate-800/80 text-xs font-bold text-slate-300 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-2"><Users size={12} className="text-blue-400"/> 核心船员 ({crew.length})</div>
                {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
            </div>
            <div className="divide-y divide-slate-700/50">
                {displayList.map(c => (
                    <div key={c.id} className="p-2 text-[11px] hover:bg-slate-800/30 transition-colors">
                        <div className="flex justify-between items-center mb-1"><span className="font-medium text-slate-200">{c.role}</span><span className="text-green-400/80 scale-90 bg-green-900/20 px-1 rounded">{c.status}</span></div>
                        <div className="text-slate-400 mb-1.5">{c.name}</div>
                        <div className="flex flex-wrap gap-1">{c.certs.map(cert => <span key={cert} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/10 text-[9px]">{cert}</span>)}</div>
                    </div>
                ))}
            </div>
            {!expanded && crew.length > 2 && <div className="p-1.5 text-[10px] text-center text-slate-500 hover:text-slate-300 cursor-pointer bg-slate-800/80 transition-colors" onClick={(e) => { e.stopPropagation(); setExpanded(true); }}>显示更多 ({crew.length - 2}人)...</div>}
        </div>
    );
};

export default CrewList;
