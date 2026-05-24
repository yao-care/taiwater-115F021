/* ============================================================
   shared/mock-data.js — 模擬資料產生器
   全部 deterministic（無隨機 seed 跳動），重新整理結果一致
   ============================================================ */

window.SP = window.SP || {};

/* ---------- 常數 ---------- */
SP.REGIONS = [
  "第一區處（基隆）", "第二區處（板新）", "第三區處（桃園）",
  "第四區處（中港）", "第五區處（中區）", "第六區處（豐原）",
  "第七區處（嘉義）", "第八區處（雲林）", "第九區處（台南）",
  "第十區處（高雄）", "第十一區處（屏東）", "第十二區處（宜蘭）",
  "第十三區處（東區）",
];

SP.PLANTS_BY_REGION = {
  "第四區處（中港）": ["中港廠所", "苗栗廠所", "竹南廠所", "頭份廠所"],
  "第五區處（中區）": ["台中廠所", "豐原廠所", "大里廠所"],
  "第三區處（桃園）": ["桃園廠所", "中壢廠所", "龍潭廠所"],
};

SP.ROLE_DEFS = [
  { id: "admin",       label: "系統管理員",   mode: "desktop" },
  { id: "hq",          label: "總處管理員",   mode: "desktop" },
  { id: "region",      label: "區處主管",     mode: "desktop" },
  { id: "plant",       label: "廠所人員",     mode: "desktop" },
  { id: "inspector",   label: "檢漏員",       mode: "mobile"  },
  { id: "repairer",    label: "修漏員",       mode: "mobile"  },
  { id: "cs",          label: "客服人員",     mode: "desktop" },
  { id: "dba",         label: "DBA",          mode: "desktop" },
  { id: "security",    label: "資安人員",     mode: "desktop" },
  { id: "audit_int",   label: "內部稽核員",   mode: "desktop", readonly: true },
  { id: "audit_ext",   label: "外部稽核員",   mode: "desktop", readonly: true },
];

SP.CASE_STATUS = ["申報", "派工", "檢漏中", "待修", "修復中", "已修", "結案"];
SP.SEVERITIES = ["critical", "high", "medium", "low"];
SP.PIPE_MATERIALS = ["DIP", "PVC", "PE", "AC", "GIP", "SP"];

/* ---------- 工具函式（deterministic pick） ---------- */
function pick(arr, i) { return arr[i % arr.length]; }
function pad(n, w) { return String(n).padStart(w, "0"); }

/* ---------- 11 個固定角色帳號 ---------- */
function buildFixedUsers() {
  return [
    { id: "U001", name: "李宗翰", role: "admin",     region: "—",                 plant: "—",         email: "li.zh@water.gov.tw",      phone: "(04)22244191#101" },
    { id: "U002", name: "周明德", role: "hq",        region: "—",                 plant: "—",         email: "chou.md@water.gov.tw",    phone: "(02)87331212#201" },
    { id: "U003", name: "陳大華", role: "region",    region: "第四區處（中港）",   plant: "—",         email: "chen.dh@water.gov.tw",    phone: "(04)22244191#301" },
    { id: "U004", name: "賴伯毅", role: "plant",     region: "第四區處（中港）",   plant: "中港廠所", email: "jui8751093@mail.water.gov.tw", phone: "(04)22244191#804" },
    { id: "U005", name: "王志強", role: "inspector", region: "第四區處（中港）",   plant: "中港廠所", email: "wang.zq@water.gov.tw",    phone: "0912-345-001" },
    { id: "U006", name: "林文雄", role: "repairer",  region: "第四區處（中港）",   plant: "中港廠所", email: "lin.wx@water.gov.tw",     phone: "0912-345-002" },
    { id: "U007", name: "蔡美玲", role: "cs",        region: "客服中心",          plant: "—",         email: "tsai.ml@water.gov.tw",    phone: "1910 客服專線" },
    { id: "U008", name: "周大維", role: "dba",       region: "資訊處",            plant: "—",         email: "chou.dw@water.gov.tw",    phone: "(02)87331212#501" },
    { id: "U009", name: "何雅婷", role: "security",  region: "資訊處",            plant: "—",         email: "ho.yt@water.gov.tw",      phone: "(02)87331212#502" },
    { id: "U010", name: "吳明憲", role: "audit_int", region: "稽核室",            plant: "—",         email: "wu.mh@water.gov.tw",      phone: "(02)87331212#901" },
    { id: "U011", name: "鄭立群", role: "audit_ext", region: "—",                 plant: "—",         email: "cheng.lq@bsi-tw.com",     phone: "0987-654-321", org: "BSI Taiwan" },
  ];
}

