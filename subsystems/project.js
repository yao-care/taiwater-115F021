/* ============================================================
   subsystems/project.js — 專案管理儀表板
   依 10-專案管理.md
   ============================================================ */

window.SP = window.SP || {};

const { Routes: PJRoutes, Route: PJRoute, useNavigate: usePJNav } = ReactRouterDOM;

SP.ProjectPage = function ProjectPage() {
  return (
    <PJRoutes>
      <PJRoute path="/"             element={<SP.ProjectGantt />} />
      <PJRoute path="/gantt"        element={<SP.ProjectGantt />} />
      <PJRoute path="/payment"      element={<SP.ProjectPayment />} />
      <PJRoute path="/team"         element={<SP.ProjectTeam />} />
      <PJRoute path="/training"     element={<SP.ProjectTraining />} />
      <PJRoute path="/penalty"      element={<SP.ProjectPenalty />} />
      <PJRoute path="/documents"    element={<SP.ProjectDocuments />} />
      <PJRoute path="/traceability" element={<SP.ProjectTraceability />} />
      <PJRoute path="/code-counter" element={<SP.ProjectCodeCounter />} />
      <PJRoute path="*"             element={<SP.ProjectGantt />} />
    </PJRoutes>
  );
};

/* ---------- 5 階段 Gantt ---------- */
SP.ProjectGantt = function ProjectGantt() {
  const navigate = usePJNav();
  const tasks = [
    { id: "M1", name: "需求分析", start: "2026-07-01", end: "2026-08-15", progress: 0.45, status: "in_progress" },
    { id: "M2", name: "系統設計", start: "2026-08-15", end: "2026-10-10", progress: 0,    status: "pending" },
    { id: "M3", name: "雛型 / UAT", start: "2026-10-10", end: "2026-12-20", progress: 0, status: "pending" },
    { id: "M4", name: "上線部署", start: "2026-12-20", end: "2027-01-20", progress: 0,   status: "pending" },
    { id: "M5", name: "教育訓練 / 結案", start: "2027-01-20", end: "2027-02-20", progress: 0, status: "pending" },
  ];
  return (
    <>
      <SP.PageHeader title="專案管理儀表板" subtitle="履約 28 個月 ・ 5 階段驗收" breadcrumb={["首頁", "專案管理"]} rfp="附錄六 + 伍/陸/柒/捌" actions={
        <>
          <SP.Button variant="primary" onClick={() => navigate("/project/team")}>👥 團隊</SP.Button>
          <SP.Button variant="secondary" onClick={() => navigate("/project/documents")}>📁 文件</SP.Button>
          <SP.Button variant="secondary" onClick={() => navigate("/project/traceability")}>🧭 需求追溯</SP.Button>
        </>
      } />

      <div className="kpi-grid">
        <SP.KpiCard label="專案進度"   value="12%" tone="high" hint="規劃中" />
        <SP.KpiCard label="當前階段"   value="M1" suffix="需求分析" />
        <SP.KpiCard label="團隊成員"   value="10" suffix="人" />
        <SP.KpiCard label="教育訓練"   value="8" suffix="場" hint="預計 264 人次" />
      </div>

      <SP.Card title="5 階段甘特圖 + 付款" subtitle="點階段查看細項">
        <SP.GanttChart tasks={tasks} today="2026-07-15" height={260} />
      </SP.Card>

      <div className="mt-6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-5)" }}>
        <SP.Card title="付款進度" subtitle="總計 5 期">
          <div className="flex-col" style={{ gap: "var(--space-3)" }}>
            <SP.ProgressBar label="階段一開發（50%）" value={0} />
            <SP.ProgressBar label="階段二開發（40%）" value={0} />
            <SP.ProgressBar label="教育訓練（10%）" value={0} />
          </div>
          <SP.Button size="sm" variant="ghost" className="mt-2" onClick={() => navigate("/project/payment")}>查看完整 →</SP.Button>
        </SP.Card>
        <SP.Card title="罰則對照" subtitle="捌 罰則">
          <ul style={{ paddingLeft: "1.25rem", fontSize: "var(--text-sm)", lineHeight: 1.7 }}>
            <li>一般違反 0.1% / 日</li>
            <li>合計 ≥ 20% 終止契約</li>
            <li>惡意程式 5%（不受上限）</li>
            <li>資安改善逾期 / 日罰</li>
          </ul>
          <SP.Button size="sm" variant="ghost" onClick={() => navigate("/project/penalty")}>完整對照表 →</SP.Button>
        </SP.Card>
        <SP.Card title="文件中心" subtitle="14 種交付文件">
          <ul style={{ paddingLeft: "1.25rem", fontSize: "var(--text-sm)", lineHeight: 1.7 }}>
            <li style={{ color: "var(--color-pass)" }}>✓ 專案管理計畫書</li>
            <li style={{ color: "var(--color-pass)" }}>✓ 需求規格書（草案）</li>
            <li>系統設計書（待）</li>
            <li>UAT 報告（待）</li>
          </ul>
          <SP.Button size="sm" variant="ghost" onClick={() => navigate("/project/documents")}>查看全部 →</SP.Button>
        </SP.Card>
      </div>
    </>
  );
};

