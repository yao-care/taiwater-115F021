/* ============================================================
   shared/layout.js — AppShell / Header / Nav
   依 00-系統全圖.md 的 10 子系統 + 完整 roles 標記
   ============================================================ */

window.SP = window.SP || {};

/* ---------- Nav 結構 ---------- */
SP.NAV_GROUPS = [
  {
    id: "work",
    title: "我的工作",
    items: [
      { path: "/",                       icon: "🏠", label: "首頁",             roles: ["all"] },
      { path: "/dashboard",              icon: "📊", label: "角色儀表板",    roles: ["all"] },
      { path: "/dashboard/case-track",   icon: "🔭", label: "案件即時追蹤",      roles: ["admin", "hq", "region", "plant", "cs"] },
      { path: "/login",                  icon: "🔑", label: "登入頁",            roles: ["all"] },
    ],
  },
  {
    id: "inspection",
    title: "檢漏子系統",
    items: [
      { path: "/inspection",              icon: "🔍", label: "檢漏首頁",                   roles: ["inspector", "plant", "region", "hq", "admin"] },
      { path: "/inspection/work",         icon: "📋", label: "檢漏作業",                   roles: ["inspector", "plant", "admin"] },
      { path: "/inspection/advanced",     icon: "📊", label: "進階作業",                   roles: ["plant", "region", "hq", "admin"] },
      { path: "/inspection/annual",       icon: "📅", label: "年度作業",                   roles: ["region", "hq", "admin"] },
      { path: "/inspection/reports",      icon: "📈", label: "報表查詢",                   roles: ["plant", "region", "hq", "admin"] },
      { path: "/inspection/regulations",  icon: "📜", label: "規定紀錄",                   roles: ["all"] },
      { path: "/inspection/admin",        icon: "⚙",  label: "檢漏系統管理",                roles: ["admin", "plant"] },
    ],
  },
  {
    id: "repair",
    title: "修漏子系統",
    items: [
      { path: "/repair",                  icon: "🛠️", label: "修漏首頁",       roles: ["repairer", "plant", "region", "hq", "admin"] },
      { path: "/repair/cases",            icon: "📝", label: "案件申報",       roles: ["cs", "plant", "admin"] },
      { path: "/repair/dispatch-board",   icon: "🗂️", label: "派工看板",       roles: ["plant", "admin"] },
      { path: "/repair/dispatch",         icon: "📋", label: "派工管理",       roles: ["plant", "admin"] },
      { path: "/repair/records",          icon: "📓", label: "修漏記錄查詢",   roles: ["plant", "region", "admin"] },
      { path: "/repair/statistics",       icon: "📊", label: "統計分析",       roles: ["plant", "region", "hq", "admin"] },
      { path: "/repair/reports",          icon: "📄", label: "報表列印",       roles: ["plant", "region", "admin"] },
      { path: "/repair/admin",            icon: "⚙",  label: "修漏系統管理",    roles: ["admin", "plant"] },
    ],
  },
  {
    id: "pcces",
    title: "工程預算 / PCCES",
    items: [
      { path: "/pcces",         icon: "💰", label: "PCCES 首頁",       roles: ["plant", "admin"] },
      { path: "/pcces/wizard",  icon: "🧙", label: "預算書精靈",     roles: ["plant", "admin"] },
      { path: "/pcces/items",   icon: "📚", label: "工項編碼資料庫",    roles: ["plant", "admin"] },
      { path: "/pcces/budget",  icon: "📊", label: "預算書查詢",        roles: ["plant", "region", "admin"] },
    ],
  },
  {
    id: "mobile",
    title: "行動版",
    items: [
      { path: "/mobile/inspector", icon: "📱", label: "檢漏員行動版", roles: ["inspector", "admin"] },
      { path: "/mobile/repairer",  icon: "🔧", label: "修漏員行動版", roles: ["repairer", "admin"] },
    ],
  },
  {
    id: "report",
    title: "報表 / 年報書",
    items: [
      { path: "/annual-report",     icon: "📕", label: "年度報告書 (16 章)", roles: ["region", "hq", "admin"] },
      { path: "/annual-report/10",  icon: "📒", label: "年度報告書 (10 章)", roles: ["region", "hq", "admin"] },
    ],
  },
  {
    id: "integration",
    title: "介接管理",
    items: [
      { path: "/integration",          icon: "🔌", label: "14 系統清單",   roles: ["admin", "dba"] },
      { path: "/integration/health",   icon: "❤️", label: "健康度監控",    roles: ["admin", "dba", "security"] },
      { path: "/integration/topology", icon: "🌐", label: "介接架構圖",    roles: ["admin", "dba", "hq"] },
      { path: "/integration/wmts",     icon: "🗺️", label: "WMTS / WMS",    roles: ["admin", "dba", "plant"] },
      { path: "/integration/logs",     icon: "📜", label: "介接同步記錄",       roles: ["admin", "dba"] },
    ],
  },
  {
    id: "security",
    title: "資安合規",
    items: [
      { path: "/security",                icon: "🛡️", label: "12 構面總覽",   roles: ["security", "admin", "audit_int", "audit_ext"] },
      { path: "/security/access-control", icon: "🔐", label: "存取控制",      roles: ["security", "admin", "audit_int", "audit_ext"] },
      { path: "/security/sbom",           icon: "📦", label: "SBOM",          roles: ["security", "admin"] },
      { path: "/security/vapt",           icon: "🐛", label: "弱掃 / 滲透",   roles: ["security", "admin", "audit_int", "audit_ext"] },
      { path: "/security/isms",           icon: "📜", label: "ISMS 標準書",   roles: ["security", "admin", "audit_int", "audit_ext"] },
      { path: "/security/audit-log",      icon: "🔍", label: "稽核日誌",      roles: ["audit_int", "audit_ext", "admin", "security"] },
      { path: "/security/finding",        icon: "🚩", label: "稽核發現",      roles: ["security", "admin", "audit_int", "audit_ext"] },
    ],
  },
  {
    id: "project",
    title: "專案管理",
    items: [
      { path: "/project/gantt",        icon: "🗓️", label: "5 階段甘特圖",  roles: ["admin", "hq"] },
      { path: "/project/payment",      icon: "💰", label: "付款進度",       roles: ["admin", "hq"] },
      { path: "/project/team",         icon: "👥", label: "專案團隊",       roles: ["admin", "hq"] },
      { path: "/project/training",     icon: "🎓", label: "教育訓練",       roles: ["admin", "hq", "region"] },
      { path: "/project/penalty",      icon: "⚠️", label: "罰則對照",       roles: ["admin", "hq"] },
      { path: "/project/documents",    icon: "📁", label: "文件中心",       roles: ["admin", "hq", "region", "plant"] },
      { path: "/project/traceability", icon: "🧭", label: "需求追溯",       roles: ["admin", "hq", "region"] },
      { path: "/project/code-counter", icon: "🧮", label: "程式支數",       roles: ["admin"] },
    ],
  },
];

