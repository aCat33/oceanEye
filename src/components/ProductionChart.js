import React from 'react';

const ProductionChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
    const points = data.map((val, idx) => `${(idx / (data.length - 1)) * 280},${40 - ((val - min) / range) * 40}`).join(' ');
    return (
        <div className="mt-2 bg-slate-900/50 p-3 rounded border border-slate-700">
            <div className="flex justify-between text-[10px] text-slate-400 mb-2"><span className="font-semibold text-slate-300">月产量趋势</span><span className="text-green-400 font-mono">Max: {max.toFixed(0)}</span></div>
            <svg width="100%" height={40} className="overflow-visible"><polyline points={points} fill="none" stroke="#fbbf24" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg>
        </div>
    );
};

export default ProductionChart;