SP.ProjectPayment = function ProjectPayment() {
  const navigate = usePJNav();
  return (
    <>
      <SP.PageHeader title="付款進度" subtitle="5 期 ・ 含維護 2 期" breadcrumb={["首頁", "專案", "付款"]} rfp="柒付款" actions={<SP.Button variant="ghost" onClick={() => navigate("/project")}>返回</SP.Button>} />
      <SP.Card>
        <SP.Table headers={["階段", "權重", "金額", "進度", "狀態"]} rows={[
          ["階段一開發（檢修漏 8M）", "50%", "$ — ", <div style={{ width: "8rem" }}><SP.ProgressBar value={0} /></div>, <SP.Badge tone="medium">未啟動</SP.Badge>],
          ["階段二開發（行動版 4M）", "40%", "$ — ", <div style={{ width: "8rem" }}><SP.ProgressBar value={0} /></div>, <SP.Badge tone="medium">未啟動</SP.Badge>],
          ["教育訓練（1M）", "10%", "$ — ", <div style={{ width: "8rem" }}><SP.ProgressBar value={0} /></div>, <SP.Badge tone="medium">未啟動</SP.Badge>],
          ["現行維護 第 1 期", "50%", "$ — ", <div style={{ width: "8rem" }}><SP.ProgressBar value={0} /></div>, <SP.Badge tone="medium">未啟動</SP.Badge>],
          ["現行維護 第 2 期", "50%", "$ — ", <div style={{ width: "8rem" }}><SP.ProgressBar value={0} /></div>, <SP.Badge tone="medium">未啟動</SP.Badge>],
          ["系統維護 第 1 期", "50%", "$ — ", <div style={{ width: "8rem" }}><SP.ProgressBar value={0} /></div>, <SP.Badge tone="medium">未啟動</SP.Badge>],
          ["系統維護 第 2 期", "50%", "$ — ", <div style={{ width: "8rem" }}><SP.ProgressBar value={0} /></div>, <SP.Badge tone="medium">未啟動</SP.Badge>],
        ]} />
      </SP.Card>
    </>
  );
};

SP.ProjectTeam = function ProjectTeam() {
  const { state } = SP.useStore();
  const navigate = usePJNav();
  return (
    <>
      <SP.PageHeader title="專案團隊" subtitle={state.team.length + " 位成員 ・ 兼任 ≤ 2"} breadcrumb={["首頁", "專案", "團隊"]} rfp="伍、三 專案工作小組與人員能力需求" actions={<SP.Button variant="ghost" onClick={() => navigate("/project")}>返回</SP.Button>} />
      <SP.Card padding="0">
        <SP.Table headers={["姓名", "角色", "公司", "年資", "證照"]} rows={state.team.map(t => [
          <span style={{ fontWeight: 600 }}>{t.name}</span>,
          <SP.Badge tone="info">{t.role}</SP.Badge>,
          <span className="text-sm muted">{t.company}</span>,
          <span className="text-sm">{t.experience}</span>,
          <span className="text-sm">{t.certs.join(", ")}</span>,
        ])} />
      </SP.Card>
    </>
  );
};

