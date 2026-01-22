import React, { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import TopNavigation from './components/TopNavigation';
import DrawingToolbar from './components/DrawingToolbar';
import PlaybackControls from './components/PlaybackControls';
import SidebarPanel from './components/SidebarPanel';
import RouteDataPreview from './components/RouteDataPreview';
import { Loader2 } from './components/Icons';
import { generateData, generateWeatherData, TYPHOON_DATA } from './utils/dataGenerator';
import { renderMarkersForTianditu } from './utils/markerUtils';
import { 
  useMapInitialization, 
  useTileLayerSwitch, 
  useWeatherLayer, 
  useTyphoonLayer 
} from './utils/mapHooks';

export default function App() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const playbackLayerRef = useRef(null);
  const importLayerRef = useRef(null);
  const drawingLayerRef = useRef(null);
  const typhoonLayerRef = useRef(null);
  const weatherLayerRef = useRef(null);
  const fileInputRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  const [allItems, setAllItems] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null); 
  const [libLoaded, setLibLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [playbackState, setPlaybackState] = useState({ id: null, index: 0, playing: false });
  const [previewDataId, setPreviewDataId] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnRoutePoints, setDrawnRoutePoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMap, setIsDarkMap] = useState(true);

  const activeAlarms = useMemo(() => allItems.filter(i => i.isAlarm), [allItems]);
  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.name.toLowerCase().includes(lower) || 
      item.id.toLowerCase().includes(lower)
    ).slice(0, 10);
  }, [searchQuery, allItems]);

  // 加载天地图库
  useEffect(() => {
    if (scriptLoadedRef.current) return;
    const checkTianditu = () => window.T && typeof window.T.Map === 'function';
    if (checkTianditu()) { setLibLoaded(true); return; }
    scriptLoadedRef.current = true;
    
    // 天地图脚本已在 public/index.html 中加载，这里只需要等待加载完成
    const interval = setInterval(() => {
      if (checkTianditu()) { 
        setLibLoaded(true); 
        clearInterval(interval); 
      }
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      if (!checkTianditu()) {
        console.error("天地图 API 加载失败");
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // 地图模式切换
  useEffect(() => {
    if (!mapInstanceRef.current || !libLoaded || !window.T) return;
    const map = mapInstanceRef.current;
    
    // 根据模式切换图层类型（不清除覆盖物）
    if (isDarkMap) {
      // 深色模式 - 影像图
      map.setMapType(window.TMAP_SATELLITE_MAP);
    } else {
      // 浅色模式 - 矢量图
      map.setMapType(window.TMAP_NORMAL_MAP);
    }
  }, [isDarkMap, libLoaded]);

  useEffect(() => { setAllItems(generateData()); setWeatherData(generateWeatherData()); }, []);

  useMapInitialization(libLoaded, mapContainerRef, mapInstanceRef, tileLayerRef, weatherLayerRef, routeLayerRef, markersLayerRef, typhoonLayerRef, playbackLayerRef, importLayerRef, drawingLayerRef, setMapReady);
  useTileLayerSwitch(mapInstanceRef, tileLayerRef, isOfflineMode, libLoaded);
  useWeatherLayer(mapInstanceRef, weatherLayerRef, weatherData, showWeather, libLoaded);
  useTyphoonLayer(mapInstanceRef, typhoonLayerRef, mapReady, libLoaded);

  // 绘图模式逻辑
  useEffect(() => {
    if (!mapInstanceRef.current || !window.T) return;
    const map = mapInstanceRef.current;
    const handleMapClick = (e) => {
      if (!isDrawingMode) return;
      setDrawnRoutePoints(prev => [...prev, [e.lnglat.lat, e.lnglat.lng]]);
    };
    if (isDrawingMode) {
      map.addEventListener('click', handleMapClick);
    } else {
      map.removeEventListener('click', handleMapClick);
    }
    return () => { 
      if (map) map.removeEventListener('click', handleMapClick); 
    };
  }, [isDrawingMode, libLoaded]);

  // 绘图图层渲染
  useEffect(() => {
    if (!drawingLayerRef.current || !window.T) return;
    const T = window.T;
    const map = mapInstanceRef.current;
    const layer = drawingLayerRef.current;
    
    // 清除旧图层
    layer.forEach(overlay => map.removeOverLay(overlay));
    layer.length = 0;
    
    if (drawnRoutePoints.length > 0) {
      const points = drawnRoutePoints.map(p => new T.LngLat(p[1], p[0]));
      const line = new T.Polyline(points, { 
        color: '#fbbf24', 
        weight: 3, 
        opacity: 0.8,
        style: 'dashed'
      });
      map.addOverLay(line);
      layer.push(line);
      
      drawnRoutePoints.forEach((p, i) => {
        const circleIcon = new T.Icon({
          iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="30"><circle cx="30" cy="20" r="5" fill="#fbbf24"/><text x="30" y="10" text-anchor="middle" font-size="10" fill="#fbbf24" font-weight="bold">WP ${i+1}</text></svg>`),
          iconSize: new T.Point(60, 30),
          iconAnchor: new T.Point(30, 20)
        });
        const marker = new T.Marker(new T.LngLat(p[1], p[0]), { icon: circleIcon });
        map.addOverLay(marker);
        layer.push(marker);
      });
    }
  }, [drawnRoutePoints, libLoaded]);

  // 回放控制
  useEffect(() => {
    let timer;
    if (playbackState.playing && playbackState.id) {
      timer = setInterval(() => {
        setPlaybackState(prev => {
          const ship = allItems.find(s => s.id === prev.id);
          if (!ship || !ship.historyPath || prev.index >= ship.historyPath.length - 1) {
            return { ...prev, playing: false };
          }
          return { ...prev, index: prev.index + 1 };
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [playbackState.playing, playbackState.id, allItems]);

  // 回放图层
  useEffect(() => {
    if (!mapInstanceRef.current || !playbackLayerRef.current || !libLoaded || !window.T) return;
    const T = window.T;
    const map = mapInstanceRef.current;
    const layer = playbackLayerRef.current;
    
    // 清除旧图层
    layer.forEach(overlay => map.removeOverLay(overlay));
    layer.length = 0;
    
    if (playbackState.id) {
      const ship = allItems.find(s => s.id === playbackState.id);
      if (ship && ship.historyPath && ship.historyPath.length > 0) {
        // 完整轨迹线
        const fullPath = ship.historyPath.map(p => new T.LngLat(p[1], p[0]));
        const fullLine = new T.Polyline(fullPath, { 
          color: '#64748b', 
          weight: 2, 
          opacity: 0.5,
          style: 'dashed'
        });
        map.addOverLay(fullLine);
        layer.push(fullLine);
        
        // 已走过的轨迹
        const travelledPath = ship.historyPath.slice(0, playbackState.index + 1).map(p => new T.LngLat(p[1], p[0]));
        const travelledLine = new T.Polyline(travelledPath, { 
          color: '#0ea5e9', 
          weight: 3, 
          opacity: 1 
        });
        map.addOverLay(travelledLine);
        layer.push(travelledLine);
        
        // 当前位置
        const currentPos = ship.historyPath[playbackState.index];
        if (currentPos) {
          const iconHtml = `<div class="relative w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full border-2 border-white shadow-lg text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${ship.course}deg)"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.9 5.8 2.5 8" /></svg></div>`;
          
          const icon = new T.Icon({
            iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><foreignObject width="32" height="32">${iconHtml}</foreignObject></svg>`),
            iconSize: new T.Point(32, 32),
            iconAnchor: new T.Point(16, 16)
          });
          
          const marker = new T.Marker(new T.LngLat(currentPos[1], currentPos[0]), { icon });
          map.addOverLay(marker);
          layer.push(marker);
          
          if (playbackState.playing) {
            map.panTo(new T.LngLat(currentPos[1], currentPos[0]));
          }
        }
      }
    }
  }, [playbackState, allItems, libLoaded]);

  // 选中航线图层
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current || !libLoaded || !window.T) return;
    const T = window.T;
    const map = mapInstanceRef.current;
    const layer = routeLayerRef.current;
    
    // 清除旧图层
    layer.forEach(overlay => map.removeOverLay(overlay));
    layer.length = 0;
    
    if (!highlightedItemId) return;
    const item = allItems.find(i => i.id === highlightedItemId);
    if (item && item.type === 'ship' && item.plannedRoute) {
      const routePoints = item.plannedRoute.map(p => new T.LngLat(p[1], p[0]));
      const routeLine = new T.Polyline(routePoints, { 
        color: '#3b82f6', 
        weight: 2, 
        opacity: 0.8,
        style: 'dashed'
      });
      map.addOverLay(routeLine);
      layer.push(routeLine);
      
      if (item.isAlarm) {
        const currentPos = new T.LngLat(item.lon, item.lat);
        const nearestRoutePoint = new T.LngLat(item.plannedRoute[0][1], item.plannedRoute[0][0]);
        const deviationLine = new T.Polyline([currentPos, nearestRoutePoint], { 
          color: '#ef4444', 
          weight: 2, 
          opacity: 0.8 
        });
        map.addOverLay(deviationLine);
        layer.push(deviationLine);
        
        const midLat = (item.lat + item.plannedRoute[0][0])/2;
        const midLon = (item.lon + item.plannedRoute[0][1])/2;
        
        const labelIcon = new T.Icon({
          iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="20"><foreignObject width="80" height="20"><div xmlns="http://www.w3.org/1999/xhtml" class="bg-red-600 text-white text-[10px] px-1 rounded shadow whitespace-nowrap">偏离 ${item.xte.toFixed(1)} NM</div></foreignObject></svg>`),
          iconSize: new T.Point(80, 20),
          iconAnchor: new T.Point(40, 10)
        });
        const labelMarker = new T.Marker(new T.LngLat(midLon, midLat), { icon: labelIcon });
        map.addOverLay(labelMarker);
        layer.push(labelMarker);
      }
    }
  }, [highlightedItemId, allItems, libLoaded]);

  // 标记图层
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || allItems.length === 0 || !libLoaded || !window.T) return;
    const T = window.T;
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    
    renderMarkersForTianditu(map, T, layer, allItems, highlightedItemId, playbackState, setHighlightedItemId, setSelectedCluster);
  }, [allItems, mapReady, libLoaded, highlightedItemId, playbackState.id, playbackState.playing]);

  const handleLocateItem = (item) => {
    setHighlightedItemId(item.id);
    if (mapInstanceRef.current && window.T) {
      mapInstanceRef.current.centerAndZoom(new window.T.LngLat(item.lon, item.lat), 12);
    }
  };

  const startPlayback = (id) => setPlaybackState({ id, index: 0, playing: true });
  const stopPlayback = () => setPlaybackState({ id: null, index: 0, playing: false });
  const togglePlayPause = () => setPlaybackState(prev => ({ ...prev, playing: !prev.playing }));

  const handleStartDrawing = () => setIsDrawingMode(!isDrawingMode);
  const handleClearDrawing = () => setDrawnRoutePoints([]);
  const handleUndoDrawing = () => setDrawnRoutePoints(prev => prev.slice(0, -1));
  const handleSaveDrawing = () => {
    if (drawnRoutePoints.length < 2) { alert("请至少绘制两个航路点"); return; }
    const geoJson = {
      type: "Feature",
      properties: { name: `Custom Route ${new Date().toLocaleString()}` },
      geometry: { type: "LineString", coordinates: drawnRoutePoints.map(p => [p[1], p[0]]) }
    };
    const blob = new Blob([JSON.stringify(geoJson, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `route_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    alert(`航线已保存 (${drawnRoutePoints.length} WPs)`);
    setIsDrawingMode(false);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const drawImportedRoute = (points) => {
    if (!mapInstanceRef.current || !importLayerRef.current || !window.T) return;
    const T = window.T;
    const map = mapInstanceRef.current;
    const layer = importLayerRef.current;
    
    // 清除旧图层
    layer.forEach(overlay => map.removeOverLay(overlay));
    layer.length = 0;
    
    const lngLatPoints = points.map(p => new T.LngLat(p[1], p[0]));
    const polyline = new T.Polyline(lngLatPoints, { color: '#d946ef', weight: 4, style: 'dashed' });
    map.addOverLay(polyline);
    layer.push(polyline);
    
    points.forEach((p, i) => {
      const icon = new T.Icon({
        iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="30"><circle cx="30" cy="20" r="4" fill="#d946ef" stroke="#fff" stroke-width="1"/><text x="30" y="10" text-anchor="middle" font-size="10" fill="#d946ef" font-weight="bold">WP ${i+1}</text></svg>`),
        iconSize: new T.Point(60, 30),
        iconAnchor: new T.Point(30, 20)
      });
      const marker = new T.Marker(new T.LngLat(p[1], p[0]), { icon });
      map.addOverLay(marker);
      layer.push(marker);
    });
    
    // 调整视图以包含所有点
    const lngs = points.map(p => p[1]);
    const lats = points.map(p => p[0]);
    const bounds = new T.LngLatBounds(
      new T.LngLat(Math.min(...lngs), Math.min(...lats)),
      new T.LngLat(Math.max(...lngs), Math.max(...lats))
    );
    map.setViewport([bounds]);
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        let routePoints = [];
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            routePoints = json.map(p => Array.isArray(p) ? p : [p.lat || p.latitude, p.lon || p.lng || p.longitude]);
          } else if (json.type === 'FeatureCollection' || json.type === 'Feature') {
            const features = json.type === 'FeatureCollection' ? json.features : [json];
            const lineString = features.find(f => f.geometry.type === 'LineString');
            if (lineString) routePoints = lineString.geometry.coordinates.map(c => [c[1], c[0]]);
          }
        } else {
          text.split('\n').forEach(line => {
            const cleanLine = line.replace(/['"]/g, '').trim();
            if (!cleanLine) return;
            const parts = cleanLine.split(/[,\t;]/).map(s => s.trim());
            const coords = parts.filter(p => !isNaN(parseFloat(p)) && Math.abs(parseFloat(p)) <= 180);
            if (coords.length >= 2) {
              const v1 = parseFloat(coords[0]); const v2 = parseFloat(coords[1]);
              if (v1 >= -90 && v1 <= 90 && v2 >= -180 && v2 <= 180) routePoints.push([v1, v2]);
            }
          });
        }
        if (routePoints.length > 1) {
          drawImportedRoute(routePoints);
          setTimeout(() => alert(`成功导入航线，包含 ${routePoints.length} 个航路点。\n已自动缩放至航线区域。`), 100);
        } else {
          alert("未识别到有效的航路点数据。\n\n支持格式:\n1. CSV: lat,lon\n2. GeoJSON\n3. JSON 数组");
        }
      } catch (err) {
        console.error("Import failed", err);
        alert("导入失败：文件格式解析错误");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleRefresh = () => { setAllItems(generateData()); setWeatherData(generateWeatherData()); };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-white font-sans overflow-hidden">
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv,.json,.txt,.geojson" onChange={handleFileImport} />
      
      <TopNavigation 
        activeAlarms={activeAlarms}
        isOfflineMode={isOfflineMode}
        setIsOfflineMode={setIsOfflineMode}
        isDrawingMode={isDrawingMode}
        handleStartDrawing={handleStartDrawing}
        handleImportClick={handleImportClick}
        showWeather={showWeather}
        setShowWeather={setShowWeather}
        typhoonData={TYPHOON_DATA}
        mapInstance={mapInstanceRef.current}
        handleRefresh={handleRefresh}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        filteredItems={filteredItems}
        handleLocateItem={handleLocateItem}
        isDarkMap={isDarkMap}
        setIsDarkMap={setIsDarkMap}
      />

      <div className="flex-1 relative w-full h-full bg-slate-900">
        <div id="map" ref={mapContainerRef} className="w-full h-full z-0" />
        
        {!libLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50 text-slate-400">
            <Loader2 className="animate-spin" size={32}/>
            <span>加载中...</span>
          </div>
        )}

        {isDrawingMode && (
          <DrawingToolbar 
            handleUndoDrawing={handleUndoDrawing}
            handleClearDrawing={handleClearDrawing}
            handleSaveDrawing={handleSaveDrawing}
            handleStartDrawing={handleStartDrawing}
          />
        )}

        {previewDataId && (
          <RouteDataPreview 
            ship={allItems.find(i => i.id === previewDataId)} 
            onClose={() => setPreviewDataId(null)} 
          />
        )}

        <PlaybackControls 
          playbackState={playbackState}
          togglePlayPause={togglePlayPause}
          stopPlayback={stopPlayback}
        />

        <SidebarPanel 
          selectedCluster={selectedCluster}
          setSelectedCluster={setSelectedCluster}
          handleLocateItem={handleLocateItem}
          highlightedItemId={highlightedItemId}
          startPlayback={startPlayback}
          setPreviewDataId={setPreviewDataId}
        />
      </div>
    </div>
  );
}
