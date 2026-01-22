import { useEffect } from 'react';
import { TILE_SOURCES, generateWindCirclePoints } from './mapUtils';
import { TYPHOON_DATA, TYPHOON_INTENSITY } from './dataGenerator';
import typhoonSprite from '../icons/typhoonstatic.png';

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

    // 只绘制12级风圈（红色）
    const windLevels = [
        { level: 12, radii: currentPos[8], color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.35 }
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
    
    // 绘制已走路径（按强度分段绘制不同颜色）
    for (let i = 0; i < t.currentIdx; i++) {
      const p1 = t.path[i];
      const p2 = t.path[i + 1];
      const intensity1 = TYPHOON_INTENSITY[p1[2]] || TYPHOON_INTENSITY.TY;
      const intensity2 = TYPHOON_INTENSITY[p2[2]] || TYPHOON_INTENSITY.TY;
      const segmentPath = [new T.LngLat(p1[1], p1[0]), new T.LngLat(p2[1], p2[0])];
      const segmentLine = new T.Polyline(segmentPath, { 
        color: intensity2.color, 
        weight: 3, 
        opacity: 0.9
      });
      map.addOverLay(segmentLine);
      layer.push(segmentLine);
      
      // 在每个路径点上绘制实心圆点（使用该点的强度颜色）
      const pointCircle = new T.Circle(new T.LngLat(p1[1], p1[0]), 15000, {
        color: intensity1.color,
        fillColor: intensity1.color,
        fillOpacity: 1,
        weight: 2
      });
      
      // 为圆点添加点击事件
      pointCircle.addEventListener('click', () => {
        const intensityLevel = TYPHOON_INTENSITY[p1[2]]?.level || '未知';
        const infoWindow = new T.InfoWindow();
        const content = `
          <div style="padding: 15px; min-width: 280px; font-family: Arial, sans-serif;">
            <div style="background: #3b82f6; color: white; padding: 10px; margin: -15px -15px 10px -15px; font-size: 16px; font-weight: bold;">
              【天琴】${p1[3] || '时间未知'}
            </div>
            <div style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #3b82f6;">中心位置：</strong>东经${p1[1].toFixed(1)}° 北纬${p1[0].toFixed(1)}°
            </div>
            <div style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #3b82f6;">风速风力：</strong>${p1[4] || '未知'},${intensityLevel}（${intensity1.name}）
            </div>
            <div style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #3b82f6;">中心气压：</strong>${p1[5] || '未知'}
            </div>
          </div>
        `;
        infoWindow.setLngLat(new T.LngLat(p1[1], p1[0]));
        infoWindow.setContent(content);
        map.addOverLay(infoWindow);
      });
      
      map.addOverLay(pointCircle);
      layer.push(pointCircle);
    }
    
    // 绘制当前位置的圆点（稍大一些）
    const currentPoint = t.path[t.currentIdx];
    const currentIntensityForPoint = TYPHOON_INTENSITY[currentPoint[2]] || TYPHOON_INTENSITY.TY;
    const currentCircle = new T.Circle(new T.LngLat(currentPoint[1], currentPoint[0]), 15000, {
      color: currentIntensityForPoint.color,
      fillColor: currentIntensityForPoint.color,
      fillOpacity: 1,
      weight: 2
    });
    
    // 为当前位置圆点添加点击事件
    currentCircle.addEventListener('click', () => {
      const intensityLevel = TYPHOON_INTENSITY[currentPoint[2]]?.level || '未知';
      const infoWindow = new T.InfoWindow();
      const content = `
        <div style="padding: 15px; min-width: 280px; font-family: Arial, sans-serif;">
          <div style="background: #3b82f6; color: white; padding: 10px; margin: -15px -15px 10px -15px; font-size: 16px; font-weight: bold;">
            【天琴】${currentPoint[3] || '时间未知'}
          </div>
          <div style="margin: 8px 0; font-size: 14px;">
            <strong style="color: #3b82f6;">中心位置：</strong>东经${currentPoint[1].toFixed(1)}° 北纬${currentPoint[0].toFixed(1)}°
          </div>
          <div style="margin: 8px 0; font-size: 14px;">
            <strong style="color: #3b82f6;">风速风力：</strong>${currentPoint[4] || '未知'},${intensityLevel}（${currentIntensityForPoint.name}）
          </div>
          <div style="margin: 8px 0; font-size: 14px;">
            <strong style="color: #3b82f6;">中心气压：</strong>${currentPoint[5] || '未知'}
          </div>
        </div>
      `;
      infoWindow.setLngLat(new T.LngLat(currentPoint[1], currentPoint[0]));
      infoWindow.setContent(content);
      map.addOverLay(infoWindow);
    });
    
    map.addOverLay(currentCircle);
    layer.push(currentCircle);
    
    // 绘制预测路径（虚线，按强度分段）
    for (let i = t.currentIdx; i < t.path.length - 1; i++) {
      const p1 = t.path[i];
      const p2 = t.path[i + 1];
      const intensity1 = TYPHOON_INTENSITY[p1[2]] || TYPHOON_INTENSITY.TY;
      const intensity2 = TYPHOON_INTENSITY[p2[2]] || TYPHOON_INTENSITY.TY;
      const segmentPath = [new T.LngLat(p1[1], p1[0]), new T.LngLat(p2[1], p2[0])];
      const segmentLine = new T.Polyline(segmentPath, { 
        color: intensity2.color, 
        weight: 3, 
        opacity: 0.7,
        lineStyle: 'dashed'
      });
      map.addOverLay(segmentLine);
      layer.push(segmentLine);
      
      // 在预测路径点上绘制空心圆点
      if (i > t.currentIdx) {
        const pointCircle = new T.Circle(new T.LngLat(p1[1], p1[0]), 15000, {
          color: intensity1.color,
          fillColor: '#ffffff',
          fillOpacity: 0.5,
          weight: 3
        });
        
        // 为预测点添加点击事件
        pointCircle.addEventListener('click', () => {
          const intensityLevel = TYPHOON_INTENSITY[p1[2]]?.level || '未知';
          const infoWindow = new T.InfoWindow();
          const content = `
            <div style="padding: 15px; min-width: 280px; font-family: Arial, sans-serif;">
              <div style="background: #3b82f6; color: white; padding: 10px; margin: -15px -15px 10px -15px; font-size: 16px; font-weight: bold;">
                【天琴】${p1[3] || '时间未知'} (预测)
              </div>
              <div style="margin: 8px 0; font-size: 14px;">
                <strong style="color: #3b82f6;">中心位置：</strong>东经${p1[1].toFixed(1)}° 北纬${p1[0].toFixed(1)}°
              </div>
              <div style="margin: 8px 0; font-size: 14px;">
                <strong style="color: #3b82f6;">风速风力：</strong>${p1[4] || '未知'},${intensityLevel}（${intensity1.name}）
              </div>
              <div style="margin: 8px 0; font-size: 14px;">
                <strong style="color: #3b82f6;">中心气压：</strong>${p1[5] || '未知'}
              </div>
            </div>
          `;
          infoWindow.setLngLat(new T.LngLat(p1[1], p1[0]));
          infoWindow.setContent(content);
          map.addOverLay(infoWindow);
        });
        
        map.addOverLay(pointCircle);
        layer.push(pointCircle);
      }
    }
    
    // 绘制最后一个预测点
    if (t.path.length > t.currentIdx + 1) {
      const lastPoint = t.path[t.path.length - 1];
      const lastIntensity = TYPHOON_INTENSITY[lastPoint[2]] || TYPHOON_INTENSITY.TY;
      const lastCircle = new T.Circle(new T.LngLat(lastPoint[1], lastPoint[0]), 15000, {
        color: lastIntensity.color,
        fillColor: '#ffffff',
        fillOpacity: 0.5,
        weight: 3
      });
      
      // 为最后一个预测点添加点击事件
      lastCircle.addEventListener('click', () => {
        const intensityLevel = TYPHOON_INTENSITY[lastPoint[2]]?.level || '未知';
        const infoWindow = new T.InfoWindow();
        const content = `
          <div style="padding: 15px; min-width: 280px; font-family: Arial, sans-serif;">
            <div style="background: #3b82f6; color: white; padding: 10px; margin: -15px -15px 10px -15px; font-size: 16px; font-weight: bold;">
              【天琴】${lastPoint[3] || '时间未知'} (预测)
            </div>
            <div style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #3b82f6;">中心位置：</strong>东经${lastPoint[1].toFixed(1)}° 北纬${lastPoint[0].toFixed(1)}°
            </div>
            <div style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #3b82f6;">风速风力：</strong>${lastPoint[4] || '未知'},${intensityLevel}（${lastIntensity.name}）
            </div>
            <div style="margin: 8px 0; font-size: 14px;">
              <strong style="color: #3b82f6;">中心气压：</strong>${lastPoint[5] || '未知'}
            </div>
          </div>
        `;
        infoWindow.setLngLat(new T.LngLat(lastPoint[1], lastPoint[0]));
        infoWindow.setContent(content);
        map.addOverLay(infoWindow);
      });
      
      map.addOverLay(lastCircle);
      layer.push(lastCircle);
    }
    
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
    
    // 台风图标（使用精灵图）
    // 根据当前台风强度确定精灵图位置（横向排列）
    const currentIntensity = currentPos[2]; // TD, TS, STS, TY, STY, SuperTY
    const intensityMap = {
      'STS': 0,     // 强热带风暴 - 绿色
      'TS': 1,      // 热带风暴 - 蓝色
      'TD': 2,      // 热带低压 - 黄色
      'TY': 3,      // 台风 - 橙色
      'STY': 4,     // 强台风 - 粉色
      'SuperTY': 5  // 超强台风 - 红色
    };
    
    const spriteIndex = intensityMap[currentIntensity] || 3;
    const displaySize = 60; // 显示尺寸
    
    // 使用Canvas裁剪精灵图
    const canvas = document.createElement('canvas');
    canvas.width = displaySize;
    canvas.height = displaySize;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      // 精灵图有7个图标（6个台风等级 + 1个三角形），横向排列
      const spriteWidth = img.width;
      const spriteHeight = img.height;
      const singleIconWidth = spriteWidth / 7; // 分成7份
      
      // 清除画布并设置透明背景
      ctx.clearRect(0, 0, displaySize, displaySize);
      
      // 从横向精灵图中裁剪对应位置的图标，并缩放到显示尺寸
      ctx.drawImage(
        img, 
        spriteIndex * singleIconWidth, 0,           // 源图裁剪起点
        singleIconWidth, spriteHeight,              // 源图裁剪尺寸
        0, 0,                                        // 目标画布起点
        displaySize, displaySize                     // 目标画布尺寸
      );
      
      const iconUrl = canvas.toDataURL('image/png');
      
      // 创建带旋转动画的SVG图标（逆时针）
      const rotatingSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${displaySize}" height="${displaySize}" viewBox="0 0 ${displaySize} ${displaySize}">
        <defs>
          <style>
            @keyframes rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); }
            }
          </style>
        </defs>
        <image href="${iconUrl}" x="0" y="0" width="${displaySize}" height="${displaySize}" style="animation: rotate 2s linear infinite; transform-origin: center center;" />
      </svg>`;
      
      const typhoonIcon = new T.Icon({
        iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(rotatingSvg),
        iconSize: new T.Point(displaySize, displaySize),
        iconAnchor: new T.Point(displaySize/2, displaySize/2)
      });
      
      const marker = new T.Marker(new T.LngLat(currentPos[1], currentPos[0]), { icon: typhoonIcon });
      map.addOverLay(marker);
      layer.push(marker);
    };
    img.src = typhoonSprite;
  }, [libLoaded, mapReady, mapInstanceRef, typhoonLayerRef]);
};
