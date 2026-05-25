/* ============================================================
   shared/tour.js — 頁面說明氣泡（每進一個功能自動跳）
   每頁 localStorage 獨立記錄是否看過
   Header ❓ 按鈕可一鍵重置（讓所有頁面說明重新自動跳）
   ============================================================ */

window.SP = window.SP || {};

SP.INTRO_STORE_KEY = "shuili_poc_intro_done_v1";

/* ---------- localStorage helpers ---------- */
SP.getIntroDoneMap = function () {
  try { return JSON.parse(localStorage.getItem(SP.INTRO_STORE_KEY) || "{}"); }
  catch (e) { return {}; }
};

SP.markIntroDone = function (id) {
  const m = SP.getIntroDoneMap();
  m[id] = true;
  try { localStorage.setItem(SP.INTRO_STORE_KEY, JSON.stringify(m)); }
  catch (e) {}
};

SP.resetAllIntros = function () {
  try { localStorage.removeItem(SP.INTRO_STORE_KEY); }
  catch (e) {}
};

SP.isIntroDone = function (id) {
  return !!SP.getIntroDoneMap()[id];
};

/* ---------- 從 path 找對應 intro（含前綴匹配） ---------- */
SP.getIntroForPath = function (pathname) {
  if (!SP.PAGE_INTROS) return null;
  // 完全匹配優先
  if (SP.PAGE_INTROS[pathname]) {
    return { id: pathname, ...SP.PAGE_INTROS[pathname] };
  }
  // 前綴匹配（從長到短）
  const segs = pathname.split("/").filter(Boolean);
  while (segs.length > 0) {
    const partial = "/" + segs.join("/");
    if (SP.PAGE_INTROS[partial]) return { id: partial, ...SP.PAGE_INTROS[partial] };
    segs.pop();
  }
  if (SP.PAGE_INTROS["/"]) return { id: "/", ...SP.PAGE_INTROS["/"] };
  return null;
};

