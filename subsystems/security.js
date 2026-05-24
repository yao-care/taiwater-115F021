/* ============================================================
   subsystems/security.js — 資安合規（12 構面 + SBOM + 第三方檢測 + ISMS + 稽核）
   依 09-資安.md
   ============================================================ */

window.SP = window.SP || {};

const { Routes: SRoutes, Route: SRoute, useNavigate: useSNav } = ReactRouterDOM;

SP.SecurityPage = function SecurityPage() {
  return (
    <SRoutes>
      <SRoute path="/"                element={<SP.SecurityMatrix />} />
      <SRoute path="/access-control"  element={<SP.SecurityAccessControl />} />
      <SRoute path="/sbom"            element={<SP.SecuritySbom />} />
      <SRoute path="/vapt"            element={<SP.SecurityVapt />} />
      <SRoute path="/isms"            element={<SP.SecurityIsms />} />
      <SRoute path="/audit-log"       element={<SP.SecurityAuditLog />} />
      <SRoute path="/finding"         element={<SP.SecurityFinding />} />
      <SRoute path="*"                element={<SP.SecurityMatrix />} />
    </SRoutes>
  );
};

/* ---------- 12 構面定義 ---------- */
SP.SECURITY_DOMAINS = [
  { id: "access",       name: "存取控制",                  total: 28, done: 26, partial: 1, na: 1, percent: 93 },
  { id: "identity",     name: "識別與鑑別",                total: 12, done: 11, partial: 1, na: 0, percent: 92 },
  { id: "comm",         name: "系統與通訊保護",            total: 22, done: 21, partial: 0, na: 1, percent: 95 },
  { id: "integrity",    name: "系統與資訊完整性",          total: 18, done: 17, partial: 1, na: 0, percent: 94 },
  { id: "continuity",   name: "營運持續（RPO/RTO）",        total: 14, done: 13, partial: 0, na: 1, percent: 93 },
  { id: "config",       name: "配置管理（SDLC 5）",         total: 15, done: 14, partial: 1, na: 0, percent: 93 },
  { id: "incident",     name: "事件應變（日誌 12 月）",     total: 10, done: 9,  partial: 1, na: 0, percent: 90 },
  { id: "personnel",    name: "人員安全（切結書）",        total: 8,  done: 7,  partial: 0, na: 1, percent: 88 },
];

/* ---------- SecurityMatrix 主頁 ---------- */
SP.SecurityMatrix = function SecurityMatrix() {
  const navigate = useSNav();
  const total = SP.SECURITY_DOMAINS.reduce((s, d) => s + d.total, 0);
  const done = SP.SECURITY_DOMAINS.reduce((s, d) => s + d.done, 0);

  return (
    <>
      <SP.PageHeader
        title="資安合規矩陣"
        subtitle={"資通系統防護基準（中級）・ 8 構面 ・ " + total + " 控制 ・ 實作 " + Math.round(done / total * 100) + "%"}
        breadcrumb={["首頁", "資安合規"]}
        rfp="附錄九"
        actions={
          <>
            <SP.Button variant="primary" onClick={() => navigate("/security/sbom")}>SBOM</SP.Button>
            <SP.Button variant="secondary" onClick={() => navigate("/security/vapt")}>第三方檢測</SP.Button>
            <SP.Button variant="secondary" onClick={() => navigate("/security/isms")}>ISMS 標準書</SP.Button>
          </>
        }
      />

      <div className="kpi-grid">
        <SP.KpiCard label="構面數"   value="8" suffix="構面" />
        <SP.KpiCard label="控制總數" value={total} suffix="項" />
        <SP.KpiCard label="已實作"   value={done + " (" + Math.round(done / total * 100) + "%)"} tone="pass" />
        <SP.KpiCard label="待改善"   value={SP.SECURITY_DOMAINS.reduce((s, d) => s + d.partial, 0)} suffix="項" tone="high" />
      </div>

      <SP.Card title="8 構面合規矩陣" subtitle="點構面進入細項">
        <SP.Table
          headers={["構面", "總數", "已實作", "部份", "不適用", "進度"]}
          rows={SP.SECURITY_DOMAINS.map(d => [
            <a onClick={() => navigate("/security/access-control")} style={{ cursor: "pointer", fontWeight: 600 }}>{d.name}</a>,
            <span>{d.total}</span>,
            <span style={{ color: "var(--color-pass)", fontWeight: 600 }}>{d.done}</span>,
            <span style={{ color: "var(--color-high)" }}>{d.partial}</span>,
            <span className="muted">{d.na}</span>,
            <div style={{ minWidth: "10rem" }}><SP.ProgressBar value={d.percent} tone={d.percent >= 95 ? "pass" : d.percent >= 90 ? undefined : "high"} /></div>,
          ])}
        />
      </SP.Card>
    </>
  );
};

