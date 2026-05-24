/* ============================================================
   shared/mobile-kit.js — 行動版 React 元件
   依 08-行動版.md：PhoneFrame 內模擬 RN UI，真實可操作
   ============================================================ */

window.SP = window.SP || {};

/* ---------- PhoneFrame ---------- */
SP.PhoneFrame = function PhoneFrame({ children, time = "09:42", signal = 4, battery = 100 }) {
  return (
    <div style={phoneFrameStyle}>
      <div style={phoneInnerStyle}>
        <SP.MobileStatusBar time={time} signal={signal} battery={battery} />
        <div style={phoneContentStyle}>{children}</div>
      </div>
    </div>
  );
};

const phoneFrameStyle = {
  width: "375px",
  background: "oklch(0.15 0.01 250)",
  border: "8px solid oklch(0.12 0.01 250)",
  borderRadius: "2.5rem",
  padding: "0",
  boxShadow: "0 25px 60px oklch(0.15 0.02 250 / 0.3)",
  overflow: "hidden",
  position: "relative",
};

const phoneInnerStyle = {
  background: "var(--bg-base)",
  borderRadius: "1.75rem",
  overflow: "hidden",
  height: "720px",
  display: "flex",
  flexDirection: "column",
};

const phoneContentStyle = {
  flex: 1,
  overflowY: "auto",
  background: "var(--bg-base)",
};

/* ---------- MobileStatusBar ---------- */
SP.MobileStatusBar = function MobileStatusBar({ time, signal, battery }) {
  return (
    <div style={{
      background: "var(--tw-primary)",
      color: "var(--text-inverse)",
      padding: "0.5rem 1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
    }}>
      <span>{time}</span>
      <span style={{ display: "flex", gap: "0.5rem" }}>
        <span>{Array.from({ length: signal }).map((_, i) => <span key={i}>·</span>)} 5G</span>
        <span>🔋 {battery}%</span>
      </span>
    </div>
  );
};

/* ---------- MobileAppBar ---------- */
SP.MobileAppBar = function MobileAppBar({ title, onBack, right, sub }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-base)",
      padding: "0.75rem 1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: "none",
          border: 0,
          fontSize: "var(--text-lg)",
          cursor: "pointer",
          padding: "0.25rem 0.5rem",
        }}>←</button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>{title}</div>
        {sub && <div className="text-xs muted">{sub}</div>}
      </div>
      {right}
    </div>
  );
};

/* ---------- MobileTabBar ---------- */
SP.MobileTabBar = function MobileTabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      borderTop: "1px solid var(--border-base)",
      display: "flex",
      padding: "0.25rem 0",
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            background: "none",
            border: 0,
            padding: "0.5rem 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.125rem",
            color: t.id === active ? "var(--tw-primary)" : "var(--text-muted)",
            fontWeight: t.id === active ? 700 : 500,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "1.25rem" }}>{t.icon}</span>
          <span style={{ fontSize: "0.75rem" }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

/* ---------- MobileListItem ---------- */
SP.MobileListItem = function MobileListItem({ icon, title, subtitle, badge, right, onClick, severity }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--bg-surface)",
        padding: "0.875rem 1rem",
        borderBottom: "1px solid var(--border-base)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        cursor: onClick ? "pointer" : "default",
        borderLeft: severity ? "4px solid var(--color-" + severity + ")" : undefined,
      }}
    >
      {icon && <div style={{ fontSize: "1.5rem" }}>{icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{title}</div>
        {subtitle && <div className="text-xs muted">{subtitle}</div>}
      </div>
      {badge}
      {right}
    </div>
  );
};

/* ---------- MobileButton ---------- */
SP.MobileButton = function MobileButton({ variant = "primary", icon, children, onClick, fullWidth = true, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? "100%" : undefined,
        padding: "0.875rem 1rem",
        background: variant === "primary" ? "var(--tw-primary)" : variant === "danger" ? "var(--color-critical)" : "var(--bg-surface)",
        color: variant === "primary" || variant === "danger" ? "var(--text-inverse)" : "var(--text-primary)",
        border: variant === "secondary" ? "1px solid var(--border-strong)" : "0",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-base)",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

/* ---------- MobilePhotoGrid ---------- */
SP.MobilePhotoGrid = function MobilePhotoGrid({ photos = [], max = 9, onAdd, onRemove }) {
  const slots = Array.from({ length: Math.max(max, photos.length) }, (_, i) => photos[i] || null);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "0.5rem",
    }}>
      {slots.map((p, i) => (
        <div key={i} style={{
          aspectRatio: "1",
          background: p ? "var(--tw-water-light)" : "var(--bg-muted)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: "var(--text-muted)",
          cursor: p ? "default" : "pointer",
          position: "relative",
          overflow: "hidden",
        }} onClick={() => !p && onAdd && onAdd()}>
          {p ? (
            <>
              <span style={{ fontSize: "2rem" }}>📷</span>
              <span style={{ position: "absolute", bottom: 4, right: 4, fontSize: "0.75rem", background: "oklch(0 0 0 / 0.6)", color: "white", padding: "0 4px", borderRadius: 2 }}>{i + 1}</span>
              {onRemove && (
                <button onClick={() => onRemove(i)} style={{
                  position: "absolute", top: 4, right: 4,
                  background: "var(--color-critical)", color: "white", border: 0,
                  width: "1.25rem", height: "1.25rem", borderRadius: "999px",
                  fontSize: "0.75rem", cursor: "pointer",
                }}>×</button>
              )}
            </>
          ) : "+"}
        </div>
      ))}
    </div>
  );
};

/* ---------- MobileInput ---------- */
SP.MobileInput = function MobileInput({ label, value, onChange, placeholder, type = "text", multiline }) {
  return (
    <div style={{ marginBottom: "var(--space-3)" }}>
      {label && <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>}
      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={mobileInputStyle}
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={mobileInputStyle}
        />
      )}
    </div>
  );
};

const mobileInputStyle = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-md)",
  fontSize: "var(--text-sm)",
  background: "var(--bg-surface)",
  fontFamily: "inherit",
};

/* ---------- CoordinateBox（WGS84 + TWD97） ---------- */
SP.CoordinateBox = function CoordinateBox({ lng, lat }) {
  // 簡單 WGS84 → TWD97 線性近似（POC 用，非精確）
  const twd97x = ((lng - 121) * 100000 + 250000).toFixed(1);
  const twd97y = ((lat - 23.5) * 110000 + 2600000).toFixed(1);
  return (
    <div style={{
      background: "var(--bg-muted)",
      border: "1px solid var(--border-base)",
      borderRadius: "var(--radius-md)",
      padding: "0.75rem",
      fontSize: "var(--text-xs)",
      fontFamily: "var(--font-mono)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>📍 GPS 自動定位</div>
      <div>WGS84  {lat.toFixed(4)}°N  {lng.toFixed(4)}°E</div>
      <div>TWD97  X={twd97x}  Y={twd97y}</div>
    </div>
  );
};