/* ---------- PageIntroBubble — 右下角氣泡 ---------- */
SP.PageIntroBubble = function PageIntroBubble({ intro, onClose, onNeverShow }) {
  return (
    <div style={bubbleStyle} role="dialog" aria-label="本頁說明">
      <div style={bubbleHeaderStyle}>
        <span style={{
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: "var(--tw-primary)",
          letterSpacing: "0.04em",
        }}>ℹ️ 本頁說明</span>
        <button
          onClick={onClose}
          style={closeBtnStyle}
          aria-label="關閉"
          title="關閉（下次進入此頁仍會自動顯示）"
        >×</button>
      </div>
      <div style={{
        fontSize: "var(--text-base)",
        fontWeight: 700,
        marginBottom: "var(--space-2)",
        color: "var(--text-primary)",
      }}>{intro.title}</div>
      <div style={{
        fontSize: "var(--text-sm)",
        lineHeight: 1.7,
        color: "var(--text-secondary)",
      }}>{intro.body}</div>
      {intro.tips && intro.tips.length > 0 && (
        <ul style={{
          marginTop: "var(--space-3)",
          paddingLeft: "1.25rem",
          fontSize: "var(--text-sm)",
          lineHeight: 1.7,
          color: "var(--text-secondary)",
        }}>
          {intro.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
      <div style={{
        marginTop: "var(--space-4)",
        display: "flex",
        gap: "var(--space-2)",
        justifyContent: "flex-end",
      }}>
        <button onClick={onNeverShow} style={ghostBtnStyle}>不再顯示</button>
        <button onClick={onClose} style={primaryBtnStyle}>了解了</button>
      </div>
    </div>
  );
};

const bubbleStyle = {
  position: "fixed",
  bottom: "var(--space-5)",
  right: "var(--space-5)",
  width: "22rem",
  maxWidth: "calc(100vw - 2rem)",
  background: "var(--bg-surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-lg)",
  padding: "var(--space-5)",
  zIndex: 80,
  animation: "intro-pop-in 250ms ease-out",
};

const bubbleHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "var(--space-3)",
};

const closeBtnStyle = {
  background: "none",
  border: 0,
  fontSize: "var(--text-xl)",
  cursor: "pointer",
  color: "var(--text-muted)",
  padding: "0 var(--space-2)",
  lineHeight: 1,
};

const ghostBtnStyle = {
  background: "transparent",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-2) var(--space-3)",
  fontSize: "var(--text-sm)",
  cursor: "pointer",
  color: "var(--text-secondary)",
};

const primaryBtnStyle = {
  background: "var(--tw-primary)",
  border: 0,
  borderRadius: "var(--radius-md)",
  padding: "var(--space-2) var(--space-4)",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  cursor: "pointer",
  color: "var(--text-inverse)",
};

/* keyframe 加到 layout.css 內，這裡用 style tag 兜底 */
if (typeof document !== "undefined" && !document.getElementById("intro-anim-style")) {
  const styleEl = document.createElement("style");
  styleEl.id = "intro-anim-style";
  styleEl.textContent =
    "@keyframes intro-pop-in { from { transform: translateY(1rem) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }";
  document.head.appendChild(styleEl);
}

/* ---------- usePageIntro hook — 每個 PageHeader 內呼叫 ---------- */
SP.usePageIntro = function () {
  const location = ReactRouterDOM.useLocation();
  const intro = SP.getIntroForPath(location.pathname);
  const [open, setOpen] = React.useState(false);
  const [forceTick, setForceTick] = React.useState(0);

  React.useEffect(() => {
    if (!intro) { setOpen(false); return; }
    if (SP.isIntroDone(intro.id) && forceTick === 0) {
      setOpen(false);
      return;
    }
    // 首次進入該頁 → 600ms 後跳氣泡
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [intro && intro.id, forceTick]);

  const close = React.useCallback(() => setOpen(false), []);
  const neverShow = React.useCallback(() => {
    if (intro) SP.markIntroDone(intro.id);
    setOpen(false);
  }, [intro && intro.id]);
  const manualOpen = React.useCallback(() => {
    setForceTick(t => t + 1);
    setOpen(true);
  }, []);

  return { intro, open, close, neverShow, manualOpen };
};

/* ---------- IntroIconButton — PageHeader 旁邊的 ℹ️ 按鈕 ---------- */
SP.IntroIconButton = function IntroIconButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="本頁說明"
      style={{
        background: "var(--bg-muted)",
        border: "1px solid var(--border-base)",
        borderRadius: "999px",
        width: "2rem",
        height: "2rem",
        fontSize: "1rem",
        cursor: "pointer",
        marginLeft: "var(--space-2)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >ℹ️</button>
  );
};

/* ---------- WelcomeModal — 系統總體介紹（首次進站自動 + ❓ 按鈕隨時可開） ---------- */
SP.WelcomeWrapper = function WelcomeWrapper() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    // 註冊全域開啟函式，讓 Header「📖 系統介紹」按鈕可呼叫
    SP._openWelcome = () => setShow(true);
    let timer = null;
    if (!SP.isIntroDone("__welcome__")) {
      timer = setTimeout(() => setShow(true), 700);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (SP._openWelcome) delete SP._openWelcome;
    };
  }, []);
  const close = () => {
    SP.markIntroDone("__welcome__");
    setShow(false);
  };
  const resetAllIntros = () => {
    if (window.confirm("重置所有頁面說明？下次進入每頁仍會自動跳出說明氣泡（不會影響業務資料）。")) {
      SP.resetAllIntros();
      setShow(false);
      window.location.reload();
    }
  };
  if (!show) return null;
  return (
    <div style={welcomeBackdropStyle} onClick={close}>
      <div style={welcomeBoxStyle} onClick={e => e.stopPropagation()}>
        {/* 標題區 */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "var(--space-2)" }}>💧</div>
          <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700 }}>歡迎使用 台水檢修漏管理資訊系統</h2>
          <div className="text-sm muted" style={{ marginTop: "var(--space-1)" }}>公開徵求 POC ・ 案號 115F021 ・ 藥提醒科技有限公司</div>
        </div>

        {/* 系統範圍 4 數字 */}
        <div style={welcomeStatsStyle}>
          <div style={welcomeStatStyle}>
            <div style={welcomeStatNumStyle}>11</div>
            <div className="text-xs muted">角色</div>
          </div>
          <div style={welcomeStatStyle}>
            <div style={welcomeStatNumStyle}>10</div>
            <div className="text-xs muted">子系統</div>
          </div>
          <div style={welcomeStatStyle}>
            <div style={welcomeStatNumStyle}>126</div>
            <div className="text-xs muted">操作葉子</div>
          </div>
          <div style={welcomeStatStyle}>
            <div style={welcomeStatNumStyle}>7</div>
            <div className="text-xs muted">跨角色流程</div>
          </div>
        </div>

        {/* 功能亮點 */}
        <div style={{ marginBottom: "var(--space-5)" }}>
          <div style={sectionTitleStyle}>✨ 功能亮點</div>
          <div style={highlightGridStyle}>
            <Highlight icon="🎭" title="11 角色一鍵切換" body="同帳號即時切換看不同視角，Nav 自動依角色過濾" />
            <Highlight icon="🔄" title="跨角色即時連動" body="客服建案 → 廠所派工 → 檢漏拍照 → 修漏結案，資料即時同步" />
            <Highlight icon="📱" title="行動版真實可操作" body="PhoneFrame 內每個按鈕都可點，含 GPS / 拍照 / 一鍵上傳" />
            <Highlight icon="💰" title="PCCES XML 4.3" body="5 步驟精靈 + 編碼正確率自動檢核（≥ 40% 門檻）" />
            <Highlight icon="🛡️" title="資安 8 構面 127 控制" body="ISMS + SBOM + 第三方檢測 + 稽核日誌（SHA-256 防竄改）" />
            <Highlight icon="🔌" title="14 介接系統" body="健康度監控 + 拓樸架構圖 + WMTS / WMS 圖層" />
          </div>
        </div>

        {/* 推薦演示順序 */}
        <div style={{ marginBottom: "var(--space-5)" }}>
          <div style={sectionTitleStyle}>🎬 推薦演示順序（5 分鐘看完整流程）</div>
          <ol style={demoOlStyle}>
            <li>右上「<strong>🎭 角色快切</strong>」 → 切到「<strong>蔡美玲 客服人員</strong>」 → 按「+ 新案件（一鍵）」</li>
            <li>切到「<strong>賴伯毅 廠所人員</strong>」 → 進派工看板 → 點「派檢漏員」</li>
            <li>切到「<strong>王志強 檢漏員</strong>」 → 行動版任務 → 拍照 → 一鍵上傳</li>
            <li>切到「<strong>林文雄 修漏員</strong>」 → 行動版 → 實修登錄 → 一鍵結案</li>
            <li>切回「<strong>李宗翰 系統管理員</strong>」 → 左 Nav「案件即時追蹤」 → 看跨 4 角色完整 timeline</li>
          </ol>
        </div>

        {/* 操作機制 */}
        <div style={mechanismBoxStyle}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "var(--space-1)" }}>💡 操作機制</div>
          <div className="text-sm">
            每進入一個新功能，右下角會自動跳出該頁<strong>使用說明氣泡</strong>。
            已看過頁面下次不再自動跳，可隨時點標題旁 <strong>ℹ️</strong> 重看。
            想重新看本介紹，可從右上「<strong>📖 系統介紹</strong>」開啟。
          </div>
        </div>

        {/* 底部按鈕 */}
        <div style={{ marginTop: "var(--space-5)", display: "flex", gap: "var(--space-2)", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={resetAllIntros} style={ghostBtnStyle}>重置已看頁面說明</button>
          <button onClick={close} style={{ ...primaryBtnStyle, padding: "var(--space-3) var(--space-6)", fontSize: "var(--text-base)" }}>了解，開始探索 →</button>
        </div>
      </div>
    </div>
  );
};

