import { useEffect } from 'react';
import { TILE_SOURCES, generateWindCirclePoints } from './mapUtils';
import { TYPHOON_DATA } from './dataGenerator';

export const useMapInitialization = (
  libLoaded,
  mapContainerRef,
  mapInstanceRef,
  tileLayerRef,
  weatherLayerRef,
  routeLayerRef,
  markersLayerRef,
  typhoonLayerRef,
  playbackLayerRef,
  importLayerRef,
  drawingLayerRef,
  setMapReady
) => {
  useEffect(() => {
    if (!libLoaded || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const T = window.T;
    if (!T || typeof T.Map !== 'function') return;

    try {
        // 创建天地图实例
        const map = new T.Map(mapContainerRef.current);
        map.centerAndZoom(new T.LngLat(105, 35), 4);
        
        // 启用所有交互功能
        map.enableDrag();
        map.enableScrollWheelZoom();
        map.enableDoubleClickZoom();
        map.enableKeyboard();
        map.enableInertia();
        map.enableContinuousZoom();
        map.enableAutoResize();
        
        // 确保地图容器可以接收鼠标事件
        if (mapContainerRef.current) {
          mapContainerRef.current.style.cursor = 'grab';
          mapContainerRef.current.style.pointerEvents = 'auto';
        }

        // 创建图层对象（用数组模拟图层组）
        const weatherLayer = [];
        const routeLayer = [];
        const typhoonLayer = [];
        const markersLayer = [];
        const playbackLayer = [];
        const importLayer = [];
        const drawingLayer = [];
        
        weatherLayerRef.current = weatherLayer;
        routeLayerRef.current = routeLayer;
        markersLayerRef.current = markersLayer;
        typhoonLayerRef.current = typhoonLayer;
        playbackLayerRef.current = playbackLayer;
        importLayerRef.current = importLayer;
        drawingLayerRef.current = drawingLayer;
        
        tileLayerRef.current = { type: 'tianditu', map };
        mapInstanceRef.current = map;

        // 准格尔盆地
        const junggarCoords = [
            new T.LngLat(87.5, 48.2), new T.LngLat(89.0, 47.8), new T.LngLat(90.2, 47.0), 
            new T.LngLat(90.8, 46.0), new T.LngLat(91.0, 45.0), new T.LngLat(90.0, 44.2), 
            new T.LngLat(88.5, 43.8), new T.LngLat(87.0, 43.5), new T.LngLat(85.5, 43.8), 
            new T.LngLat(84.0, 44.5), new T.LngLat(83.0, 45.5), new T.LngLat(83.5, 46.5), 
            new T.LngLat(84.8, 47.2), new T.LngLat(86.0, 47.8)
        ];
        const polygon = new T.Polygon(junggarCoords, {
            color: '#fbbf24',
            weight: 2,
            opacity: 0.8,
            fillColor: '#fbbf24',
            fillOpacity: 0.15
        });
        map.addOverLay(polygon);

        // 监听地图移动事件
        map.addEventListener('moveend', () => setMapReady(prev => !prev));
        setMapReady(true);
    } catch (err) {
        console.error("Map initialization failed", err);
    }

    return () => { 
        if (mapInstanceRef.current) {
            mapInstanceRef.current.clearOverLays();
            mapInstanceRef.current = null; 
        }
    };
  }, [libLoaded]);
};

export const useTileLayerSwitch = (mapInstanceRef, tileLayerRef, isOfflineMode, libLoaded) => {
  useEffect(() => {
      if (!mapInstanceRef.current || !tileLayerRef.current || !libLoaded) return;
      if (!window.L || typeof window.L.tileLayer !== 'function') return;

      const L = window.L; 
      const map = mapInstanceRef.current;
      const source = isOfflineMode ? TILE_SOURCES.OFFLINE : TILE_SOURCES.ONLINE;
      
      if (tileLayerRef.current) {
         map.removeLayer(tileLayerRef.current);
      }
      
      const newTileLayer = L.tileLayer(source.url, { 
        attribution: source.attribution, 
        maxZoom: 19 
      }).addTo(map);
      newTileLayer.bringToBack();
      tileLayerRef.current = newTileLayer;
  }, [isOfflineMode, libLoaded]);
};

export const useWeatherLayer = (mapInstanceRef, weatherLayerRef, weatherData, showWeather, libLoaded) => {
  useEffect(() => {
    if (!mapInstanceRef.current || !weatherLayerRef.current || !libLoaded) return;
    if (!window.T) return;

    const T = window.T;
    const map = mapInstanceRef.current;
    const layer = weatherLayerRef.current;
    
    // 清除旧的图层
    layer.forEach(marker => map.removeOverLay(marker));
    layer.length = 0;
    
    if (!showWeather) return;

    weatherData.forEach(w => {
        let color = '#a3e635'; 
        if (w.windSpeed >= 15) color = '#facc15'; 
        if (w.windSpeed >= 25) color = '#f87171';
        
        let weatherIconSvg = w.type === 'Clear' 
          ? `<circle cx="12" cy="12" r="6" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2"/>` 
          : `<path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3s1.3 3 3 3h11c1.7 0 3-1.3 3-3z" fill="${color}" fill-opacity="0.4"/>`;
        
        const html = `<div class="relative w-10 h-10 flex items-center justify-center"><div style="transform: rotate(${w.windDir}deg); transform-origin: center;" class="absolute inset-0 flex items-center justify-center opacity-60"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></div><div class="absolute bottom-0 right-0 bg-slate-900/80 text-[8px] px-1 rounded text-white font-mono">${w.windSpeed}</div><div class="absolute top-0 left-0 w-4 h-4"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${weatherIconSvg}</svg></div></div>`;
        
        const icon = new T.Icon({
            iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><foreignObject width="40" height="40">${html}</foreignObject></svg>`),
            iconSize: new T.Point(40, 40),
            iconAnchor: new T.Point(20, 20)
        });
        
        const marker = new T.Marker(new T.LngLat(w.lon, w.lat), { icon });
        map.addOverLay(marker);
        layer.push(marker);
    });
  }, [libLoaded, weatherData, showWeather]);
};

export const useTyphoonLayer = (mapInstanceRef, typhoonLayerRef, mapReady, libLoaded) => {
  useEffect(() => {
    if (!mapInstanceRef.current || !typhoonLayerRef.current || !libLoaded) return;
    if (!window.T) return;

    const T = window.T;
    const map = mapInstanceRef.current;
    const layer = typhoonLayerRef.current;
    
    // 清除旧的图层
    layer.forEach(overlay => map.removeOverLay(overlay));
    layer.length = 0;
    
    const t = TYPHOON_DATA; 
    const currentPos = t.path[t.currentIdx];

    const windLevels = [
        { level: 7, radii: t.windRadii[7], color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.15 },
        { level: 10, radii: t.windRadii[10], color: '#eab308', fillColor: '#eab308', fillOpacity: 0.25 },
        { level: 12, radii: t.windRadii[12], color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.35 }
    ];
    
    // 绘制风圈
    windLevels.forEach(w => {
      const points = generateWindCirclePoints(currentPos, w.radii).map(p => new T.LngLat(p[1], p[0]));
      const polygon = new T.Polygon(points, { 
        color: w.color, 
        weight: 1.5, 
        fillColor: w.fillColor, 
        fillOpacity: w.fillOpacity 
      });
      map.addOverLay(polygon);
      layer.push(polygon);
    });
    
    // 绘制已走路径
    const passedPath = t.path.slice(0, t.currentIdx + 1).map(p => new T.LngLat(p[1], p[0]));
    const passedLine = new T.Polyline(passedPath, { 
      color: '#f87171', 
      weight: 2, 
      opacity: 0.8 
    });
    map.addOverLay(passedLine);
    layer.push(passedLine);
    
    // 绘制预测路径
    const futurePath = t.path.slice(t.currentIdx).map(p => new T.LngLat(p[1], p[0]));
    const futureLine = new T.Polyline(futurePath, { 
      color: '#fbbf24', 
      weight: 2, 
      opacity: 0.7,
      style: 'dashed'
    });
    map.addOverLay(futureLine);
    layer.push(futureLine);
    
    // 绘制24小时警戒线（红色实线）
    if (t.warningLines && t.warningLines.h24) {
      const h24Path = t.warningLines.h24.map(p => new T.LngLat(p[1], p[0]));
      const h24Line = new T.Polyline(h24Path, { 
        color: '#dc2626', 
        weight: 1.5, 
        opacity: 0.9
      });
      map.addOverLay(h24Line);
      layer.push(h24Line);
      
      // 添加24小时标签（竖向完整文字）
      const h24LabelSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='120' style='pointer-events: none;'>
        <text x='10' y='20' text-anchor='middle' font-size='12' fill='#dc2626' font-weight='bold'>24</text>
        <text x='10' y='35' text-anchor='middle' font-size='12' fill='#dc2626' font-weight='bold'>小</text>
        <text x='10' y='50' text-anchor='middle' font-size='12' fill='#dc2626' font-weight='bold'>时</text>
        <text x='10' y='65' text-anchor='middle' font-size='12' fill='#dc2626' font-weight='bold'>警</text>
        <text x='10' y='80' text-anchor='middle' font-size='12' fill='#dc2626' font-weight='bold'>戒</text>
        <text x='10' y='95' text-anchor='middle' font-size='12' fill='#dc2626' font-weight='bold'>线</text>
      </svg>`;
      const h24LabelIcon = new T.Icon({
        iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(h24LabelSvg),
        iconSize: new T.Point(20, 120),
        iconAnchor: new T.Point(10, 60)
      });
      const h24LabelPos = t.warningLines.h24[0];
      const h24Label = new T.Marker(new T.LngLat(h24LabelPos[1], h24LabelPos[0]), { icon: h24LabelIcon });
      map.addOverLay(h24Label);
      layer.push(h24Label);
    }

    // 绘制48小时警戒线（蓝色虚线）
    if (t.warningLines && t.warningLines.h48) {
      const h48Path = t.warningLines.h48.map(p => new T.LngLat(p[1], p[0]));
      const h48Line = new T.Polyline(h48Path, { 
        color: '#3b82f6',  
        weight: 1.5, 
        opacity: 0.8,
        lineStyle: 'dashed'
      });
      map.addOverLay(h48Line);
      layer.push(h48Line);
      
      // 添加48小时标签（竖向完整文字）
      const h48LabelSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='130' style='pointer-events: none;'>
        <text x='10' y='20' text-anchor='middle' font-size='12' fill='#3b82f6' font-weight='bold'>48</text>
        <text x='10' y='38' text-anchor='middle' font-size='12' fill='#3b82f6' font-weight='bold'>小</text>
        <text x='10' y='53' text-anchor='middle' font-size='12' fill='#3b82f6' font-weight='bold'>时</text>
        <text x='10' y='68' text-anchor='middle' font-size='12' fill='#3b82f6' font-weight='bold'>警</text>
        <text x='10' y='83' text-anchor='middle' font-size='12' fill='#3b82f6' font-weight='bold'>戒</text>
        <text x='10' y='98' text-anchor='middle' font-size='12' fill='#3b82f6' font-weight='bold'>线</text>
      </svg>`;
      const h48LabelIcon = new T.Icon({
        iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(h48LabelSvg),
        iconSize: new T.Point(20, 130),
        iconAnchor: new T.Point(10, 65)
      });
      const h48LabelPos = t.warningLines.h48[0];
      const h48Label = new T.Marker(new T.LngLat(h48LabelPos[1], h48LabelPos[0]), { icon: h48LabelIcon });
      map.addOverLay(h48Label);
      layer.push(h48Label);
    }
    
    // 台风图标（SVG+文本）
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='80' viewBox='0 0 60 80' style='pointer-events: none;'>
      <g>
        <text x='30' y='18' text-anchor='middle' font-size='14' fill='#e16531' font-weight='bold'>台风 ${t.name}</text>
        <g transform='translate(10,25) scale(0.04)'>
          <path d="M608 42.666667c53.312 0 104.533333 8.896 152.298667 25.258666a466.538667 466.538667 0 0 0-196.608 73.045334l-0.661334 0.426666C798.229333 166.826667 981.333333 366.037333 981.333333 608c0 53.312-8.896 104.533333-25.28 152.298667a466.56 466.56 0 0 0-73.514666-197.333334C857.173333 798.229333 657.962667 981.376 416 981.376c-53.312 0-104.533333-8.896-152.298667-25.28a466.538667 466.538667 0 0 0 196.608-73.045333l0.725334-0.469334C225.792 857.173333 42.666667 657.941333 42.666667 416c0-53.312 8.896-104.533333 25.258666-152.298667a466.56 466.56 0 0 0 73.493334 197.269334C166.826667 225.749333 366.058667 42.666667 608 42.666667zM512 352a160 160 0 1 0 0 320 160 160 0 0 0 0-320z" fill="#e16531"/>
        </g>
      </g>
    </svg>`;
    const icon = new T.Icon({
      iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
      iconSize: new T.Point(60, 80),
      iconAnchor: new T.Point(30, 45)
    });
    const marker = new T.Marker(new T.LngLat(currentPos[1], currentPos[0]), { icon });
    map.addOverLay(marker);
    layer.push(marker);
  }, [libLoaded, mapReady, mapInstanceRef, typhoonLayerRef]);
};