/* ---------- 依角色過濾 Nav ---------- */
SP.filterNavForRole = function (roleId) {
  if (!roleId) return SP.NAV_GROUPS;
  return SP.NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      !item.roles || item.roles.includes("all") || item.roles.includes(roleId)
    ),
  })).filter(group => group.items.length > 0);
};

/* ---------- AppHeader ---------- */
SP.AppHeader = function AppHeader() {
  const { state, dispatch } = SP.useStore();
  const navigate = ReactRouterDOM.useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = React.useState(false);

  const user = state.currentUser;
  const unreadCount = user
    ? state.notifications.filter(n => n.recipient === user.id && !n.read).length
    : state.notifications.filter(n => !n.read).length;

  const switchRole = (newUser) => {
    dispatch({ type: "SWITCH_ROLE", payload: newUser });
    setRoleMenuOpen(false);
    if (newUser.role === "inspector") {
      navigate("/mobile/inspector");
    } else if (newUser.role === "repairer") {
      navigate("/mobile/repairer");
    } else {
      navigate("/dashboard");
    }
  };

  const resetDemo = () => {
    if (window.confirm("重新初始化所有演示資料？（清空 localStorage）")) {
      dispatch({ type: "RESET_DEMO" });
      navigate("/");
    }
  };

  // 角色快切：每個角色取一個代表使用者
  const roleSamples = SP.ROLE_DEFS
    .map(r => state.users.find(u => u.role === r.id))
    .filter(Boolean);

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__brand-icon">💧</span>
        <span>檢修漏管理系統</span>
      </div>

      <div className="app-header__search">
        <span className="app-header__search-icon">🔍</span>
        <input type="text" placeholder="搜尋案件 / 使用者 / 管段 / 文件" disabled />
      </div>

      <div className="app-header__actions">
        {/* 區處下拉 */}
        <div style={{ position: "relative" }} data-tour="region-switcher">
          <button className="app-header__action" onClick={() => setRegionMenuOpen(o => !o)}>
            🏛 {state.currentRegion} ▾
          </button>
          {regionMenuOpen && (
            <div style={dropdownStyle}>
              {SP.REGIONS.map(r => (
                <button key={r} style={dropdownItemStyle(r === state.currentRegion)}
                  onClick={() => { dispatch({ type: "SET_REGION", payload: r }); setRegionMenuOpen(false); }}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 通知 */}
        <button className="app-header__action app-header__action--bell" title="通知" data-tour="bell">
          🔔
          {unreadCount > 0 && <span className="app-header__bell-count">{unreadCount}</span>}
        </button>

        {/* 使用者 */}
        <button className="app-header__action" title={user?.name}>
          👤 {user?.name || "未登入"}
        </button>

        {/* 角色快切（demo 用） */}
        <div style={{ position: "relative" }} data-tour="role-switcher">
          <button className="app-header__action" onClick={() => setRoleMenuOpen(o => !o)}>
            🎭 角色快切 ▾
          </button>
          {roleMenuOpen && (
            <div style={{ ...dropdownStyle, width: "20rem" }}>
              <div style={{ padding: "0.5rem 0.75rem", fontSize: "var(--text-xs)", color: "var(--text-muted)", borderBottom: "1px solid var(--border-base)" }}>
                點選角色直達該儀表板（演示用）
              </div>
              {roleSamples.map(u => (
                <button key={u.id} style={dropdownItemStyle(user?.id === u.id)} onClick={() => switchRole(u)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span>{u.name}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{SP.roleLabel(u.role)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 教學按鈕 */}
        <SP.TourHelpButton />

        {/* 重置示範 */}
        <button className="app-header__action" onClick={resetDemo} title="清 localStorage 重新初始化" data-tour="reset">
          ⚙ 重置示範
        </button>
      </div>
    </header>
  );
};

/* TourHelpButton 已在 shared/tour.js 定義（重置所有頁面說明） */

const dropdownStyle = {
  position: "absolute",
  top: "calc(100% + 0.25rem)",
  right: 0,
  background: "var(--bg-surface)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-base)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-lg)",
  minWidth: "12rem",
  maxHeight: "20rem",
  overflowY: "auto",
  zIndex: "var(--z-header)",
};

const dropdownItemStyle = (active) => ({
  display: "block",
  width: "100%",
  padding: "0.5rem 0.75rem",
  background: active ? "var(--bg-low)" : "transparent",
  border: "none",
  textAlign: "left",
  fontSize: "var(--text-sm)",
  color: active ? "var(--color-low)" : "var(--text-primary)",
  cursor: "pointer",
  fontWeight: active ? 600 : 400,
});

/* ---------- AppNav ---------- */
SP.AppNav = function AppNav() {
  const { state } = SP.useStore();
  const location = ReactRouterDOM.useLocation();
  const navigate = ReactRouterDOM.useNavigate();

  const groups = SP.filterNavForRole(state.currentUser?.role);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="app-nav" aria-label="主導航" data-tour="app-nav">
      {groups.map(group => (
        <div key={group.id} className="app-nav__group">
          <div className="app-nav__group-title">{group.title}</div>
          {group.items.map(item => (
            <div
              key={item.path}
              className={"app-nav__item" + (isActive(item.path) ? " app-nav__item--active" : "")}
              onClick={() => navigate(item.path)}
            >
              <span className="app-nav__item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
};

/* ---------- AppShell ---------- */
SP.AppShell = function AppShell({ children }) {
  return (
    <div className="app-shell">
      <SP.AppHeader />
      <div className="app-body">
        <SP.AppNav />
        <main className="app-main" data-tour="app-main">{children}</main>
      </div>
      <SP.ToastStack />
    </div>
  );
};
