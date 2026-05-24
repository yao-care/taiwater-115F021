/* ============================================================
   subsystems/mobile.js — 行動版（檢漏員 5 頁 + 修漏員留階段 4）
   ============================================================ */

window.SP = window.SP || {};

const { Routes: MRoutes, Route: MRoute, useNavigate: useMNav } = ReactRouterDOM;

/* ---------- 子系統 Router ---------- */
SP.MobilePage = function MobilePage() {
  return (
    <MRoutes>
      <MRoute path="/"            element={<SP.MobileChooser />} />
      <MRoute path="/inspector/*" element={<SP.MobileInspector />} />
      <MRoute path="/repairer/*"  element={<SP.MobileRepairerStub />} />
      <MRoute path="*"            element={<SP.MobileChooser />} />
    </MRoutes>
  );
};

/* ---------- MobileChooser（裝置選擇） ---------- */
SP.MobileChooser = function MobileChooser() {
  const navigate = useMNav();
  return (
    <>
      <SP.PageHeader title="行動版" subtitle="選擇要演示的角色行動版" breadcrumb={["首頁", "行動版"]} rfp="附錄一 二" />
      <div style={{ display: "flex", gap: "var(--space-5)", justifyContent: "center", padding: "var(--space-6)" }}>
        <SP.Card title="📱 檢漏員行動版" subtitle="王志強 ・ 第四區處">
          <ul className="text-sm" style={{ paddingLeft: "1.25rem" }}>
            <li>今日任務（依距離排序）</li>
            <li>案件 GPS 自動定位（WGS84 + TWD97）</li>
            <li>現場拍照 + 一鍵上傳</li>
            <li>工作日報</li>
            <li>管線圖資</li>
          </ul>
          <div className="mt-4">
            <SP.Button variant="primary" onClick={() => navigate("/mobile/inspector")}>進入檢漏員行動版</SP.Button>
          </div>
        </SP.Card>
        <SP.Card title="🔧 修漏員行動版" subtitle="林文雄 ・ 第四區處">
          <ul className="text-sm" style={{ paddingLeft: "1.25rem" }}>
            <li>派工任務</li>
            <li>實修登錄（挖填 / 漏水量 / 費用）</li>
            <li>監工照片</li>
            <li>一鍵結案</li>
            <li>統計</li>
          </ul>
          <div className="mt-4">
            <SP.Button variant="secondary" onClick={() => navigate("/mobile/repairer")}>進入修漏員行動版</SP.Button>
            <div className="text-xs muted mt-2">階段 4 補完整功能</div>
          </div>
        </SP.Card>
      </div>
    </>
  );
};

/* ============================================================
   檢漏員行動版（PhoneFrame + state 切頁）
   ============================================================ */
