/* ============================================================
   subsystems/dashboard.js — 11 角色儀表板
   依 06-Dashboard.md，11 個 sub-dashboard + 案件即時追蹤
   ============================================================ */

window.SP = window.SP || {};

/* ---------- 儀表板 Router（依 currentUser.role 分派） ---------- */
SP.DashboardPage = function DashboardPage() {
  const { state } = SP.useStore();
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();
  const user = state.currentUser;

  const isCaseTrack = location.pathname.endsWith("/case-track");

  React.useEffect(() => {
    if (!user || isCaseTrack) return;
    if (user.role === "inspector") navigate("/mobile/inspector", { replace: true });
    else if (user.role === "repairer") navigate("/mobile/repairer", { replace: true });
  }, [user && user.id, isCaseTrack]);

  if (isCaseTrack) return <SP.CaseTrackView />;
  if (!user) return <div className="loading-screen">使用者資料載入中...</div>;

  const VIEWS = {
    admin:      SP.AdminDashboard,
    hq:         SP.HqDashboard,
    region:     SP.RegionDashboard,
    plant:      SP.PlantDashboard,
    cs:         SP.CsDashboard,
    dba:        SP.DbaDashboard,
    security:   SP.SecurityDashboard,
    audit_int:  SP.AuditDashboard,
    audit_ext:  SP.AuditDashboard,
    inspector:  () => <div className="loading-screen">導向行動版中...</div>,
    repairer:   () => <div className="loading-screen">導向行動版中...</div>,
  };
  const View = VIEWS[user.role];
  return View ? <View /> : <div>未知角色：{user.role}</div>;
};

/* ============================================================
   1. 系統管理員儀表板
   ============================================================ */
SP.AdminDashboard = function AdminDashboard() {
  const { state } = SP.useStore();
  const online = state.onlineUsers || { current: 0, max: 100, today: 0, peak: { count: 0 } };
  const healthy = state.integrations.filter(i => i.status === "healthy").length;
  const totalInt = state.integrations.length;
  const pendingAccounts = state.accountRequests.filter(r => r.status === "pending").length;

  return (
    <>
      <SP.PageHeader
        title="系統管理員儀表板"
        subtitle="李宗翰 ・ 系統管理員 ・ 全功能後台"
        breadcrumb={["首頁", "儀表板", "系統管理員"]}
        rfp="附錄一 三(二)、附錄九"
      />
      <div className="kpi-grid">
        <SP.KpiCard label="線上人數"     value={online.current + "/" + online.max}     hint={"今日累計 " + online.today + " 人"} />
        <SP.KpiCard label="介接系統健康" value={healthy + "/" + totalInt}              suffix="系統" tone={healthy === totalInt ? "pass" : "critical"} />
        <SP.KpiCard label="可用率（30 天）" value="99.7%"                              tone="pass" delta={0.2} />
        <SP.KpiCard label="待簽帳號"     value={pendingAccounts}                      suffix="件" tone={pendingAccounts > 0 ? "critical" : undefined} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <SP.IntegrationStatus max={8} compact />
        <SP.AccountRequestList limit={6} />
      </div>
      <SP.AuditLogTable limit={10} />
    </>
  );
};

/* ============================================================
   2. 總處管理員儀表板
   ============================================================ */
