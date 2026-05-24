/* ============================================================
   subsystems/inspection.js — 檢漏子系統 B
   階段 3 核心頁：檢漏首頁 + 案件處理單
   ============================================================ */

window.SP = window.SP || {};

const { Routes: IRoutes, Route: IRoute, useNavigate: useNav2, useParams: useParams2 } = ReactRouterDOM;

/* ---------- 子系統 Router ---------- */
SP.InspectionPage = function InspectionPage() {
  return (
    <IRoutes>
      <IRoute path="/"              element={<SP.InspectionHome />} />
      <IRoute path="/work"          element={<SP.InspectionCaseList />} />
      <IRoute path="/work/:caseId"  element={<SP.InspectionCaseDetail />} />
      <IRoute path="/advanced"      element={<SP.InspectionAdvanced />} />
      <IRoute path="/annual"        element={<SP.InspectionAnnual />} />
      <IRoute path="/reports"       element={<SP.InspectionReports />} />
      <IRoute path="/regulations"   element={<SP.InspectionRegulations />} />
      <IRoute path="/admin"         element={<SP.InspectionAdmin />} />
      <IRoute path="*"              element={<SP.InspectionHome />} />
    </IRoutes>
  );
};

/* ---------- InspectionHome 檢漏首頁 ---------- */
SP.InspectionHome = function InspectionHome() {
  const { state } = SP.useStore();
  const navigate = useNav2();
  const user = state.currentUser;

  // 本人 / 本廠所未輸入一覽
  const myCases = user?.role === "inspector"
    ? state.cases.filter(c => c.assignedTo === user.id && c.status !== "結案")
    : state.cases.filter(c => (!user?.plant || c.plant === user.plant) && ["派工", "檢漏中"].includes(c.status));

  const completedThisMonth = state.inspections.filter(i =>
    user?.role === "inspector" ? i.by === user.id : true
  ).length;

  return (
    <>
      <SP.PageHeader
        title="檢漏子系統"
        subtitle={(user?.plant || user?.region || "全國") + " ・ 通知變更 + 未輸入一覽"}
        breadcrumb={["首頁", "檢漏子系統"]}
        rfp="附錄一 三(一)"
        actions={<SP.Button variant="primary" onClick={() => navigate("/inspection/work")}>進入檢漏作業</SP.Button>}
      />

      <div className="kpi-grid">
        <SP.KpiCard label="未輸入案件" value={myCases.filter(c => c.status === "派工").length} suffix="件" tone="high" />
        <SP.KpiCard label="進行中"     value={myCases.length} suffix="件" />
        <SP.KpiCard label="本月已完成" value={completedThisMonth} suffix="件" tone="pass" />
        <SP.KpiCard label="個人達標率" value="88%" tone="pass" delta={2.1} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "var(--space-5)" }}>
        <SP.Card title="待處理案件" subtitle={myCases.length + " 件" } action={
          <SP.Button size="sm" variant="ghost" onClick={() => navigate("/inspection/work")}>查看全部 →</SP.Button>
        }>
          <div className="flex-col" style={{ gap: "var(--space-2)" }}>
            {myCases.slice(0, 6).map(c => (
              <SP.CaseCard key={c.id} caseItem={c} compact onClick={() => navigate("/inspection/work/" + c.id)} />
            ))}
            {myCases.length === 0 && <div className="text-sm muted" style={{ textAlign: "center", padding: "var(--space-3)" }}>無待處理案件</div>}
          </div>
        </SP.Card>

        <SP.Card title="檢漏案件地圖">
          <SP.GisMap cases={myCases.slice(0, 30)} height={300} layers={{ wmts: true, wms: false, pipes: false, cases: true }} onMarkerClick={c => navigate("/inspection/work/" + c.id)} />
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- InspectionCaseList 檢漏作業（案件處理單列表） ---------- */
SP.InspectionCaseList = function InspectionCaseList() {
  const { state } = SP.useStore();
  const navigate = useNav2();
  const user = state.currentUser;
  const [filter, setFilter] = React.useState("all");

  const allCases = user?.role === "inspector"
    ? state.cases.filter(c => c.assignedTo === user.id)
    : state.cases.filter(c => !user?.plant || c.plant === user.plant);

  const filtered = filter === "all" ? allCases : allCases.filter(c => c.status === filter);

  const filterOptions = [
    { value: "all",    label: "全部",  count: allCases.length },
    { value: "派工",   label: "派工中", count: allCases.filter(c => c.status === "派工").length },
    { value: "檢漏中", label: "檢漏中", count: allCases.filter(c => c.status === "檢漏中").length },
    { value: "待修",   label: "已檢漏", count: allCases.filter(c => c.status === "待修").length },
    { value: "結案",   label: "結案",   count: allCases.filter(c => c.status === "結案").length },
  ];

  return (
    <>
      <SP.PageHeader
        title="檢漏作業 / 案件處理單"
        subtitle={user?.role === "inspector" ? "我的指派" : (user?.plant || user?.region) + " 全部案件"}
        breadcrumb={["首頁", "檢漏子系統", "檢漏作業"]}
        rfp="附錄一 三(三)1"
      />

      <SP.Toolbar>
        <SP.CaseFilter value={filter} onChange={setFilter} options={filterOptions} />
      </SP.Toolbar>

      <SP.Card padding="0">
        <SP.Table
          headers={["案號", "案件", "區處 / 廠所", "嚴重度", "狀態", "建立", "操作"]}
          rows={filtered.slice(0, 30).map(c => [
            <span className="font-mono text-sm">{c.caseNo}</span>,
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", maxWidth: "20rem" }}>{c.title}</span>,
            <span className="text-sm muted">{c.region.replace("處", "")} / {c.plant}</span>,
            <SP.SeverityBadge severity={c.severity} />,
            <SP.StatusBadge status={c.status} />,
            <span className="text-sm muted">{SP.format.date(c.createdAt)}</span>,
            <SP.Button size="sm" variant="primary" onClick={() => navigate("/inspection/work/" + c.id)}>查看</SP.Button>,
          ])}
        />
      </SP.Card>
    </>
  );
};