/* ---------- 存取控制細項 ---------- */
SP.SecurityAccessControl = function SecurityAccessControl() {
  const navigate = useSNav();
  return (
    <>
      <SP.PageHeader title="存取控制 28 項" subtitle="附錄九 帳號 6 / 最小權限 / 遠端存取 / 連線階段" breadcrumb={["首頁", "資安", "存取控制"]} rfp="附錄九"
        actions={<SP.Button variant="ghost" onClick={() => navigate("/security")}>返回</SP.Button>} />
      <SP.Card title="帳號管理（6 項）">
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          <li style={{ color: "var(--color-pass)" }}>✓ 帳號申請 → 開通 → 停用 → 刪除 四階段管理</li>
          <li style={{ color: "var(--color-pass)" }}>✓ 逾期臨時帳號自動禁用</li>
          <li style={{ color: "var(--color-pass)" }}>✓ 閒置帳號自動禁用（半年未登入）</li>
          <li style={{ color: "var(--color-pass)" }}>✓ 定期審核（每半年）</li>
          <li style={{ color: "var(--color-pass)" }}>✓ 系統閒置時間定義（30 分鐘）</li>
          <li style={{ color: "var(--color-pass)" }}>✓ 逾閒置自動 session 登出</li>
        </ul>
      </SP.Card>
      <div className="mt-4">
        <SP.Card title="最小權限（1 項）">
          <ul style={{ paddingLeft: "1.25rem" }}>
            <li style={{ color: "var(--color-pass)" }}>✓ 最小權限原則（11 角色 × 7 模組矩陣）</li>
          </ul>
        </SP.Card>
      </div>
      <div className="mt-4">
        <SP.Card title="遠端存取（5 項）">
          <ul style={{ paddingLeft: "1.25rem" }}>
            <li style={{ color: "var(--color-pass)" }}>✓ 文件化遠端存取程序</li>
            <li style={{ color: "var(--color-pass)" }}>✓ 伺服器端權限控管</li>
            <li style={{ color: "var(--color-pass)" }}>✓ 監控遠端存取活動</li>
            <li style={{ color: "var(--color-pass)" }}>✓ 加密（TLS 1.2+ + VPN）</li>
            <li style={{ color: "var(--color-pass)" }}>✓ 白名單 IP</li>
          </ul>
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- SBOM ---------- */
SP.SecuritySbom = function SecuritySbom() {
  const navigate = useSNav();
  const COMMERCIAL = [
    { name: ".NET",         version: "8.0",   license: "MIT",       cve: null },
    { name: "ASP.NET Core", version: "8.0",   license: "MIT",       cve: null },
    { name: "EF Core",      version: "8.0",   license: "MIT",       cve: null },
    { name: "SQL Server",   version: "2022",  license: "Microsoft", cve: null },
  ];
  const OPEN_SOURCE = [
    { name: "React",     version: "18.3",  license: "MIT",      cve: null },
    { name: "D3.js",     version: "7.8.5", license: "BSD-3",    cve: null },
    { name: "Leaflet",   version: "1.9.4", license: "BSD-2",    cve: null },
    { name: "Bootstrap", version: "5.3.2", license: "MIT",      cve: null },
    { name: "jQuery",    version: "3.7.1", license: "MIT",      cve: "監控中" },
    { name: "Axios",     version: "1.6.2", license: "MIT",      cve: null },
    { name: "Lodash",    version: "4.17.21", license: "MIT",    cve: null },
    { name: "Moment.js", version: "2.30",  license: "MIT",      cve: null },
    { name: "Chart.js",  version: "4.4",   license: "MIT",      cve: null },
    { name: "DataTables", version: "1.13.8", license: "MIT",    cve: null },
    { name: "FontAwesome", version: "6.5", license: "CC BY 4.0", cve: null },
    { name: "Quill",     version: "1.3.7", license: "BSD-3",    cve: null },
  ];

  return (
    <>
      <SP.PageHeader title="SBOM 軟體物料清單" subtitle="商用 4 + 開源 12 ・ CVE 監控" breadcrumb={["首頁", "資安", "SBOM"]} rfp="附錄九"
        actions={<><SP.Button variant="primary" onClick={() => alert("已連到 NICS SBOM 工具")}>NICS 工具</SP.Button><SP.Button variant="ghost" onClick={() => navigate("/security")}>返回</SP.Button></>} />

      <div className="kpi-grid">
        <SP.KpiCard label="商用軟體"    value={COMMERCIAL.length} suffix="項" />
        <SP.KpiCard label="開源軟體"    value={OPEN_SOURCE.length} suffix="項" />
        <SP.KpiCard label="CVE 高風險"  value="0" tone="pass" hint="無高風險 CVE" />
        <SP.KpiCard label="CVE 監控中"  value="1" suffix="項" tone="high" hint="jQuery 監控中" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <SP.Card title="商用軟體（4）">
          <SP.Table compact headers={["名稱", "版本", "授權", "狀態"]} rows={COMMERCIAL.map(c => [
            <span style={{ fontWeight: 600 }}>{c.name}</span>,
            <span className="font-mono text-sm">{c.version}</span>,
            <SP.Badge tone="info">{c.license}</SP.Badge>,
            <SP.Badge tone="pass">✓ 監控中</SP.Badge>,
          ])} />
        </SP.Card>
        <SP.Card title="開源軟體（12）">
          <SP.Table compact headers={["名稱", "版本", "授權", "CVE"]} rows={OPEN_SOURCE.map(c => [
            <span style={{ fontWeight: 600 }}>{c.name}</span>,
            <span className="font-mono text-sm">{c.version}</span>,
            <SP.Badge tone="info">{c.license}</SP.Badge>,
            c.cve ? <SP.Badge tone="high">{c.cve}</SP.Badge> : <SP.Badge tone="pass">✓</SP.Badge>,
          ])} />
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- 第三方檢測（弱掃 / 滲透 / 源碼） ---------- */
SP.SecurityVapt = function SecurityVapt() {
  const navigate = useSNav();
  return (
    <>
      <SP.PageHeader title="第三方資安檢測" subtitle="弱掃 + 滲透測試 + 源碼掃描" breadcrumb={["首頁", "資安", "第三方檢測"]} rfp="附錄九"
        actions={<SP.Button variant="ghost" onClick={() => navigate("/security")}>返回</SP.Button>} />

      <div className="kpi-grid">
        <SP.KpiCard label="弱點掃描"   value="2026-05-15" tone="pass" hint="✓ 通過 12 大類" />
        <SP.KpiCard label="滲透測試"   value="2026-05-10" tone="pass" hint="✓ 通過 8 子類" />
        <SP.KpiCard label="源碼掃描"   value="2026-05-22" tone="pass" hint="✓ 通過" />
        <SP.KpiCard label="OWASP Top10" value="100%" tone="pass" hint="覆蓋率" />
      </div>

      <SP.Card title="滲透測試 12 大類矩陣" subtitle="所有類別 ✓ 通過">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-3)" }}>
          {[
            ["作業系統 - 遠端服務", "作業系統 - 本機服務"],
            ["網站 - 設定管理", "網站 - 使用者認證"],
            ["網站 - 連線管理", "網站 - 使用者授權"],
            ["網站 - 邏輯漏洞", "網站 - 輸入驗證 (1)"],
            ["網站 - 輸入驗證 (2)", "網站 - Web Service"],
            ["應用程式 - Ajax", "應用程式 - 網站套件"],
            ["密碼破解 - 字典檔", "其他"],
          ].flat().map((label, i) => (
            <div key={i} style={{ padding: "var(--space-2) var(--space-3)", background: "var(--bg-pass)", border: "1px solid var(--color-pass)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>
              <span style={{ color: "var(--color-pass)", marginRight: "0.5rem" }}>✓</span>{label}
            </div>
          ))}
        </div>
      </SP.Card>
    </>
  );
};

/* ---------- ISMS 標準書 ---------- */
SP.SecurityIsms = function SecurityIsms() {
  const navigate = useSNav();
  return (
    <>
      <SP.PageHeader title="ISMS 標準書遵循" subtitle="14 開發 + 15 委外 標準書 + 4 種切結書" breadcrumb={["首頁", "資安", "ISMS"]} rfp="附錄九"
        actions={<SP.Button variant="ghost" onClick={() => navigate("/security")}>返回</SP.Button>} />

      <SP.Card title="ISMS 標準書">
        <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          <li style={{ color: "var(--color-pass)" }}>✓ 14 開發-03-010 系統開發維護作業標準書</li>
          <li style={{ color: "var(--color-pass)" }}>✓ 15 委外-03-009 資訊業務委外安全作業標準書</li>
        </ul>
      </SP.Card>
      <div className="mt-4">
        <SP.Card title="切結書（4 種）">
          <SP.Table compact headers={["切結書", "對象", "狀態"]} rows={[
            ["委外廠商同意書", "藥提醒科技", <SP.Badge tone="pass">✓ 已簽</SP.Badge>],
            ["員工同意書", "5 位專案成員", <SP.Badge tone="pass">✓ 5/5 已簽</SP.Badge>],
            ["資訊處理切結書", "PM / SA", <SP.Badge tone="pass">✓ 已簽</SP.Badge>],
            ["資料銷毀切結書", "履約結束", <SP.Badge tone="medium">待履約結束</SP.Badge>],
          ]} />
        </SP.Card>
      </div>
      <div className="mt-4">
        <SP.Card title="其他文件">
          <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8 }}>
            <li style={{ color: "var(--color-pass)" }}>✓ 滲透測試 Permission Memo（已上傳）</li>
            <li style={{ color: "var(--color-pass)" }}>✓ 個資清冊（5 個資料種類）</li>
            <li style={{ color: "var(--color-pass)" }}>✓ 資產清冊</li>
          </ul>
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- 稽核日誌 ---------- */
SP.SecurityAuditLog = function SecurityAuditLog() {
  const navigate = useSNav();
  const { state } = SP.useStore();
  const userMap = Object.fromEntries(state.users.map(u => [u.id, u]));
  const [filter, setFilter] = React.useState("all");

  const filteredLogs = filter === "all" ? state.auditLogs : state.auditLogs.filter(l => l.action === filter);

  const filterOptions = [
    { value: "all",          label: "全部",      count: state.auditLogs.length },
    { value: "LOGIN",        label: "登入",       count: state.auditLogs.filter(l => l.action === "LOGIN").length },
    { value: "CREATE_CASE",  label: "建立案件",   count: state.auditLogs.filter(l => l.action === "CREATE_CASE").length },
    { value: "DISPATCH",     label: "派工",       count: state.auditLogs.filter(l => l.action === "DISPATCH").length },
    { value: "UPLOAD_PHOTO", label: "上傳照片",   count: state.auditLogs.filter(l => l.action === "UPLOAD_PHOTO").length },
    { value: "REPAIR_DONE",  label: "結案",       count: state.auditLogs.filter(l => l.action === "REPAIR_DONE").length },
  ];

  return (
    <>
      <SP.PageHeader title="稽核日誌" subtitle="保存 12 個月 ・ SHA-256 防竄改" breadcrumb={["首頁", "資安", "稽核日誌"]} rfp="附錄九"
        actions={<SP.Button variant="ghost" onClick={() => navigate("/security")}>返回</SP.Button>} />

      <SP.Toolbar>
        <SP.CaseFilter value={filter} onChange={setFilter} options={filterOptions} />
      </SP.Toolbar>

      <SP.Card padding="0">
        <SP.Table
          headers={["時間", "使用者", "事件", "對象", "IP", "Hash"]}
          rows={filteredLogs.slice(0, 50).map(l => [
            <span className="text-sm font-mono muted">{SP.format.datetime(l.at)}</span>,
            <span className="text-sm">{userMap[l.userId]?.name || l.userId}</span>,
            <SP.Badge tone="info">{l.action}</SP.Badge>,
            <span className="text-sm font-mono">{l.target}</span>,
            <span className="text-sm font-mono muted">{l.ip}</span>,
            <span className="text-xs font-mono muted">{l.hash.slice(0, 20)}…</span>,
          ])}
        />
      </SP.Card>
    </>
  );
};

/* ---------- 稽核發現追蹤 (CAPA) ---------- */
SP.SecurityFinding = function SecurityFinding() {
  const navigate = useSNav();
  return (
    <>
      <SP.PageHeader title="稽核發現追蹤（CAPA）" subtitle="Corrective and Preventive Actions" breadcrumb={["首頁", "資安", "稽核發現"]} rfp="附錄九"
        actions={<SP.Button variant="ghost" onClick={() => navigate("/security")}>返回</SP.Button>} />
      <SP.Card>
        <SP.Table headers={["編號", "發現項目", "嚴重度", "負責人", "狀態", "完成日期"]} rows={[
          ["#2026-05-001", "Session 自動登出未實作", <SP.Badge tone="high">高</SP.Badge>, "何雅婷", <SP.Badge tone="pass">已改善</SP.Badge>, "2026-05-10"],
          ["#2026-05-002", "SBOM 未更新", <SP.Badge tone="medium">中</SP.Badge>, "資安組", <SP.Badge tone="medium">進行中</SP.Badge>, "預計 2026-05-30"],
          ["#2026-05-003", "預設密碼首次未強制變更", <SP.Badge tone="high">高</SP.Badge>, "何雅婷", <SP.Badge tone="pass">已改善</SP.Badge>, "2026-05-05"],
          ["#2026-04-007", "備份還原演練未紀錄", <SP.Badge tone="medium">中</SP.Badge>, "DBA", <SP.Badge tone="pass">已改善</SP.Badge>, "2026-04-25"],
          ["#2026-04-012", "AD 群組權限過大", <SP.Badge tone="high">高</SP.Badge>, "資安組", <SP.Badge tone="high">待處理</SP.Badge>, "預計 2026-06-15"],
          ["#2026-03-018", "源碼掃描每月未執行", <SP.Badge tone="medium">中</SP.Badge>, "DevOps", <SP.Badge tone="pass">已改善</SP.Badge>, "2026-04-01"],
        ]} />
      </SP.Card>
    </>
  );
};