SP.HqDashboard = function HqDashboard() {
  const { state } = SP.useStore();
  const snapshots = state.kpiSnapshots || [];
  const annualPlan = state.annualPlan || { targets: [] };
  const totalCases = state.cases.length * 25;  // 演示放大到全國規模
  const leakageM3 = snapshots[snapshots.length - 1]?.leakageM3 || 0;
  const closeRate = snapshots[snapshots.length - 1]?.closeRate || 0;

  return (
    <>
      <SP.PageHeader
        title="總處管理員儀表板"
        subtitle="周明德 ・ 總處 ・ 全國 KPI / 政策 / 年度計畫"
        breadcrumb={["首頁", "儀表板", "總處"]}
        rfp="附錄一 三(五)"
      />
      <div className="kpi-grid">
        <SP.KpiCard label="全國案件總數" value={totalCases.toLocaleString()} suffix="件" delta={6.3} />
        <SP.KpiCard label="漏水量（本月）" value={leakageM3.toLocaleString()} suffix="千 m³" tone={leakageM3 > 2500 ? "critical" : undefined} />
        <SP.KpiCard label="達成率"        value={closeRate.toFixed(1) + "%"} tone="pass" delta={1.8} />
        <SP.KpiCard label="13 區處上線"    value="13/13"                       tone="pass" hint="全部正常運作" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <SP.Card title="13 區處 KPI 排名" subtitle="依本月達成率">
          <SP.RankBar
            data={state.regionRanking.map(r => ({ rank: r.rank, label: r.region.replace("處", ""), value: r.achievement }))}
            max={100}
            suffix="%"
            topN={13}
          />
        </SP.Card>

        <SP.Card title="月度趨勢" subtitle="近 12 個月">
          <SP.LineChart
            data={snapshots.map(s => ({ label: s.month.slice(5), value: s.closeRate }))}
            height={180}
            fill
          />
          <div className="text-xs muted mt-2">縱軸：結案率 %</div>
        </SP.Card>
      </div>

      <SP.Card title="年度計畫進度（2026）" subtitle="總處核發目標 vs 全國實際">
        <div className="flex-col" style={{ gap: "var(--space-4)" }}>
          {annualPlan.targets.map(t => (
            <SP.ProgressBar
              key={t.metric}
              label={t.metric + "  " + t.actual.toLocaleString() + " / " + t.target.toLocaleString() + " " + t.unit}
              value={t.progress}
              tone={t.progress >= 90 ? "pass" : t.progress >= 70 ? undefined : "high"}
            />
          ))}
        </div>
      </SP.Card>
    </>
  );
};

/* ============================================================
   3. 區處主管儀表板
   ============================================================ */
SP.RegionDashboard = function RegionDashboard() {
  const { state } = SP.useStore();
  const region = state.currentUser?.region || state.currentRegion;
  const cs = state.cases.filter(c => c.region === region);
  const closed = cs.filter(c => c.status === "結案").length;
  const closeRate = cs.length > 0 ? Math.round((closed / cs.length) * 100) : 0;
  const plants = (SP.PLANTS_BY_REGION[region] || []).length;
  const inspectors = state.users.filter(u => u.region === region && u.role === "inspector").length;

  return (
    <>
      <SP.PageHeader
        title="區處主管儀表板"
        subtitle={state.currentUser.name + " ・ " + region + " ・ 區處績效 / 月報審核 / 年度報告書"}
        breadcrumb={["首頁", "儀表板", "區處主管"]}
        rfp="附錄一 三(五)+(六)"
      />
      <div className="kpi-grid">
        <SP.KpiCard label="本月新增案件"  value={cs.length}     suffix="件" delta={4.2} />
        <SP.KpiCard label="結案率"        value={closeRate + "%"} tone={closeRate >= 85 ? "pass" : undefined} delta={2.1} />
        <SP.KpiCard label="達成率"        value="89%"             tone="pass" />
        <SP.KpiCard label="廠所 / 檢漏員"  value={plants + " / " + inspectors} hint="本區處編制" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr)", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <SP.PlantPerformanceList region={region} />
        <SP.MonthlyReportList region={region} />
      </div>

      <SP.Card title="年度報告書中心" subtitle="本區處 2026 系統成果報告書（16 章）/ 年度成果報告書（10 章）" action={
        <span style={{ display: "inline-flex", gap: "var(--space-2)" }}>
          <SP.Button size="sm" variant="primary" onClick={() => window.location.hash = "#/annual-report"}>系統成果（16 章）</SP.Button>
          <SP.Button size="sm" variant="secondary" onClick={() => window.location.hash = "#/annual-report/10"}>年度成果（10 章）</SP.Button>
        </span>
      }>
        <div className="text-sm muted">章節進度由 cases / repairs / inspections 即時計算，可逐章審核並一鍵匯出 ODF。詳細功能將在階段 5 完整實作。</div>
      </SP.Card>
    </>
  );
};

/* ============================================================
   4. 廠所人員儀表板
   ============================================================ */