SP.MobileInspector = function MobileInspector() {
  const { state, dispatch } = SP.useStore();
  const navigate = useMNav();
  const toast = SP.useToast();
  const user = state.currentUser;
  const [tab, setTab] = React.useState("tasks");
  const [selectedCase, setSelectedCase] = React.useState(null);
  const [photoMode, setPhotoMode] = React.useState(false);
  const [tempPhotos, setTempPhotos] = React.useState([]);

  // 自動切到對應檢漏員視角（demo 用）
  const inspectorUser = user?.role === "inspector"
    ? user
    : state.users.find(u => u.id === "U005");  // 王志強

  const myTasks = state.cases.filter(c =>
    c.assignedTo === inspectorUser?.id && ["派工", "檢漏中"].includes(c.status)
  );

  const myUnreadNotifs = inspectorUser
    ? state.notifications.filter(n => n.recipient === inspectorUser.id && !n.read).length
    : 0;

  // ---------- 內部頁面：任務列表 ----------
  const TasksPage = (
    <>
      <SP.MobileAppBar
        title="今日任務"
        sub={"👋 " + (inspectorUser?.name || "—") + " ・ " + (inspectorUser?.plant || "—")}
        right={myUnreadNotifs > 0 ? <span className="badge badge--critical" style={{ marginRight: 4 }}>🔔 {myUnreadNotifs}</span> : null}
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        <div style={{ fontSize: "var(--text-sm)", marginBottom: "0.5rem", padding: "0 0.25rem" }}>
          今天有 <strong>{myTasks.length}</strong> 件待處理
        </div>
        {myTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)" }}>
            🎉 目前沒有指派任務<br/>
            <span className="text-xs">廠所派工後會立即收到通知</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {myTasks.map(c => (
              <div
                key={c.id}
                onClick={() => { setSelectedCase(c); setTab("case-detail"); setTempPhotos([]); }}
                style={{
                  background: "var(--bg-surface)",
                  borderLeft: "4px solid var(--color-" + c.severity + ")",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <SP.SeverityBadge severity={c.severity} />
                  <span className="text-xs muted">{c.caseNo}</span>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "var(--text-sm)", fontWeight: 600 }}>{c.title}</div>
                <div className="text-xs muted mt-2" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span>📍 {c.address}</span>
                </div>
                <div className="mt-2" style={{ display: "flex", gap: "0.5rem" }}>
                  <SP.MobileButton fullWidth={false} variant="secondary" onClick={(e) => { e.stopPropagation(); toast({ title: "已啟動導航", body: "Google Maps 開啟中..." }); }}>🗺 導航</SP.MobileButton>
                  <SP.MobileButton fullWidth={false} variant="primary" onClick={(e) => { e.stopPropagation(); setSelectedCase(c); setTab("case-detail"); setTempPhotos([]); }}>開始處理</SP.MobileButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ---------- 內部頁面：案件詳情 ----------
  const CaseDetailPage = selectedCase && (
    <>
      <SP.MobileAppBar
        title={"案件 " + selectedCase.caseNo}
        onBack={() => { setSelectedCase(null); setTab("tasks"); setTempPhotos([]); }}
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--text-base)", marginBottom: "0.5rem" }}>{selectedCase.title}</div>
        <div className="text-sm" style={{ marginBottom: "0.75rem" }}>
          📍 {selectedCase.address}
        </div>

        <SP.CoordinateBox lng={selectedCase.lng} lat={selectedCase.lat} />

        <div style={{ marginTop: "0.75rem", marginBottom: "0.5rem", fontWeight: 600, fontSize: "var(--text-sm)" }}>
          📷 現場照片 ({tempPhotos.length}/9)
        </div>
        <SP.MobilePhotoGrid
          photos={tempPhotos}
          max={9}
          onAdd={() => setTempPhotos([...tempPhotos, "IMG_" + Date.now() + ".jpg"])}
          onRemove={(i) => setTempPhotos(tempPhotos.filter((_, idx) => idx !== i))}
        />

        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <SP.MobileButton
            variant="secondary"
            icon="📷"
            onClick={() => setTempPhotos([...tempPhotos, "IMG_" + Date.now() + ".jpg"])}
          >
            拍照（自動嵌入 GPS）
          </SP.MobileButton>
          <SP.MobileButton
            variant="primary"
            icon="✓"
            disabled={tempPhotos.length === 0}
            onClick={() => {
              dispatch({
                type: "SUBMIT_INSPECTION",
                payload: {
                  caseId: selectedCase.id,
                  inspectorId: inspectorUser.id,
                  gps: [selectedCase.lng, selectedCase.lat],
                  photos: tempPhotos,
                  method: "聲學 + 拍照",
                  note: "現場確認漏水，已拍照 " + tempPhotos.length + " 張",
                },
              });
              toast({ kind: "pass", title: "✓ 已上傳", body: "案件 " + selectedCase.caseNo + " ・ 廠所已收到通知" });
              setSelectedCase(null);
              setTempPhotos([]);
              setTab("tasks");
            }}
          >
            一鍵送出（自動帶 GPS / 照片）
          </SP.MobileButton>
        </div>

        {/* Timeline */}
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}>Timeline</div>
          <SP.CaseTimeline timeline={selectedCase.timeline} users={state.users} />
        </div>
      </div>
    </>
  );

  // ---------- 內部頁面：地圖 ----------
  const MapPage = (
    <>
      <SP.MobileAppBar title="案件地圖" sub={inspectorUser?.region} />
      <div style={{ flex: 1, padding: "0.5rem", overflowY: "auto" }}>
        <SP.GisMap cases={myTasks.length > 0 ? myTasks : state.cases.slice(0, 20)} height={400} layers={{ wmts: true, wms: false, pipes: false, cases: true }} onMarkerClick={c => { setSelectedCase(c); setTab("case-detail"); setTempPhotos([]); }} />
        <div className="text-xs muted mt-2" style={{ textAlign: "center" }}>{myTasks.length > 0 ? "我的任務 " + myTasks.length + " 件" : "全部案件 (demo)"}</div>
      </div>
    </>
  );

  // ---------- 內部頁面：拍照（從 detail 拍照分離出來，這頁只是入口） ----------
  const PhotoPage = (
    <>
      <SP.MobileAppBar title="現場拍照" sub="選擇案件後即可開始" />
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        {myTasks.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0" }}>
            無待處理任務<br/>
            <span className="text-xs">請等待廠所派工</span>
          </div>
        ) : (
          <div className="text-sm muted" style={{ marginBottom: "0.5rem" }}>選擇要拍照的案件</div>
        )}
        {myTasks.map(c => (
          <SP.MobileListItem
            key={c.id}
            icon="📷"
            severity={c.severity}
            title={c.caseNo + " ・ " + c.title}
            subtitle={c.address}
            onClick={() => { setSelectedCase(c); setTab("case-detail"); }}
          />
        ))}
      </div>
    </>
  );

  // ---------- 內部頁面：工作日報 ----------
  const todayInspections = state.inspections.filter(i =>
    i.by === inspectorUser?.id &&
    new Date(i.at).toDateString() === new Date().toDateString()
  );

  const DailyPage = (
    <>
      <SP.MobileAppBar title="工作日報" sub={SP.format.date(new Date().toISOString())} />
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <div style={{
          background: "var(--bg-surface)", padding: "1rem", borderRadius: "var(--radius-md)",
          marginBottom: "0.75rem", textAlign: "center",
        }}>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--tw-primary)" }}>{todayInspections.length}</div>
          <div className="text-sm muted">本日已完成檢漏</div>
        </div>

        <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}>本日紀錄</div>
        {todayInspections.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "1rem 0" }}>本日尚無檢漏紀錄</div>
        ) : todayInspections.map(i => {
          const c = state.cases.find(c => c.id === i.caseId);
          return (
            <div key={i.id} style={{
              background: "var(--bg-surface)", padding: "0.625rem", borderRadius: "var(--radius-md)",
              marginBottom: "0.5rem",
            }}>
              <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{c?.caseNo} ・ {c?.title || "—"}</div>
              <div className="text-xs muted">{SP.format.datetime(i.at).slice(11)} ・ 方法：{i.method} ・ 照片 {i.photos.length}</div>
            </div>
          );
        })}

        <div className="mt-4">
          <SP.MobileButton variant="primary" icon="📄" onClick={() => toast({ kind: "pass", title: "日報已產生", body: "已上傳到廠所 ・ 中港廠所" })}>產生今日日報（一鍵）</SP.MobileButton>
        </div>
      </div>
    </>
  );

  // ---------- 內部頁面：設定 ----------
  const SettingsPage = (
    <>
      <SP.MobileAppBar title="設定" />
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <SP.MobileListItem icon="👤" title={inspectorUser?.name || "—"} subtitle={SP.roleLabel(inspectorUser?.role) + " ・ " + inspectorUser?.plant} />
        <SP.MobileListItem icon="🔔" title="通知設定" subtitle={"未讀 " + myUnreadNotifs + " 則"} />
        <SP.MobileListItem icon="📍" title="GPS 自動定位" subtitle="WGS84 + TWD97 雙坐標" />
        <SP.MobileListItem icon="📷" title="相機解析度" subtitle="高 (4032×3024) ・ 自動嵌入 GPS EXIF" />
        <SP.MobileListItem icon="🔐" title="變更密碼" />
        <SP.MobileListItem icon="↩" title="登出（返回桌面）" onClick={() => navigate("/")} />
        <div className="text-xs muted mt-4" style={{ textAlign: "center" }}>檢修漏管理 App v1.0 ・ POC Demo</div>
      </div>
    </>
  );

  const tabs = [
    { id: "tasks", label: "案件", icon: "📋" },
    { id: "map",   label: "地圖", icon: "🗺" },
    { id: "photo", label: "拍照", icon: "📷" },
    { id: "daily", label: "日報", icon: "📊" },
    { id: "settings", label: "設定", icon: "⚙" },
  ];

  return (
    <>
      <SP.PageHeader
        title="行動版（檢漏員）"
        subtitle="王志強 ・ 中港廠所 ・ React 元件真實可操作"
        breadcrumb={["首頁", "行動版", "檢漏員"]}
        rfp="附錄一 二(二)"
      />
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-4)" }}>
        <SP.PhoneFrame>
          {tab === "case-detail" && selectedCase ? CaseDetailPage :
           tab === "tasks"    ? TasksPage :
           tab === "map"      ? MapPage :
           tab === "photo"    ? PhotoPage :
           tab === "daily"    ? DailyPage :
           tab === "settings" ? SettingsPage : TasksPage}
          {tab !== "case-detail" && (
            <SP.MobileTabBar tabs={tabs} active={tab} onChange={setTab} />
          )}
        </SP.PhoneFrame>
      </div>
    </>
  );
};

