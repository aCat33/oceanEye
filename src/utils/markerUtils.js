// 标记图层辅助函数 - 用于天地图
export const renderMarkersForTianditu = (map, T, layer, allItems, highlightedItemId, playbackState, setHighlightedItemId, setSelectedCluster) => {
  console.log('renderMarkersForTianditu called', { itemsCount: allItems.length, layerLength: layer.length });
  
  // 清除旧图层
  layer.forEach(overlay => map.removeOverLay(overlay));
  layer.length = 0;

  // 简单聚合逻辑（基于经纬度距离）
  const clusters = [];
  const processedIds = new Set();
  
  for (let i = 0; i < allItems.length; i++) {
    if (processedIds.has(allItems[i].id)) continue;
    const base = allItems[i];
    const cluster = [base];
    processedIds.add(base.id);
    
    for (let j = i + 1; j < allItems.length; j++) {
      if (processedIds.has(allItems[j].id)) continue;
      const distance = Math.sqrt(
        Math.pow((base.lat - allItems[j].lat) * 111, 2) + 
        Math.pow((base.lon - allItems[j].lon) * 111 * Math.cos(base.lat * Math.PI / 180), 2)
      );
      if (distance < 50) { // 50km聚合
        cluster.push(allItems[j]);
        processedIds.add(allItems[j].id);
      }
    }
    clusters.push(cluster);
  }

  clusters.forEach(clusterItems => {
    const isCluster = clusterItems.length > 1;
    const mainItem = clusterItems[0];
    const position = new T.LngLat(mainItem.lon, mainItem.lat);
    const isHighlighted = !isCluster && mainItem.id === highlightedItemId;
    const hasAlarmInCluster = clusterItems.some(i => i.isAlarm);
    
    if (playbackState.id === mainItem.id && playbackState.playing) return;

    let iconUrl = '';
    let iconSize = 32;

    if (isCluster) {
      const color = hasAlarmInCluster ? '#dc2626' : 
        (clusterItems.some(i=>i.type==='rig') ? '#f97316' : '#2563eb');
      iconUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
          <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
          <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${clusterItems.length}</text>
        </svg>`
      );
    } else {
      const item = mainItem;
      const rotation = item.course || 0;
      const color = item.isAlarm ? '#dc2626' : (item.type === 'rig' ? '#f97316' : '#3b82f6');
      
      if (item.type === 'rig') {
        iconUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
            <path d="M16 8l4 4a6 6 0 1 1-8 0z" fill="none" stroke="white" stroke-width="2"/>
          </svg>`
        );
      } else {
        iconUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <g transform="rotate(${rotation} 16 16)">
              <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
              <polygon points="16 6 20 20 16 18 12 20" fill="white"/>
            </g>
          </svg>`
        );
      }
      
      if (item.isAlarm || isHighlighted) {
        iconSize = 40;
        const pulseColor = item.isAlarm ? '#ef4444' : '#facc15';
        iconUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
            <circle cx="20" cy="20" r="18" fill="${pulseColor}" opacity="0.3"/>
            <circle cx="20" cy="20" r="14" fill="${pulseColor}" opacity="0.2"/>
            <g transform="translate(4, 4)">
              ${item.type === 'rig' 
                ? `<circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
                   <path d="M16 8l4 4a6 6 0 1 1-8 0z" fill="none" stroke="white" stroke-width="2"/>`
                : `<g transform="rotate(${rotation} 16 16)">
                     <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
                     <polygon points="16 6 20 20 16 18 12 20" fill="white"/>
                   </g>`
              }
            </g>
          </svg>`
        );
      }
    }

    const icon = new T.Icon({
      iconUrl: iconUrl,
      iconSize: new T.Point(iconSize, iconSize),
      iconAnchor: new T.Point(iconSize/2, iconSize/2)
    });

    const marker = new T.Marker(position, { icon });
    
    marker.addEventListener('click', () => {
      if (!isCluster) setHighlightedItemId(mainItem.id);
      setSelectedCluster({ 
        id: isCluster ? `cluster-${mainItem.id}` : mainItem.id, 
        isCluster, 
        items: clusterItems 
      });
    });

    map.addOverLay(marker);
    layer.push(marker);
  });
  
  console.log('Markers added to map:', layer.length);
};
