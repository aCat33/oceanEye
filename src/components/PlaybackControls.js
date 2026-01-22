import React from 'react';
import { Play, Pause, StopCircle } from './Icons';

const PlaybackControls = ({ playbackState, togglePlayPause, stopPlayback }) => {
    if (!playbackState.id) return null;

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 p-4 rounded-xl flex items-center gap-4 z-[2000] backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2">
                <button onClick={togglePlayPause} className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors">
                    {playbackState.playing ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                </button>
                <button onClick={stopPlayback} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors text-red-400">
                    <StopCircle size={20} />
                </button>
            </div>
            <div className="flex flex-col gap-1 w-64">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>回放进度</span>
                    <span className="font-mono">{(playbackState.index / 50 * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300 ease-linear" style={{ width: `${(playbackState.index / 50 * 100)}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default PlaybackControls;
