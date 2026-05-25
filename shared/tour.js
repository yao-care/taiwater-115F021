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

/* ---------- WelcomeModal — 首次進站歡迎（簡化版） ---------- */
SP.WelcomeWrapper = function WelcomeWrapper() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    if (!SP.isIntroDone("__welcome__")) {
      const t = setTimeout(() => setShow(true), 700);
      return () => clearTimeout(t);
    }
  }, []);
  const close = () => {
    SP.markIntroDone("__welcome__");
    setShow(false);
  };
  if (!show) return null;
  return (
    <div style={welcomeBackdropStyle}>
      <div style={welcomeBoxStyle}>
        <div style={{ fontSize: "3rem", marginBottom: "var(--space-3)" }}>💧</div>
        <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700 }}>歡迎使用 台水檢修漏管理資訊系統</h2>
        <div className="text-sm muted" style={{ marginTop: "var(--space-2)" }}>公開徵求 POC ・ 藥提醒科技</div>
        <p style={{ marginTop: "var(--space-5)", fontSize: "var(--text-base)", lineHeight: 1.7 }}>
          每進入一個新功能時，<br />
          右下角會跳出該頁面的<strong>使用說明</strong>。
          <br /><br />
          已看過的頁面不再自動跳出，可隨時點頁面標題旁的 <strong>ℹ️</strong> 按鈕重新查閱。
        </p>
        <div style={{ marginTop: "var(--space-5)" }}>
          <button onClick={close} style={{ ...primaryBtnStyle, padding: "var(--space-3) var(--space-6)", fontSize: "var(--text-base)" }}>了解，開始探索 →</button>
        </div>
        <div className="text-xs muted" style={{ marginTop: "var(--space-4)" }}>
          想重新看所有頁面說明？點 Header 上「❓ 重置教學」
        </div>
      </div>
    </div>
  );
};

const welcomeBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "oklch(0.15 0.02 250 / 0.7)",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-4)",
};

const welcomeBoxStyle = {
  background: "var(--bg-surface)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-8)",
  maxWidth: "30rem",
  width: "100%",
  textAlign: "center",
  boxShadow: "var(--shadow-lg)",
};

/* ---------- TourHelpButton（Header 內的 ❓ 按鈕：重置） ---------- */
SP.TourHelpButton = function TourHelpButton() {
  const navigate = ReactRouterDOM.useNavigate();
  return (
    <button
      className="app-header__action"
      onClick={() => {
        if (window.confirm("重新顯示所有頁面說明？（會清除「已看過」的記錄，下次進入每頁仍會自動跳出說明氣泡）")) {
          SP.resetAllIntros();
          navigate("/");
          window.location.reload();
        }
      }}
      title="重置所有頁面說明"
      data-tour="help"
    >
      ❓ 重置教學
    </button>
  );
};
