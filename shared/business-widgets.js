/* ============================================================
   shared/business-widgets.js — 業務複合元件
   v1（階段 2）：角色徽章 + 通知中心 + 介接狀態 + 待審帳號 + 月報審核
   v2 後續：CaseCard / CaseTimeline / DispatchBoard / ComplianceMatrix...
   ============================================================ */

window.SP = window.SP || {};

/* ---------- RoleBadge ---------- */
SP.RoleBadge = function RoleBadge({ role, size = "md" }) {
  const ICON = {
    admin: "👤", hq: "👔", region: "🏛", plant: "🏢",
    inspector: "📱", repairer: "📱", cs: "☎",
    dba: "🗄", security: "🔐",
    audit_int: "🔎", audit_ext: "🌐",
  };
  const COLOR = {
    admin: "info", hq: "info", region: "info", plant: "low",
    inspector: "medium", repairer: "medium", cs: "pass",
    dba: "info", security: "critical",
    audit_int: "neutral", audit_ext: "neutral",
  };
  return (
    <span className={"badge badge--" + (COLOR[role] || "neutral")}>
      <span style={{ fontSize: size === "sm" ? "0.875rem" : "1rem" }}>{ICON[role] || "❓"}</span>
      <span>{SP.roleLabel(role)}</span>
    </span>
  );
};

