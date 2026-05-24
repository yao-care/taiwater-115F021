/* ============================================================
   subsystems/annual-report.js — 年度成果報告書
   16 章自動產生 + 10 章年度版 + 一鍵匯出 ODF
   ============================================================ */

window.SP = window.SP || {};

const { Routes: ARRoutes, Route: ARRoute, useNavigate: useARNav, useParams: useARParams } = ReactRouterDOM;

SP.AnnualReportPage = function AnnualReportPage() {
  return (
    <ARRoutes>
      <ARRoute path="/"           element={<SP.AnnualReportHome />} />
      <ARRoute path="/16"         element={<SP.AnnualReport16 />} />
      <ARRoute path="/10"         element={<SP.AnnualReport10 />} />
      <ARRoute path="/preview/:n" element={<SP.AnnualReportPreview />} />
      <ARRoute path="/export"     element={<SP.AnnualReportExport />} />
      <ARRoute path="*"           element={<SP.AnnualReportHome />} />
    </ARRoutes>
  );
};

SP.AnnualReportHome = function AnnualReportHome() {
  const navigate = useARNav();
  return (
    <>
      <SP.PageHeader
        title="年度成果報告書中心"
        subtitle="2026 年度 ・ 系統自動從案件 / 修漏 / 檢漏資料即時計算章節內容"
        breadcrumb={["首頁", "報表 / 年報書"]}
        rfp="附錄一 三(五) 2 + 3"
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <SP.Card title="📕 系統成果報告書（16 章）" subtitle="月度 / 季度 / 半年提交 ・ 區處 → 總處">
          <ul className="text-sm" style={{ paddingLeft: "1.25rem", marginTop: 0 }}>
            <li>執行摘要 / 區處概況 / 年度目標</li>
            <li>案件統計 / 漏水原因 / 管網狀況</li>
            <li>修漏成果 / 檢漏成果 / 工程預算</li>
            <li>介接系統 / 資安合規 / 教育訓練</li>
            <li>廠商管理 / KPI 績效 / 改善建議 / 附錄</li>
          </ul>
          <div className="mt-4">
            <SP.Button variant="primary" onClick={() => navigate("/annual-report/16")}>進入 16 章編輯</SP.Button>
          </div>
        </SP.Card>
        <SP.Card title="📒 年度成果報告書（10 章）" subtitle="年度提交 ・ 區處主管核發">
          <ul className="text-sm" style={{ paddingLeft: "1.25rem", marginTop: 0 }}>
            <li>年度執行摘要</li>
            <li>區處整體績效</li>
            <li>檢漏 / 修漏年度統計</li>
            <li>漏水率改善歷年比較</li>
            <li>重大事件回顧 / 教訓登錄</li>
            <li>明年度計畫建議</li>
          </ul>
          <div className="mt-4">
            <SP.Button variant="secondary" onClick={() => navigate("/annual-report/10")}>進入 10 章編輯</SP.Button>
          </div>
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- 16 章內容（自動產生） ---------- */
SP.REPORT16_CHAPTERS = [
  "執行摘要", "區處概況", "年度目標與達成", "案件統計與分析",
  "漏水原因分析", "管網狀況", "修漏成果", "檢漏成果",
  "工程預算執行", "介接系統運維", "資安合規", "教育訓練",
  "廠商管理", "KPI 績效", "改善建議", "附錄",
];

SP.AnnualReport16 = function AnnualReport16() {
  const { state } = SP.useStore();
  const navigate = useARNav();
  const toast = SP.useToast();
  const [selected, setSelected] = React.useState(0);
  const [mode, setMode] = React.useState("preview");  // preview | edit
  const user = state.currentUser;
  const region = user?.region || state.currentRegion;

  const chapter = SP.REPORT16_CHAPTERS[selected];
  const content = SP.generateChapterContent(state, region, selected);

  return (
    <>
      <SP.PageHeader
        title="2026 系統成果報告書"
        subtitle={region + " ・ " + SP.REPORT16_CHAPTERS.length + " 章 ・ 完成 " + Math.floor(SP.REPORT16_CHAPTERS.length * 0.8) + " / " + SP.REPORT16_CHAPTERS.length}
        breadcrumb={["首頁", "報表", "16 章報告書"]}
        rfp="三(五)2"
        actions={
          <>
            <SP.Button variant="primary" onClick={() => toast({ kind: "pass", title: "已匯出 ODF", body: "下載 system-report-2026-" + region.slice(0, 4) + ".odt" })}>一鍵匯出 ODF</SP.Button>
            <SP.Button variant="secondary" onClick={() => toast({ kind: "pass", title: "已送總處", body: "等待核發中" })}>送總處核發</SP.Button>
            <SP.Button variant="ghost" onClick={() => navigate("/annual-report")}>返回</SP.Button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,3fr)", gap: "var(--space-4)" }}>
        <SP.Card title="章節清單" padding="0">
          <div>
            {SP.REPORT16_CHAPTERS.map((name, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  padding: "0.625rem 0.875rem",
                  borderBottom: "1px solid var(--border-base)",
                  background: i === selected ? "var(--bg-low)" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "var(--text-sm)",
                  color: i === selected ? "var(--color-low)" : "var(--text-primary)",
                  fontWeight: i === selected ? 600 : 400,
                }}
              >
                <span style={{ width: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>{(i + 1).toString().padStart(2, "0")}</span>
                <span style={{ flex: 1 }}>{name}</span>
                <span style={{ color: i < 13 ? "var(--color-pass)" : "var(--text-muted)" }}>{i < 13 ? "✓" : "○"}</span>
              </div>
            ))}
          </div>
        </SP.Card>

        <SP.Card
          title={(selected + 1) + ". " + chapter}
          subtitle="內容由系統自動從 store 即時計算"
          action={
            <span style={{ display: "inline-flex", gap: "var(--space-2)" }}>
              <SP.Button size="sm" variant={mode === "preview" ? "primary" : "secondary"} onClick={() => setMode("preview")}>預覽</SP.Button>
              <SP.Button size="sm" variant={mode === "edit" ? "primary" : "secondary"} onClick={() => setMode("edit")}>編輯</SP.Button>
            </span>
          }
        >
          {/* A4 風格章節預覽 */}
          <div style={{
            background: "white",
            border: "1px solid var(--border-base)",
            boxShadow: "var(--shadow-md)",
            padding: "var(--space-6)",
            minHeight: "32rem",
            maxHeight: "40rem",
            overflowY: "auto",
            fontFamily: "var(--font-sans)",
          }}>
            <h2 style={{ fontSize: "var(--text-xl)", margin: 0, borderBottom: "2px solid var(--tw-primary)", paddingBottom: "var(--space-2)" }}>
              第 {selected + 1} 章 {chapter}
            </h2>
            {mode === "preview"
              ? <div style={{ marginTop: "var(--space-4)", lineHeight: "1.8", fontSize: "var(--text-base)" }}>{content}</div>
              : <textarea
                  style={{ marginTop: "var(--space-4)", width: "100%", minHeight: "28rem", padding: "var(--space-3)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontFamily: "var(--font-sans)", lineHeight: 1.6 }}
                  defaultValue={typeof content === "string" ? content : "自動產生內容（編輯模式 demo）"}
                />
            }
          </div>

          <div className="mt-4 flex-row" style={{ justifyContent: "space-between" }}>
            <SP.Button variant="secondary" disabled={selected === 0} onClick={() => setSelected(s => s - 1)}>← 上一章</SP.Button>
            <span className="text-sm muted">{selected + 1} / {SP.REPORT16_CHAPTERS.length}</span>
            <SP.Button variant="secondary" disabled={selected === SP.REPORT16_CHAPTERS.length - 1} onClick={() => setSelected(s => s + 1)}>下一章 →</SP.Button>
          </div>
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- 自動產生章節內容（依索引從 store 即時計算） ---------- */
SP.generateChapterContent = function (state, region, idx) {
  const cs = state.cases.filter(c => !region || c.region === region);
  const closed = cs.filter(c => c.status === "結案").length;
  const closeRate = cs.length > 0 ? Math.round((closed / cs.length) * 100) : 0;
  const criticalCount = cs.filter(c => c.severity === "critical").length;
  const totalRepairs = state.repairs.length;
  const totalCost = state.repairs.reduce((s, r) => s + r.cost, 0);
  const totalLeakage = state.repairs.length * 12;  // demo

  const chapters = {
    0: (  // 執行摘要
      <>
        <p>本年度（2026）{region} 共受理檢修漏案件 <strong>{cs.length}</strong> 件，其中已結案 <strong>{closed}</strong> 件，結案率達 <strong>{closeRate}%</strong>。</p>
        <p>透過新系統介入，案件平均處理時間從原本 18 天降至 14 天，並大幅提升各角色協作效率。本年度漏水量減少約 <strong>{totalLeakage.toLocaleString()} m³</strong>，達成年度目標 87%。</p>
        <p>重點成就包括：（1）跨子系統介接打通 14 系統；（2）資安 12 構面達成 93% 實作率；（3）導入 PCCES XML 4.3 編碼，編碼正確率 ≥ 40%。</p>
      </>
    ),
    1: (  // 區處概況
      <>
        <p>{region} 編制：廠所 <strong>{(SP.PLANTS_BY_REGION[region] || []).length}</strong> 個、檢漏員 {state.users.filter(u => u.region === region && u.role === "inspector").length} 人、修漏員 {state.users.filter(u => u.region === region && u.role === "repairer").length} 人。</p>
        <p>本區處轄管管段共 {state.pipes.filter(p => p.region === region).length} 段，總長度約 {state.pipes.filter(p => p.region === region).reduce((s, p) => s + p.length, 0).toLocaleString()} 公尺。</p>
      </>
    ),
    2: (  // 年度目標與達成
      <>
        <p>本年度核定目標 5 項，實際達成：</p>
        <ul>
          {state.annualPlan?.targets?.map(t => (
            <li key={t.metric}><strong>{t.metric}</strong>：目標 {t.target.toLocaleString()} {t.unit} / 實際 {t.actual.toLocaleString()} {t.unit} → 達成率 <strong>{t.progress}%</strong></li>
          ))}
        </ul>
      </>
    ),
    3: (  // 案件統計與分析
      <>
        <p>本年度共 <strong>{cs.length}</strong> 件案件，依嚴重度分布：</p>
        <ul>
          <li>緊急：{cs.filter(c => c.severity === "critical").length} 件</li>
          <li>高：{cs.filter(c => c.severity === "high").length} 件</li>
          <li>中：{cs.filter(c => c.severity === "medium").length} 件</li>
          <li>低：{cs.filter(c => c.severity === "low").length} 件</li>
        </ul>
        <p>各狀態分布：</p>
        <ul>
          {SP.CASE_STATUS.map(s => <li key={s}>{s}：{cs.filter(c => c.status === s).length} 件</li>)}
        </ul>
      </>
    ),
    4: (  // 漏水原因分析
      <>
        <p>本年度主要漏水原因分布：</p>
        <ul>
          <li>管材老化（管齡 &gt; 40 年）：{state.pipes.filter(p => p.age > 40).length} 段次</li>
          <li>地震 / 沉陷：18%（推估）</li>
          <li>外力破壞：12%</li>
          <li>接頭鬆脫：10%</li>
        </ul>
        <p>建議將管齡超過 40 年的 {state.pipes.filter(p => p.age > 40).length} 段管路列入優先汰換計畫。</p>
      </>
    ),
    5: (  // 管網狀況
      <>
        <p>本年度管網狀況：</p>
        <ul>
          <li>總管段：{state.pipes.length}</li>
          <li>高風險 (critical)：{state.pipes.filter(p => p.risk === "critical").length}</li>
          <li>高風險 (high)：{state.pipes.filter(p => p.risk === "high").length}</li>
        </ul>
        <p>材質分布：DIP {state.pipes.filter(p => p.material === "DIP").length} 段 / PVC {state.pipes.filter(p => p.material === "PVC").length} 段 / PE {state.pipes.filter(p => p.material === "PE").length} 段 / 其他。</p>
      </>
    ),
    6: (  // 修漏成果
      <>
        <p>本年度修漏作業彙整：</p>
        <ul>
          <li>修漏件數：<strong>{totalRepairs}</strong></li>
          <li>修漏總費用：<strong>{SP.format.money(totalCost)}</strong></li>
          <li>平均單件費用：{SP.format.money(totalRepairs > 0 ? Math.round(totalCost / totalRepairs) : 0)}</li>
          <li>節水量推估：{totalLeakage.toLocaleString()} m³</li>
        </ul>
      </>
    ),
    7: (  // 檢漏成果
      <>
        <p>本年度檢漏作業：</p>
        <ul>
          <li>檢漏件數：{state.inspections.length}</li>
          <li>確認漏水案件：{state.inspections.filter(i => i.confirmed).length}</li>
          <li>聲學檢測：{state.inspections.filter(i => i.method?.includes("聲學")).length}</li>
        </ul>
      </>
    ),
    8: <p>工程預算執行：PCCES XML 編製 {totalRepairs} 件，編碼正確率達 83%（&gt; RFP 40% 門檻）。預算執行率 87%，未動支 2,847 萬元。</p>,
    9: <p>14 個介接系統健康度：{state.integrations.filter(i => i.status === "healthy").length} 健康 / {state.integrations.filter(i => i.status === "degraded").length} 降級 / {state.integrations.filter(i => i.status === "down").length} 離線。年度可用率 99.7%。</p>,
    10: <p>資安合規檢核：8 構面 127 控制措施，實作率 93%。第三方檢測（弱掃 / 滲透 / 源碼）100% 通過。SBOM 監控 16 套件，無高風險 CVE。</p>,
    11: <p>本年度教育訓練 8 場、共 88 小時、訓練人次 264。覆蓋系統管理員、區處主管、廠所、檢漏員、修漏員、客服、DBA、資安、稽核員等 9 類角色。</p>,
    12: <p>本年度合作廠商 {state.vendors.length} 家，平均評分 4.2/5。本年度新增 3 家，停權 0 家。</p>,
    13: <p>本年度核心 KPI 全部達標：結案率 {closeRate}%、緊急案件 24h 處理率 92%、SLA 95%、可用率 99.7%。</p>,
    14: <p>改善建議：（1）擴大管齡 &gt; 40 年管段汰換預算；（2）強化 AI 漏水熱區預測；（3）導入無人機巡檢；（4）行動版增加離線模式。</p>,
    15: <p>附錄包含：派工紀錄表、PCCES 工項明細、資安檢核表、廠商評分表、教育訓練紀錄、需求追溯矩陣。</p>,
  };
  return chapters[idx] || <p>本章節內容由系統自動產生。</p>;
};

/* ---------- 10 章版本（簡化） ---------- */
SP.AnnualReport10 = function AnnualReport10() {
  const navigate = useARNav();
  const toast = SP.useToast();
  const CHAPTERS = [
    "年度執行摘要", "區處整體績效", "檢漏年度統計", "修漏年度統計",
    "漏水率改善歷年比較", "管網汰換成果", "重大事件回顧", "教訓登錄",
    "明年度計畫建議", "附錄",
  ];
  const [selected, setSelected] = React.useState(0);
  return (
    <>
      <SP.PageHeader
        title="2026 年度成果報告書（10 章）"
        subtitle="年度核發版 ・ 區處主管 → 總處"
        breadcrumb={["首頁", "報表", "10 章年度報告書"]}
        rfp="三(五)3"
        actions={
          <>
            <SP.Button variant="primary" onClick={() => toast({ kind: "pass", title: "已匯出 ODF" })}>匯出 ODF</SP.Button>
            <SP.Button variant="ghost" onClick={() => navigate("/annual-report")}>返回</SP.Button>
          </>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,3fr)", gap: "var(--space-4)" }}>
        <SP.Card title="章節" padding="0">
          {CHAPTERS.map((c, i) => (
            <div key={i} onClick={() => setSelected(i)} style={{
              padding: "0.625rem 0.875rem", borderBottom: "1px solid var(--border-base)",
              background: i === selected ? "var(--bg-low)" : "transparent",
              cursor: "pointer", fontSize: "var(--text-sm)",
            }}>{(i + 1).toString().padStart(2, "0")} {c}</div>
          ))}
        </SP.Card>
        <SP.Card title={(selected + 1) + ". " + CHAPTERS[selected]} subtitle="從 cases / repairs / inspections 即時計算">
          <div style={{ background: "white", padding: "var(--space-6)", borderRadius: "var(--radius-md)", minHeight: "24rem", border: "1px solid var(--border-base)", lineHeight: 1.8 }}>
            <h3>第 {selected + 1} 章 {CHAPTERS[selected]}</h3>
            <p style={{ marginTop: "var(--space-3)" }}>本章節內容由系統自動產生 demo，實際版本會根據區處 / 年度資料動態計算 8-15 頁完整內容。</p>
          </div>
        </SP.Card>
      </div>
    </>
  );
};

SP.AnnualReportPreview = SP.AnnualReportHome;
SP.AnnualReportExport = SP.AnnualReportHome;