/* ---------- 30 個額外檢漏 / 修漏員（區處輪替） ---------- */
function buildFieldUsers() {
  const fieldFirstNames = ["志", "文", "建", "俊", "永", "金", "明", "宏", "正", "忠", "進", "信", "義", "和", "勇"];
  const fieldLastNames  = ["陳", "林", "張", "李", "黃", "王", "吳", "劉", "蔡", "楊", "許", "鄭", "謝", "郭", "洪"];
  const fieldMidNames   = ["強", "雄", "誠", "傑", "賢", "德", "村", "華", "豪", "祥", "瑞", "祺", "成", "達", "輝"];
  const users = [];
  for (let i = 0; i < 30; i++) {
    const isInsp = i % 2 === 0;
    const region = pick(SP.REGIONS, i);
    users.push({
      id: "U" + pad(100 + i, 3),
      name: pick(fieldLastNames, i) + pick(fieldFirstNames, i + 3) + pick(fieldMidNames, i + 1),
      role: isInsp ? "inspector" : "repairer",
      region,
      plant: (SP.PLANTS_BY_REGION[region] || ["—"])[i % 4] || "—",
      email: "user" + (100 + i) + "@water.gov.tw",
      phone: "0912-" + pad(100 + i * 7, 3) + "-" + pad(i * 31 % 1000, 3),
    });
  }
  return users;
}

/* ---------- 50 個案件 ---------- */
function buildCases() {
  const cases = [];
  const districts = ["北區", "中區", "南區", "西區", "東區", "大甲區", "豐原區", "大里區", "霧峰區", "潭子區"];
  const roads = ["中港路", "台灣大道", "文心路", "復興路", "民權路", "中正路", "建國路", "和平路", "光明路", "成功路"];
  const reasons = ["地面冒水", "水壓不足", "水費異常", "馬路凹陷", "用戶通報", "巡查發現", "聲學檢測", "夜間流量分析"];
  const today = new Date("2026-05-23");

  for (let i = 0; i < 50; i++) {
    const days = i * 2 - 30;   // 拉開時間軸
    const created = new Date(today);
    created.setDate(created.getDate() + days);
    const status = pick(SP.CASE_STATUS, i);
    const region = pick(SP.REGIONS, i % 13);
    cases.push({
      id: "C" + pad(202600000 + i, 8),
      caseNo: "115-" + pad(i + 1, 4),
      title: pick(roads, i) + pick(districts, i) + "段 " + (10 + i * 7 % 90) + " 號附近 " + pick(reasons, i),
      region,
      plant: (SP.PLANTS_BY_REGION[region] || ["—"])[i % 4] || "—",
      district: pick(districts, i),
      address: pick(roads, i) + pick(districts, i) + "段 " + (10 + i * 7 % 90) + " 號",
      lng: 120.65 + (i % 13) * 0.04,
      lat: 24.05 + (i % 13) * 0.04,
      severity: pick(SP.SEVERITIES, i),
      status,
      source: i % 4 === 0 ? "1910 客服" : i % 4 === 1 ? "巡查" : i % 4 === 2 ? "聲學檢測" : "夜間流量",
      reporter: i % 4 === 0 ? "蔡美玲" : "—",
      reporterPhone: i % 4 === 0 ? "1910" : "—",
      assignedTo: status !== "申報" ? "U005" : null,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
      timeline: [
        { at: created.toISOString(), by: "U007", action: "案件建立", note: pick(reasons, i) },
      ],
      estimatedLoss: 50 + (i * 13) % 250,  // 噸/日
      photos: [],
      rfp: "附錄一 三(三)",
    });
  }
  return cases;
}

