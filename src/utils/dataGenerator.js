import { calculateCrossTrackError, DEVIATION_THRESHOLD_NM } from './mapUtils';

// 台风强度等级定义
export const TYPHOON_INTENSITY = {
  TD: { name: '热带低压', level: '6-7级', color: '#eab308', windLevel: 7 },      // 黄色
  TS: { name: '热带风暴', level: '8-9级', color: '#3b82f6', windLevel: 9 },      // 蓝色
  STS: { name: '强热带风暴', level: '10-11级', color: '#22c55e', windLevel: 11 }, // 绿色
  TY: { name: '台风', level: '12-13级', color: '#f97316', windLevel: 13 },       // 橙色
  STY: { name: '强台风', level: '14-15级', color: '#ec4899', windLevel: 15 },    // 粉色
  SuperTY: { name: '超强台风', level: '≥16级', color: '#ef4444', windLevel: 16 } // 红色
};

export const TYPHOON_DATA = {
  id: '202527',
  name: '热带风暴"天琴" (TQIN)',
  level: '9级 (23m/s)',
  pressure: '990百帕',
  time: '11月30日0时',
  // 路径点：[纬度, 经度, 强度类型, 时间, 风速, 气压]
  path: [
    [10.5, 135.0, 'TD', '11月24日14时', '15米/秒', '1002百帕'],
    [11.2, 133.5, 'TD', '11月24日20时', '15米/秒', '1001百帕'],
    [11.8, 132.0, 'TS', '11月25日2时', '18米/秒', '998百帕'],
    [12.3, 130.5, 'TS', '11月25日8时', '20米/秒', '995百帕'],
    [12.8, 128.5, 'TS', '11月25日14时', '21米/秒', '994百帕'],
    [13.1, 126.0, 'TY', '11月25日20时', '30米/秒', '980百帕'],
    [13.4, 123.5, 'TY', '11月26日2时', '32米/秒', '978百帕'],
    [13.5, 121.0, 'TY', '11月26日8时', '28米/秒', '982百帕'],
    [13.6, 118.5, 'STS', '11月26日14时', '25米/秒', '988百帕'],
    [13.6, 116.0, 'STS', '11月26日20时', '24米/秒', '990百帕'],
    [13.6, 113.5, 'TS', '11月27日2时', '20米/秒', '995百帕'],
    [13.6, 112.1, 'TS', '11月30日0时', '23米/秒', '990百帕'],  // 当前位置
    [13.6, 110.0, 'TS', '11月30日6时', '18米/秒', '998百帕'],  // 预测
    [13.5, 108.0, 'TD', '11月30日12时', '15米/秒', '1002百帕'], // 预测减弱
    [13.4, 106.0, 'TD', '11月30日18时', '13米/秒', '1004百帕']  // 预测
  ],
  currentIdx: 11,
  windRadii: { 
      7: {ne:350, se:300, sw:200, nw:280}, 
      10: {ne:150, se:120, sw:80, nw:100}, 
      12: {ne:80, se:60, sw:40, nw:50} 
  },
  // 24小时和48小时警戒线路径（红色和蓝色折线）
  warningLines: {
    // 24小时警戒线：直线向南，在菲律宾上方（约17°N）折向西南
    h24: [
      [35.0, 123.0],  // 北端
      [17.0, 123.0],  // 直线到菲律宾上方转折点
      [14.0, 120.0],  // 折向西南
      [11.0, 117.0],  // 继续西南
      [8.0, 114.0],   // 继续西南
      [5.0, 111.0]    // 南端
    ],
    // 48小时警戒线：直线向南，在菲律宾下方（约7°N）折向西南
    h48: [
      [36.0, 127.0],  // 北端
      [7.0, 127.0],   // 直线到菲律宾下方转折点
      [5.0, 124.0],   // 折向西南
      [3.0, 121.0],   // 继续西南
      [1.0, 118.0]    // 南端
    ]
  }
};