/* ---------- InspectionCaseDetail 檢漏案件詳情 ---------- */
SP.InspectionCaseDetail = function InspectionCaseDetail() {
  const { state, dispatch } = SP.useStore();
  const navigate = useNav2();
  const toast = SP.useToast();
  const { caseId } = useParams2();
  const user = state.currentUser;
  const c = state.cases.find(x => x.id === caseId);

  if (!c) return <SP.PlaceholderPage icon="❓" title="案件不存在" hint={caseId} />;

  const submitInspection = () => {
    dispatch({
      type: "SUBMIT_INSPECTION",
      payload: {
        caseId: c.id,
        inspectorId: user.id,
        gps: [c.lng, c.lat],
        photos: ["IMG_" + Date.now() + "_1.jpg", "IMG_" + Date.now() + "_2.jpg", "IMG_" + Date.now() + "_3.jpg"],
        method: "聲學",
        note: "現場確認漏水，已拍照存證",
      },
    });
    toast({ kind: "pass", title: "✓ 檢漏完成", body: "案件 " + c.caseNo + " 已上傳，廠所已收到通知" });
    setTimeout(() => navigate("/inspection"), 800);
  };

  return (
    <>
      <SP.PageHeader
        title={c.caseNo + " ・ " + c.title}
        subtitle={c.region + " ・ 來源：" + c.source}
        breadcrumb={["首頁", "檢漏子系統", "案件處理單"]}
        rfp="附錄一 三(三)1"
        actions={
          c.status === "派工" || c.status === "檢漏中" ? (
            <SP.Button variant="primary" onClick={submitInspection}>✓ 一鍵上傳檢漏結果</SP.Button>
          ) : null
        }
      />

      <SP.Card title="案件流程">
        <SP.CaseStatusFlow status={c.status} />
      </SP.Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "var(--space-5)", marginTop: "var(--space-5)" }}>
        <SP.Card title="案件資訊">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-3)" }}>
            <DetailRow label="嚴重度" value={<SP.SeverityBadge severity={c.severity} />} />
            <DetailRow label="目前狀態" value={<SP.StatusBadge status={c.status} />} />
            <DetailRow label="地址" value={c.address} />
            <DetailRow label="GPS" value={c.lng.toFixed(4) + ", " + c.lat.toFixed(4)} />
            <DetailRow label="通報人" value={(c.reporter || "—") + " / " + (c.reporterPhone || "—")} />
            <DetailRow label="預估漏水量" value={(c.estimatedLoss || 0) + " 噸 / 日"} />
          </div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <div className="text-sm muted" style={{ marginBottom: "var(--space-2)" }}>位置地圖</div>
            <SP.GisMap cases={[c]} height={240} focus={c} layers={{ wmts: true, wms: false, pipes: false, cases: true }} />
          </div>
        </SP.Card>

        <SP.Card title="Timeline">
          <SP.CaseTimeline timeline={c.timeline} users={state.users} />
        </SP.Card>
      </div>
    </>
  );
};