/* ---------- 200 個管段 ---------- */
function buildPipes() {
  const pipes = [];
  for (let i = 0; i < 200; i++) {
    const region = pick(SP.REGIONS, i);
    const material = pick(SP.PIPE_MATERIALS, i);
    const age = 5 + (i * 7) % 50;       // 5-54 年
    const diameter = 75 + (i * 25) % 525; // 75-600 mm
    const risk = age > 40 ? "critical" : age > 30 ? "high" : age > 20 ? "medium" : "low";
    pipes.push({
      id: "P" + pad(i + 1, 4),
      region,
      district: ((i * 31) % 10),
      material,
      diameter,
      length: 50 + (i * 17) % 950,
      installedYear: 2026 - age,
      age,
      risk,
      lng: 120.65 + (i % 13) * 0.04 + ((i % 7) * 0.005),
      lat: 24.05 + (i % 13) * 0.04 + ((i % 5) * 0.005),
    });
  }
  return pipes;
}

/* ---------- 14 個介接系統 ---------- */
function buildIntegrations() {
  const defs = [
    { name: "CIS 用戶資料系統",         protocol: "REST",  owner: "資訊處" },
    { name: "GIS 地理資訊系統",         protocol: "WMTS",  owner: "資訊處" },
    { name: "SCADA 監控系統",          protocol: "OPC-UA", owner: "工務組" },
    { name: "AMI 智慧水表",            protocol: "MQTT",   owner: "工務組" },
    { name: "ERP 工程預算書",          protocol: "SOAP",   owner: "財務處" },
    { name: "1999 市民熱線",           protocol: "REST",   owner: "客服中心" },
    { name: "EIP 員工入口",            protocol: "OIDC",   owner: "資訊處" },
    { name: "AD 網域服務",             protocol: "LDAP",   owner: "資訊處" },
    { name: "PCCES 工程細目編碼",      protocol: "XML",    owner: "工務組" },
    { name: "PMIS 專案管理",           protocol: "REST",   owner: "資訊處" },
    { name: "DM 文管系統",             protocol: "WebDAV", owner: "秘書室" },
    { name: "BI 統計報表平台",         protocol: "ODBC",   owner: "資訊處" },
    { name: "氣象局降雨資料",          protocol: "REST",   owner: "氣象局" },
    { name: "Open Data 政府資料平台",   protocol: "REST",   owner: "資訊處" },
  ];
  return defs.map((d, i) => ({
    id: "I" + pad(i + 1, 2),
    ...d,
    endpoint: "https://api.water.gov.tw/" + d.name.split(" ")[0].toLowerCase(),
    status: i % 9 === 0 ? "degraded" : i % 13 === 0 ? "down" : "healthy",
    latencyMs: 30 + (i * 7) % 200,
    lastSyncAt: new Date(2026, 4, 22, 8 + i, 30).toISOString(),
    errorRate24h: ((i * 13) % 50) / 100,  // 0~0.49%
  }));
}

/* ---------- 20 個廠商 ---------- */
function buildVendors() {
  const names = [
    "宏華水利工程", "鴻泰土木", "禾川管路", "達誠工程", "天工水管",
    "中興工程", "金水工程", "南都管路", "東霖工程", "西嶸土木",
    "永慶水利", "誠新管路", "立成工程", "群益土木", "順發水利",
    "弘揚工程", "建發管路", "勤美土木", "雙喜工程", "正元水利",
  ];
  return names.map((name, i) => ({
    id: "V" + pad(i + 1, 3),
    name,
    taxId: pad(10000000 + i * 31, 8),
    contact: pick(["林經理", "陳總監", "黃工程師", "張副理"], i),
    phone: "(04)" + pad(2222 + i * 13, 4) + "-" + pad(1000 + i * 7, 4),
    region: pick(SP.REGIONS, i),
    category: pick(["土木工程", "管路工程", "水利工程", "綜合"], i),
    rating: 4 + (i % 10) / 10,
    activeCases: i % 7,
    blacklisted: false,
  }));
}

