/* ============================================================
   subsystems/pcces.js — 工程預算書 + PCCES XML 4.3 編製
   ============================================================ */

window.SP = window.SP || {};

const { Routes: PRoutes, Route: PRoute, useNavigate: usePNav } = ReactRouterDOM;

SP.PccesPage = function PccesPage() {
  return (
    <PRoutes>
      <PRoute path="/"        element={<SP.PccesHome />} />
      <PRoute path="/wizard"  element={<SP.PccesWizard />} />
      <PRoute path="/items"   element={<SP.PccesItems />} />
      <PRoute path="/budget"  element={<SP.PccesBudget />} />
      <PRoute path="*"        element={<SP.PccesHome />} />
    </PRoutes>
  );
};

/* ---------- 工項編碼資料庫（PCCES 4.3） ---------- */
SP.PCCES_ITEMS = [
  { code: "03210010", name: "鋼筋混凝土路面修復",   unit: "m²", price: 1850, level: 4 },
  { code: "03210020", name: "AC 路面鋪設",            unit: "m²", price: 850,  level: 4 },
  { code: "03210030", name: "AC 路面切割",            unit: "m",  price: 320,  level: 4 },
  { code: "03220010", name: "管溝開挖（深 1.5m）",    unit: "m",  price: 2400, level: 4 },
  { code: "03220020", name: "管溝回填壓實",            unit: "m³", price: 580,  level: 4 },
  { code: "03230010", name: "DIP DN150 直管",         unit: "m",  price: 1850, level: 4 },
  { code: "03230020", name: "DIP DN200 直管",         unit: "m",  price: 2350, level: 4 },
  { code: "03230030", name: "DIP DN300 直管",         unit: "m",  price: 3650, level: 4 },
  { code: "03240010", name: "DIP 法蘭接頭",            unit: "個", price: 5200, level: 4 },
  { code: "03240020", name: "止水閥 DN150",            unit: "個", price: 18500, level: 4 },
  { code: "03250010", name: "現場保護圍籬",            unit: "m",  price: 280,  level: 4 },
  { code: "03250020", name: "交維號誌設置",            unit: "處", price: 4500, level: 4 },
  { code: "03260010", name: "監工人力",                unit: "人日", price: 5500, level: 4 },
  { code: "03260020", name: "現場保險",                unit: "案", price: 12000, level: 4 },
  { code: "03260030", name: "施工照片紀錄",            unit: "案", price: 800,  level: 4 },
];

SP.PccesHome = function PccesHome() {
  const navigate = usePNav();
  const { state } = SP.useStore();
  const repairCases = state.cases.filter(c => c.status === "結案" || c.status === "已修" || c.status === "修復中");

  return (
    <>
      <SP.PageHeader
        title="PCCES 工程預算書"
        subtitle="工程細目編碼 PCCES XML 4.3 + 編碼正確率 ≥ 40% 自動檢核"
        breadcrumb={["首頁", "工程預算 / PCCES"]}
        rfp="附錄一 四(八)"
        actions={<SP.Button variant="primary" onClick={() => navigate("/pcces/wizard")}>開始新預算書 wizard</SP.Button>}
      />

      <div className="kpi-grid">
        <SP.KpiCard label="工項編碼"     value={SP.PCCES_ITEMS.length} suffix="項" hint="PCCES 4.3 工程會標準" />
        <SP.KpiCard label="本月新增"     value="8" suffix="件" tone="pass" delta={12.5} />
        <SP.KpiCard label="平均編碼正確率" value="83%" tone="pass" hint="≥ RFP 40% 門檻" />
        <SP.KpiCard label="待簽預算書"   value="2" suffix="件" tone="high" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "var(--space-5)" }}>
        <SP.Card title="可建預算書案件" subtitle="從已修 / 結案案件選一個建立預算書" action={
          <SP.Button size="sm" variant="primary" onClick={() => navigate("/pcces/wizard")}>進入 wizard</SP.Button>
        }>
          <SP.Table
            compact
            headers={["案號", "標題", "建議金額", "操作"]}
            rows={repairCases.slice(0, 5).map(c => [
              <span className="font-mono text-sm">{c.caseNo}</span>,
              <span className="text-sm">{c.title}</span>,
              <span className="text-sm font-mono">{SP.format.money(15000 + (Math.abs(c.id.charCodeAt(0) || 0) * 257) % 30000)}</span>,
              <SP.Button size="sm" variant="primary" onClick={() => navigate("/pcces/wizard?case=" + c.id)}>建預算書</SP.Button>,
            ])}
          />
        </SP.Card>

        <SP.Card title="快速入口">
          <div className="flex-col" style={{ gap: "var(--space-3)" }}>
            <SP.Button variant="secondary" onClick={() => navigate("/pcces/items")}>📚 工項編碼資料庫（{SP.PCCES_ITEMS.length} 項）</SP.Button>
            <SP.Button variant="secondary" onClick={() => navigate("/pcces/budget")}>📊 預算書查詢</SP.Button>
            <SP.Button variant="secondary" onClick={() => navigate("/pcces/wizard")}>🧙 5 步驟 wizard</SP.Button>
          </div>
        </SP.Card>
      </div>
    </>
  );
};

