/* ============================================================
   shared/home.js — 系統首頁（System Home）
   登入後首頁。依當前角色與區處顯示對應的 KPI / 待辦 / 通知 / 系統狀態
   ============================================================ */

window.SP = window.SP || {};

SP.HomePage = function HomePage() {
  const { state } = SP.useStore();
  const navigate = ReactRouterDOM.useNavigate();
  const user = state.currentUser;
  const region = state.currentRegion;

  if (!user) {
    return <div className="loading-screen">使用者資料載入中...</div>;
  }

  // KPI（依當前區處過濾，"全國"模式則不過濾）
  const isHQ = user.role === "hq" || user.role === "admin";
  const filterRegion = isHQ ? null : region;
  const kpis = SP.selectors.kpisByRegion(state, filterRegion);
  const closeRate = kpis.total > 0 ? Math.round((kpis.closedThisMonth / kpis.total) * 100) : 0;

  // 我的待辦（指派給我的 / 未讀通知）
  const myCases = state.cases.filter(c =>
    c.assignedTo === user.id && c.status !== "結案"
  ).slice(0, 5);
  const myNotifications = state.notifications
    .filter(n => n.recipient === user.id && !n.read)
    .slice(0, 5);

  // 跨區處主管 / 系統管理員看：最新案件（不限指派）
  const showAllCases = ["admin", "hq", "region", "plant", "cs"].includes(user.role);
  const latestCases = state.cases
    .filter(c => !filterRegion || c.region === filterRegion)
    .slice(0, 8);

  // 介接系統狀態
  const integrationsDown = state.integrations.filter(i => i.status !== "healthy");
  const healthyCount = state.integrations.length - integrationsDown.length;

  // 高風險管段（給管理員 / 工程相關角色看）
  const criticalPipes = state.pipes.filter(p => p.risk === "critical").length;

  return (
    <>
      <SP.PageHeader
        title={"您好，" + user.name + "（" + SP.roleLabel(user.role) + "）"}
        subtitle={isHQ
          ? "全國檢修漏案件管理 ・ 今日 " + SP.format.date(new Date().toISOString())
          : "區處：" + region + " ・ 今日 " + SP.format.date(new Date().toISOString())}
        breadcrumb={["首頁"]}
        rfp="附錄一 三(一) 系統首頁"
        actions={
          showAllCases ? (
            <>
              <SP.Button variant="primary" icon="+" onClick={() => navigate("/case-flow")}>新案件</SP.Button>
              <SP.Button variant="secondary" onClick={() => navigate("/case-flow#dispatch")}>派工看板</SP.Button>
              <SP.Button variant="ghost" onClick={() => navigate("/annual-report")}>查看報表</SP.Button>
            </>
          ) : (
            <SP.Button variant="primary" onClick={() => navigate("/dashboard")}>進入我的工作</SP.Button>
          )
        }
      />

      {/* KPI 行 */}
      <div className="kpi-grid">
        <SP.KpiCard
          label={isHQ ? "全國案件總數" : "區處案件總數"}
          value={kpis.total}
          suffix="件"
          delta={8.4}
        />
        <SP.KpiCard
          label="進行中案件"
          value={kpis.open}
          suffix="件"
          tone={kpis.open > 30 ? "critical" : undefined}
        />
        <SP.KpiCard
          label="緊急案件"
          value={kpis.critical}
          suffix="件"
          tone="critical"
          hint="嚴重度 critical，需優先派工"
        />
        <SP.KpiCard
          label="本月結案率"
          value={closeRate + "%"}
          tone={closeRate >= 80 ? "pass" : undefined}
          delta={3.2}
        />
      </div>

      {/* 主內容：兩欄 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: "var(--space-5)" }}>

        {/* 左欄：最新案件 */}
        <div className="flex-col" style={{ gap: "var(--space-5)" }}>
          <SP.Card
            title={isHQ ? "全國最新案件" : "本區處最新案件"}
            subtitle={latestCases.length + " 件 ・ 依建立時間排序"}
            action={<SP.Button size="sm" variant="ghost" onClick={() => navigate("/case-flow")}>查看全部 →</SP.Button>}
          >
            <SP.Table
              compact
              headers={["案號", "案件", "區處", "嚴重度", "狀態"]}
              rows={latestCases.map(c => [
                <span className="font-mono text-sm">{c.caseNo}</span>,
                <span>{c.title}</span>,
                <span className="text-sm muted">{c.region}</span>,
                <SP.SeverityBadge severity={c.severity} />,
                <SP.StatusBadge status={c.status} />,
              ])}
            />
          </SP.Card>

          {/* 我的待辦（指派給我的案件） */}
          {myCases.length > 0 && (
            <SP.Card
              title="我的待辦"
              subtitle={"指派給我未結案的案件，共 " + myCases.length + " 件"}
              action={<SP.Button size="sm" variant="ghost" onClick={() => navigate("/case-flow#kanban")}>我的案件 →</SP.Button>}
            >
              <SP.Table
                compact
                headers={["案號", "案件", "嚴重度", "狀態", "更新"]}
                rows={myCases.map(c => [
                  <span className="font-mono text-sm">{c.caseNo}</span>,
                  <span>{c.title}</span>,
                  <SP.SeverityBadge severity={c.severity} />,
                  <SP.StatusBadge status={c.status} />,
                  <span className="text-sm muted">{SP.format.date(c.updatedAt)}</span>,
                ])}
              />
            </SP.Card>
          )}
        </div>

        {/* 右欄：通知 + 系統狀態 */}
        <div className="flex-col" style={{ gap: "var(--space-5)" }}>

          {/* 通知 */}
          <SP.Card
            title="未讀通知"
            subtitle={myNotifications.length + " 則待處理"}
          >
            {myNotifications.length === 0 ? (
              <div className="text-sm muted" style={{ textAlign: "center", padding: "var(--space-4)" }}>目前無未讀通知</div>
            ) : (
              <div className="flex-col" style={{ gap: "var(--space-3)" }}>
                {myNotifications.map(n => (
                  <div key={n.id} style={notifItemStyle}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
                      <strong style={{ fontSize: "var(--text-sm)" }}>{n.title}</strong>
                      <SP.Badge tone={notifTone(n.kind)}>{notifLabel(n.kind)}</SP.Badge>
                    </div>
                    <div className="text-sm muted mt-2">{n.body}</div>
                    <div className="text-xs muted mt-2">{SP.format.datetime(n.at)}</div>
                  </div>
                ))}
              </div>
            )}
          </SP.Card>

          {/* 介接系統狀態 */}
          <SP.Card
            title="介接系統狀態"
            subtitle={"健康 " + healthyCount + " / " + state.integrations.length + " 系統"}
            action={<SP.Button size="sm" variant="ghost" onClick={() => navigate("/integration")}>監控 →</SP.Button>}
          >
            {integrationsDown.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--color-pass)" }}>✓ 全部系統正常</div>
            ) : (
              <div className="flex-col" style={{ gap: "var(--space-2)" }}>
                {integrationsDown.map(i => (
                  <div key={i.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <SP.StatusDot tone={i.status === "down" ? "critical" : "high"} />
                    <span className="text-sm" style={{ flex: 1 }}>{i.name}</span>
                    <SP.Badge tone={i.status === "down" ? "critical" : "high"}>
                      {i.status === "down" ? "離線" : "降級"}
                    </SP.Badge>
                  </div>
                ))}
              </div>
            )}
          </SP.Card>

          {/* 高風險管段（限管理員 / hq / region / plant） */}
          {["admin", "hq", "region", "plant"].includes(user.role) && (
            <SP.Card
              title="高風險管段"
              subtitle="風險評分 critical"
              action={<SP.Button size="sm" variant="ghost" onClick={() => navigate("/case-flow")}>地圖 →</SP.Button>}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
                <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--color-critical)" }}>{criticalPipes}</div>
                <div className="text-sm muted">/ {state.pipes.length} 段</div>
              </div>
              <div className="text-sm muted mt-2">管齡 &gt; 40 年的管段，建議列入年度汰換計畫。</div>
            </SP.Card>
          )}
        </div>
      </div>
    </>
  );
};

/* ---------- helpers ---------- */
const notifItemStyle = {
  padding: "var(--space-3)",
  border: "1px solid var(--border-base)",
  borderRadius: "var(--radius-md)",
  background: "var(--bg-muted)",
};

function notifTone(kind) {
  return {
    new_case:   "info",
    dispatched: "high",
    kpi:        "pass",
    security:   "critical",
    audit:      "medium",
  }[kind] || "neutral";
}

function notifLabel(kind) {
  return {
    new_case:   "新案件",
    dispatched: "派工",
    kpi:        "KPI",
    security:   "資安",
    audit:      "稽核",
  }[kind] || kind;
}