/* ---------- 通知 ---------- */
function buildNotifications() {
  return [
    { id: "N001", recipient: "U004", from: "U007", kind: "new_case",   title: "新案件待派工",     body: "客服蔡美玲建立案件 115-0023（中港路冒水）", at: "2026-05-23T08:42:00", read: false },
    { id: "N002", recipient: "U005", from: "U004", kind: "dispatched", title: "你被派工到案件 115-0023", body: "中港路冒水 / 中港廠所 賴伯毅", at: "2026-05-23T08:50:00", read: false },
    { id: "N003", recipient: "U006", from: "U004", kind: "dispatched", title: "修漏任務：115-0015",     body: "已檢漏完成，待修",                         at: "2026-05-23T07:30:00", read: false },
    { id: "N004", recipient: "U003", from: "system", kind: "kpi",      title: "本月區處 KPI 更新",      body: "結案率 87%（+3%）",                        at: "2026-05-22T18:00:00", read: true  },
    { id: "N005", recipient: "U009", from: "system", kind: "security", title: "SBOM 新版套件高風險",     body: "log4j 2.x 偵測為 critical",                at: "2026-05-22T11:20:00", read: false },
    { id: "N006", recipient: "U010", from: "system", kind: "audit",    title: "系統登入失敗多次",         body: "U004 連續 5 次密碼錯誤",                    at: "2026-05-21T15:00:00", read: false },
  ];
}

/* ---------- 稽核日誌（20 筆樣本） ---------- */
function buildAuditLogs() {
  const acts = ["LOGIN", "CREATE_CASE", "UPDATE_CASE", "DISPATCH", "UPLOAD_PHOTO", "REPAIR_DONE", "EXPORT_REPORT", "CHANGE_PASSWORD", "ACCESS_AUDIT", "VIEW_DASHBOARD"];
  const logs = [];
  for (let i = 0; i < 20; i++) {
    logs.push({
      id: "L" + pad(i + 1, 4),
      userId: "U" + pad(((i * 7) % 11) + 1, 3),
      action: pick(acts, i),
      target: i % 3 === 0 ? "C" + pad(202600000 + i, 8) : "—",
      ip: "10.0." + ((i * 13) % 256) + "." + ((i * 7) % 256),
      ua: i % 2 === 0 ? "Mozilla/5.0 Chrome" : "Mozilla/5.0 Edge",
      at: new Date(2026, 4, 23 - (i % 5), 9 + (i % 10), (i * 7) % 60).toISOString(),
      hash: "sha256:" + pad(i * 99991, 12),
    });
  }
  return logs;
}

/* ---------- 5 階段驗收 ---------- */
function buildMilestones() {
  return [
    { id: "M1", name: "需求分析報告書",   weeks: 6,  status: "in_progress", penalty: "0.1% / 日", progress: 0.45, due: "2026-08-15" },
    { id: "M2", name: "系統設計報告書",   weeks: 8,  status: "pending",     penalty: "0.1% / 日", progress: 0,    due: "2026-10-10" },
    { id: "M3", name: "雛型 / UAT 測試",  weeks: 10, status: "pending",     penalty: "0.2% / 日", progress: 0,    due: "2026-12-20" },
    { id: "M4", name: "上線部署",         weeks: 4,  status: "pending",     penalty: "0.2% / 日", progress: 0,    due: "2027-01-20" },
    { id: "M5", name: "結案 / 教育訓練",  weeks: 4,  status: "pending",     penalty: "0.3% / 日", progress: 0,    due: "2027-02-20" },
  ];
}

/* ---------- 專案團隊（10 人） ---------- */
function buildTeam() {
  return [
    { id: "T01", name: "鄧尚文", role: "專案經理 / PM",       company: "藥提醒科技", experience: "12 年", certs: ["PMP"] },
    { id: "T02", name: "張饒輝", role: "系統分析師 / SA",     company: "藥提醒科技", experience: "8 年",  certs: ["CISSP"] },
    { id: "T03", name: "技術主管", role: "技術主管",             company: "藥提醒科技", experience: "10 年", certs: ["AWS SA"] },
    { id: "T04", name: "資安專家", role: "資安顧問",             company: "藥提醒科技", experience: "9 年",  certs: ["CISSP", "ISO 27001 LA"] },
    { id: "T05", name: "前端工程師 A", role: "前端工程師",         company: "藥提醒科技", experience: "5 年",  certs: ["—"] },
    { id: "T06", name: "前端工程師 B", role: "前端工程師",         company: "藥提醒科技", experience: "4 年",  certs: ["—"] },
    { id: "T07", name: "後端工程師 A", role: "後端工程師",         company: "藥提醒科技", experience: "7 年",  certs: ["AWS DA"] },
    { id: "T08", name: "後端工程師 B", role: "後端工程師",         company: "藥提醒科技", experience: "5 年",  certs: ["—"] },
    { id: "T09", name: "資料庫工程師", role: "DBA",                 company: "藥提醒科技", experience: "8 年",  certs: ["Oracle OCP"] },
    { id: "T10", name: "QA 工程師",     role: "測試 / QA",          company: "藥提醒科技", experience: "6 年",  certs: ["ISTQB"] },
  ];
}