SP.PlantDashboard = function PlantDashboard() {
  const { state } = SP.useStore();
  const navigate = ReactRouterDOM.useNavigate();
  const user = state.currentUser;
  const plant = user?.plant || "中港廠所";
  const plantCases = state.cases.filter(c => c.plant === plant);
  const todayDispatch = plantCases.filter(c => c.status === "派工").length;
  const inProgress = plantCases.filter(c => ["檢漏中", "待修", "修復中", "已修"].includes(c.status)).length;
  const closedThisMonth = plantCases.filter(c => c.status === "結案").length;
  const vendorsCount = state.vendors.filter(v => v.region === user?.region).length;

  return (
    <>
      <SP.PageHeader
        title="廠所人員儀表板"
        subtitle={user.name + " ・ " + plant + " ・ 派工 + 工程預算書"}
        breadcrumb={["首頁", "儀表板", "廠所人員"]}
        rfp="附錄一 四(一)~(八)"
      />
      <div className="kpi-grid">
        <SP.KpiCard label="今日派工"      value={todayDispatch} suffix="件" tone={todayDispatch > 0 ? "high" : undefined} />
        <SP.KpiCard label="進行中"        value={inProgress}    suffix="件" />
        <SP.KpiCard label="本月結案"      value={closedThisMonth} suffix="件" tone="pass" delta={5.8} />
        <SP.KpiCard label="本區處廠商"    value={vendorsCount}  suffix="家" />
      </div>

      <SP.Card
        title="派工看板（簡略視圖）"
        subtitle="完整拖拉派工看板將於階段 3 實作"
        action={<SP.Button size="sm" variant="primary" onClick={() => navigate("/repair/dispatch-board")}>進入派工看板 →</SP.Button>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
          {["申報", "派工", "檢漏中", "修復中"].map(status => {
            const list = plantCases.filter(c => c.status === status).slice(0, 3);
            return (
              <div key={status} style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
                <div style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>{status} ({plantCases.filter(c => c.status === status).length})</div>
                <div className="flex-col" style={{ gap: "var(--space-2)" }}>
                  {list.length === 0 ? <div className="text-xs muted">無</div> : list.map(c => (
                    <div key={c.id} style={{ background: "var(--bg-surface)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)" }}>
                      <div style={{ fontWeight: 600 }}>{c.caseNo}</div>
                      <div className="muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SP.Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "var(--space-5)", marginTop: "var(--space-5)" }}>
        <SP.Card title="工程預算書（PCCES）" subtitle="本廠所進行中 / 待簽" action={<SP.Button size="sm" variant="ghost" onClick={() => navigate("/pcces")}>進入 →</SP.Button>}>
          <div style={{ display: "flex", gap: "var(--space-5)", paddingTop: "var(--space-2)" }}>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--tw-primary)" }}>5</div>
              <div className="text-sm muted">進行中</div>
            </div>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--color-high)" }}>2</div>
              <div className="text-sm muted">待簽</div>
            </div>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--color-pass)" }}>8</div>
              <div className="text-sm muted">本月完成</div>
            </div>
          </div>
        </SP.Card>
        <SP.Card title="廠商管理" subtitle={"本區處 " + vendorsCount + " 家配合廠商"}>
          <div style={{ display: "flex", gap: "var(--space-5)", paddingTop: "var(--space-2)" }}>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--tw-primary)" }}>{vendorsCount}</div>
              <div className="text-sm muted">合作中</div>
            </div>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--color-pass)" }}>4.2</div>
              <div className="text-sm muted">平均評分</div>
            </div>
          </div>
        </SP.Card>
      </div>
    </>
  );
};

/* ============================================================
   5. 客服人員儀表板
   ============================================================ */
SP.CsDashboard = function CsDashboard() {
  const { state, dispatch } = SP.useStore();
  const toast = SP.useToast();
  const navigate = ReactRouterDOM.useNavigate();
  const cs = state.csMetrics || { todayCalls: 0, casesCreated: 0, forwarded: 0, slaPercent: 0, recentCalls: [] };

  // 一鍵建立案件 — 自動帶 demo 預設值，連動推派最近廠所、通知、稽核日誌
  const newCase = () => {
    const samples = [
      { title: "雙十路二段地面冒水", address: "北區雙十路二段 88 號附近", reason: "地面冒水", severity: "critical" },
      { title: "美村路一段水壓不足", address: "西區美村路一段 45 號附近", reason: "水壓不足", severity: "high" },
      { title: "三民路三段水費異常", address: "中區三民路三段 12 號附近", reason: "水費異常", severity: "medium" },
      { title: "崇德路二段馬路凹陷", address: "東區崇德路二段 23 號附近", reason: "馬路凹陷", severity: "high" },
    ];
    const sample = samples[(state.cases.length) % samples.length];
    dispatch({
      type: "CREATE_CASE_FROM_CS",
      payload: {
        ...sample,
        region: "第四區處（中港）",
        plant: "中港廠所",
        reporter: "民眾通報",
        reporterPhone: "0912-" + String(100 + state.cases.length).padStart(3, "0") + "-345",
        lng: 120.65 + (state.cases.length % 5) * 0.01,
        lat: 24.55 + (state.cases.length % 5) * 0.01,
        byUserId: state.currentUser.id,
        byName: state.currentUser.name,
      },
    });
    toast({ kind: "pass", title: "✓ 已建立案件", body: sample.title + " ・ 自動推派中港廠所 ・ 賴伯毅已收到通知" });
  };

  return (
    <>
      <SP.PageHeader
        title="客服人員儀表板"
        subtitle={state.currentUser.name + " ・ 客服中心 1910 ・ 案件申報與後送"}
        breadcrumb={["首頁", "儀表板", "客服"]}
        rfp="附錄一 四(三)"
      />
      <div className="kpi-grid">
        <SP.KpiCard label="今日來電"   value={cs.todayCalls}   suffix="通" />
        <SP.KpiCard label="已建案"     value={cs.casesCreated} suffix="件" />
        <SP.KpiCard label="後送中"     value={cs.forwarded}    suffix="件" tone={cs.forwarded > 10 ? "high" : undefined} />
        <SP.KpiCard label="SLA"        value={cs.slaPercent + "%"} tone="pass" delta={1.5} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: "var(--space-5)" }}>
        <SP.Card title="新案件一鍵建立" subtitle="自動帶民眾資訊 / GPS / 推派廠所">
          <div className="flex-col" style={{ gap: "var(--space-3)" }}>
            <SP.Button variant="primary" size="lg" onClick={newCase}>+ 新案件（一鍵）</SP.Button>
            <div className="text-xs muted">點下後自動觸發：建立 case → 推派最近廠所 → 通知廠所主管 → 寫稽核日誌</div>
          </div>
        </SP.Card>
        <SP.Card title="今日來電紀錄" subtitle={cs.recentCalls.length + " 筆 ・ 最新優先"}>
          <SP.Table
            compact
            headers={["時間", "來電", "地點", "原因", "處理"]}
            rows={cs.recentCalls.map(call => [
              <span className="text-sm font-mono muted">{SP.format.datetime(call.at).slice(11)}</span>,
              <span className="text-sm font-mono">{call.caller}</span>,
              <span className="text-sm">{call.area}</span>,
              <span className="text-sm">{call.reason}</span>,
              call.status === "forwarded" ? <SP.Badge tone="pass">已建案</SP.Badge> : <SP.Badge tone="medium">處理中</SP.Badge>,
            ])}
          />
        </SP.Card>
      </div>
    </>
  );
};

/* ============================================================
   6. DBA 儀表板
   ============================================================ */
SP.DbaDashboard = function DbaDashboard() {
  const { state } = SP.useStore();
  const db = state.dbHealth;
  if (!db) return <div>DB 資料載入中...</div>;

  return (
    <>
      <SP.PageHeader
        title="DBA 儀表板"
        subtitle={state.currentUser.name + " ・ 資訊處 ・ DB 效能 / HA / SSRS / SSIS"}
        breadcrumb={["首頁", "儀表板", "DBA"]}
        rfp="附錄九 系統與資訊完整性 + 營運持續"
      />
      <div className="kpi-grid">
        <SP.KpiCard label="DB 連線"      value={db.connections + "/" + db.maxConnections} suffix="" tone={db.connections > db.maxConnections * 0.8 ? "high" : "pass"} />
        <SP.KpiCard label="TPS"          value={db.tps.toLocaleString()} />
        <SP.KpiCard label="RTO / RPO"    value={db.rtoHours + "h / " + db.rpoMinutes + "m"} hint="復原時間 / 復原點目標" tone="pass" />
        <SP.KpiCard label="HA 主備"      value={db.haStatus.primary + " / " + db.haStatus.standby} tone="pass" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "var(--space-5)", marginBottom: "var(--space-5)" }}>
        <SP.Card title="DB 效能（即時）" subtitle="CPU / Memory / IO / Buffer">
          <div className="flex-col" style={{ gap: "var(--space-4)" }}>
            <SP.ProgressBar label="CPU"          value={db.cpu}         tone={db.cpu > 70 ? "high" : undefined} />
            <SP.ProgressBar label="Memory"       value={db.memory}      tone={db.memory > 75 ? "high" : undefined} />
            <SP.ProgressBar label="Buffer 命中率" value={db.bufferHitRate} tone="pass" />
            <SP.ProgressBar label="連線使用率"    value={Math.round(db.connections / db.maxConnections * 100)} />
          </div>
        </SP.Card>
        <SP.Card title="備份狀態" subtitle="完整 / 差異 / 異地">
          <SP.Table
            compact
            headers={["類別", "排程", "最後執行", "狀態", "大小"]}
            rows={[
              ["完整備份", db.backups.fullBackup.schedule, SP.format.datetime(db.backups.fullBackup.lastRun), <SP.Badge tone="pass">{db.backups.fullBackup.status}</SP.Badge>, (db.backups.fullBackup.sizeMb / 1024).toFixed(1) + " GB"],
              ["差異備份", db.backups.differential.schedule, SP.format.datetime(db.backups.differential.lastRun), <SP.Badge tone="pass">{db.backups.differential.status}</SP.Badge>, db.backups.differential.sizeMb + " MB"],
              ["異地備份", db.backups.offsite.schedule, SP.format.datetime(db.backups.offsite.lastRun), <SP.Badge tone="pass">{db.backups.offsite.status}</SP.Badge>, (db.backups.offsite.sizeMb / 1024).toFixed(1) + " GB"],
            ]}
          />
          <div className="text-xs muted mt-4">最近異地備份還原演練：{SP.format.date(db.backups.lastDrill)}</div>
        </SP.Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "var(--space-5)" }}>
        <SP.Card title="Top 慢查詢" subtitle="近 24h">
          <SP.Table
            compact
            headers={["SQL", "耗時", "次數"]}
            rows={db.slowQueries.map(q => [
              <span className="text-xs font-mono">{q.sql}</span>,
              <span style={{ fontWeight: 600, color: q.durationMs > 3000 ? "var(--color-critical)" : "var(--text-primary)" }}>{q.durationMs} ms</span>,
              <span className="text-sm muted">{q.runs}</span>,
            ])}
          />
        </SP.Card>
        <SP.Card title="SSRS / SSIS 排程作業" subtitle="近一週執行狀況">
          <SP.Table
            compact
            headers={["作業", "排程", "最後執行", "狀態"]}
            rows={db.ssrsJobs.map(j => [
              <span className="text-sm">{j.name}</span>,
              <span className="text-sm muted">{j.schedule}</span>,
              <span className="text-sm muted">{SP.format.datetime(j.lastRun)}</span>,
              <SP.Badge tone="pass">{j.status}</SP.Badge>,
            ])}
          />
        </SP.Card>
      </div>
    </>
  );
};

