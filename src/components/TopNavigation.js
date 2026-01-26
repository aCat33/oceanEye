import React, { useState } from 'react';
import { 
    Bell, Wifi, WifiOff, PenTool, FileUp, CloudLightning, Cloud, 
    Wind, Mountain, Anchor, Target, MapIcon, Search, Sun, Moon 
} from './Icons';

const TopNavigation = ({ 
    activeAlarms, 
    isOfflineMode, 
    setIsOfflineMode, 
    isDrawingMode, 
    handleStartDrawing, 
    handleImportClick, 
    showWeather, 
    setShowWeather, 
    typhoonList,
    currentTyphoonIndex,
    setCurrentTyphoonIndex,
    mapInstance, 
    handleRefresh,
    searchQuery,
    setSearchQuery,
    isDarkMap,
    setIsDarkMap,
    isSearchFocused,
    setIsSearchFocused,
    filteredItems,
    handleLocateItem
}) => {
    const [showTyphoonMenu, setShowTyphoonMenu] = useState(false);
    return (
        <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 z-20 shadow-lg shrink-0">
            <div className="flex items-center gap-2">
                <MapIcon className="text-blue-400" />
                <div>
                    <h1 className="font-bold text-lg tracking-wide">OceanEye 监控系统</h1>
                    <p className="text-[10px] text-slate-400 -mt-1">OSM | 台风 | 智能航线报警</p>
                </div>
            </div>

            {/* 搜索框 */}
            <div className="relative mx-4 flex-1 max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-1.5 border border-slate-600 rounded bg-slate-700/50 text-slate-200 placeholder-slate-400 focus:outline-none focus:bg-slate-700 focus:border-blue-500 text-xs transition-colors"
                    placeholder="搜索船舶..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                {isSearchFocused && filteredItems.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-slate-800 border border-slate-700 rounded shadow-xl max-h-60 overflow-y-auto custom-scrollbar z-50">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id} 
                                className="px-3 py-2 hover:bg-slate-700 cursor-pointer flex justify-between items-center text-xs border-b border-slate-700/50 last:border-0"
                                onClick={() => {
                                    handleLocateItem(item);
                                    setSearchQuery("");
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    {item.type === 'ship' ? 
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.9 5.8 2.5 8" /></svg>
                                        : 
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>
                                    }
                                    <span className="text-slate-200 font-medium">{item.name}</span>
                                </div>
                                <span className="text-slate-500 font-mono text-[10px]">{item.id}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded border transition-colors ${activeAlarms.length > 0 ? 'bg-red-600/20 border-red-500 text-red-200 animate-pulse font-bold' : 'bg-slate-800 border-slate-600 text-slate-400'}`}>
                    <Bell size={14} /> {activeAlarms.length > 0 ? `${activeAlarms.length} 艘严重偏航` : '系统正常'}
                </div>
                <div className="h-6 w-px bg-slate-600 mx-1"></div>
                <button onClick={() => setIsOfflineMode(!isOfflineMode)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-slate-600 bg-slate-700 text-slate-300">
                    {isOfflineMode ? <WifiOff size={14} /> : <Wifi size={14} />} {isOfflineMode ? '离线' : '在线'}
                </button>
                <button onClick={handleStartDrawing} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded border transition-colors ${isDrawingMode ? 'bg-yellow-600/20 border-yellow-500 text-yellow-200 font-bold animate-pulse' : 'border-slate-600 bg-slate-700 text-slate-300'}`}>
                    <PenTool size={14} /> 绘制航线
                </button>
                <button onClick={handleImportClick} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-slate-600 bg-purple-900/30 text-purple-200 hover:bg-purple-900/50 border-purple-500/30">
                    <FileUp size={14} /> 导入航线
                </button>
                <button onClick={() => setShowWeather(!showWeather)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded border transition-colors ${showWeather?'bg-sky-600 border-sky-400 text-white':'bg-slate-700 border-slate-600 text-slate-300'}`}>
                    {showWeather ? <CloudLightning size={14} /> : <Cloud size={14} />} 气象
                </button>
                
                {/* 台风按钮 - 带下拉菜单 */}
                <div className="relative">
                    <button 
                        onClick={() => setShowTyphoonMenu(!showTyphoonMenu)} 
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-red-600/20 border border-red-500 text-red-200 hover:bg-red-600/40"
                    >
                        <Wind size={14} /> 台风 ({typhoonList.length})
                    </button>
                    {showTyphoonMenu && (
                        <div className="absolute top-full mt-1 right-0 bg-slate-800 border border-slate-700 rounded shadow-xl z-50 min-w-[220px]">
                            {typhoonList.map((typhoon, index) => (
                                <div 
                                    key={typhoon.id}
                                    className={`px-3 py-2 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0 ${currentTyphoonIndex === index ? 'bg-red-600/20' : ''}`}
                                    onClick={() => {
                                        setCurrentTyphoonIndex(index);
                                        setShowTyphoonMenu(false);
                                        if (mapInstance && window.T) {
                                            const pos = typhoon.path[typhoon.currentIdx];
                                            mapInstance.centerAndZoom(new window.T.LngLat(pos[1], pos[0]), 6);
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Wind size={12} className="text-red-400" />
                                            <div className="text-xs">
                                                <div className="font-medium text-slate-200">{typhoon.name}</div>
                                                <div className="text-[10px] text-slate-400">{typhoon.level} · {typhoon.time}</div>
                                            </div>
                                        </div>
                                        {currentTyphoonIndex === index && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <button onClick={() => { if (mapInstance && window.T) { mapInstance.centerAndZoom(new window.T.LngLat(87.0, 45.5), 6); }}} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-amber-600/30 border border-amber-600 text-amber-200 hover:bg-amber-600/50">
                    <Mountain size={14} /> 盆地
                </button>
                <button onClick={handleRefresh} className="p-2 rounded hover:bg-slate-700 text-slate-300">
                    <Anchor size={18} />
                </button>
                <button onClick={() => setIsDarkMap(!isDarkMap)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded border transition-colors ${isDarkMap ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-yellow-50 border-yellow-400 text-slate-800'}`}>
                    {isDarkMap ? <Moon size={14} /> : <Sun size={14} />} {isDarkMap ? '深色' : '浅色'}
                </button>
                <button onClick={() => { if (mapInstance && window.T) { mapInstance.centerAndZoom(new window.T.LngLat(105, 35), 4); }}} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500">
                    <Target size={14} /> 居中
                </button>
            </div>
        </div>
    );
};

export default TopNavigation;