/* ---------- 5 步驟 wizard ---------- */
SP.PccesWizard = function PccesWizard() {
  const { state } = SP.useStore();
  const navigate = usePNav();
  const toast = SP.useToast();
  const [step, setStep] = React.useState(1);
  const [selectedCase, setSelectedCase] = React.useState(state.cases[0]);
  const [items, setItems] = React.useState([
    { ...SP.PCCES_ITEMS[3], qty: 8 },
    { ...SP.PCCES_ITEMS[4], qty: 12 },
    { ...SP.PCCES_ITEMS[5], qty: 6 },
    { ...SP.PCCES_ITEMS[8], qty: 2 },
    { ...SP.PCCES_ITEMS[11], qty: 1 },
    { ...SP.PCCES_ITEMS[12], qty: 3 },
  ]);

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const accuracy = 83;  // demo 編碼正確率
  const passThreshold = accuracy >= 40;

  const stepName = ["", "選擇案件", "系統建議工項", "編碼正確率檢核", "XML 預覽", "上傳"];

  return (
    <>
      <SP.PageHeader
        title="PCCES 預算書 wizard"
        subtitle={"步驟 " + step + " / 5：" + stepName[step]}
        breadcrumb={["首頁", "PCCES", "wizard"]}
        rfp="四(八)3"
        actions={<SP.Button variant="ghost" onClick={() => navigate("/pcces")}>取消</SP.Button>}
      />

      {/* Stepper */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} style={{
            padding: "0.5rem 1rem",
            background: n <= step ? "var(--tw-primary)" : "var(--bg-muted)",
            color: n <= step ? "var(--text-inverse)" : "var(--text-muted)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            fontWeight: n === step ? 700 : 500,
          }}>
            {n}. {stepName[n]}
          </div>
        ))}
      </div>

      <SP.Card>
        {step === 1 && (
          <div>
            <h3 style={{ marginTop: 0 }}>選擇案件</h3>
            <p className="text-sm muted">從已完成檢漏 / 修漏的案件中選擇要編製工程預算書的對象。</p>
            <SP.Table
              compact
              headers={["案號", "標題", "區處", "選"]}
              rows={state.cases.slice(0, 10).map(c => [
                <span className="font-mono text-sm">{c.caseNo}</span>,
                <span>{c.title}</span>,
                <span className="text-sm muted">{c.region.replace("處", "")}</span>,
                <input type="radio" name="case" checked={selectedCase?.id === c.id} onChange={() => setSelectedCase(c)} />,
              ])}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ marginTop: 0 }}>系統建議工項（含 PCCES 編碼）</h3>
            <p className="text-sm muted">針對案件 <strong>{selectedCase?.caseNo}</strong> 自動推薦工項。可調整數量。</p>
            <SP.Table
              compact
              headers={["編碼", "工項名稱", "單位", "單價", "數量", "小計"]}
              rows={items.map((it, i) => [
                <span className="font-mono text-xs">{it.code}</span>,
                <span>{it.name}</span>,
                <span className="text-sm muted">{it.unit}</span>,
                <span className="font-mono text-sm">{SP.format.money(it.price)}</span>,
                <input type="number" value={it.qty} min={0} style={{ width: "4rem", padding: "0.25rem", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)" }}
                  onChange={e => setItems(items.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) } : x))} />,
                <span className="font-mono text-sm" style={{ fontWeight: 600 }}>{SP.format.money(it.qty * it.price)}</span>,
              ])}
            />
            <div className="mt-4" style={{ textAlign: "right", fontSize: "var(--text-lg)", fontWeight: 700 }}>
              總計：<span style={{ color: "var(--tw-primary)" }}>{SP.format.money(total)}</span>
              {total > 10000000 && <SP.Badge tone="critical">&gt; 1000 萬 警示</SP.Badge>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ marginTop: 0 }}>編碼正確率檢核</h3>
            <p className="text-sm muted">RFP 附錄一 四(八) 3 要求 PCCES 編碼正確率 ≥ 40%。</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
              <SP.KpiCard label="編碼正確率" value={accuracy + "%"} tone={passThreshold ? "pass" : "critical"} hint={passThreshold ? "✓ 通過 40% 門檻" : "✗ 未達門檻"} />
              <SP.KpiCard label="檢核項數" value={items.length} suffix="項" />
            </div>
            <div className="mt-4">
              <SP.ProgressBar label="正確率" value={accuracy} tone={passThreshold ? "pass" : "critical"} />
            </div>
            <div className="mt-4" style={{ padding: "var(--space-3)", background: "var(--bg-pass)", borderRadius: "var(--radius-md)" }}>
              <strong style={{ color: "var(--color-pass)" }}>✓ 檢核通過</strong>
              <ul className="text-sm mt-2" style={{ marginBottom: 0 }}>
                <li>所有工項已附 8 碼 PCCES 編碼（Level 4）</li>
                <li>單價符合工程會 PCCES 4.3 參考標準</li>
                <li>數量單位符合規定</li>
              </ul>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 style={{ marginTop: 0 }}>PCCES XML 預覽</h3>
            <p className="text-sm muted">PCCES XML 4.3 格式 ・ 可下載 / 列印 / 直接上傳工程會平台。</p>
            <pre style={{
              background: "var(--bg-overlay)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-mono)",
              overflow: "auto",
              maxHeight: "28rem",
              border: "1px solid var(--border-base)",
            }}>{generateXml(selectedCase, items, total)}</pre>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 style={{ marginTop: 0 }}>上傳工程會 PCCES 平台</h3>
            <div style={{ padding: "var(--space-4)", background: "var(--bg-low)", borderRadius: "var(--radius-md)" }}>
              <div className="text-sm">案件：<strong>{selectedCase?.caseNo} ・ {selectedCase?.title}</strong></div>
              <div className="text-sm">工項數：{items.length} 項</div>
              <div className="text-sm">總金額：<strong>{SP.format.money(total)}</strong></div>
              <div className="text-sm">編碼正確率：<strong>{accuracy}% ✓</strong></div>
            </div>
            <div className="mt-4 flex-col" style={{ gap: "var(--space-3)" }}>
              <SP.Button variant="primary" size="lg" onClick={() => { toast({ kind: "pass", title: "✓ 已上傳工程會", body: "PCCES 編號 PCC-2026-" + (selectedCase?.caseNo.replace("115-", "")) }); navigate("/pcces"); }}>上傳工程會 PCCES 平台</SP.Button>
              <SP.Button variant="secondary" onClick={() => toast({ kind: "pass", title: "已下載 ODS" })}>📥 匯出 ODS</SP.Button>
              <SP.Button variant="secondary" onClick={() => toast({ kind: "pass", title: "已下載 XML" })}>📥 下載 XML</SP.Button>
            </div>
          </div>
        )}

        <div className="mt-6 flex-row" style={{ justifyContent: "space-between" }}>
          <SP.Button variant="secondary" disabled={step === 1} onClick={() => setStep(s => s - 1)}>← 上一步</SP.Button>
          <SP.Button variant="primary" disabled={step === 5} onClick={() => setStep(s => s + 1)}>下一步 →</SP.Button>
        </div>
      </SP.Card>
    </>
  );
};