/* ============================================================
   修漏員行動版（完整版 階段 4）
   ============================================================ */
SP.MobileRepairerStub = function MobileRepairer() {
  const { state, dispatch } = SP.useStore();
  const navigate = useMNav();
  const toast = SP.useToast();
  const user = state.currentUser;
  const [tab, setTab] = React.useState("tasks");
  const [selectedCase, setSelectedCase] = React.useState(null);
  const [repairForm, setRepairForm] = React.useState({
    method: "管材更新", excavation: "0.8m×1.5m", cost: 18500,
    leakageM3: 12, supervisor: "U004", photos: [], note: "",
  });

  const repairerUser = user?.role === "repairer" ? user : state.users.find(u => u.id === "U006");

  // 我的派工：assignedTo 是我 + status 為「待修」「修復中」
  const myTasks = state.cases.filter(c =>
    ["待修", "修復中"].includes(c.status) && c.region === repairerUser?.region
  );

  const myUnread = repairerUser
    ? state.notifications.filter(n => n.recipient === repairerUser.id && !n.read).length
    : 0;

  const myRepairs = state.repairs.filter(r => r.by === repairerUser?.id);
  const totalCost = myRepairs.reduce((sum, r) => sum + r.cost, 0);

  // ---------- 任務列表 ----------
  const TasksPage = (
    <>
      <SP.MobileAppBar
        title="派工任務"
        sub={"🔧 " + (repairerUser?.name || "—") + " ・ " + (repairerUser?.plant || "—")}
        right={myUnread > 0 ? <span className="badge badge--critical" style={{ marginRight: 4 }}>🔔 {myUnread}</span> : null}
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        <div style={{ fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}>
          今天有 <strong>{myTasks.length}</strong> 件修漏任務
        </div>
        {myTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)" }}>
            🎉 目前沒有派工任務
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {myTasks.map(c => (
              <div
                key={c.id}
                onClick={() => { setSelectedCase(c); setTab("repair"); setRepairForm({ ...repairForm, photos: [] }); }}
                style={{
                  background: "var(--bg-surface)",
                  borderLeft: "4px solid var(--color-" + c.severity + ")",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <SP.SeverityBadge severity={c.severity} />
                  <span className="text-xs muted">{c.caseNo}</span>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "var(--text-sm)", fontWeight: 600 }}>{c.title}</div>
                <div className="text-xs muted mt-2">📍 {c.address}</div>
                <div className="text-xs" style={{ marginTop: "0.25rem", color: "var(--color-pass)" }}>✓ 已完成檢漏，可開工</div>
                <div className="mt-2">
                  <SP.MobileButton variant="primary" onClick={(e) => { e.stopPropagation(); setSelectedCase(c); setTab("repair"); setRepairForm({ ...repairForm, photos: [] }); }}>開始實修登錄</SP.MobileButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ---------- 實修登錄 ----------
  const RepairPage = selectedCase ? (
    <>
      <SP.MobileAppBar
        title={"實修 " + selectedCase.caseNo}
        onBack={() => { setSelectedCase(null); setTab("tasks"); }}
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--text-base)", marginBottom: "0.25rem" }}>{selectedCase.title}</div>
        <div className="text-sm muted mb-4">📍 {selectedCase.address}</div>

        <SP.CoordinateBox lng={selectedCase.lng} lat={selectedCase.lat} />

        <div style={{ marginTop: "0.75rem" }}>
          <SP.MobileInput
            label="修復方法"
            value={repairForm.method}
            onChange={v => setRepairForm({ ...repairForm, method: v })}
          />
          <SP.MobileInput
            label="挖填規格"
            value={repairForm.excavation}
            onChange={v => setRepairForm({ ...repairForm, excavation: v })}
          />
          <SP.MobileInput
            label="漏水量（m³）"
            type="number"
            value={repairForm.leakageM3}
            onChange={v => setRepairForm({ ...repairForm, leakageM3: Number(v) })}
          />
          <SP.MobileInput
            label="修復費用（元）"
            type="number"
            value={repairForm.cost}
            onChange={v => setRepairForm({ ...repairForm, cost: Number(v) })}
          />

          <div style={{ marginBottom: "0.5rem", fontWeight: 600, fontSize: "var(--text-sm)" }}>📷 監工照片 ({repairForm.photos.length}/9)</div>
          <SP.MobilePhotoGrid
            photos={repairForm.photos}
            max={9}
            onAdd={() => setRepairForm({ ...repairForm, photos: [...repairForm.photos, "REPAIR_IMG_" + Date.now() + ".jpg"] })}
            onRemove={(i) => setRepairForm({ ...repairForm, photos: repairForm.photos.filter((_, idx) => idx !== i) })}
          />

          <SP.MobileInput
            label="備註"
            value={repairForm.note}
            onChange={v => setRepairForm({ ...repairForm, note: v })}
            multiline
            placeholder="完工說明 / 注意事項"
          />

          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <SP.MobileButton
              variant="primary"
              icon="✓"
              onClick={() => {
                dispatch({
                  type: "SUBMIT_REPAIR",
                  payload: {
                    caseId: selectedCase.id,
                    repairerId: repairerUser.id,
                    method: repairForm.method,
                    excavation: repairForm.excavation,
                    cost: repairForm.cost,
                    photos: repairForm.photos,
                    note: repairForm.note || "修復完成，漏水量 " + repairForm.leakageM3 + " m³",
                    supervisor: repairForm.supervisor,
                  },
                });
                toast({ kind: "pass", title: "✓ 已結案", body: selectedCase.caseNo + " ・ 客服已收到通知" });
                setSelectedCase(null); setTab("tasks");
                setRepairForm({ ...repairForm, photos: [], note: "" });
              }}
            >
              一鍵結案（自動回客服）
            </SP.MobileButton>
            <SP.MobileButton variant="secondary" onClick={() => { setSelectedCase(null); setTab("tasks"); }}>取消</SP.MobileButton>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <SP.MobileAppBar title="實修登錄" />
      <div style={{ flex: 1, padding: "1rem", textAlign: "center", color: "var(--text-muted)" }}>
        請從「派工」選擇案件
      </div>
    </>
  );

  // ---------- 地圖 ----------
  const MapPage = (
    <>
      <SP.MobileAppBar title="案件地圖" sub={repairerUser?.region} />
      <div style={{ flex: 1, padding: "0.5rem", overflowY: "auto" }}>
        <SP.GisMap cases={myTasks.length > 0 ? myTasks : state.cases.slice(0, 20)} height={400} layers={{ wmts: true, wms: false, pipes: false, cases: true }} onMarkerClick={c => { setSelectedCase(c); setTab("repair"); setRepairForm({ ...repairForm, photos: [] }); }} />
      </div>
    </>
  );

  // ---------- 統計 ----------
  const StatsPage = (
    <>
      <SP.MobileAppBar title="統計" sub={"本月已修 " + myRepairs.length + " 件"} />
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <div style={{ background: "var(--bg-surface)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "0.75rem", textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--tw-primary)" }}>{myRepairs.length}</div>
          <div className="text-sm muted">本月已修案件</div>
        </div>
        <div style={{ background: "var(--bg-surface)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "0.75rem", textAlign: "center" }}>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--color-pass)" }}>{SP.format.money(totalCost)}</div>
          <div className="text-sm muted">本月總費用</div>
        </div>
        <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: "0.5rem" }}>近期紀錄</div>
        {myRepairs.length === 0 ? (
          <div className="text-sm muted" style={{ textAlign: "center", padding: "1rem 0" }}>尚無紀錄</div>
        ) : myRepairs.slice(0, 5).map(r => {
          const c = state.cases.find(c => c.id === r.caseId);
          return (
            <div key={r.id} style={{ background: "var(--bg-surface)", padding: "0.625rem", borderRadius: "var(--radius-md)", marginBottom: "0.5rem" }}>
              <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{c?.caseNo} ・ {c?.title || "—"}</div>
              <div className="text-xs muted">{SP.format.datetime(r.at)} ・ {r.method} ・ {SP.format.money(r.cost)}</div>
            </div>
          );
        })}
      </div>
    </>
  );

  // ---------- 設定 ----------
  const SettingsPage = (
    <>
      <SP.MobileAppBar title="設定" />
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <SP.MobileListItem icon="👤" title={repairerUser?.name || "—"} subtitle={SP.roleLabel(repairerUser?.role) + " ・ " + repairerUser?.plant} />
        <SP.MobileListItem icon="🔔" title="通知設定" subtitle={"未讀 " + myUnread + " 則"} />
        <SP.MobileListItem icon="🏗️" title="開挖回填規範" />
        <SP.MobileListItem icon="📷" title="監工照片解析度" subtitle="高 ・ 自動嵌入時戳" />
        <SP.MobileListItem icon="🔐" title="變更密碼" />
        <SP.MobileListItem icon="↩" title="登出（返回桌面）" onClick={() => navigate("/")} />
      </div>
    </>
  );

  const tabs = [
    { id: "tasks", label: "派工", icon: "📋" },
    { id: "map",   label: "地圖", icon: "🗺" },
    { id: "repair", label: "實修", icon: "🔧" },
    { id: "stats", label: "統計", icon: "📊" },
    { id: "settings", label: "設定", icon: "⚙" },
  ];

  return (
    <>
      <SP.PageHeader
        title="行動版（修漏員）"
        subtitle={(repairerUser?.name || "—") + " ・ " + (repairerUser?.plant || "—") + " ・ 實修登錄 + 一鍵結案"}
        breadcrumb={["首頁", "行動版", "修漏員"]}
        rfp="附錄一 二(三)"
      />
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-4)" }}>
        <SP.PhoneFrame>
          {tab === "tasks"  ? TasksPage :
           tab === "repair" ? RepairPage :
           tab === "map"    ? MapPage :
           tab === "stats"  ? StatsPage :
           tab === "settings" ? SettingsPage : TasksPage}
          <SP.MobileTabBar tabs={tabs} active={tab} onChange={setTab} />
        </SP.PhoneFrame>
      </div>
    </>
  );
};