export const generateData = () => {
  const ships = [];
  const rigs = [];
  const destinations = ["Shanghai", "Singapore", "Rotterdam", "Busan", "Ningbo"];
  const operators = ["CNOOC", "Shell", "BP", "TotalEnergies", "Sinopec"];
  
  const crewRoles = [
      { role: "船长 (Captain)", certs: ["Master Unlimited", "GMDSS", "ECDIS"] },
      { role: "大副 (Chief Off)", certs: ["Chief Mate", "GMDSS", "SSO"] },
      { role: "轮机长 (Chief Eng)", certs: ["Chief Engineer", "High Voltage"] },
      { role: "二副 (2nd Off)", certs: ["OOW Deck", "GMDSS"] }
  ];

  for (let i = 0; i < 40; i++) {
    const lat = 25 + Math.random() * 15;
    const lon = 118 + Math.random() * 10;
    
    const isDeviating = i % 6 === 0;
    let deviationOffset = isDeviating ? 2.5 : 0.01; 
    
    const routePointsCount = 5 + Math.floor(Math.random() * 3);
    const plannedRoute = [];
    const startLat = lat - 5 + deviationOffset;
    const startLon = lon - 5 + deviationOffset;
    const endLat = lat + 5 + deviationOffset;
    const endLon = lon + 5 + deviationOffset;
    
    for(let k = 0; k <= routePointsCount; k++) {
        const fraction = k / routePointsCount;
        const curveLat = (Math.random() - 0.5) * 2.0 * Math.sin(fraction * Math.PI);
        const curveLon = (Math.random() - 0.5) * 2.0 * Math.sin(fraction * Math.PI);
        
        const wpLat = startLat + (endLat - startLat) * fraction + curveLat;
        const wpLon = startLon + (endLon - startLon) * fraction + curveLon;
        
        if (Math.abs(fraction - 0.5) < 0.1 && !isDeviating) {
             plannedRoute.push([lat, lon]);
        } else {
             plannedRoute.push([wpLat, wpLon]);
        }
    }
    plannedRoute[0] = [startLat, startLon];
    plannedRoute[plannedRoute.length - 1] = [endLat, endLon];

    const historyPath = [];
    let hLat = lat;
    let hLon = lon;
    for(let k=0; k<50; k++) {
        historyPath.unshift([hLat, hLon]);
        hLat -= (Math.random() - 0.3) * 0.05;
        hLon -= (Math.random() - 0.5) * 0.05;
    }
    historyPath.push([lat, lon]);

    const xte = calculateCrossTrackError(lat, lon, plannedRoute);
    const isAlarm = xte > DEVIATION_THRESHOLD_NM;

    const crewList = crewRoles.map((cr, idx) => ({
        id: `crew-${i}-${idx}`,
        name: `Crew ${1000 + i * 10 + idx}`,
        role: cr.role,
        certs: cr.certs,
        status: "On Duty"
    }));

    ships.push({
      id: `S-CN-${i}`,
      name: isAlarm ? `⚠️ 严重偏航-S${i}` : `中远海运 ${100 + i}`,
      type: 'ship',
      lat: lat,
      lon: lon,
      course: Math.floor(Math.random() * 360),
      speed: (10 + Math.random() * 10).toFixed(1),
      destination: destinations[i % destinations.length],
      eta: `${new Date().getMonth()+1}-${new Date().getDate() + Math.floor(Math.random()*5)} 14:00`,
      imo: 9000000 + i,
      crewList: crewList,
      flagState: "China",
      buildYear: 2015 + Math.floor(Math.random() * 8),
      plannedRoute: plannedRoute, 
      historyPath: historyPath,
      xte: xte, 
      isAlarm: isAlarm 
    });
  }
  
  const rigLocations = [
    { lat: 19.5, lon: 113.5, name: "南海一号" }, { lat: 18.2, lon: 114.2, name: "流花 11-1" },
    { lat: 38.5, lon: 120.5, name: "渤中 19-6" }, { lat: 26.5, lon: -90.5, name: "墨西哥湾 A" },
    { lat: 27.0, lon: -89.0, name: "墨西哥湾 B" }, { lat: 56.5, lon: 3.5, name: "北海布伦特" },
    { lat: 45.6, lon: 84.9, name: "克拉玛依油田" }, { lat: 44.8, lon: 88.2, name: "准东油田" }
  ];
  rigLocations.forEach((loc, idx) => {
    rigs.push({
      id: `R-${idx}`, name: loc.name, type: 'rig', lat: loc.lat, lon: loc.lon,
      status: Math.random() > 0.2 ? '正常' : '维护',
      operator: operators[idx % operators.length], depth: 100 + Math.floor(Math.random() * 2000),
      dailyOutput: (5000 + Math.random()*5000).toFixed(0), 
      productionHistory: Array(30).fill(0).map(()=>4000+Math.random()*3000),
      lastMaintenance: "2024-08-15"
    });
  });
  return [...ships, ...rigs];
};

export const generateWeatherData = () => {
  const points = [];
  for (let lat = 5; lat < 55; lat += 4) {
    for (let lon = 100; lon < 150; lon += 4) {
        const rand = Math.random();
        let type = 'Clear';
        if (rand > 0.7) type = 'Cloudy'; if (rand > 0.85) type = 'Rain'; if (rand > 0.95) type = 'Storm';
        const typhoonCenter = TYPHOON_DATA.path[TYPHOON_DATA.currentIdx];
        const distToTyphoon = Math.sqrt(Math.pow(lat - typhoonCenter[0], 2) + Math.pow(lon - typhoonCenter[1], 2));
        let windSpeed = 10 + Math.random() * 15;
        if (distToTyphoon < 10) windSpeed += (10 - distToTyphoon) * 5; 
        points.push({ lat, lon, type, windDir: Math.floor(Math.random() * 360), windSpeed: windSpeed.toFixed(1), temp: (30 - (lat - 10) * 0.5 + Math.random() * 2).toFixed(1) });
    }
  }
  return points;
};