function Highlight({ icon, title, body }) {
  return (
    <div style={highlightItemStyle}>
      <div style={{ fontSize: "1.5rem" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "0.125rem" }}>{title}</div>
        <div className="text-xs muted" style={{ lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

const welcomeBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "oklch(0.15 0.02 250 / 0.7)",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-4)",
  overflowY: "auto",
};

const welcomeBoxStyle = {
  background: "var(--bg-surface)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-6)",
  maxWidth: "44rem",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "var(--shadow-lg)",
};

const welcomeStatsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "var(--space-3)",
  marginBottom: "var(--space-5)",
  padding: "var(--space-4)",
  background: "var(--tw-water-light)",
  borderRadius: "var(--radius-md)",
};

const welcomeStatStyle = {
  textAlign: "center",
};

const welcomeStatNumStyle = {
  fontSize: "var(--text-2xl)",
  fontWeight: 700,
  color: "var(--tw-primary)",
  lineHeight: 1,
  marginBottom: "0.25rem",
};

const sectionTitleStyle = {
  fontSize: "var(--text-sm)",
  fontWeight: 700,
  marginBottom: "var(--space-3)",
  color: "var(--text-primary)",
  paddingBottom: "var(--space-2)",
  borderBottom: "2px solid var(--tw-primary)",
  display: "inline-block",
};

const highlightGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "var(--space-3)",
};

const highlightItemStyle = {
  display: "flex",
  gap: "var(--space-3)",
  alignItems: "flex-start",
  padding: "var(--space-3)",
  background: "var(--bg-muted)",
  borderRadius: "var(--radius-md)",
};

const demoOlStyle = {
  paddingLeft: "1.5rem",
  margin: 0,
  fontSize: "var(--text-sm)",
  lineHeight: 1.9,
  color: "var(--text-secondary)",
};

const mechanismBoxStyle = {
  padding: "var(--space-3) var(--space-4)",
  background: "var(--bg-low)",
  borderRadius: "var(--radius-md)",
  borderLeft: "3px solid var(--color-low)",
};

/* ---------- TourHelpButton（Header 內的「📖 系統介紹」按鈕） ---------- */
SP.TourHelpButton = function TourHelpButton() {
  return (
    <button
      className="app-header__action"
      onClick={() => {
        if (typeof SP._openWelcome === "function") SP._openWelcome();
      }}
      title="開啟系統介紹"
      data-tour="help"
    >
      📖 系統介紹
    </button>
  );
};