/* ---------- 訓練場次 ---------- */
function buildTrainings() {
  return [
    { id: "TR01", name: "系統管理員訓練",   audience: "資訊處",   hours: 16, attendees: 8,  date: "2026-12-05" },
    { id: "TR02", name: "區處主管操作訓練", audience: "13 區處",  hours: 8,  attendees: 26, date: "2026-12-12" },
    { id: "TR03", name: "廠所人員操作訓練", audience: "全國廠所", hours: 8,  attendees: 80, date: "2026-12-19" },
    { id: "TR04", name: "檢漏 / 修漏員行動版訓練", audience: "現場人員", hours: 4, attendees: 120, date: "2027-01-09" },
    { id: "TR05", name: "客服中心操作訓練",  audience: "1910 客服", hours: 6, attendees: 18, date: "2027-01-16" },
    { id: "TR06", name: "DBA 資料庫運維",   audience: "資訊處",   hours: 12, attendees: 4,  date: "2027-01-23" },
    { id: "TR07", name: "資安人員 SBOM 訓練", audience: "資安",   hours: 8,  attendees: 6,  date: "2027-02-06" },
    { id: "TR08", name: "稽核員操作訓練",    audience: "內外稽核", hours: 4,  attendees: 10, date: "2027-02-13" },
  ];
}

/* ---------- 交付文件清單 ---------- */
function buildDocuments() {
  const defs = [
    { name: "專案管理計畫書",     phase: "M1", type: "PMP",   version: "v1.2", status: "approved" },
    { name: "需求規格書",         phase: "M1", type: "SRS",   version: "v0.9", status: "draft" },
    { name: "系統設計書",         phase: "M2", type: "SDD",   version: "—",    status: "pending" },
    { name: "資料庫設計書",       phase: "M2", type: "DBD",   version: "—",    status: "pending" },
    { name: "介接規格書",         phase: "M2", type: "ICD",   version: "—",    status: "pending" },
    { name: "資安計畫書",         phase: "M1", type: "SSP",   version: "v1.0", status: "approved" },
    { name: "測試計畫書",         phase: "M3", type: "STP",   version: "—",    status: "pending" },
    { name: "UAT 報告",           phase: "M3", type: "UAT",   version: "—",    status: "pending" },
    { name: "教育訓練手冊",       phase: "M5", type: "TRN",   version: "—",    status: "pending" },
    { name: "操作手冊（11 角色）", phase: "M5", type: "USR",   version: "—",    status: "pending" },
    { name: "源碼掃描報告",       phase: "M3", type: "SAST",  version: "—",    status: "pending" },
    { name: "弱掃 / 滲透報告",    phase: "M3", type: "VAPT",  version: "—",    status: "pending" },
    { name: "SBOM 物料清單",      phase: "M2", type: "SBOM",  version: "—",    status: "pending" },
    { name: "年度成果報告書（範本）", phase: "M5", type: "REPORT", version: "—", status: "pending" },
  ];
  return defs.map((d, i) => ({ id: "D" + pad(i + 1, 3), ...d }));
}

/* ---------- 派工 / 檢漏 / 修漏（少量樣本） ---------- */
function buildDispatches() {
  return [
    { id: "DI001", caseId: "C202600005", from: "U004", to: "U005", at: "2026-05-22T09:00:00", note: "中港路冒水，優先處理" },
    { id: "DI002", caseId: "C202600008", from: "U004", to: "U006", at: "2026-05-23T08:00:00", note: "已檢漏完成轉修" },
  ];
}