SP.ProjectTraining = function ProjectTraining() {
  const { state } = SP.useStore();
  const navigate = usePJNav();
  const totalHours = state.trainings.reduce((s, t) => s + t.hours, 0);
  const totalAttendees = state.trainings.reduce((s, t) => s + t.attendees, 0);
  return (
    <>
      <SP.PageHeader title="教育訓練" subtitle={state.trainings.length + " 場 / " + totalHours + " 小時 / 預計 " + totalAttendees + " 人次"} breadcrumb={["首頁", "專案", "訓練"]} rfp="伍、四 教育訓練需求" actions={<SP.Button variant="ghost" onClick={() => navigate("/project")}>返回</SP.Button>} />
      <SP.Card padding="0">
        <SP.Table headers={["場次", "對象", "時數", "人數", "日期"]} rows={state.trainings.map(t => [
          <span style={{ fontWeight: 600 }}>{t.name}</span>,
          <span className="text-sm">{t.audience}</span>,
          <span className="text-sm">{t.hours} 小時</span>,
          <span className="text-sm">{t.attendees} 人</span>,
          <span className="text-sm muted">{t.date}</span>,
        ])} />
      </SP.Card>
    </>
  );
};

SP.ProjectPenalty = function ProjectPenalty() {
  const navigate = usePJNav();
  return (
    <>
      <SP.PageHeader title="罰則對照表" subtitle="捌 罰則" breadcrumb={["首頁", "專案", "罰則"]} rfp="捌 罰則" actions={<SP.Button variant="ghost" onClick={() => navigate("/project")}>返回</SP.Button>} />
      <SP.Card>
        <SP.Table headers={["違反項目", "罰款基準", "備註"]} rows={[
          ["一般違反", "千分之 1 / 日", "依履約金額"],
          ["罰款合計 ≥ 20%", "終止契約 + 沒入履約保證金", "嚴重"],
          ["惡意程式碼", "5% 不受 20% 上限", "獨立計算"],
          ["資安改善逾期", "3 工作天內未完成 / 日罰", "依嚴重度"],
          ["人員替換 / 剔除 / SA 變更上限", "依違反次數加成", "—"],
          ["系統故障未恢復", "1 工作天內未恢復 / 日罰", "依等級"],
          ["UAT 不通過", "重新測試 + 加倍罰款", "—"],
        ]} />
      </SP.Card>
    </>
  );
};

SP.ProjectDocuments = function ProjectDocuments() {
  const { state } = SP.useStore();
  const navigate = usePJNav();
  return (
    <>
      <SP.PageHeader title="文件中心" subtitle={state.documents.length + " 種交付文件"} breadcrumb={["首頁", "專案", "文件"]} rfp="附錄六 交付文件建議內容" actions={<SP.Button variant="ghost" onClick={() => navigate("/project")}>返回</SP.Button>} />
      <SP.Card padding="0">
        <SP.Table headers={["文件", "類型", "階段", "版本", "狀態", "操作"]} rows={state.documents.map(d => [
          <span style={{ fontWeight: 600 }}>{d.name}</span>,
          <SP.Badge tone="info">{d.type}</SP.Badge>,
          <span className="text-sm muted">{d.phase}</span>,
          <span className="text-sm font-mono">{d.version}</span>,
          <SP.Badge tone={d.status === "approved" ? "pass" : d.status === "draft" ? "high" : "medium"}>{d.status}</SP.Badge>,
          d.status === "approved" || d.status === "draft" ? <SP.Button size="sm" variant="secondary">📥 下載</SP.Button> : <span className="text-sm muted">—</span>,
        ])} />
      </SP.Card>
    </>
  );
};