/* ============================================================
   7. 資安人員儀表板
   ============================================================ */
SP.SecurityDashboard = function SecurityDashboard() {
  const { state } = SP.useStore();
  const navigate = ReactRouterDOM.useNavigate();
  return (
    <>
      <SP.PageHeader
        title="資安人員儀表板"
        subtitle={state.currentUser.name + " ・ 資訊處資安 ・ ISMS + SBOM + 12 構面"}
        breadcrumb={["首頁", "儀表板", "資安人員"]}
        rfp="附錄九 全文"
      />
      <div className="kpi-grid">
        <SP.KpiCard label="12 構面進度" value="93%"  tone="pass" hint="127 控制措施 / 已實作 118" />
        <SP.KpiCard label="待改善"      value="5"     suffix="項" tone="high" />
        <SP.KpiCard label="SBOM 監控"    value="16"    suffix="軟體" hint="4 商用 / 12 開源" />
        <SP.KpiCard label="第三方檢測"   value="3/3"   tone="pass" hint="弱掃 / 滲透 / 源碼 ✓" />
      </div>

      <SP.Card title="12 構面合規率" subtitle="點構面進入細項（階段 5 完整）">
        <div className="flex-col" style={{ gap: "var(--space-3)" }}>
          {SECURITY_DOMAINS.map(d => (
            <SP.ProgressBar
              key={d.name}
              label={d.name + "（" + d.total + " 項）"}
              value={d.percent}
              tone={d.percent >= 95 ? "pass" : d.percent >= 90 ? undefined : "high"}
            />
          ))}
        </div>
        <div className="mt-4">
          <SP.Button size="sm" variant="primary" onClick={() => navigate("/security/matrix")}>進入完整矩陣 →</SP.Button>
        </div>
      </SP.Card>
    </>
  );
};

