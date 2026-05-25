/* ============================================================
   shared/components.js — 共用 UI 元件
   原則 2：盡量無狀態，state 從 Store 來，連動才會自動發生
   ============================================================ */

window.SP = window.SP || {};

/* ---------- KpiCard ---------- */
SP.KpiCard = function KpiCard({ label, value, delta, tone, suffix, hint }) {
  const valueClass =
    tone === "critical" ? "kpi-card__value kpi-card__value--critical"
    : tone === "pass"   ? "kpi-card__value kpi-card__value--pass"
    : "kpi-card__value";

  return (
    <div className="kpi-card">
      <div className="kpi-card__label">{label}</div>
      <div className={valueClass}>
        {value}
        {suffix && <span className="text-sm muted" style={{ marginLeft: "0.25rem" }}>{suffix}</span>}
      </div>
      {delta != null && (
        <div className={"kpi-card__delta " + (delta >= 0 ? "kpi-card__delta--up" : "kpi-card__delta--down")}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
        </div>
      )}
      {hint && <div className="text-xs muted mt-2">{hint}</div>}
    </div>
  );
};

/* ---------- Badge ---------- */
SP.Badge = function Badge({ tone = "neutral", children }) {
  return <span className={"badge badge--" + tone}>{children}</span>;
};

SP.SeverityBadge = function SeverityBadge({ severity }) {
  const labelMap = {
    critical: "緊急", high: "高", medium: "中", low: "低", pass: "通過",
  };
  return <SP.Badge tone={severity}>{labelMap[severity] || severity}</SP.Badge>;
};

SP.StatusBadge = function StatusBadge({ status }) {
  const toneMap = {
    "申報": "info", "派工": "info", "檢漏中": "high",
    "待修": "medium", "修復中": "high", "已修": "pass", "結案": "pass",
  };
  return <SP.Badge tone={toneMap[status] || "neutral"}>{status}</SP.Badge>;
};

/* ---------- StatusDot ---------- */
SP.StatusDot = function StatusDot({ tone = "neutral" }) {
  return <span className={"status-dot status-dot--" + tone}></span>;
};