function generateXml(c, items, total) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<PCCES version="4.3" xmlns="http://www.pcc.gov.tw/pcces/4.3">
  <Project>
    <ProjectNo>${c?.caseNo || ""}</ProjectNo>
    <ProjectName>${c?.title || ""}</ProjectName>
    <Owner>台灣自來水股份有限公司 ${c?.region || ""}</Owner>
    <Location>
      <Address>${c?.address || ""}</Address>
      <GPS lng="${c?.lng}" lat="${c?.lat}" />
    </Location>
    <Currency>TWD</Currency>
  </Project>
  <Items count="${items.length}">
${items.map(it => `    <Item code="${it.code}" level="${it.level}">
      <Name>${it.name}</Name>
      <Unit>${it.unit}</Unit>
      <UnitPrice>${it.price}</UnitPrice>
      <Quantity>${it.qty}</Quantity>
      <Subtotal>${it.qty * it.price}</Subtotal>
    </Item>`).join("\n")}
  </Items>
  <Total>${total}</Total>
  <Approval>
    <CodingAccuracy>83</CodingAccuracy>
    <Threshold>40</Threshold>
    <Pass>true</Pass>
  </Approval>
</PCCES>`;
}

/* ---------- 工項編碼資料庫 ---------- */
SP.PccesItems = function PccesItems() {
  const navigate = usePNav();
  return (
    <>
      <SP.PageHeader title="工項編碼資料庫" subtitle="PCCES 4.3 工程會標準 ・ Level 4 細目" breadcrumb={["首頁", "PCCES", "編碼資料庫"]} rfp="四(八)1"
        actions={<SP.Button variant="ghost" onClick={() => navigate("/pcces")}>返回</SP.Button>} />
      <SP.Card padding="0">
        <SP.Table
          headers={["編碼", "工項名稱", "單位", "單價", "Level"]}
          rows={SP.PCCES_ITEMS.map(it => [
            <span className="font-mono text-sm">{it.code}</span>,
            <span>{it.name}</span>,
            <span className="text-sm muted">{it.unit}</span>,
            <span className="font-mono text-sm">{SP.format.money(it.price)}</span>,
            <SP.Badge tone="info">Level {it.level}</SP.Badge>,
          ])}
        />
      </SP.Card>
    </>
  );
};

SP.PccesBudget = function PccesBudget() {
  const navigate = usePNav();
  const budgets = [
    { id: "BU-2026-0023", title: "中港路二段管線汰換", date: "2026-05-22", items: 12, total: 285000, status: "approved", contractor: "宏華水利工程" },
    { id: "BU-2026-0022", title: "美村路一段水壓改善", date: "2026-05-20", items: 8,  total: 162000, status: "approved", contractor: "禾川管路" },
    { id: "BU-2026-0021", title: "三民路三段管材更新", date: "2026-05-18", items: 15, total: 412000, status: "pending",  contractor: "達誠工程" },
    { id: "BU-2026-0020", title: "崇德路二段馬路凹陷修復", date: "2026-05-15", items: 10, total: 198500, status: "approved", contractor: "鴻泰土木" },
    { id: "BU-2026-0019", title: "雙十路二段地面冒水", date: "2026-05-12", items: 14, total: 358000, status: "in_review", contractor: "天工水管" },
    { id: "BU-2026-0018", title: "復興路西區段管溝開挖", date: "2026-05-10", items: 9,  total: 145000, status: "approved", contractor: "中興工程" },
  ];
  const STATUS_TONE = { approved: "pass", pending: "high", in_review: "medium", rejected: "critical" };
  const STATUS_LABEL = { approved: "已核", pending: "待簽", in_review: "審核中", rejected: "退回" };

  return (
    <>
      <SP.PageHeader title="預算書查詢" subtitle="6 個分頁 ・ 封面 / 總表 / 進度 / 詳細 / 單價 / 資源" breadcrumb={["首頁", "PCCES", "預算書查詢"]} rfp="附錄一 四(八)6"
        actions={<><SP.Button variant="primary" onClick={() => navigate("/pcces/wizard")}>新增預算書</SP.Button><SP.Button variant="ghost" onClick={() => navigate("/pcces")}>返回</SP.Button></>} />

      <div className="kpi-grid">
        <SP.KpiCard label="本月新增"   value={budgets.length} suffix="件" />
        <SP.KpiCard label="總金額"     value={SP.format.money(budgets.reduce((s, b) => s + b.total, 0))} />
        <SP.KpiCard label="已核"       value={budgets.filter(b => b.status === "approved").length} suffix="件" tone="pass" />
        <SP.KpiCard label="待簽 / 審核" value={budgets.filter(b => ["pending", "in_review"].includes(b.status)).length} suffix="件" tone="high" />
      </div>

      <SP.Card title="預算書清單">
        <SP.Table
          headers={["編號", "案件", "日期", "工項數", "總金額", "廠商", "狀態", "操作"]}
          rows={budgets.map(b => [
            <span className="font-mono text-sm">{b.id}</span>,
            <span style={{ fontWeight: 600 }}>{b.title}</span>,
            <span className="text-sm muted">{b.date}</span>,
            <span className="text-sm">{b.items} 項</span>,
            <span className="font-mono text-sm">{SP.format.money(b.total)}</span>,
            <span className="text-sm">{b.contractor}</span>,
            <SP.Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</SP.Badge>,
            <span style={{ display: "inline-flex", gap: "0.5rem" }}>
              <SP.Button size="sm" variant="primary">檢視</SP.Button>
              <SP.Button size="sm" variant="secondary">下載 XML</SP.Button>
            </span>,
          ])}
        />
      </SP.Card>
    </>
  );
};