function buildInspections() {
  return [
    { id: "IN001", caseId: "C202600005", by: "U005", at: "2026-05-22T11:30:00", method: "聲學", confirmed: true, gps: [120.65, 24.05], photos: ["mock1.jpg", "mock2.jpg"], note: "管材 DIP 老化" },
  ];
}

function buildRepairs() {
  return [
    { id: "RE001", caseId: "C202600008", by: "U006", at: "2026-05-23T10:00:00", method: "管材更新", excavation: "0.8m×1.5m", cost: 18500, supervisor: "U004", photos: ["mock3.jpg"], note: "原 DIP 改用 DI" },
  ];
}

/* ============================================================
   階段 2 補：dashboard 需要的衍生資料
   ============================================================ */

/* ---------- 登入紀錄（給 admin dashboard） ---------- */
function buildLoginLogs() {
  const logs = [];
  for (let i = 0; i < 40; i++) {
    const userIdx = (i * 7) % 11 + 1;
    const success = i % 11 !== 3;  // ~9% 失敗
    logs.push({
      id: "LL" + pad(i + 1, 4),
      userId: "U" + pad(userIdx, 3),
      at: new Date(2026, 4, 23 - (i % 7), 8 + (i % 12), (i * 13) % 60).toISOString(),
      ip: "10.10." + ((i * 17) % 256) + "." + ((i * 11) % 256),
      ua: i % 2 === 0 ? "Chrome 122.0 / macOS" : "Edge 122 / Windows",
      success,
      reason: success ? null : "密碼錯誤",
    });
  }
  return logs;
}