SP.ProjectTraceability = function ProjectTraceability() {
  const navigate = usePJNav();
  const rows = [
    { rfp: "附錄一 三(三)2", req: "案件 GIS 定位",       fn: "B10", tc: "TC-B10-001",         status: "已實作" },
    { rfp: "附錄一 四(四)2", req: "派工 WMTS + WMS",     fn: "C12", tc: "TC-C12-003",         status: "已實作" },
    { rfp: "附錄一 四(八)3", req: "PCCES XML 編碼 ≥ 40%", fn: "C38", tc: "TC-C38-007",         status: "已實作" },
    { rfp: "附錄九 帳號 6",   req: "Session 自動登出",   fn: "資安", tc: "TC-SEC-012",         status: "已實作" },
    { rfp: "附錄一 三(五)2", req: "成果報告書 16 章",   fn: "B26", tc: "TC-B26-001~016",     status: "已實作" },
    { rfp: "附錄一 二(二)2", req: "行動版 GPS WGS84+TWD97", fn: "A04", tc: "TC-A04-001", status: "已實作" },
    { rfp: "附錄九 系統與通訊保護", req: "HTTPS + HSTS", fn: "資安", tc: "TC-SEC-018",     status: "已實作" },
    { rfp: "附錄一 一(七)", req: "AD 單一登入",         fn: "D01", tc: "TC-D01-002",         status: "已實作" },
  ];
  return (
    <>
      <SP.PageHeader title="需求追溯矩陣" subtitle="RFP → 功能 → 測試案例" breadcrumb={["首頁", "專案", "追溯"]} rfp="—" actions={<SP.Button variant="ghost" onClick={() => navigate("/project")}>返回</SP.Button>} />
      <SP.Card padding="0">
        <SP.Table headers={["RFP 章節", "需求簡述", "功能對應", "測試案例", "狀態"]} rows={rows.map(r => [
          <span className="text-sm font-mono">{r.rfp}</span>,
          <span className="text-sm">{r.req}</span>,
          <SP.Badge tone="info">{r.fn}</SP.Badge>,
          <span className="text-sm font-mono">{r.tc}</span>,
          <SP.Badge tone="pass">{r.status}</SP.Badge>,
        ])} />
      </SP.Card>
    </>
  );
};

SP.ProjectCodeCounter = function ProjectCodeCounter() {
  const navigate = usePJNav();
  return (
    <>
      <SP.PageHeader title="程式支數計算機" subtitle="5% / 15% 門檻檢核" breadcrumb={["首頁", "專案", "程式支數"]} rfp="—" actions={<SP.Button variant="ghost" onClick={() => navigate("/project")}>返回</SP.Button>} />
      <SP.Card title="複雜度判定 + 修改幅度">
        <SP.Table headers={["類別", "計算公式", "支數"]} rows={[
          ["高複雜度 (≥ 2500 行)", "1.5 支", "—"],
          ["中複雜度 (1300~2500)", "1.2 支", "—"],
          ["低複雜度 (< 1300)", "1.0 支", "—"],
          ["修改 ≤ 30%", "累計 6 支 = 1 支新增", "—"],
          ["修改 > 30%", "累計 3 支 = 1 支新增", "—"],
          ["網頁", "30 個頁面 = 1 支", "—"],
          ["動態元件", "6 個 = 1 支", "—"],
          ["全面修改", "60 個頁面 = 1 支", "—"],
        ]} />
      </SP.Card>
      <div className="mt-4">
        <SP.Card title="本期累計" subtitle="尚未動工，計畫 5% / 15% 門檻內">
          <SP.ProgressBar label="現行維護 / 5% 上限" value={3.2} max={5} suffix="%" tone="pass" />
          <div className="mt-3">
            <SP.ProgressBar label="新系統維護 / 15% 上限" value={0} max={15} suffix="%" />
          </div>
        </SP.Card>
      </div>
    </>
  );
};