const SECURITY_DOMAINS = [
  { name: "存取控制",          total: 28, percent: 93 },
  { name: "識別與鑑別",        total: 12, percent: 92 },
  { name: "系統與通訊保護",    total: 22, percent: 95 },
  { name: "系統與資訊完整性",  total: 18, percent: 94 },
  { name: "營運持續（RPO/RTO）", total: 14, percent: 93 },
  { name: "配置管理（SDLC 5）",  total: 15, percent: 93 },
  { name: "事件應變（日誌12月）", total: 10, percent: 90 },
  { name: "人員安全（切結書）",  total: 8,  percent: 88 },
];

/* ============================================================
   8. 內 / 外稽核 儀表板（共用，唯讀）
   ============================================================ */
SP.AuditDashboard = function AuditDashboard() {
  const { state } = SP.useStore();
  const navigate = ReactRouterDOM.useNavigate();
  const isExt = state.currentUser?.role === "audit_ext";

  return (
    <>
      <SP.PageHeader
        title={(isExt ? "外部稽核員" : "內部稽核員") + " 儀表板（唯讀）"}
        subtitle={state.currentUser.name + (isExt ? " ・ ISO 27001 LA / BSI Taiwan" : " ・ 稽核室")}
        breadcrumb={["首頁", "儀表板", isExt ? "外稽" : "內稽"]}
        rfp="附錄九 + ISO 27001"
      />
      <div className="kpi-grid">
        <SP.KpiCard label="控制措施"   value="127" suffix="項" />
        <SP.KpiCard label="已實作"     value="118" suffix="項 (93%)" tone="pass" />
        <SP.KpiCard label="待改善"     value="5"   suffix="項" tone="high" />
        <SP.KpiCard label="不適用"     value="4"   suffix="項" />
      </div>

      <SP.Card title="12 構面合規率（唯讀）" subtitle="點開可看細項，不可修改">
        <div className="flex-col" style={{ gap: "var(--space-3)" }}>
          {SECURITY_DOMAINS.map(d => (
            <SP.ProgressBar key={d.name} label={d.name + "（" + d.total + " 項）"} value={d.percent} tone={d.percent >= 95 ? "pass" : undefined} />
          ))}
        </div>
      </SP.Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "var(--space-5)", marginTop: "var(--space-5)" }}>
        <SP.Card title="稽核發現追蹤" subtitle="近期 finding（CAPA）">
          <SP.Table
            compact
            headers={["編號", "發現項目", "狀態"]}
            rows={[
              ["#2026-05-001", "Session 自動登出未實作", <SP.Badge tone="pass">已改善</SP.Badge>],
              ["#2026-05-002", "SBOM 未更新",            <SP.Badge tone="medium">進行中</SP.Badge>],
              ["#2026-05-003", "預設密碼首次未強制變更",  <SP.Badge tone="pass">已改善</SP.Badge>],
              ["#2026-04-007", "備份還原演練未紀錄",     <SP.Badge tone="pass">已改善</SP.Badge>],
              ["#2026-04-012", "AD 群組權限過大",        <SP.Badge tone="high">待處理</SP.Badge>],
            ]}
          />
        </SP.Card>
        <SP.Card title="操作（唯讀）">
          <div className="flex-col" style={{ gap: "var(--space-3)" }}>
            <SP.Button variant="secondary" onClick={() => navigate("/security/audit-log")}>查看稽核日誌</SP.Button>
            <SP.Button variant="secondary" onClick={() => navigate("/security/matrix")}>12 構面細項</SP.Button>
            {isExt && <SP.Button variant="primary">匯出 ISO 27001 稽核報告（PDF / ODF）</SP.Button>}
          </div>
        </SP.Card>
      </div>
    </>
  );
};

