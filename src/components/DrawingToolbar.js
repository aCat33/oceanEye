import React from 'react';
import { PenTool, CornerUpLeft, Trash2, Save } from './Icons';

const DrawingToolbar = ({ 
    handleUndoDrawing, 
    handleClearDrawing, 
    handleSaveDrawing, 
    handleStartDrawing 
}) => {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-yellow-500/50 p-3 rounded-lg flex items-center gap-3 z-[2000] backdrop-blur-md shadow-2xl animate-in slide-in-from-top duration-300">
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-2 mr-2">
                <PenTool size={16}/> 绘图模式: 点击地图添加点
            </span>
            <div className="h-6 w-px bg-slate-700 mx-1"></div>
            <button onClick={handleUndoDrawing} className="p-1.5 rounded hover:bg-slate-700 text-slate-300" title="撤销上一点">
                <CornerUpLeft size={18}/>
            </button>
            <button onClick={handleClearDrawing} className="p-1.5 rounded hover:bg-slate-700 text-red-400" title="清空">
                <Trash2 size={18}/>
            </button>
            <div className="h-6 w-px bg-slate-700 mx-1"></div>
            <button onClick={handleSaveDrawing} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">
                <Save size={14}/> 保存航线
            </button>
            <button onClick={handleStartDrawing} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300">
                退出
            </button>
        </div>
    );
};

export default DrawingToolbar;
