/* ============================================================
   subsystems/repair.js — 修漏子系統 C1-C6
   階段 3 核心頁：派工看板（DispatchBoard）+ 案件詳情 + 案件申報
   ============================================================ */

window.SP = window.SP || {};

const { Routes, Route, useNavigate, useParams, useLocation } = ReactRouterDOM;

/* ---------- 子系統 Router ---------- */
SP.RepairPage = function RepairPage() {
  return (
    <Routes>
      <Route path="/"                 element={<SP.RepairHome />} />
      <Route path="/dispatch-board"   element={<SP.DispatchBoardPage />} />
      <Route path="/dispatch"         element={<SP.DispatchManage />} />
      <Route path="/cases"            element={<SP.CaseReportPage />} />
      <Route path="/cases/:caseId"    element={<SP.CaseDetailPage />} />
      <Route path="/records"          element={<SP.RepairRecords />} />
      <Route path="/statistics"       element={<SP.RepairStatistics />} />
      <Route path="/reports"          element={<SP.RepairReports />} />
      <Route path="/admin"            element={<SP.RepairAdmin />} />
      <Route path="*"                 element={<SP.RepairHome />} />
    </Routes>
  );
};

/* ---------- RepairHome 修漏首頁 ---------- */
SP.RepairHome = function RepairHome() {
  const { state } = SP.useStore();
  const navigate = useNavigate();
  const user = state.currentUser;
  const region = user?.region || state.currentRegion;
  const plant = user?.plant;

  const myCases = state.cases.filter(c =>
    (!plant || c.plant === plant) && c.status !== "結案"
  );
  const overdue = myCases.filter(c => {
    const days = (Date.now() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
    return days > 7;
  });
  const newCases = myCases.filter(c => c.status === "申報");
  const inProgress = myCases.filter(c => ["派工", "檢漏中", "待修", "修復中", "已修"].includes(c.status));

  return (
    <>
      <SP.PageHeader
        title="修漏子系統"
        subtitle={(plant || region) + " ・ 後送 / 移辦 / 逾期一覽"}
        breadcrumb={["首頁", "修漏子系統"]}
        rfp="附錄一 四(一)"
        actions={
          <>
            <SP.Button variant="primary" onClick={() => navigate("/repair/dispatch-board")}>進入派工看板</SP.Button>
            <SP.Button variant="secondary" onClick={() => navigate("/repair/cases")}>新案件申報</SP.Button>
          </>
        }
      />

      <div className="kpi-grid">
        <SP.KpiCard label="未派工"   value={newCases.length}    suffix="件" tone={newCases.length > 0 ? "critical" : undefined} />
        <SP.KpiCard label="進行中"   value={inProgress.length}  suffix="件" />
        <SP.KpiCard label="逾期 > 7 天" value={overdue.length}   suffix="件" tone="critical" />
        <SP.KpiCard label="本月結案" value={state.cases.filter(c => c.plant === plant && c.status === "結案").length} suffix="件" tone="pass" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "var(--space-5)" }}>
        <SP.Card title="新申報待派工" subtitle={newCases.length + " 件" } action={
          <SP.Button size="sm" variant="ghost" onClick={() => navigate("/repair/dispatch-board")}>派工看板 →</SP.Button>
        }>
          <div className="flex-col" style={{ gap: "var(--space-2)" }}>
            {newCases.slice(0, 5).map(c => (
              <SP.CaseCard key={c.id} caseItem={c} compact onClick={() => navigate("/repair/cases/" + c.id)} />
            ))}
            {newCases.length === 0 && <div className="text-sm muted" style={{ textAlign: "center", padding: "var(--space-3)" }}>無待派工案件</div>}
          </div>
        </SP.Card>

        <SP.Card title="逾期案件" subtitle={overdue.length + " 件，建議優先處理"}>
          <div className="flex-col" style={{ gap: "var(--space-2)" }}>
            {overdue.slice(0, 5).map(c => (
              <SP.CaseCard key={c.id} caseItem={c} compact onClick={() => navigate("/repair/cases/" + c.id)} />
            ))}
            {overdue.length === 0 && <div className="text-sm muted" style={{ textAlign: "center", padding: "var(--space-3)" }}>無逾期案件</div>}
          </div>
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- DispatchBoardPage 派工看板 ---------- */
SP.DispatchBoardPage = function DispatchBoardPage() {
  const { state, dispatch } = SP.useStore();
  const navigate = useNavigate();
  const toast = SP.useToast();
  const user = state.currentUser;
  const region = user?.region || state.currentRegion;
  const plant = user?.plant;

  const visibleCases = state.cases.filter(c =>
    (user?.role === "admin" || user?.role === "hq") ? true
    : plant ? c.plant === plant
    : c.region === region
  );

  const inspectors = state.users.filter(u => u.role === "inspector" && u.region === region);
  const repairers  = state.users.filter(u => u.role === "repairer"  && u.region === region);

  const onDispatchInspector = (c) => {
    if (inspectors.length === 0) {
      toast({ kind: "critical", title: "無可用檢漏員", body: "本區處無檢漏員" });
      return;
    }
    const target = inspectors[0];  // 一鍵化：自動帶最近檢漏員（POC 取第一個）
    dispatch({
      type: "DISPATCH_TO_INSPECTOR",
      payload: { caseId: c.id, inspectorId: target.id, fromUserId: user.id },
    });
    toast({ kind: "pass", title: "已派檢漏員", body: target.name + " ・ " + c.caseNo });
  };

  const onDispatchRepairer = (c) => {
    if (repairers.length === 0) {
      toast({ kind: "critical", title: "無可用修漏員", body: "本區處無修漏員" });
      return;
    }
    const target = repairers[0];
    dispatch({
      type: "DISPATCH_TO_REPAIRER",
      payload: { caseId: c.id, repairerId: target.id, fromUserId: user.id },
    });
    toast({ kind: "pass", title: "已派修漏員", body: target.name + " ・ " + c.caseNo });
  };

  return (
    <>
      <SP.PageHeader
        title="派工看板"
        subtitle={"一鍵派工 ・ " + (plant || region) + " ・ 檢漏員 " + inspectors.length + " 人 / 修漏員 " + repairers.length + " 人"}
        breadcrumb={["首頁", "修漏", "派工看板"]}
        rfp="附錄一 四(四)"
        actions={
          <SP.Button variant="secondary" onClick={() => navigate("/repair")}>返回</SP.Button>
        }
      />

      <SP.DispatchBoard
        cases={visibleCases.slice(0, 20)}
        onDispatchInspector={onDispatchInspector}
        onDispatchRepairer={onDispatchRepairer}
        onSelectCase={(c) => navigate("/repair/cases/" + c.id)}
      />

      <div className="mt-6">
        <SP.Card title="本區處團隊" subtitle="檢漏員 / 修漏員清單">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>檢漏員（{inspectors.length}）</div>
              <div className="flex-col" style={{ gap: "var(--space-1)" }}>
                {inspectors.slice(0, 5).map(u => (
                  <div key={u.id} className="text-sm" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{u.name}</span>
                    <span className="muted">{u.plant}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>修漏員（{repairers.length}）</div>
              <div className="flex-col" style={{ gap: "var(--space-1)" }}>
                {repairers.slice(0, 5).map(u => (
                  <div key={u.id} className="text-sm" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{u.name}</span>
                    <span className="muted">{u.plant}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- DispatchManage 派工管理（列表 + 過往派工紀錄） ---------- */
SP.DispatchManage = function DispatchManage() {
  const { state } = SP.useStore();
  const navigate = useNavigate();
  const userMap = Object.fromEntries(state.users.map(u => [u.id, u]));
  const caseMap = Object.fromEntries(state.cases.map(c => [c.id, c]));

  return (
    <>
      <SP.PageHeader
        title="派工管理"
        subtitle="過往派工紀錄 ・ 含檢漏 / 修漏"
        breadcrumb={["首頁", "修漏", "派工管理"]}
        rfp="附錄一 四(四)"
      />
      <SP.Card title="派工紀錄" subtitle={"近 " + state.dispatches.length + " 筆"} action={
        <SP.Button size="sm" variant="primary" onClick={() => navigate("/repair/dispatch-board")}>進入派工看板</SP.Button>
      }>
        <SP.Table
          headers={["時間", "案號", "派工人", "受派人", "類別", "備註"]}
          rows={state.dispatches.slice(0, 20).map(d => {
            const c = caseMap[d.caseId];
            return [
              <span className="text-sm muted">{SP.format.datetime(d.at)}</span>,
              c ? <a onClick={() => navigate("/repair/cases/" + c.id)} style={{ cursor: "pointer" }}>{c.caseNo}</a> : "—",
              <span className="text-sm">{userMap[d.from]?.name || d.from}</span>,
              <span className="text-sm">{userMap[d.to]?.name || d.to}</span>,
              <SP.Badge tone={d.kind === "inspect" ? "info" : "high"}>{d.kind === "inspect" ? "檢漏" : "修漏"}</SP.Badge>,
              <span className="text-sm muted">{d.note}</span>,
            ];
          })}
        />
      </SP.Card>
    </>
  );
};

/* ---------- CaseReportPage 案件申報（cs/plant） ---------- */
SP.CaseReportPage = function CaseReportPage() {
  const { state, dispatch } = SP.useStore();
  const navigate = useNavigate();
  const toast = SP.useToast();
  const user = state.currentUser;
  const [form, setForm] = React.useState({
    title: "",
    region: user?.region || "第四區處（中港）",
    address: "",
    severity: "high",
    reporter: "",
    reporterPhone: "",
    reason: "",
  });

  const submit = () => {
    if (!form.title || !form.address) {
      toast({ kind: "critical", title: "請填案件標題與地址" });
      return;
    }
    const id = dispatch({
      type: "CREATE_CASE_FROM_CS",
      payload: {
        ...form,
        title: form.title || (form.address + " " + form.reason),
        plant: SP.PLANTS_BY_REGION[form.region]?.[0] || "—",
        byUserId: user.id,
        byName: user.name,
      },
    });
    toast({ kind: "pass", title: "已建立案件", body: "自動推派 " + form.region + "，通知廠所" });
    setTimeout(() => navigate("/repair/dispatch-board"), 600);
  };

  return (
    <>
      <SP.PageHeader
        title="案件申報"
        subtitle="客服 / 廠所人員 ・ 線上申報"
        breadcrumb={["首頁", "修漏", "案件申報"]}
        rfp="附錄一 四(三)"
      />
      <SP.Card title="新案件" subtitle="一鍵建立後自動推派最近廠所">
        <SP.FormRow label="案件標題" required>
          <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="如：北區雙十路二段地面冒水" />
        </SP.FormRow>
        <div className="form-grid form-grid--cols-2 mt-4">
          <SP.FormRow label="區處" required>
            <select className="form-control" value={form.region} onChange={e => setForm({...form, region: e.target.value})}>
              {SP.REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </SP.FormRow>
          <SP.FormRow label="嚴重度">
            <select className="form-control" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
              <option value="critical">緊急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </SP.FormRow>
        </div>
        <SP.FormRow label="地址" required>
          <input className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="如：中港路二段 100 號附近" />
        </SP.FormRow>
        <div className="form-grid form-grid--cols-2 mt-4">
          <SP.FormRow label="通報人">
            <input className="form-control" value={form.reporter} onChange={e => setForm({...form, reporter: e.target.value})} placeholder="—" />
          </SP.FormRow>
          <SP.FormRow label="通報電話">
            <input className="form-control" value={form.reporterPhone} onChange={e => setForm({...form, reporterPhone: e.target.value})} placeholder="0912-xxx-xxx" />
          </SP.FormRow>
        </div>
        <SP.FormRow label="漏水原因">
          <input className="form-control" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="地面冒水 / 水壓不足 / 馬路凹陷..." />
        </SP.FormRow>
        <div className="mt-6" style={{ display: "flex", gap: "var(--space-3)" }}>
          <SP.Button variant="primary" size="lg" onClick={submit}>+ 一鍵建立案件</SP.Button>
          <SP.Button variant="secondary" onClick={() => navigate("/repair")}>取消</SP.Button>
        </div>
      </SP.Card>
    </>
  );
};

/* ---------- CaseDetailPage 案件詳情 ---------- */
SP.CaseDetailPage = function CaseDetailPage() {
  const { state, dispatch } = SP.useStore();
  const navigate = useNavigate();
  const toast = SP.useToast();
  const { caseId } = useParams();
  const user = state.currentUser;
  const c = state.cases.find(x => x.id === caseId);

  if (!c) {
    return (
      <>
        <SP.PageHeader title="案件不存在" breadcrumb={["首頁", "修漏", "案件詳情"]} />
        <SP.Button onClick={() => navigate("/repair")}>返回</SP.Button>
      </>
    );
  }

  const inspectors = state.users.filter(u => u.role === "inspector" && u.region === c.region);
  const repairers  = state.users.filter(u => u.role === "repairer"  && u.region === c.region);

  const dispatchInspector = () => {
    if (inspectors.length === 0) return toast({ kind: "critical", title: "無可用檢漏員" });
    dispatch({ type: "DISPATCH_TO_INSPECTOR", payload: { caseId: c.id, inspectorId: inspectors[0].id, fromUserId: user.id } });
    toast({ kind: "pass", title: "已派檢漏員", body: inspectors[0].name });
  };
  const dispatchRepairer = () => {
    if (repairers.length === 0) return toast({ kind: "critical", title: "無可用修漏員" });
    dispatch({ type: "DISPATCH_TO_REPAIRER", payload: { caseId: c.id, repairerId: repairers[0].id, fromUserId: user.id } });
    toast({ kind: "pass", title: "已派修漏員", body: repairers[0].name });
  };

  return (
    <>
      <SP.PageHeader
        title={c.caseNo + " ・ " + c.title}
        subtitle={c.region + " / " + c.plant + " ・ 建立 " + SP.format.datetime(c.createdAt)}
        breadcrumb={["首頁", "修漏", "案件詳情"]}
        rfp={c.rfp}
        actions={
          <>
            {c.status === "申報" && <SP.Button variant="primary" onClick={dispatchInspector}>一鍵派檢漏員</SP.Button>}
            {c.status === "待修" && <SP.Button variant="primary" onClick={dispatchRepairer}>一鍵派修漏員</SP.Button>}
            <SP.Button variant="secondary" onClick={() => navigate("/repair/dispatch-board")}>派工看板</SP.Button>
          </>
        }
      />

      {/* status flow */}
      <SP.Card title="案件流程" padding={"var(--space-4)"}>
        <SP.CaseStatusFlow status={c.status} />
      </SP.Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "var(--space-5)", marginTop: "var(--space-5)" }}>
        <SP.Card title="案件資訊">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-3)" }}>
            <Info label="嚴重度" value={<SP.SeverityBadge severity={c.severity} />} />
            <Info label="目前狀態" value={<SP.StatusBadge status={c.status} />} />
            <Info label="案件來源" value={c.source} />
            <Info label="通報人 / 電話" value={(c.reporter || "—") + " / " + (c.reporterPhone || "—")} />
            <Info label="地址" value={c.address} />
            <Info label="GPS" value={c.lng.toFixed(4) + ", " + c.lat.toFixed(4)} />
            <Info label="預估漏水量" value={(c.estimatedLoss || 0) + " 噸 / 日"} />
            <Info label="負責人" value={state.users.find(u => u.id === c.assignedTo)?.name || "—"} />
          </div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <div className="text-sm muted" style={{ marginBottom: "var(--space-2)" }}>位置地圖</div>
            <SP.GisMap
              cases={[c]}
              height={240}
              focus={c}
              layers={{ wmts: true, wms: false, pipes: false, cases: true }}
            />
          </div>
        </SP.Card>

        <SP.Card title="Timeline">
          <SP.CaseTimeline timeline={c.timeline} users={state.users} />
        </SP.Card>
      </div>

      {/* 檢漏 / 修漏紀錄 */}
      <div className="mt-6">
        <SP.Card title="現場紀錄">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>檢漏紀錄</div>
              {(state.inspections.filter(i => i.caseId === c.id)).length === 0
                ? <div className="text-sm muted">尚無</div>
                : state.inspections.filter(i => i.caseId === c.id).map(i => (
                    <div key={i.id} className="text-sm" style={{ padding: "var(--space-2)", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", marginBottom: "var(--space-2)" }}>
                      <div><strong>{state.users.find(u => u.id === i.by)?.name || i.by}</strong> ・ {SP.format.datetime(i.at)}</div>
                      <div className="muted">方法：{i.method} ・ 照片 {i.photos?.length || 0} 張</div>
                      <div>{i.note}</div>
                    </div>
                  ))
              }
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: "var(--space-2)" }}>修漏紀錄</div>
              {(state.repairs.filter(r => r.caseId === c.id)).length === 0
                ? <div className="text-sm muted">尚無</div>
                : state.repairs.filter(r => r.caseId === c.id).map(r => (
                    <div key={r.id} className="text-sm" style={{ padding: "var(--space-2)", background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", marginBottom: "var(--space-2)" }}>
                      <div><strong>{state.users.find(u => u.id === r.by)?.name || r.by}</strong> ・ {SP.format.datetime(r.at)}</div>
                      <div className="muted">方法：{r.method} ・ 挖填：{r.excavation} ・ 費用 {SP.format.money(r.cost)}</div>
                      <div>{r.note}</div>
                    </div>
                  ))
              }
            </div>
          </div>
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

/* ============================================================
   修漏子系統葉子（依 sitemap C 模組展開）
   ============================================================ */

/* ---------- 修漏記錄查詢 四(五) ---------- */
SP.RepairRecords = function RepairRecords() {
  const { state } = SP.useStore();
  const reports = [
    { id: "C16", name: "漏水情形管制月報",   freq: "月" },
    { id: "C17", name: "漏水原因分析表",     freq: "月" },
    { id: "C18", name: "修漏記錄簿",         freq: "週" },
    { id: "C19", name: "修漏記錄簿二（附件）", freq: "週" },
    { id: "C20", name: "管線修理統計表",     freq: "月" },
    { id: "C21", name: "管線漏水密度及修理費用", freq: "月" },
    { id: "C22", name: "路平專案報表",       freq: "季" },
    { id: "C23", name: "搶修器材儲備明細表", freq: "週" },
    { id: "C24", name: "管線修復速率表",     freq: "月" },
  ];
  return (
    <SP.RfpLeafPage
      icon="📓"
      title="修漏記錄查詢"
      subtitle="9 個子報表 ・ 依條件查詢 / 匯出"
      breadcrumb={["首頁", "修漏", "記錄查詢"]}
      rfp="附錄一 四(五)"
      sections={[
        {
          title: "本月修漏紀錄",
          subtitle: state.repairs.length + " 筆",
          kind: "table",
          headers: ["案號", "修漏員", "方法", "挖填", "費用", "時間"],
          rows: state.repairs.slice(0, 10).map(r => {
            const c = state.cases.find(x => x.id === r.caseId);
            const u = state.users.find(x => x.id === r.by);
            return [
              <span className="font-mono text-sm">{c?.caseNo || "—"}</span>,
              <span className="text-sm">{u?.name || r.by}</span>,
              <span className="text-sm">{r.method}</span>,
              <span className="text-sm">{r.excavation}</span>,
              <span className="text-sm font-mono">{SP.format.money(r.cost)}</span>,
              <span className="text-sm muted">{SP.format.datetime(r.at)}</span>,
            ];
          }),
        },
        {
          title: "9 個子報表",
          kind: "table",
          headers: ["編號", "報表", "頻率", "操作"],
          rows: reports.map(r => [
            <span className="font-mono text-sm">{r.id}</span>,
            <span style={{ fontWeight: 600 }}>{r.name}</span>,
            <SP.Badge tone="info">{r.freq}</SP.Badge>,
            <span style={{ display: "inline-flex", gap: "0.5rem" }}>
              <SP.Button size="sm" variant="primary">預覽</SP.Button>
              <SP.Button size="sm" variant="secondary">ODF</SP.Button>
            </span>,
          ]),
        },
      ]}
    />
  );
};

/* ---------- 統計分析 四(六) ---------- */
SP.RepairStatistics = function RepairStatistics() {
  const { state } = SP.useStore();
  const items = [
    { id: "C25", name: "物料與其他材料統計", desc: "DIP / PVC / PE 用量分類" },
    { id: "C26", name: "各作業登錄時間追蹤", desc: "派工 → 抵達 → 開工 → 完工" },
    { id: "C27", name: "管線財產查詢",       desc: "200 段管線資產清冊" },
    { id: "C28", name: "委外實修項目統計",   desc: "20 家配合廠商實作量" },
    { id: "C29", name: "回收廢料統計",       desc: "舊管材 / 回填土回收量" },
    { id: "C30", name: "自訂統計圖表",       desc: "拖拉式 BI 圖表組合" },
    { id: "C31", name: "久未結案案件查詢",   desc: "&gt; 30 天未結案" },
  ];
  return (
    <SP.RfpLeafPage
      icon="📊"
      title="統計分析"
      subtitle="7 個分析項目"
      breadcrumb={["首頁", "修漏", "統計分析"]}
      rfp="附錄一 四(六)"
      sections={[
        {
          title: "本月關鍵指標",
          kind: "kpis",
          kpis: [
            { label: "修漏件數",   value: state.repairs.length, suffix: "件", tone: "pass" },
            { label: "總費用",     value: SP.format.money(state.repairs.reduce((s, r) => s + r.cost, 0)) },
            { label: "平均挖填",   value: "1.2", suffix: "m³ / 件" },
            { label: "委外比例",   value: "62", suffix: "%" },
          ],
        },
        {
          title: "7 個分析子項",
          kind: "table",
          headers: ["編號", "項目", "說明", "操作"],
          rows: items.map(it => [
            <span className="font-mono text-sm">{it.id}</span>,
            <span style={{ fontWeight: 600 }}>{it.name}</span>,
            <span className="text-sm muted">{it.desc}</span>,
            <SP.Button size="sm" variant="primary">查詢</SP.Button>,
          ]),
        },
      ]}
    />
  );
};

/* ---------- 報表列印 四(七) ---------- */
SP.RepairReports = function RepairReports() {
  const items = [
    { id: "C32", name: "申報案件列印",            desc: "個案完整資料表 / A4 直印" },
    { id: "C33", name: "廠商實修報表管理",        desc: "依廠商統計實作量" },
    { id: "C34", name: "進階條件式查詢 1",         desc: "多條件組合查詢" },
    { id: "C35", name: "進階條件式查詢 2",         desc: "含 GIS 地圖選取" },
  ];
  return (
    <SP.RfpLeafPage
      icon="📄"
      title="報表列印"
      subtitle="4 個報表 ・ 含進階條件式查詢"
      breadcrumb={["首頁", "修漏", "報表列印"]}
      rfp="附錄一 四(七)"
      sections={[{
        title: "報表清單",
        kind: "table",
        headers: ["編號", "報表", "說明", "操作"],
        rows: items.map(it => [
          <span className="font-mono text-sm">{it.id}</span>,
          <span style={{ fontWeight: 600 }}>{it.name}</span>,
          <span className="text-sm muted">{it.desc}</span>,
          <span style={{ display: "inline-flex", gap: "0.5rem" }}>
            <SP.Button size="sm" variant="primary">預覽</SP.Button>
            <SP.Button size="sm" variant="secondary">列印</SP.Button>
          </span>,
        ]),
      }]}
    />
  );
};

/* ---------- 修漏系統管理 四(二) ---------- */
SP.RepairAdmin = function RepairAdmin() {
  const items = [
    { id: "C02", name: "修漏帳號權限管理", desc: "11 角色權限矩陣" },
    { id: "C03", name: "修漏登錄查詢",     desc: "登入歷史 / 失敗紀錄" },
    { id: "C04", name: "廠商管理",         desc: "20 家配合廠商 + 評分" },
    { id: "C05", name: "案件轉移",         desc: "跨廠所 / 跨區處轉案" },
    { id: "C06", name: "廠所轄區與聯絡名冊", desc: "13 區處 × 廠所 × 聯絡人" },
    { id: "C07", name: "權限審核",         desc: "新進帳號審核" },
  ];
  return (
    <SP.RfpLeafPage
      icon="⚙"
      title="修漏系統管理"
      subtitle="6 個系統管理項目"
      breadcrumb={["首頁", "修漏", "系統管理"]}
      rfp="附錄一 四(二)"
      sections={[{
        title: "管理項目",
        kind: "table",
        headers: ["編號", "項目", "說明", "操作"],
        rows: items.map(it => [
          <span className="font-mono text-sm">{it.id}</span>,
          <span style={{ fontWeight: 600 }}>{it.name}</span>,
          <span className="text-sm muted">{it.desc}</span>,
          <SP.Button size="sm" variant="secondary">進入</SP.Button>,
        ]),
      }]}
    />
  );
};