/* ---------- NotificationItem ---------- */
SP.NotificationItem = function NotificationItem({ n, onClick }) {
  const tone = SP.notifTone ? SP.notifTone(n.kind) : "neutral";
  return (
    <div
      onClick={onClick}
      style={{
        padding: "var(--space-3)",
        border: "1px solid " + (n.read ? "var(--border-base)" : "var(--color-low)"),
        background: n.read ? "var(--bg-surface)" : "var(--bg-low)",
        borderRadius: "var(--radius-md)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
        <strong style={{ fontSize: "var(--text-sm)" }}>{n.title}</strong>
        <SP.Badge tone={tone}>{SP.notifLabel ? SP.notifLabel(n.kind) : n.kind}</SP.Badge>
      </div>
      <div className="text-sm muted">{n.body}</div>
      <div className="text-xs muted mt-2">{SP.format.datetime(n.at)}</div>
    </div>
  );
};

/* ---------- 通知標籤映射（給 home.js / notification center 共用） ---------- */
SP.notifTone = function (kind) {
  return ({
    new_case:   "info",
    dispatched: "high",
    kpi:        "pass",
    security:   "critical",
    audit:      "medium",
  })[kind] || "neutral";
};
SP.notifLabel = function (kind) {
  return ({
    new_case:   "新案件",
    dispatched: "派工",
    kpi:        "KPI",
    security:   "資安",
    audit:      "稽核",
  })[kind] || kind;
};

/* ---------- NotificationCenter（卡片內含通知列表 + 全部已讀） ---------- */
SP.NotificationCenter = function NotificationCenter({ userId, limit = 5, title = "未讀通知" }) {
  const { state, dispatch } = SP.useStore();
  const list = state.notifications.filter(n => !userId || n.recipient === userId);
  const unread = list.filter(n => !n.read);
  const display = list.slice(0, limit);

  const markRead = (id) => dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  const markAllRead = () => dispatch({ type: "MARK_ALL_READ", recipient: userId });

  return (
    <SP.Card
      title={title}
      subtitle={unread.length + " 則未讀 / " + list.length + " 則總計"}
      action={unread.length > 0 ? <SP.Button size="sm" variant="ghost" onClick={markAllRead}>全部已讀</SP.Button> : null}
    >
      {display.length === 0 ? (
        <div className="text-sm muted" style={{ textAlign: "center", padding: "var(--space-4)" }}>目前無通知</div>
      ) : (
        <div className="flex-col" style={{ gap: "var(--space-3)" }}>
          {display.map(n => (
            <SP.NotificationItem key={n.id} n={n} onClick={() => markRead(n.id)} />
          ))}
        </div>
      )}
    </SP.Card>
  );
};

/* ---------- IntegrationStatus（14 系統健康度，admin dashboard 用） ---------- */
SP.IntegrationStatus = function IntegrationStatus({ compact, max }) {
  const { state } = SP.useStore();
  const navigate = ReactRouterDOM.useNavigate();
  const list = max ? state.integrations.slice(0, max) : state.integrations;
  const downCount = state.integrations.filter(i => i.status !== "healthy").length;

  return (
    <SP.Card
      title="介接系統健康度"
      subtitle={"健康 " + (state.integrations.length - downCount) + " / " + state.integrations.length + " 系統"}
      action={<SP.Button size="sm" variant="ghost" onClick={() => navigate("/integration/health")}>監控 →</SP.Button>}
    >
      <div className="flex-col" style={{ gap: "var(--space-2)" }}>
        {list.map(i => (
          <div key={i.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: compact ? "0.125rem 0" : "var(--space-1) 0" }}>
            <SP.StatusDot tone={i.status === "down" ? "critical" : i.status === "degraded" ? "high" : "pass"} />
            <span className="text-sm" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</span>
            <span className="text-xs muted" style={{ width: "5rem", textAlign: "right" }}>{i.latencyMs}ms</span>
            <SP.Badge tone={i.status === "down" ? "critical" : i.status === "degraded" ? "high" : "pass"}>
              {i.status === "down" ? "離線" : i.status === "degraded" ? "降級" : "正常"}
            </SP.Badge>
          </div>
        ))}
      </div>
    </SP.Card>
  );
};

/* ---------- AccountRequestList（待審帳號，admin dashboard 用） ---------- */
SP.AccountRequestList = function AccountRequestList({ limit = 5 }) {
  const { state } = SP.useStore();
  const toast = SP.useToast();
  const list = state.accountRequests.filter(r => r.status === "pending").slice(0, limit);

  const approve = (r) => toast({ kind: "pass", title: "已批准帳號申請", body: r.name + "（" + SP.roleLabel(r.role) + "）" });
  const reject  = (r) => toast({ kind: "critical", title: "已駁回帳號申請", body: r.name });

  return (
    <SP.Card
      title="待審帳號"
      subtitle={state.accountRequests.filter(r => r.status === "pending").length + " 件待簽"}
    >
      {list.length === 0 ? (
        <div className="text-sm muted" style={{ textAlign: "center", padding: "var(--space-4)" }}>無待審帳號</div>
      ) : (
        <SP.Table
          compact
          headers={["申請人", "角色", "區處", "申請日期", "操作"]}
          rows={list.map(r => [
            <span style={{ fontWeight: 600 }}>{r.name}</span>,
            <SP.RoleBadge role={r.role} />,
            <span className="text-sm muted">{r.region}</span>,
            <span className="text-sm muted">{SP.format.date(r.at)}</span>,
            <span style={{ display: "inline-flex", gap: "var(--space-2)" }}>
              <SP.Button size="sm" variant="primary" onClick={() => approve(r)}>批准</SP.Button>
              <SP.Button size="sm" variant="secondary" onClick={() => reject(r)}>駁回</SP.Button>
            </span>,
          ])}
        />
      )}
    </SP.Card>
  );
};

/* ---------- MonthlyReportList（月報審核，region dashboard 用） ---------- */
SP.MonthlyReportList = function MonthlyReportList({ region }) {
  const { state } = SP.useStore();
  const toast = SP.useToast();
  const list = state.monthlyReports.filter(r => !region || r.region === region);

  const TONE = { pending_review: "high", approved: "pass", returned: "critical" };
  const LABEL = { pending_review: "待審", approved: "已核", returned: "退回" };

  return (
    <SP.Card title="月 / 季報審核" subtitle={list.filter(r => r.status === "pending_review").length + " 件待審"}>
      <SP.Table
        compact
        headers={["期別", "廠所", "繳交者", "狀態", "操作"]}
        rows={list.map(r => [
          <span>{r.month}{r.type === "annual" ? "（年度）" : ""}</span>,
          <span className="text-sm">{r.plant}</span>,
          <span className="text-sm muted">{r.submitter}</span>,
          <SP.Badge tone={TONE[r.status]}>{LABEL[r.status]}</SP.Badge>,
          r.status === "pending_review"
            ? <span style={{ display: "inline-flex", gap: "var(--space-2)" }}>
                <SP.Button size="sm" variant="primary" onClick={() => toast({ kind: "pass", title: "已核准", body: r.plant + " " + r.month })}>審核</SP.Button>
                <SP.Button size="sm" variant="secondary" onClick={() => toast({ kind: "critical", title: "已退回", body: r.plant })}>退回</SP.Button>
              </span>
            : <span className="text-sm muted">—</span>,
        ])}
      />
    </SP.Card>
  );
};

/* ---------- PlantPerformanceList（廠所績效，region 用 RankBar） ---------- */
SP.PlantPerformanceList = function PlantPerformanceList({ region }) {
  const { state } = SP.useStore();
  const list = state.plantPerformance
    .filter(p => !region || p.region === region)
    .map(p => ({
      rank: 0,
      label: p.plant,
      value: p.achievement,
      sub: "結案率 " + p.closeRate + "%",
    }));
  return (
    <SP.Card title={(region || "全國") + " 廠所績效"} subtitle="達成率排名">
      <SP.RankBar data={list.sort((a, b) => b.value - a.value).map((d, i) => ({ ...d, rank: i + 1 }))} suffix="%" max={100} />
    </SP.Card>
  );
};

/* ---------- LoginLogList（admin dashboard 用） ---------- */
SP.LoginLogList = function LoginLogList({ limit = 8 }) {
  const { state } = SP.useStore();
  const userMap = Object.fromEntries(state.users.map(u => [u.id, u]));
  const logs = state.loginLogs.slice(0, limit);
  return (
    <SP.Card title="最近登入紀錄" subtitle={"近 " + limit + " 筆 / 共 " + state.loginLogs.length + " 筆"}>
      <SP.Table
        compact
        headers={["時間", "使用者", "IP", "瀏覽器", "結果"]}
        rows={logs.map(l => [
          <span className="text-sm muted font-mono">{SP.format.datetime(l.at)}</span>,
          <span className="text-sm">{userMap[l.userId]?.name || l.userId}</span>,
          <span className="text-sm font-mono">{l.ip}</span>,
          <span className="text-sm muted">{l.ua.split(" ")[0]}</span>,
          l.success ? <SP.Badge tone="pass">成功</SP.Badge> : <SP.Badge tone="critical">{l.reason || "失敗"}</SP.Badge>,
        ])}
      />
    </SP.Card>
  );
};

/* ============================================================
   v2（階段 3）：CaseCard / CaseTimeline / CaseStatusFlow / DispatchBoard
   ============================================================ */

/* ---------- CaseStatusFlow — 7 status stepper ---------- */
SP.CaseStatusFlow = function CaseStatusFlow({ status }) {
  const idx = SP.CASE_STATUS.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", flexWrap: "wrap" }}>
      {SP.CASE_STATUS.map((s, i) => {
        const done = i <= idx;
        const cur = i === idx;
        return (
          <React.Fragment key={s}>
            <div style={{
              padding: "0.25rem 0.625rem",
              borderRadius: "999px",
              fontSize: "var(--text-xs)",
              fontWeight: cur ? 700 : 500,
              background: cur ? "var(--tw-primary)" : done ? "var(--bg-pass)" : "var(--bg-muted)",
              color:      cur ? "var(--text-inverse)" : done ? "var(--color-pass)" : "var(--text-muted)",
              border: "1px solid " + (cur ? "var(--tw-primary)" : "var(--border-base)"),
            }}>{s}</div>
            {i < SP.CASE_STATUS.length - 1 && (
              <span style={{ color: done ? "var(--color-pass)" : "var(--text-muted)", fontSize: "0.75rem" }}>→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ---------- CaseCard ---------- */
SP.CaseCard = function CaseCard({ caseItem, compact, onClick, action }) {
  const c = caseItem;
  return (
    <div
      onClick={onClick}
      style={{
        padding: "var(--space-3)",
        border: "1px solid var(--border-base)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-surface)",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
        <span className="font-mono text-sm" style={{ fontWeight: 700 }}>{c.caseNo}</span>
        <SP.SeverityBadge severity={c.severity} />
      </div>
      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
      {!compact && (
        <div className="text-xs muted" style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span>{c.region.replace("處", "")}</span>
          <span>・</span>
          <span>{c.plant}</span>
          <span>・</span>
          <span>{SP.format.date(c.createdAt)}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
        <SP.StatusBadge status={c.status} />
        {action}
      </div>
    </div>
  );
};

/* ---------- CaseTimeline — 垂直時間軸 ---------- */
SP.CaseTimeline = function CaseTimeline({ timeline, users }) {
  if (!timeline || timeline.length === 0) {
    return <div className="text-sm muted" style={{ padding: "var(--space-3)" }}>尚無 timeline 紀錄</div>;
  }
  const userMap = users ? Object.fromEntries(users.map(u => [u.id, u])) : {};
  return (
    <div className="flex-col" style={{ gap: "var(--space-3)" }}>
      {timeline.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: "0.875rem", height: "0.875rem", borderRadius: "999px",
              background: i === timeline.length - 1 ? "var(--tw-primary)" : "var(--color-pass)",
              marginTop: "0.4rem",
              border: "2px solid var(--bg-surface)",
              boxShadow: "0 0 0 1px " + (i === timeline.length - 1 ? "var(--tw-primary)" : "var(--color-pass)"),
            }} />
            {i < timeline.length - 1 && (
              <div style={{ width: "2px", flex: 1, minHeight: "1rem", background: "var(--border-base)", marginTop: "0.25rem" }} />
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: "var(--space-2)" }}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{t.action}</div>
            <div className="text-xs muted">
              {SP.format.datetime(t.at)} ・ {userMap[t.by]?.name || t.by}
            </div>
            {t.note && <div className="text-sm" style={{ marginTop: "0.25rem" }}>{t.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ---------- DispatchBoard — 4 status column ---------- */
SP.DispatchBoard = function DispatchBoard({ cases, onDispatchInspector, onDispatchRepairer, onSelectCase }) {
  const cols = [
    { status: "申報",   actionLabel: "派檢漏員", actionFn: onDispatchInspector },
    { status: "派工",   actionLabel: "已派工",   actionFn: null },
    { status: "待修",   actionLabel: "派修漏員", actionFn: onDispatchRepairer },
    { status: "修復中", actionLabel: "施工中",   actionFn: null },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
      {cols.map(col => {
        const list = cases.filter(c => c.status === col.status);
        return (
          <div key={col.status} style={{
            background: "var(--bg-muted)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-1)" }}>
              <SP.StatusBadge status={col.status} />
              <span className="text-xs muted">{list.length} 件</span>
            </div>
            {list.length === 0 ? (
              <div className="text-xs muted" style={{ textAlign: "center", padding: "var(--space-3)" }}>無</div>
            ) : list.map(c => (
              <SP.CaseCard
                key={c.id}
                caseItem={c}
                compact
                onClick={onSelectCase ? () => onSelectCase(c) : undefined}
                action={col.actionFn ? (
                  <SP.Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => { e.stopPropagation(); col.actionFn(c); }}
                  >
                    {col.actionLabel}
                  </SP.Button>
                ) : null}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- CaseFilter — 簡易篩選列 ---------- */
SP.CaseFilter = function CaseFilter({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={value === o.value ? "btn btn--primary btn--sm" : "btn btn--secondary btn--sm"}
        >
          {o.label}
          {o.count != null && <span style={{ marginLeft: "0.5rem", opacity: 0.7 }}>({o.count})</span>}
        </button>
      ))}
    </div>
  );
};

/* ---------- AuditLogTable（admin / security / 內外稽核共用） ---------- */
SP.AuditLogTable = function AuditLogTable({ limit = 10, compact = true }) {
  const { state } = SP.useStore();
  const userMap = Object.fromEntries(state.users.map(u => [u.id, u]));
  const logs = state.auditLogs.slice(0, limit);
  return (
    <SP.Card title="操作日誌（最近）" subtitle="保存 12 個月 ・ SHA-256 防竄改">
      <SP.Table
        compact={compact}
        headers={["時間", "使用者", "事件", "對象", "IP", "Hash"]}
        rows={logs.map(l => [
          <span className="text-sm muted font-mono">{SP.format.datetime(l.at)}</span>,
          <span className="text-sm">{userMap[l.userId]?.name || l.userId}</span>,
          <SP.Badge tone="info">{l.action}</SP.Badge>,
          <span className="text-sm font-mono">{l.target}</span>,
          <span className="text-sm font-mono muted">{l.ip}</span>,
          <span className="text-xs font-mono muted">{l.hash.slice(0, 16)}…</span>,
        ])}
      />
    </SP.Card>
  );
};
