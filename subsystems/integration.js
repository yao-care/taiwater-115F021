/* ============================================================
   subsystems/integration.js — 介接管理（14 系統 + 健康度 + 架構圖 + WMTS）
   ============================================================ */

window.SP = window.SP || {};

const { Routes: IRoutes2, Route: IRoute2, useNavigate: useINav } = ReactRouterDOM;

SP.IntegrationPage = function IntegrationPage() {
  return (
    <IRoutes2>
      <IRoute2 path="/"          element={<SP.IntegrationList />} />
      <IRoute2 path="/health"    element={<SP.IntegrationHealth />} />
      <IRoute2 path="/topology"  element={<SP.IntegrationTopology />} />
      <IRoute2 path="/wmts"      element={<SP.IntegrationWmts />} />
      <IRoute2 path="/logs"      element={<SP.IntegrationLogs />} />
      <IRoute2 path="*"          element={<SP.IntegrationList />} />
    </IRoutes2>
  );
};

SP.IntegrationList = function IntegrationList() {
  const { state } = SP.useStore();
  const navigate = useINav();
  return (
    <>
      <SP.PageHeader title="介接系統清單" subtitle="14 個外部系統 ・ 統一管理" breadcrumb={["首頁", "介接管理"]} rfp="附錄一 四(九)~(十五)" actions={
        <>
          <SP.Button variant="primary" onClick={() => navigate("/integration/health")}>健康度監控</SP.Button>
          <SP.Button variant="secondary" onClick={() => navigate("/integration/topology")}>架構圖</SP.Button>
        </>
      } />
      <SP.Card padding="0">
        <SP.Table headers={["名稱", "協定", "Owner", "Endpoint", "狀態", "延遲", "錯誤率"]} rows={state.integrations.map(i => [
          <span style={{ fontWeight: 600 }}>{i.name}</span>,
          <SP.Badge tone="info">{i.protocol}</SP.Badge>,
          <span className="text-sm muted">{i.owner}</span>,
          <span className="text-xs font-mono muted">{i.endpoint}</span>,
          <SP.Badge tone={i.status === "down" ? "critical" : i.status === "degraded" ? "high" : "pass"}>{i.status === "down" ? "離線" : i.status === "degraded" ? "降級" : "正常"}</SP.Badge>,
          <span className="text-sm">{i.latencyMs} ms</span>,
          <span className="text-sm">{(i.errorRate24h * 100).toFixed(2)}%</span>,
        ])} />
      </SP.Card>
    </>
  );
};