/* ---------- Button ---------- */
SP.Button = function Button({ variant = "primary", size, onClick, children, icon, disabled, type = "button" }) {
  const cls = ["btn", "btn--" + variant, size && "btn--" + size].filter(Boolean).join(" ");
  return (
    <button className={cls} type={type} onClick={onClick} disabled={disabled}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

/* ---------- Card ---------- */
SP.Card = function Card({ title, subtitle, action, children, padding }) {
  return (
    <div className="card" style={padding ? { padding } : undefined}>
      {(title || action) && (
        <div className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <div className="card__subtitle">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

/* ---------- Table ---------- */
SP.Table = function Table({ headers, rows, empty = "尚無資料", compact }) {
  return (
    <div className="table-wrapper">
      <table className={"table" + (compact ? " table--compact" : "")}>
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--text-muted)" }}>{empty}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ---------- Modal ---------- */
SP.Modal = function Modal({ open, title, onClose, footer, children, maxWidth }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="關閉">×</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

/* ---------- ToastStack（從 store.toasts 自動 render） ---------- */
SP.ToastStack = function ToastStack() {
  const { state, dispatch } = SP.useStore();
  if (!state.toasts || state.toasts.length === 0) return null;
  return (
    <div className="toast-stack">
      {state.toasts.map(t => (
        <div key={t.id} className={"toast toast--" + (t.kind || "info")}>
          <div className="toast__icon">{t.icon || (t.kind === "pass" ? "✓" : t.kind === "critical" ? "⚠" : "ℹ")}</div>
          <div className="toast__content">
            <div className="toast__title">{t.title}</div>
            {t.body && <div className="toast__body">{t.body}</div>}
          </div>
          <button className="modal__close" onClick={() => dispatch({ type: "DISMISS_TOAST", payload: t.id })} aria-label="關閉">×</button>
        </div>
      ))}
    </div>
  );
};

/* ---------- PageHeader（標題 + 麵包屑 + RFP 追溯 + 按鈕 + ℹ️ 本頁說明） ---------- */
SP.PageHeader = function PageHeader({ title, subtitle, breadcrumb, rfp, actions }) {
  // 從 URL 自動查 PAGE_INTROS 抓本頁說明
  const introState = (typeof SP.usePageIntro === "function") ? SP.usePageIntro() : { intro: null };
  return (
    <div className="page-header">
      {breadcrumb && (
        <div className="page-header__breadcrumb">
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="page-header__breadcrumb-sep">›</span>}
              <span>{b}</span>
            </React.Fragment>
          ))}
          {rfp && <span className="page-header__rfp">RFP {rfp}</span>}
        </div>
      )}
      <h1 className="page-header__title" style={{ display: "inline-flex", alignItems: "center" }}>
        <span>{title}</span>
        {introState.intro && (
          <SP.IntroIconButton onClick={introState.manualOpen} />
        )}
      </h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      {actions && <div className="page-header__actions">{actions}</div>}
      {introState.intro && introState.open && (
        <SP.PageIntroBubble
          intro={introState.intro}
          onClose={introState.close}
          onNeverShow={introState.neverShow}
        />
      )}
    </div>
  );
};

/* ---------- Toolbar ---------- */
SP.Toolbar = function Toolbar({ children, right }) {
  return (
    <div className="toolbar">
      {children}
      {right && <><div className="toolbar__spacer" />{right}</>}
    </div>
  );
};

/* ---------- FormRow ---------- */
SP.FormRow = function FormRow({ label, required, hint, children }) {
  return (
    <div className="form-row">
      <label className={"form-label" + (required ? " form-label--required" : "")}>{label}</label>
      {children}
      {hint && <div className="text-xs muted">{hint}</div>}
    </div>
  );
};

/* ---------- 角色 label helper ---------- */
SP.roleLabel = function (roleId) {
  const r = SP.ROLE_DEFS.find(r => r.id === roleId);
  return r ? r.label : roleId;
};

/* ---------- 共用 placeholder 頁（給空殼子系統用） ---------- */
SP.PlaceholderPage = function PlaceholderPage({ icon, title, hint, stage, breadcrumb, rfp }) {
  return (
    <>
      {breadcrumb && (
        <SP.PageHeader title={title} breadcrumb={breadcrumb} rfp={rfp} />
      )}
      <div className="placeholder-page">
        <div className="placeholder-page__inner">
          <div className="placeholder-page__icon">{icon || "🚧"}</div>
          <div className="placeholder-page__title">{title}</div>
          <div className="placeholder-page__hint">{hint}</div>
          {stage && <div className="placeholder-page__stage">{stage}</div>}
        </div>
      </div>
    </>
  );
};

/* ---------- RfpLeafPage — 通用 RFP 葉子版型（含麵包屑 + 區塊 + mock 表格） ---------- */
SP.RfpLeafPage = function RfpLeafPage({ icon, title, subtitle, breadcrumb, rfp, sections = [], actions }) {
  return (
    <>
      <SP.PageHeader title={title} subtitle={subtitle} breadcrumb={breadcrumb} rfp={rfp} actions={actions} />
      <div className="flex-col" style={{ gap: "var(--space-5)" }}>
        {sections.map((s, i) => (
          <SP.Card key={i} title={s.title} subtitle={s.subtitle} action={s.action}>
            {s.kind === "table" && (
              <SP.Table headers={s.headers} rows={s.rows} />
            )}
            {s.kind === "items" && (
              <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8, fontSize: "var(--text-sm)", margin: 0 }}>
                {s.items.map((it, j) => (
                  <li key={j}>{it.label}{it.note ? <span className="muted"> — {it.note}</span> : null}</li>
                ))}
              </ul>
            )}
            {s.kind === "kpis" && (
              <div className="kpi-grid">
                {s.kpis.map((k, j) => <SP.KpiCard key={j} {...k} />)}
              </div>
            )}
            {s.kind === "text" && (
              <div style={{ fontSize: "var(--text-sm)", lineHeight: 1.7 }}>{s.content}</div>
            )}
            {s.kind === "custom" && s.render && s.render()}
          </SP.Card>
        ))}
      </div>
    </>
  );
};

/* ---------- 區處 / 角色 / 嚴重度 / 狀態 對應表（供其他元件使用） ---------- */
SP.format = {
  date: (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.getFullYear() + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0");
  },
  datetime: (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return SP.format.date(iso) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  },
  money: (n) => "$" + Number(n).toLocaleString("zh-TW"),
};
