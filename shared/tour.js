/* ============================================================
   shared/tour.js — 操作導覽引擎
   spotlight 反白 + 提示框 + 步驟切換 + localStorage 記錄完成
   ============================================================ */

window.SP = window.SP || {};

SP.TOUR_DONE_KEY = "shuili_poc_tour_done_v1";

/* ---------- TourContext + Provider ---------- */
SP.TourContext = React.createContext(null);

SP.TourProvider = function TourProvider({ children, steps }) {
  const [active, setActive] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);

  const start = React.useCallback((fromStep = 0) => {
    setStepIndex(fromStep);
    setActive(true);
  }, []);

  const stop = React.useCallback(() => {
    setActive(false);
    try { localStorage.setItem(SP.TOUR_DONE_KEY, "1"); } catch (e) {}
  }, []);

  const next = React.useCallback(() => {
    setStepIndex(i => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const prev = React.useCallback(() => {
    setStepIndex(i => Math.max(i - 1, 0));
  }, []);

  const value = React.useMemo(() => ({
    active, stepIndex, steps, start, stop, next, prev,
    isDone: () => {
      try { return localStorage.getItem(SP.TOUR_DONE_KEY) === "1"; } catch (e) { return false; }
    },
  }), [active, stepIndex, steps, start, stop, next, prev]);

  return React.createElement(
    SP.TourContext.Provider,
    { value },
    children,
    active ? React.createElement(SP.TourOverlay) : null
  );
};

SP.useTour = function () {
  const ctx = React.useContext(SP.TourContext);
  if (!ctx) throw new Error("useTour 必須在 TourProvider 內使用");
  return ctx;
};

/* ---------- WelcomeWrapper — 首次進入自動偵測 + 跳歡迎對話框 ---------- */
SP.WelcomeWrapper = function WelcomeWrapper() {
  const tour = SP.useTour();
  const [showWelcome, setShowWelcome] = React.useState(false);

  // mount 時偵測是否首次
  React.useEffect(() => {
    if (!tour.isDone()) {
      // 等 1 秒讓 layout 渲染完
      const t = setTimeout(() => setShowWelcome(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!showWelcome) return null;
  return React.createElement(SP.WelcomeModal, {
    onStart: () => { setShowWelcome(false); tour.start(0); },
    onSkip:  () => {
      setShowWelcome(false);
      try { localStorage.setItem(SP.TOUR_DONE_KEY, "1"); } catch (e) {}
    },
  });
};

/* ---------- WelcomeModal — 首次進站歡迎對話框 ---------- */
SP.WelcomeModal = function WelcomeModal({ onStart, onSkip }) {
  return (
    <div style={welcomeBackdropStyle}>
      <div style={welcomeBoxStyle}>
        <div style={{ fontSize: "3rem", marginBottom: "var(--space-3)" }}>💧</div>
        <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700 }}>歡迎使用 台水檢修漏管理資訊系統</h2>
        <div className="text-sm muted" style={{ marginTop: "var(--space-2)" }}>公開徵求 POC ・ 藥提醒科技</div>

        <p style={{ marginTop: "var(--space-5)", fontSize: "var(--text-base)", lineHeight: 1.7 }}>
          本系統包含 <strong>11 個角色</strong>、<strong>10 個子系統</strong>、<strong>126 個操作葉子</strong>。
          <br />要不要先看 60 秒導覽，認識核心功能與跨角色流程？
        </p>

        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)", justifyContent: "center" }}>
          <SP.Button variant="secondary" size="lg" onClick={onSkip}>略過，自行探索</SP.Button>
          <SP.Button variant="primary" size="lg" onClick={onStart}>開始 60 秒導覽 →</SP.Button>
        </div>

        <div className="text-xs muted" style={{ marginTop: "var(--space-4)" }}>
          隨時可從右上「❓ 教學」重新開啟導覽
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
  maxWidth: "32rem",
  width: "100%",
  textAlign: "center",
  boxShadow: "var(--shadow-lg)",
};

/* ---------- TourOverlay — 主導覽遮罩 + 提示框 ---------- */
SP.TourOverlay = function TourOverlay() {
  const { stepIndex, steps, stop, next, prev } = SP.useTour();
  const navigate = ReactRouterDOM.useNavigate();
  const { state, dispatch } = SP.useStore();
  const [rect, setRect] = React.useState(null);
  const [viewport, setViewport] = React.useState({ w: window.innerWidth, h: window.innerHeight });

  const step = steps[stepIndex];

  // 進入 step 時：執行 navigate / switchRole / scroll
  React.useEffect(() => {
    if (!step) return;
    if (step.switchRole) {
      const u = state.users.find(x => x.id === step.switchRole);
      if (u) dispatch({ type: "SWITCH_ROLE", payload: u });
    }
    if (step.navigate) {
      navigate(step.navigate);
    }
  }, [stepIndex]);

  // 計算 target rect（給 500ms 讓 navigate 完成 render）
  React.useEffect(() => {
    if (!step) return;
    let raf;
    const measure = () => {
      if (!step.selector || step.selector === "body") { setRect(null); return; }
      const el = document.querySelector(step.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ x: r.left, y: r.top, w: r.width, h: r.height });
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      } else {
        setRect(null);
      }
    };
    // navigate 後 DOM 需時間 mount，多次重試
    const timers = [50, 200, 500, 900].map(t => setTimeout(measure, t));
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      measure();
    };
    window.addEventListener("resize", onResize);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stepIndex]);

  if (!step) return null;

  const total = steps.length;
  const isLast = stepIndex === total - 1;
  const isFirst = stepIndex === 0;

  // 提示框位置計算
  const tooltipPos = computeTooltipPosition(rect, step.position, viewport);

  return (
    <div style={tourOverlayStyle}>
      {/* SVG mask 反白 spotlight */}
      <svg style={tourSvgStyle} width={viewport.w} height={viewport.h}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.x - 8} y={rect.y - 8}
                width={rect.w + 16} height={rect.h + 16}
                rx={8} ry={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="oklch(0.15 0.02 250 / 0.65)" mask="url(#tour-mask)" />
        {rect && (
          <rect
            x={rect.x - 8} y={rect.y - 8}
            width={rect.w + 16} height={rect.h + 16}
            rx={8} ry={8}
            fill="none"
            stroke="oklch(0.6 0.18 60)"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
        )}
      </svg>

      {/* 提示框 */}
      <div style={{ ...tourTooltipStyle, ...tooltipPos }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
          <span className="badge badge--info">第 {stepIndex + 1} / {total} 步</span>
          <button onClick={stop} style={tourCloseBtnStyle} title="略過全部">×</button>
        </div>

        <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-2)" }}>{step.title}</div>
        <div style={{ fontSize: "var(--text-sm)", lineHeight: 1.7, color: "var(--text-secondary)" }}>{step.body}</div>

        <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-2)", justifyContent: "space-between" }}>
          <SP.Button variant="ghost" size="sm" onClick={stop}>略過全部</SP.Button>
          <span style={{ display: "inline-flex", gap: "var(--space-2)" }}>
            {!isFirst && <SP.Button variant="secondary" size="sm" onClick={prev}>← 上一步</SP.Button>}
            {!isLast ? (
              <SP.Button variant="primary" size="sm" onClick={next}>下一步 →</SP.Button>
            ) : (
              <SP.Button variant="primary" size="sm" onClick={stop}>完成 ✓</SP.Button>
            )}
          </span>
        </div>

        {/* 進度條 */}
        <div style={{ marginTop: "var(--space-3)", height: "3px", background: "var(--bg-muted)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ width: ((stepIndex + 1) / total * 100) + "%", height: "100%", background: "var(--tw-primary)", transition: "width 200ms" }} />
        </div>
      </div>
    </div>
  );
};

const tourOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 90,
  pointerEvents: "auto",
};

const tourSvgStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

const tourTooltipStyle = {
  position: "fixed",
  background: "var(--bg-surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-lg)",
  padding: "var(--space-5)",
  width: "22rem",
  maxWidth: "calc(100vw - 2rem)",
  zIndex: 95,
};

const tourCloseBtnStyle = {
  background: "none",
  border: 0,
  fontSize: "var(--text-xl)",
  cursor: "pointer",
  color: "var(--text-muted)",
  padding: "0 var(--space-2)",
};

/* ---------- 計算提示框位置 ---------- */
function computeTooltipPosition(rect, position, viewport) {
  const tipW = 352;     // 22rem ~= 352px
  const tipH = 220;     // 估計高度
  const margin = 16;

  // 沒 target → 螢幕中央
  if (!rect) {
    return {
      top: Math.max(margin, (viewport.h - tipH) / 2) + "px",
      left: Math.max(margin, (viewport.w - tipW) / 2) + "px",
    };
  }

  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;

  let top, left;

  switch (position) {
    case "bottom":
      top = rect.y + rect.h + margin;
      left = Math.min(viewport.w - tipW - margin, Math.max(margin, cx - tipW / 2));
      break;
    case "top":
      top = rect.y - tipH - margin;
      left = Math.min(viewport.w - tipW - margin, Math.max(margin, cx - tipW / 2));
      break;
    case "left":
      top = Math.min(viewport.h - tipH - margin, Math.max(margin, cy - tipH / 2));
      left = rect.x - tipW - margin;
      break;
    case "right":
    default:
      top = Math.min(viewport.h - tipH - margin, Math.max(margin, cy - tipH / 2));
      left = rect.x + rect.w + margin;
      break;
  }

  // 邊界保護
  if (top < margin) top = margin;
  if (top + tipH > viewport.h - margin) top = viewport.h - tipH - margin;
  if (left < margin) left = margin;
  if (left + tipW > viewport.w - margin) left = viewport.w - tipW - margin;

  return { top: top + "px", left: left + "px" };
}