SP.IntegrationHealth = function IntegrationHealth() {
  const { state } = SP.useStore();
  const navigate = useINav();
  const healthy = state.integrations.filter(i => i.status === "healthy").length;
  return (
    <>
      <SP.PageHeader title="健康度監控" subtitle="即時系統可用率" breadcrumb={["首頁", "介接", "健康度"]} rfp="附錄一 四(九)" actions={<SP.Button variant="ghost" onClick={() => navigate("/integration")}>返回</SP.Button>} />
      <div className="kpi-grid">
        <SP.KpiCard label="健康系統"   value={healthy} suffix={"/ " + state.integrations.length} tone="pass" />
        <SP.KpiCard label="降級系統"   value={state.integrations.filter(i => i.status === "degraded").length} suffix="個" tone="high" />
        <SP.KpiCard label="離線系統"   value={state.integrations.filter(i => i.status === "down").length} suffix="個" tone="critical" />
        <SP.KpiCard label="平均延遲"   value={Math.round(state.integrations.reduce((s, i) => s + i.latencyMs, 0) / state.integrations.length)} suffix="ms" />
      </div>
      <SP.Card title="系統健康度" subtitle="可手動同步 / 重試">
        <div className="flex-col" style={{ gap: "var(--space-3)" }}>
          {state.integrations.map(i => (
            <div key={i.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", background: "var(--bg-surface)", border: "1px solid var(--border-base)", borderRadius: "var(--radius-md)" }}>
              <SP.StatusDot tone={i.status === "down" ? "critical" : i.status === "degraded" ? "high" : "pass"} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{i.name}</div>
                <div className="text-xs muted">{i.protocol} ・ {i.endpoint} ・ 最後同步：{SP.format.datetime(i.lastSyncAt)}</div>
              </div>
              <span className="text-sm">{i.latencyMs} ms</span>
              <SP.Badge tone={i.status === "down" ? "critical" : i.status === "degraded" ? "high" : "pass"}>{i.status === "down" ? "離線" : i.status === "degraded" ? "降級" : "正常"}</SP.Badge>
              <SP.Button size="sm" variant="secondary">手動同步</SP.Button>
            </div>
          ))}
        </div>
      </SP.Card>
    </>
  );
};

/* ---------- 介接架構 topology（D3 force layout 簡化版） ---------- */
SP.IntegrationTopology = function IntegrationTopology() {
  const { state } = SP.useStore();
  const navigate = useINav();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || !window.d3) return;
    const node = ref.current;
    const width = node.clientWidth || 800;
    const height = 600;
    const svg = d3.select(node).attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);
    svg.selectAll("*").remove();

    // 中央節點：檢修漏管理系統
    const cx = width / 2, cy = height / 2;
    const ext = state.integrations.map((i, idx) => {
      const angle = (idx / state.integrations.length) * Math.PI * 2;
      return { ...i, x: cx + Math.cos(angle) * 240, y: cy + Math.sin(angle) * 220 };
    });

    // 連線
    svg.append("g").selectAll("line").data(ext).enter().append("line")
      .attr("x1", cx).attr("y1", cy)
      .attr("x2", d => d.x).attr("y2", d => d.y)
      .attr("stroke", d => d.status === "down" ? "var(--color-critical)" : d.status === "degraded" ? "var(--color-high)" : "var(--tw-accent)")
      .attr("stroke-width", 1.5).attr("opacity", 0.5);

    // 中央節點
    svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 64).attr("fill", "var(--tw-primary)");
    svg.append("text").attr("x", cx).attr("y", cy - 4).attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "14px").attr("font-weight", 700).text("檢修漏");
    svg.append("text").attr("x", cx).attr("y", cy + 14).attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "12px").text("管理系統");

    // 外部節點
    const g = svg.append("g").selectAll("g").data(ext).enter().append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);
    g.append("circle").attr("r", 36)
      .attr("fill", d => d.status === "down" ? "var(--color-critical)" : d.status === "degraded" ? "var(--color-high)" : "var(--bg-surface)")
      .attr("stroke", "var(--border-strong)").attr("stroke-width", 1.5);
    g.append("text").attr("y", -2).attr("text-anchor", "middle").attr("font-size", "11px").attr("font-weight", 600).text(d => d.name.split(" ")[0]);
    g.append("text").attr("y", 12).attr("text-anchor", "middle").attr("font-size", "9px").attr("fill", "var(--text-muted)").text(d => d.protocol);
  }, [state.integrations.length]);

  return (
    <>
      <SP.PageHeader title="介接架構圖" subtitle="14 系統 topology" breadcrumb={["首頁", "介接", "架構圖"]} rfp="D03" actions={<SP.Button variant="ghost" onClick={() => navigate("/integration")}>返回</SP.Button>} />
      <SP.Card>
        <svg ref={ref} style={{ width: "100%", display: "block" }} />
        <div className="text-xs muted mt-2" style={{ textAlign: "center" }}>中央為本系統 ・ 14 個外部介接系統（依協定 / 健康度色彩編碼）</div>
      </SP.Card>
    </>
  );
};

SP.IntegrationWmts = function IntegrationWmts() {
  const { state } = SP.useStore();
  const navigate = useINav();
  const [layers, setLayers] = React.useState({ wmts: true, wms: false, pipes: false, cases: true });
  return (
    <>
      <SP.PageHeader title="WMTS / WMS 圖層" subtitle="內政部底圖 + 道路圖層 + 管段 + 案件" breadcrumb={["首頁", "介接", "WMTS"]} rfp="附錄一 四(四)2" actions={<SP.Button variant="ghost" onClick={() => navigate("/integration")}>返回</SP.Button>} />
      <SP.WmtsToggle layers={layers} onChange={setLayers} />
      <div className="mt-4">
        <SP.GisMap cases={state.cases.slice(0, 30)} pipes={state.pipes} height={520} layers={layers} />
      </div>
    </>
  );
};

SP.IntegrationLogs = function IntegrationLogs() {
  const { state } = SP.useStore();
  const navigate = useINav();
  return (
    <>
      <SP.PageHeader title="介接 log" subtitle="近期同步記錄" breadcrumb={["首頁", "介接", "log"]} rfp="附錄一 四(九)~(十五)" actions={<SP.Button variant="ghost" onClick={() => navigate("/integration")}>返回</SP.Button>} />
      <SP.Card padding="0">
        <SP.Table headers={["時間", "系統", "事件", "狀態", "延遲"]} rows={state.integrations.map((i, idx) => [
          <span className="text-sm muted">{SP.format.datetime(i.lastSyncAt)}</span>,
          <span style={{ fontWeight: 600 }}>{i.name}</span>,
          <span className="text-sm">同步資料</span>,
          <SP.Badge tone={i.status === "healthy" ? "pass" : i.status === "degraded" ? "high" : "critical"}>{i.status}</SP.Badge>,
          <span className="text-sm">{i.latencyMs} ms</span>,
        ])} />
      </SP.Card>
    </>
  );
};