/* ---------- 12 個月 KPI 快照（給 hq / region 趨勢圖） ---------- */
function buildKpiSnapshots() {
  const snapshots = [];
  const months = ["2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11",
                  "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];
  months.forEach((m, i) => {
    snapshots.push({
      month: m,
      totalCases:    900 + i * 28 + ((i * 17) % 40),
      closed:        780 + i * 25,
      closeRate:     78 + (i * 0.9) + ((i % 3) - 1),
      leakageM3:     2400 + i * 35 + ((i * 11) % 150),  // 漏水量（千 m³）
      avgDays:       18 - (i * 0.4),                     // 平均結案天數
      criticalCount: 40 - i + ((i * 7) % 8),
    });
  });
  return snapshots;
}

/* ---------- 13 區處績效排名（hq dashboard） ---------- */
function buildRegionRanking() {
  const performances = [92, 88, 85, 83, 82, 81, 79, 77, 76, 74, 72, 69, 65];
  return SP.REGIONS.map((region, i) => ({
    region,
    rank: i + 1,
    achievement: performances[i] || 60,
    closeRate: 70 + ((i * 13) % 25),
    casesTotal: 80 + ((i * 31) % 80),
    leakageM3: 180 + ((i * 47) % 220),
    inspectorsCount: 22 + ((i * 7) % 18),
  })).sort((a, b) => b.achievement - a.achievement)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

/* ---------- 待審帳號（admin dashboard） ---------- */
function buildAccountRequests() {
  return [
    { id: "AR01", name: "王小明", role: "inspector", region: "第四區處（中港）", reason: "新進檢漏員",   at: "2026-05-23T09:10:00", status: "pending" },
    { id: "AR02", name: "林大華", role: "repairer",  region: "第四區處（中港）", reason: "新進修漏員",   at: "2026-05-23T08:30:00", status: "pending" },
    { id: "AR03", name: "陳美玉", role: "cs",        region: "客服中心",         reason: "客服中心輪調", at: "2026-05-22T15:20:00", status: "pending" },
    { id: "AR04", name: "黃志成", role: "plant",     region: "第五區處（中區）", reason: "廠所新進",     at: "2026-05-22T11:40:00", status: "pending" },
    { id: "AR05", name: "李文德", role: "inspector", region: "第三區處（桃園）", reason: "兼任",         at: "2026-05-21T16:00:00", status: "pending" },
    { id: "AR06", name: "張慧君", role: "audit_int", region: "稽核室",           reason: "稽核新進",     at: "2026-05-21T10:15:00", status: "pending" },
    { id: "AR07", name: "鄭俊雄", role: "repairer",  region: "第七區處（嘉義）", reason: "新進修漏員",   at: "2026-05-20T14:50:00", status: "pending" },
    { id: "AR08", name: "周文豪", role: "inspector", region: "第八區處（雲林）", reason: "新進",         at: "2026-05-20T09:00:00", status: "pending" },
  ];
}

/* ---------- 廠所績效（region dashboard 用，以第四區處為例） ---------- */
function buildPlantPerformance() {
  return [
    { region: "第四區處（中港）", plant: "中港廠所", achievement: 94, casesTotal: 56, closeRate: 92, leakageM3: 168, vendors: 6 },
    { region: "第四區處（中港）", plant: "苗栗廠所", achievement: 91, casesTotal: 48, closeRate: 89, leakageM3: 142, vendors: 5 },
    { region: "第四區處（中港）", plant: "竹南廠所", achievement: 89, casesTotal: 42, closeRate: 87, leakageM3: 128, vendors: 4 },
    { region: "第四區處（中港）", plant: "頭份廠所", achievement: 86, casesTotal: 38, closeRate: 84, leakageM3: 119, vendors: 4 },
    { region: "第五區處（中區）", plant: "台中廠所", achievement: 88, casesTotal: 62, closeRate: 86, leakageM3: 195, vendors: 7 },
    { region: "第五區處（中區）", plant: "豐原廠所", achievement: 84, casesTotal: 45, closeRate: 81, leakageM3: 137, vendors: 5 },
    { region: "第五區處（中區）", plant: "大里廠所", achievement: 82, casesTotal: 39, closeRate: 79, leakageM3: 122, vendors: 4 },
  ];
}

/* ---------- 月報審核（region dashboard 用） ---------- */
function buildMonthlyReports() {
  return [
    { id: "MR01", region: "第四區處（中港）", plant: "中港廠所", month: "2026-05", submitter: "賴伯毅", submittedAt: "2026-05-22T14:30:00", status: "pending_review", chapters: 16, type: "system" },
    { id: "MR02", region: "第四區處（中港）", plant: "苗栗廠所", month: "2026-05", submitter: "—",       submittedAt: "2026-05-21T16:10:00", status: "pending_review", chapters: 16, type: "system" },
    { id: "MR03", region: "第四區處（中港）", plant: "中港廠所", month: "2026-04", submitter: "賴伯毅", submittedAt: "2026-05-15T10:00:00", status: "approved",       chapters: 16, type: "system" },
    { id: "MR04", region: "第四區處（中港）", plant: "—",        month: "2026-Q1", submitter: "陳大華", submittedAt: "2026-05-10T09:30:00", status: "pending_review", chapters: 10, type: "annual" },
    { id: "MR05", region: "第四區處（中港）", plant: "竹南廠所", month: "2026-04", submitter: "—",       submittedAt: "2026-05-08T11:20:00", status: "returned",       chapters: 16, type: "system", note: "第 7 章漏水分析需補完" },
  ];
}

/* ---------- DB 健康度（DBA dashboard） ---------- */
function buildDbHealth() {
  return {
    connections: 124,
    maxConnections: 200,
    tps: 850,
    bufferHitRate: 98.7,
    cpu: 32,
    memory: 64,
    io: "ok",
    haStatus: { primary: "online", standby: "online", lastSwitch: "2026-04-15T03:20:00" },
    backups: {
      fullBackup:     { schedule: "每日 02:00", lastRun: "2026-05-23T02:00:00", status: "ok",   sizeMb: 18234 },
      differential:   { schedule: "每 1 小時",  lastRun: "2026-05-23T13:00:00", status: "ok",   sizeMb: 124 },
      offsite:        { schedule: "每日 04:00", lastRun: "2026-05-23T04:00:00", status: "ok",   sizeMb: 18234 },
      lastDrill:      "2026-05-15T09:00:00",
    },
    rpoMinutes: 60,
    rtoHours: 4,
    slowQueries: [
      { sql: "SELECT * FROM cases WHERE ...", durationMs: 4823, runs: 18 },
      { sql: "JOIN dispatches ON ...",        durationMs: 3210, runs: 42 },
      { sql: "GROUP BY region ...",            durationMs: 2890, runs: 28 },
    ],
    indexFragmentation: [
      { table: "cases",       index: "IX_cases_region",    fragmentation: 38 },
      { table: "auditLogs",   index: "IX_auditLogs_at",    fragmentation: 22 },
    ],
    ssrsJobs: [
      { name: "月報日批",     schedule: "每月 1 日 03:00", lastRun: "2026-05-01T03:05:00", status: "ok" },
      { name: "KPI 重算",     schedule: "每日 04:00",      lastRun: "2026-05-23T04:08:00", status: "ok" },
      { name: "稽核摘要",     schedule: "每週一 06:00",    lastRun: "2026-05-19T06:02:00", status: "ok" },
    ],
  };
}

/* ---------- 年度計畫進度（hq dashboard） ---------- */
function buildAnnualPlan() {
  return {
    year: 2026,
    targets: [
      { metric: "檢漏管長",        target: 12500, actual: 10840, unit: "km",      progress: 87 },
      { metric: "汰換管長",        target: 850,   actual: 612,   unit: "km",      progress: 72 },
      { metric: "漏水減量",        target: 4200,  actual: 3380,  unit: "千 m³",   progress: 80 },
      { metric: "結案率",          target: 90,    actual: 87,    unit: "%",       progress: 97 },
      { metric: "AMI 智慧水表",    target: 100000, actual: 78500, unit: "戶",      progress: 79 },
    ],
  };
}

/* ---------- 線上人數（admin dashboard 即時 KPI） ---------- */
function buildOnlineUsers() {
  return {
    current: 87,
    max: 100,
    today: 142,
    peak: { count: 94, at: "2026-05-23T10:15:00" },
  };
}

/* ---------- 客服指標（cs dashboard） ---------- */
function buildCsMetrics() {
  return {
    todayCalls: 23,
    casesCreated: 18,
    forwarded: 12,
    slaPercent: 95,
    callsByHour: [3, 5, 8, 4, 6, 9, 7, 12, 10, 8, 6, 4],   // 0-23 部分時段
    recentCalls: [
      { id: "CL01", at: "2026-05-23T13:42:00", caller: "0912-345-678", area: "北區雙十路二段",   reason: "地面冒水",      caseId: "C202600023", status: "forwarded" },
      { id: "CL02", at: "2026-05-23T12:30:00", caller: "0922-111-222", area: "西區美村路一段",   reason: "水壓不足",      caseId: null,         status: "answered" },
      { id: "CL03", at: "2026-05-23T11:15:00", caller: "0933-444-555", area: "中區三民路三段",   reason: "水費異常",      caseId: "C202600022", status: "forwarded" },
      { id: "CL04", at: "2026-05-23T10:50:00", caller: "0955-666-777", area: "東區崇德路二段",   reason: "馬路凹陷",      caseId: "C202600021", status: "forwarded" },
    ],
  };
}

/* ---------- 主產生器 ---------- */
SP.generateMockData = function () {
  return {
    users:             [...buildFixedUsers(), ...buildFieldUsers()],
    cases:             buildCases(),
    dispatches:        buildDispatches(),
    inspections:       buildInspections(),
    repairs:           buildRepairs(),
    pipes:             buildPipes(),
    notifications:     buildNotifications(),
    auditLogs:         buildAuditLogs(),
    integrations:      buildIntegrations(),
    documents:         buildDocuments(),
    vendors:           buildVendors(),
    milestones:        buildMilestones(),
    team:              buildTeam(),
    trainings:         buildTrainings(),
    // 階段 2 補強
    loginLogs:         buildLoginLogs(),
    kpiSnapshots:      buildKpiSnapshots(),
    regionRanking:     buildRegionRanking(),
    accountRequests:   buildAccountRequests(),
    plantPerformance:  buildPlantPerformance(),
    monthlyReports:    buildMonthlyReports(),
    dbHealth:          buildDbHealth(),
    annualPlan:        buildAnnualPlan(),
    onlineUsers:       buildOnlineUsers(),
    csMetrics:         buildCsMetrics(),
  };
};
