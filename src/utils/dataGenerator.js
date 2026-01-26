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
  name: '热带风暴"天琴" (Koto)',
  level: '12级 (33m/s)',
  pressure: '975百帕',
  time: '11月27日14时',
  // 路径点：[纬度, 经度, 强度类型, 时间, 风速, 气压, 7级风圈, 10级风圈, 12级风圈]
  path: [
    [9.0, 126.9, 'TD', '11月24日08时', '15米/秒', '1004百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [9.3, 126.7, 'TD', '11月24日11时', '15米/秒', '1004百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [9.4, 126.4, 'TD', '11月24日14时', '15米/秒', '1004百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [9.6, 126.0, 'TD', '11月24日17时', '15米/秒', '1004百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [9.6, 125.3, 'TD', '11月24日20时', '15米/秒', '1004百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [10.1, 123.8, 'TD', '11月25日02时', '15米/秒', '1004百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [10.3, 123.5, 'TD', '11月25日05时', '15米/秒', '1000百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [10.6, 121.1, 'TD', '11月25日14时', '15米/秒', '998百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [11.0, 120.2, 'TS', '11月25日20时', '18米/秒', '998百帕', {ne:180,se:180,sw:150,nw:150}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [11.2, 120.0, 'TS', '11月25日23时', '18米/秒', '998百帕', {ne:180,se:180,sw:150,nw:150}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [11.5, 119.8, 'TS', '11月26日02时', '18米/秒', '998百帕', {ne:180,se:180,sw:150,nw:150}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [12.2, 118.8, 'TS', '11月26日05时', '20米/秒', '995百帕', {ne:150,se:150,sw:150,nw:150}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [12.6, 117.4, 'TS', '11月26日08时', '23米/秒', '990百帕', {ne:180,se:180,sw:180,nw:180}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [12.3, 116.5, 'STS', '11月26日14时', '25米/秒', '985百帕', {ne:180,se:180,sw:180,nw:180}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [12.3, 116.1, 'STS', '11月26日17时', '25米/秒', '985百帕', {ne:180,se:180,sw:180,nw:180}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [12.4, 115.4, 'STS', '11月26日20时', '25米/秒', '985百帕', {ne:180,se:180,sw:180,nw:180}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [12.7, 114.9, 'STS', '11月26日23时', '30米/秒', '980百帕', {ne:220,se:220,sw:220,nw:220}, {ne:80,se:80,sw:80,nw:80}, {ne:0,se:0,sw:0,nw:0}],
    [13.0, 114.7, 'TY', '11月27日02时', '33米/秒', '975百帕', {ne:220,se:220,sw:220,nw:220}, {ne:80,se:80,sw:80,nw:80}, {ne:0,se:0,sw:0,nw:0}],
    [13.0, 114.5, 'TY', '11月27日05时', '33米/秒', '975百帕', {ne:220,se:220,sw:220,nw:220}, {ne:80,se:80,sw:80,nw:80}, {ne:0,se:0,sw:0,nw:0}],
    [13.1, 114.1, 'TY', '11月27日08时', '33米/秒', '975百帕', {ne:220,se:220,sw:220,nw:220}, {ne:80,se:80,sw:80,nw:80}, {ne:0,se:0,sw:0,nw:0}],
    [13.1, 113.5, 'TY', '11月27日14时', '33米/秒', '975百帕', {ne:350,se:300,sw:200,nw:280}, {ne:100,se:100,sw:100,nw:100}, {ne:0,se:0,sw:0,nw:0}], // 当前位置
    [13.2, 113.3, 'TY', '11月27日17时', '33米/秒', '975百帕', {ne:320,se:280,sw:200,nw:280}, {ne:100,se:100,sw:100,nw:100}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [12.7, 113.5, 'STS', '11月27日20时', '30米/秒', '980百帕', {ne:320,se:280,sw:200,nw:280}, {ne:100,se:100,sw:100,nw:100}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [12.6, 113.3, 'STS', '11月28日02时', '30米/秒', '980百帕', {ne:320,se:280,sw:200,nw:320}, {ne:100,se:100,sw:100,nw:100}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [12.5, 113.3, 'STS', '11月28日05时', '28米/秒', '985百帕', {ne:320,se:280,sw:200,nw:320}, {ne:100,se:100,sw:100,nw:100}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [12.5, 113.5, 'TS', '11月28日14时', '23米/秒', '990百帕', {ne:220,se:180,sw:150,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [12.7, 113.7, 'TS', '11月28日20时', '20米/秒', '995百帕', {ne:180,se:150,sw:120,nw:180}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [12.8, 114.0, 'TD', '11月29日02时', '15米/秒', '1000百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}]  // 预测减弱
  ],
  currentIdx: 20,
  windRadii: { 
      7: {ne:350, se:300, sw:200, nw:280}, 
      10: {ne:100, se:100, sw:100, nw:100}, 
      12: {ne:0, se:0, sw:0, nw:0} 
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

// 台风数据2：塔巴 (202516)
export const TYPHOON_DATA_2 = {
  id: '202516',
  name: '热带风暴"塔巴" (Tapah)',
  level: '10级 (25m/s)',
  pressure: '985百帕',
  time: '9月7日20时',
  path: [
    [17.5, 118.8, 'TD', '9月5日20时', '15米/秒', '1002百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [17.5, 118.6, 'TD', '9月5日23时', '15米/秒', '1002百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [17.6, 118.0, 'TD', '9月6日02时', '15米/秒', '1002百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [17.8, 117.6, 'TD', '9月6日05时', '15米/秒', '1002百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [17.8, 117.4, 'TD', '9月6日08时', '15米/秒', '1002百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [18.3, 115.7, 'TS', '9月6日20时', '18米/秒', '1000百帕', {ne:280,se:280,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [18.5, 115.4, 'TS', '9月6日23时', '18米/秒', '1000百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [18.7, 115.0, 'TS', '9月7日02时', '18米/秒', '1000百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [18.7, 114.7, 'TS', '9月7日05时', '23米/秒', '990百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [18.7, 114.6, 'TS', '9月7日08时', '23米/秒', '990百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [18.7, 114.3, 'TS', '9月7日11时', '23米/秒', '990百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [19.0, 114.1, 'TS', '9月7日14时', '23米/秒', '990百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [19.5, 113.8, 'STS', '9月7日17时', '25米/秒', '985百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [20.0, 113.5, 'STS', '9月7日20时', '25米/秒', '985百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 当前位置
    [20.5, 113.2, 'STS', '9月8日02时', '25米/秒', '985百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [21.0, 113.0, 'STS', '9月8日08时', '25米/秒', '985百帕', {ne:260,se:260,sw:220,nw:220}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [21.5, 112.8, 'TS', '9月8日14时', '23米/秒', '990百帕', {ne:220,se:220,sw:180,nw:180}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [22.0, 112.5, 'TS', '9月8日20时', '20米/秒', '995百帕', {ne:180,se:180,sw:150,nw:150}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [22.3, 112.2, 'TD', '9月9日02时', '15米/秒', '1000百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}]  // 预测减弱
  ],
  currentIdx: 13,
  windRadii: { 
      7: {ne:260, se:260, sw:220, nw:220}, 
      10: {ne:0, se:0, sw:0, nw:0}, 
      12: {ne:0, se:0, sw:0, nw:0} 
  },
  warningLines: {
    h24: [
      [35.0, 120.0],
      [17.0, 120.0],
      [14.0, 117.0],
      [11.0, 114.0],
      [8.0, 111.0],
      [5.0, 108.0]
    ],
    h48: [
      [36.0, 124.0],
      [7.0, 124.0],
      [5.0, 121.0],
      [3.0, 118.0],
      [1.0, 115.0]
    ]
  }
};

// 台风数据3：麦德姆 (202521)
export const TYPHOON_DATA_3 = {
  id: '202521',
  name: '台风"麦德姆" (Matmo)',
  level: '12级 (33m/s)',
  pressure: '975百帕',
  time: '10月4日05时',
  path: [
    [14.4, 131.8, 'TD', '10月1日11时', '15米/秒', '1004百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [14.5, 130.4, 'TD', '10月1日14时', '15米/秒', '1004百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [15.0, 127.3, 'TS', '10月2日08时', '18米/秒', '998百帕', {ne:200,se:200,sw:200,nw:200}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [15.4, 125.8, 'TS', '10月2日17时', '23米/秒', '990百帕', {ne:200,se:200,sw:200,nw:200}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [16.2, 123.1, 'STS', '10月3日05时', '25米/秒', '985百帕', {ne:200,se:200,sw:200,nw:200}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}],
    [16.4, 122.6, 'STS', '10月3日08时', '28米/秒', '982百帕', {ne:250,se:250,sw:250,nw:250}, {ne:60,se:60,sw:60,nw:60}, {ne:0,se:0,sw:0,nw:0}],
    [17.1, 120.2, 'STS', '10月3日17时', '28米/秒', '982百帕', {ne:250,se:250,sw:250,nw:250}, {ne:60,se:60,sw:60,nw:60}, {ne:0,se:0,sw:0,nw:0}],
    [17.7, 118.5, 'STS', '10月3日23时', '30米/秒', '980百帕', {ne:350,se:350,sw:350,nw:350}, {ne:80,se:80,sw:80,nw:80}, {ne:0,se:0,sw:0,nw:0}],
    [17.7, 118.0, 'TY', '10月4日02时', '33米/秒', '975百帕', {ne:380,se:400,sw:360,nw:360}, {ne:100,se:100,sw:100,nw:100}, {ne:0,se:0,sw:0,nw:0}],
    [18.0, 117.7, 'TY', '10月4日05时', '33米/秒', '975百帕', {ne:380,se:400,sw:360,nw:360}, {ne:100,se:100,sw:100,nw:100}, {ne:0,se:0,sw:0,nw:0}], // 当前位置
    [18.5, 117.0, 'TY', '10月4日11时', '33米/秒', '975百帕', {ne:380,se:400,sw:360,nw:360}, {ne:100,se:100,sw:100,nw:100}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [19.0, 116.0, 'STS', '10月4日17时', '30米/秒', '980百帕', {ne:320,se:320,sw:300,nw:300}, {ne:80,se:80,sw:80,nw:80}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [19.5, 115.0, 'STS', '10月4日23时', '28米/秒', '985百帕', {ne:280,se:280,sw:260,nw:260}, {ne:60,se:60,sw:60,nw:60}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [20.0, 114.0, 'TS', '10月5日08时', '23米/秒', '990百帕', {ne:220,se:220,sw:200,nw:200}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [20.5, 113.0, 'TS', '10月5日14时', '20米/秒', '995百帕', {ne:180,se:180,sw:150,nw:150}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}], // 预测
    [20.8, 111.5, 'TD', '10月6日02时', '15米/秒', '1002百帕', {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}, {ne:0,se:0,sw:0,nw:0}]  // 预测减弱
  ],
  currentIdx: 9,
  windRadii: { 
      7: {ne:380, se:400, sw:360, nw:360}, 
      10: {ne:100, se:100, sw:100, nw:100}, 
      12: {ne:0, se:0, sw:0, nw:0} 
  },
  warningLines: {
    h24: [
      [35.0, 125.0],
      [17.0, 125.0],
      [14.0, 122.0],
      [11.0, 119.0],
      [8.0, 116.0],
      [5.0, 113.0]
    ],
    h48: [
      [36.0, 129.0],
      [7.0, 129.0],
      [5.0, 126.0],
      [3.0, 123.0],
      [1.0, 120.0]
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