function DetailRow({ label, value }) {
  return (
    <div>
      <div className="text-xs muted">{label}</div>
      <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

/* ============================================================
   檢漏子系統葉子（依 sitemap B 模組 56 葉子展開）
   ============================================================ */

/* ---------- 進階作業 三(四) ---------- */
SP.InspectionAdvanced = function InspectionAdvanced() {
  const [tab, setTab] = React.useState("pressure");
  const tabs = [
    { id: "pressure",  label: "水壓調查" },
    { id: "flow",      label: "流量調查" },
    { id: "heatmap",   label: "漏水頻率熱區" },
    { id: "pressure-chart", label: "水壓記錄歷線" },
    { id: "flow-chart",     label: "流量分析圖表" },
  ];
  return (
    <>
      <SP.PageHeader title="進階作業" subtitle="水壓 / 流量 / 漏水頻率熱區分析" breadcrumb={["首頁", "檢漏", "進階作業"]} rfp="附錄一 三(四)" />
      <SP.Toolbar>
        <SP.CaseFilter value={tab} onChange={setTab} options={tabs.map(t => ({ value: t.id, label: t.label }))} />
      </SP.Toolbar>
      {tab === "pressure" && (
        <SP.Card title="水壓調查（B20）" subtitle="TXT / CSV 上傳 → 圖台分析 → 前後比較">
          <div className="form-grid form-grid--cols-2">
            <SP.FormRow label="測點檔案上傳" hint="TXT / CSV 格式，內含時間 + 壓力值"><input type="file" className="form-control" /></SP.FormRow>
            <SP.FormRow label="調查日期"><input type="date" className="form-control" defaultValue="2026-05-20" /></SP.FormRow>
          </div>
          <div className="mt-4">
            <SP.LineChart data={[
              { label: "00:00", value: 4.2 }, { label: "04:00", value: 4.5 }, { label: "08:00", value: 3.8 },
              { label: "12:00", value: 3.2 }, { label: "16:00", value: 3.5 }, { label: "20:00", value: 4.1 },
              { label: "24:00", value: 4.3 },
            ]} height={200} fill />
            <div className="text-xs muted mt-2">縱軸：水壓 kg/cm² ・ 橫軸：時段</div>
          </div>
        </SP.Card>
      )}
      {tab === "flow" && (
        <SP.Card title="流量調查（B21）" subtitle="超音波流量計 + 流向計算">
          <SP.Table headers={["測點", "管徑", "流量 (m³/h)", "流向", "備註"]} rows={[
            ["MP-001", "DN300", "128.5", "↓", "下游"], ["MP-002", "DN200", "85.3", "←", "西向"],
            ["MP-003", "DN150", "42.7", "↓", "下游"], ["MP-004", "DN300", "162.1", "↓", "下游"],
            ["MP-005", "DN200", "78.9", "→", "東向"],
          ]} />
        </SP.Card>
      )}
      {tab === "heatmap" && (
        <SP.Card title="漏水頻率熱區分析（B22）" subtitle="GIS 熱區圖">
          <SP.GisMap cases={[]} height={400} layers={{ wmts: true, wms: false, pipes: true, cases: true }} />
          <div className="text-sm muted mt-2">紅色 = 高頻區域，建議列入年度汰換</div>
        </SP.Card>
      )}
      {tab === "pressure-chart" && (
        <SP.Card title="水壓記錄歷線圖（B23）" subtitle="近 30 天">
          <SP.LineChart data={Array.from({ length: 30 }, (_, i) => ({ label: (i + 1).toString(), value: 3.5 + Math.sin(i / 3) * 0.6 }))} height={240} fill />
        </SP.Card>
      )}
      {tab === "flow-chart" && (
        <SP.Card title="流量分析圖表（B24）" subtitle="管段流量分布">
          <SP.BarChart data={[
            { label: "DN300", value: 162 }, { label: "DN250", value: 128 }, { label: "DN200", value: 86 },
            { label: "DN150", value: 43 }, { label: "DN100", value: 22 },
          ]} height={240} />
        </SP.Card>
      )}
    </>
  );
};

/* ---------- 年度作業 三(五) ---------- */
SP.InspectionAnnual = function InspectionAnnual() {
  const navigate = useNav2();
  return (
    <SP.RfpLeafPage
      icon="📅"
      title="年度作業"
      subtitle="年度計畫 / 系統成果報告書 / 年度成果報告書 / 執行成果 / 績效統計"
      breadcrumb={["首頁", "檢漏", "年度作業"]}
      rfp="附錄一 三(五)"
      sections={[
        {
          title: "B25 製定年度計畫（13 子項）", subtitle: "本年度檢漏總計畫",
          kind: "items",
          items: [
            { label: "1. 年度檢漏目標管長", note: "12,500 km" },
            { label: "2. 預定汰換管長", note: "850 km" },
            { label: "3. 預算編列", note: "已核定" },
            { label: "4. 人員編制", note: "檢漏員 28、修漏員 22" },
            { label: "5. 儀具設備需求", note: "聲學檢漏儀 5 台" },
            { label: "6. 教育訓練計畫", note: "8 場 / 264 人次" },
            { label: "7. 委外計畫", note: "20 家配合廠商" },
            { label: "8~13. 其他細項", note: "—" },
          ],
        },
        {
          title: "B26 系統成果報告書（16 章）", subtitle: "月 / 季 / 半年提交",
          kind: "text",
          content: <SP.Button variant="primary" onClick={() => navigate("/annual-report")}>進入 16 章編輯 →</SP.Button>,
        },
        {
          title: "B27 年度成果報告書（10 章）", subtitle: "年度提交 ・ 總處核發",
          kind: "text",
          content: <SP.Button variant="secondary" onClick={() => navigate("/annual-report#/annual-report/10")}>進入 10 章編輯 →</SP.Button>,
        },
        {
          title: "B28~B31 績效統計表", subtitle: "執行成果 / 生產力 / 件數達標率 / 工作指標",
          kind: "table",
          headers: ["檢漏員", "本月件數", "目標", "達標率", "生產力指標"],
          rows: [
            ["王志強", "32", "30", "107%", "1.18"],
            ["林永誠", "28", "30", "93%",  "1.02"],
            ["陳金強", "35", "30", "117%", "1.25"],
            ["黃永誠", "26", "30", "87%",  "0.95"],
          ],
        },
      ]}
    />
  );
};

/* ---------- 報表查詢中心 三(六) ---------- */
SP.InspectionReports = function InspectionReports() {
  const reports = [
    { id: "B32", name: "檢漏員成本",         frequency: "月", lastRun: "2026-05-23", status: "ready" },
    { id: "B33", name: "系統成本",           frequency: "月", lastRun: "2026-05-23", status: "ready" },
    { id: "B34", name: "修漏費用（連結修漏案件）", frequency: "週", lastRun: "2026-05-22", status: "ready" },
    { id: "B35", name: "漏水分析（7 子表）",   frequency: "月", lastRun: "2026-05-20", status: "ready" },
    { id: "B36", name: "未辦覆明細表",         frequency: "週", lastRun: "2026-05-22", status: "ready" },
    { id: "B37", name: "績效設定（目標 / 分數）", frequency: "季", lastRun: "2026-04-01", status: "ready" },
    { id: "B38", name: "區處效益",             frequency: "月", lastRun: "2026-05-23", status: "ready" },
    { id: "B39", name: "複測更生",             frequency: "週", lastRun: "2026-05-22", status: "ready" },
    { id: "B40", name: "檢漏員概況",           frequency: "月", lastRun: "2026-05-23", status: "ready" },
    { id: "B41", name: "未結案鎖定件數統計",   frequency: "週", lastRun: "2026-05-22", status: "ready" },
    { id: "B42", name: "辦覆明細 - 結案鎖定",  frequency: "週", lastRun: "2026-05-22", status: "ready" },
    { id: "B43", name: "工作日比率",           frequency: "月", lastRun: "2026-05-23", status: "ready" },
    { id: "B44", name: "績優審查表",           frequency: "季", lastRun: "2026-04-01", status: "ready" },
    { id: "B45", name: "檢漏計畫執行統計",     frequency: "月", lastRun: "2026-05-23", status: "ready" },
  ];
  const toast = SP.useToast();
  return (
    <SP.RfpLeafPage
      icon="📈"
      title="報表查詢中心"
      subtitle={"14 個子報表 ・ 可線上預覽 / 列印 / 匯出 ODF"}
      breadcrumb={["首頁", "檢漏", "報表查詢"]}
      rfp="附錄一 三(六)"
      sections={[{
        title: "報表清單", subtitle: "點「ODF」匯出",
        kind: "table",
        headers: ["編號", "報表名稱", "頻率", "最新日期", "操作"],
        rows: reports.map(r => [
          <span className="font-mono text-sm">{r.id}</span>,
          <span style={{ fontWeight: 600 }}>{r.name}</span>,
          <SP.Badge tone="info">{r.frequency}</SP.Badge>,
          <span className="text-sm muted">{r.lastRun}</span>,
          <span style={{ display: "inline-flex", gap: "0.5rem" }}>
            <SP.Button size="sm" variant="primary" onClick={() => toast({ kind: "pass", title: "已開啟", body: r.name })}>預覽</SP.Button>
            <SP.Button size="sm" variant="secondary" onClick={() => toast({ kind: "pass", title: "已匯出 ODF", body: r.name + ".ods" })}>ODF</SP.Button>
          </span>,
        ]),
      }]}
    />
  );
};

/* ---------- 規定紀錄 三(七) ---------- */
SP.InspectionRegulations = function InspectionRegulations() {
  const items = [
    { id: "B46", name: "規定",       desc: "檢漏作業規定 / 安全規定 / SOP", count: 24 },
    { id: "B47", name: "紀錄",       desc: "歷史紀錄查詢",                count: 1248 },
    { id: "B48", name: "下載",       desc: "表格 / 範本 / 手冊下載",       count: 38 },
    { id: "B49", name: "規範",       desc: "CNS / ISO / 工程會規範",       count: 16 },
    { id: "B50", name: "歷年數據",   desc: "近 10 年漏水率歷史資料",       count: 10 },
    { id: "B51", name: "檢漏基礎",   desc: "基礎教材 / 入門教程",          count: 24 },
    { id: "B52", name: "檢漏進階",   desc: "進階技術 / 案例研究",          count: 18 },
    { id: "B53", name: "歷次考題",   desc: "證照考題庫",                  count: 285 },
    { id: "B54", name: "檢漏教材",   desc: "影音教學 / PDF",              count: 42 },
    { id: "B55", name: "案例分享",   desc: "成功案例 / 失敗檢討",          count: 67 },
  ];
  return (
    <SP.RfpLeafPage
      icon="📜"
      title="規定紀錄"
      subtitle="檢漏知識管理中心 ・ 10 類資料"
      breadcrumb={["首頁", "檢漏", "規定紀錄"]}
      rfp="附錄一 三(七)"
      sections={[{
        title: "10 類分類", subtitle: "點「進入」查看各類別內容",
        kind: "table",
        headers: ["編號", "類別", "說明", "數量", "操作"],
        rows: items.map(it => [
          <span className="font-mono text-sm">{it.id}</span>,
          <span style={{ fontWeight: 600 }}>{it.name}</span>,
          <span className="text-sm muted">{it.desc}</span>,
          <span className="text-sm">{it.count}</span>,
          <SP.Button size="sm" variant="secondary">進入</SP.Button>,
        ]),
      }]}
    />
  );
};

/* ---------- 檢漏系統管理 三(二) ---------- */
SP.InspectionAdmin = function InspectionAdmin() {
  const { state } = SP.useStore();
  const items = [
    { id: "B02", name: "帳號權限管理",     desc: "11 角色 × 7 模組權限矩陣",       owner: "admin" },
    { id: "B03", name: "登入查詢",         desc: "登入歷史 / 失敗紀錄",            owner: "admin" },
    { id: "B04", name: "設定共同費用",     desc: "出差費 / 加班費 / 油料費",       owner: "admin" },
    { id: "B05", name: "隊員資料管理",     desc: "檢漏員人事資料",                owner: "admin" },
    { id: "B06", name: "月薪設定（介接薪資系統）", desc: "月薪 + 加班 + 補貼",  owner: "hr" },
    { id: "B07", name: "設定工作區（大區 / 小區）", desc: "區處 → 廠所 → 工作區", owner: "plant" },
    { id: "B08", name: "儀具設備管理（介接財產）", desc: "聲學儀 / 流量計 / 工具", owner: "admin" },
  ];
  return (
    <SP.RfpLeafPage
      icon="⚙"
      title="檢漏系統管理"
      subtitle="7 個系統管理項目"
      breadcrumb={["首頁", "檢漏", "系統管理"]}
      rfp="附錄一 三(二)"
      sections={[
        {
          title: "管理項目清單",
          kind: "table",
          headers: ["編號", "項目", "說明", "主責"],
          rows: items.map(it => [
            <span className="font-mono text-sm">{it.id}</span>,
            <span style={{ fontWeight: 600 }}>{it.name}</span>,
            <span className="text-sm muted">{it.desc}</span>,
            <SP.Badge tone="info">{it.owner}</SP.Badge>,
          ]),
        },
        {
          title: "11 角色 × 7 模組權限矩陣（示範）",
          subtitle: "R = 讀 / W = 寫 / ✓ = 全權 / — = 無權",
          kind: "table",
          headers: ["模組 \\ 角色", "系管", "總處", "區主", "廠所", "檢漏", "修漏", "客服", "DBA", "資安", "內稽", "外稽"],
          rows: [
            ["案件 CRUD",   "✓", "R", "R", "✓", "RW(自)", "RW(自)", "C", "—", "R", "R", "R"],
            ["派工",        "✓", "R", "R", "✓", "—", "—", "—", "—", "R", "R", "R"],
            ["報表",        "✓", "✓", "✓", "RW", "—", "—", "—", "—", "R", "R", "R"],
            ["介接管理",    "✓", "—", "—", "—", "—", "—", "—", "R", "R", "—", "—"],
            ["使用者管理",  "✓", "—", "RW", "RW", "—", "—", "—", "—", "R", "—", "—"],
            ["DB 操作",     "R", "—", "—", "—", "—", "—", "—", "✓", "R", "—", "—"],
            ["資安檢核",    "R", "—", "—", "—", "—", "—", "—", "—", "✓", "R", "R"],
          ],
        },
      ]}
    />
  );
};
