// 地图图层配置（天地图）
export const TILE_SOURCES = {
    ONLINE: {
        name: '在线 (天地图影像)',
        img: 'http://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=57cf6693b1ca32c7a03a974946c14d9a',
        cia: 'http://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=57cf6693b1ca32c7a03a974946c14d9a'
    },
    OFFLINE: {
        name: '离线 (本地服务器)',
        url: 'http://localhost:8080/tiles/{z}/{x}/{y}.png'
    }
};

// 偏航阈值 (海里)
export const DEVIATION_THRESHOLD_NM = 5.0; 

// 辅助算法：计算点到线段的最短距离 (米)
export const getDistanceToSegmentMeters = (pLat, pLon, vLat, vLon, wLat, wLon) => {
    const latToM = 111132;
    const lonToM = 111132 * Math.cos(pLat * Math.PI / 180);
    const x = pLon * lonToM; const y = pLat * latToM;
    const x1 = vLon * lonToM; const y1 = vLat * latToM;
    const x2 = wLon * lonToM; const y2 = wLat * latToM;
    const l2 = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    if (l2 === 0) return Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1));
    let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return Math.sqrt((x - projX)*(x - projX) + (y - projY)*(y - projY));
};

// 核心算法：计算点到多段线的最短距离 (返回海里)
export const calculateCrossTrackError = (shipLat, shipLon, routePoints) => {
    if (!routePoints || routePoints.length < 2) return 0;
    let minDistanceMeters = Infinity;
    for (let i = 0; i < routePoints.length - 1; i++) {
        const p1 = routePoints[i];
        const p2 = routePoints[i+1];
        const dist = getDistanceToSegmentMeters(shipLat, shipLon, p1[0], p1[1], p2[0], p2[1]);
        if (dist < minDistanceMeters) minDistanceMeters = dist;
    }
    return minDistanceMeters / 1852;
};

// 辅助算法：计算目标点 (用于风圈绘制)
export const calculateDestinationPoint = (startLat, startLon, distanceMeters, bearing) => {
    const R = 6378137;
    const δ = distanceMeters / R;
    const θ = bearing * (Math.PI / 180);
    const φ1 = startLat * (Math.PI / 180);
    const λ1 = startLon * (Math.PI / 180);
    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
    const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
    return [φ2 * (180 / Math.PI), λ2 * (180 / Math.PI)];
};

// 辅助算法：生成四象限风圈多边形
export const generateWindCirclePoints = (center, radiiObj) => {
    const points = []; const step = 5;
    for (let angle = 0; angle <= 360; angle += step) {
        let r_km = 0;
        if (angle >= 0 && angle < 90) r_km = radiiObj.ne;
        else if (angle >= 90 && angle < 180) r_km = radiiObj.se;
        else if (angle >= 180 && angle < 270) r_km = radiiObj.sw;
        else r_km = radiiObj.nw;
        points.push(calculateDestinationPoint(center[0], center[1], r_km * 1000, angle));
    }
    return points;
};