/* ============================================================
   案件即時追蹤（demo 流程 A 用視窗）
   ============================================================ */
SP.CaseTrackView = function CaseTrackView() {
  const { state } = SP.useStore();
  const [selectedId, setSelectedId] = React.useState(state.cases[0]?.id);
  const selected = state.cases.find(c => c.id === selectedId);

  return (
    <>
      <SP.PageHeader
        title="案件即時追蹤"
        subtitle="跨角色生命週期觀察 ・ 任一角色操作即時反映在此 timeline"
        breadcrumb={["首頁", "儀表板", "案件追蹤"]}
        rfp="流程 A"
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: "var(--space-5)" }}>
        <SP.Card title={"案件清單（" + state.cases.length + " 件）"} padding="0">
          <div style={{ maxHeight: "30rem", overflowY: "auto" }}>
            {state.cases.slice(0, 30).map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  display: "block", width: "100%", padding: "var(--space-3)",
                  border: 0, borderBottom: "1px solid var(--border-base)",
                  background: c.id === selectedId ? "var(--bg-low)" : "transparent",
                  textAlign: "left", cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="font-mono text-sm" style={{ fontWeight: 600 }}>{c.caseNo}</span>
                  <SP.StatusBadge status={c.status} />
                </div>
                <div className="text-sm" style={{ marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                <div className="text-xs muted">{c.region}</div>
              </button>
            ))}
          </div>
        </SP.Card>

        <SP.Card title={selected ? selected.caseNo + " ・ " + selected.title : "案件 Timeline"} subtitle="跨角色操作時間軸（階段 3 補完整 timeline）">
          {selected ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                <Info label="區處 / 廠所" value={selected.region + " / " + selected.plant} />
                <Info label="地址" value={selected.address} />
                <Info label="嚴重度" value={<SP.SeverityBadge severity={selected.severity} />} />
                <Info label="案件狀態" value={<SP.StatusBadge status={selected.status} />} />
                <Info label="案件來源" value={selected.source} />
                <Info label="負責人" value={selected.assignedTo || "—"} />
                <Info label="建立時間" value={SP.format.datetime(selected.createdAt)} />
                <Info label="GPS" value={selected.lng.toFixed(4) + ", " + selected.lat.toFixed(4)} />
              </div>

              <div style={{ borderTop: "1px solid var(--border-base)", paddingTop: "var(--space-4)" }}>
                <div style={{ fontWeight: 700, marginBottom: "var(--space-3)" }}>Timeline</div>
                <div className="flex-col" style={{ gap: "var(--space-2)" }}>
                  {selected.timeline?.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                      <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "999px", background: "var(--tw-primary)", marginTop: "0.4rem" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{t.action}</div>
                        <div className="text-xs muted">{SP.format.datetime(t.at)} ・ {t.by}</div>
                        {t.note && <div className="text-sm" style={{ marginTop: "0.25rem" }}>{t.note}</div>}
                      </div>
                    </div>
                  )) || <div className="text-sm muted">尚無 timeline 紀錄</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm muted">請從左側選擇案件</div>
          )}
        </SP.Card>
      </div>
    </>
  );
};

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs muted">{label}</div>
      <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{value}</div>
    </div>
  );
}
