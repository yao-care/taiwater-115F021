/* ============================================================
   subsystems/login.js — 登入頁
   依 03-登入.md：10 帳號直達 + 真實演示模式（AD + 雙因素 + 5 次鎖定）
   ============================================================ */

window.SP = window.SP || {};

const QUICK_ACCOUNTS = [
  { id: "U001", icon: "👤", roleLabel: "系統管理員",       hint: "系統全功能後台" },
  { id: "U002", icon: "👔", roleLabel: "總處管理員",       hint: "全國 KPI 與政策" },
  { id: "U003", icon: "🏛", roleLabel: "區處主管 第四區",   hint: "區處績效與審核" },
  { id: "U004", icon: "🏢", roleLabel: "廠所人員 中港廠所", hint: "派工 + 工程預算書" },
  { id: "U005", icon: "📱", roleLabel: "檢漏員 第四區",     hint: "行動版・外業檢漏" },
  { id: "U006", icon: "📱", roleLabel: "修漏員 第四區",     hint: "行動版・外業修復" },
  { id: "U007", icon: "☎", roleLabel: "客服人員",          hint: "案件申報與後送" },
  { id: "U008", icon: "🗄", roleLabel: "DBA",               hint: "DB 效能與 HA 監控" },
  { id: "U009", icon: "🔐", roleLabel: "資安人員",          hint: "ISMS + SBOM" },
  { id: "U010", icon: "🔎", roleLabel: "ISMS 內稽",         hint: "內部稽核（唯讀）" },
  { id: "U011", icon: "🌐", roleLabel: "ISO 27001 LA",      hint: "第三方稽核（唯讀）" },
];

SP.LoginPage = function LoginPage() {
  const { state, dispatch } = SP.useStore();
  const navigate = ReactRouterDOM.useNavigate();
  const [realMode, setRealMode] = React.useState(false);
  const [adAccount, setAdAccount] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpCountdown, setOtpCountdown] = React.useState(60);
  const [failCount, setFailCount] = React.useState(0);
  const [locked, setLocked] = React.useState(false);
  const [lockedUntil, setLockedUntil] = React.useState(null);

  // OTP 60 秒倒數
  React.useEffect(() => {
    if (!realMode) return;
    const t = setInterval(() => setOtpCountdown(c => (c > 0 ? c - 1 : 60)), 1000);
    return () => clearInterval(t);
  }, [realMode]);

  // 鎖定倒數
  React.useEffect(() => {
    if (!locked) return;
    const t = setInterval(() => {
      if (lockedUntil && Date.now() >= lockedUntil) {
        setLocked(false); setFailCount(0); setLockedUntil(null);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [locked, lockedUntil]);

  const loginAs = (userId) => {
    const u = state.users.find(x => x.id === userId);
    if (!u) return;
    dispatch({ type: "LOGIN", payload: u, authMode: "demo" });
    dispatch({
      type: "LOG_AUDIT",
      payload: {
        id: "LA" + Date.now(),
        userId: u.id, action: "LOGIN", target: "—",
        ip: "10.10.4.52", ua: "POC Demo Mode",
        at: new Date().toISOString(),
        hash: "sha256:demo" + Date.now().toString(36),
      },
    });
    if (u.role === "inspector") navigate("/mobile/inspector");
    else if (u.role === "repairer") navigate("/mobile/repairer");
    else navigate("/dashboard");
  };

  const realSubmit = () => {
    // POC 不真實驗證，演示 5 次失敗鎖定
    const next = failCount + 1;
    if (next >= 5) {
      setLocked(true);
      setLockedUntil(Date.now() + 15 * 60 * 1000);
    } else {
      setFailCount(next);
    }
  };

  return (
    <>
      <SP.PageHeader
        title="台灣自來水股份有限公司"
        subtitle="檢修漏管理資訊系統 ・ 公開徵求 POC ・ 藥提醒科技有限公司"
        breadcrumb={["首頁", "登入"]}
        rfp="附錄一 一(七) + A01 行動版登入"
      />

      <div style={loginGridStyle}>
        {/* ---- 左：10 帳號直達 ---- */}
        <SP.Card title="選擇示範角色直接登入" subtitle="點選即進入該角色儀表板，不需密碼（POC 演示模式）" padding="0">
          <div style={{ padding: "var(--space-2)" }}>
            {QUICK_ACCOUNTS.map(acc => {
              const u = state.users.find(x => x.id === acc.id);
              if (!u) return null;
              return (
                <button
                  key={acc.id}
                  onClick={() => loginAs(acc.id)}
                  style={quickBtnStyle(state.currentUser?.id === acc.id)}
                >
                  <span style={{ fontSize: "1.5rem", width: "2.5rem", textAlign: "center" }}>{acc.icon}</span>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>{u.name}</div>
                    <div className="text-sm muted">{acc.roleLabel} ・ {acc.hint}</div>
                  </div>
                  <span style={{ fontSize: "1.5rem", color: "var(--tw-primary)" }}>→</span>
                </button>
              );
            })}
          </div>
        </SP.Card>

        {/* ---- 右：真實演示模式 ---- */}
        <div className="flex-col" style={{ gap: "var(--space-5)" }}>
          <SP.Card
            title={realMode ? "真實演示模式（AD + 雙因素）" : "真實演示模式預覽"}
            subtitle={realMode ? "依附錄一 一(七) + 附錄九 資安基準" : "切換後顯示完整 AD 登入流程"}
            action={
              <SP.Button size="sm" variant={realMode ? "secondary" : "primary"} onClick={() => setRealMode(m => !m)}>
                {realMode ? "返回快速登入" : "切換真實模式"}
              </SP.Button>
            }
          >
            {!realMode ? (
              <div className="text-sm muted" style={{ lineHeight: "var(--leading-relaxed)" }}>
                真實環境登入流程：
                <ol style={{ paddingLeft: "1.25rem", marginTop: "var(--space-2)" }}>
                  <li>AD 帳號 + 密碼（bcrypt + salt 儲存）</li>
                  <li>6 碼 OTP 雙因素（時效 60 秒）</li>
                  <li>圖形 CAPTCHA</li>
                  <li>連續 5 次失敗 → 鎖定 15 分鐘</li>
                  <li>預設密碼首次登入強制變更</li>
                  <li>Session 30 分鐘無操作自動登出</li>
                </ol>
              </div>
            ) : locked ? (
              <div style={{ padding: "var(--space-5)", background: "var(--bg-critical)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-critical)", marginBottom: "var(--space-2)" }}>⚠ 帳號已鎖定</div>
                <div className="text-sm">連續 5 次密碼錯誤，請 15 分鐘後再試。</div>
                <div className="text-xs muted mt-2">解鎖時間：{new Date(lockedUntil).toLocaleTimeString("zh-TW")}</div>
              </div>
            ) : (
              <div className="flex-col" style={{ gap: "var(--space-4)" }}>
                <SP.FormRow label="AD 帳號" required>
                  <input className="form-control" type="text" placeholder="username@water.gov.tw"
                    value={adAccount} onChange={e => setAdAccount(e.target.value)} />
                </SP.FormRow>
                <SP.FormRow label="密碼" required hint="至少 12 碼，含大小寫 + 數字 + 符號">
                  <input className="form-control" type="password" placeholder="••••••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} />
                </SP.FormRow>
                <SP.FormRow label={"OTP 雙因素（剩 " + otpCountdown + " 秒）"} required>
                  <input className="form-control" type="text" placeholder="6 位數字" maxLength={6}
                    value={otp} onChange={e => setOtp(e.target.value)} />
                </SP.FormRow>
                <SP.FormRow label="圖形驗證">
                  <div style={captchaStyle}>
                    <span style={{ fontFamily: "monospace", fontSize: "1.5rem", letterSpacing: "0.5rem", fontWeight: 700, color: "var(--tw-primary)" }}>F4R8X</span>
                    <SP.Button size="sm" variant="ghost">換一張</SP.Button>
                  </div>
                  <input className="form-control mt-2" type="text" placeholder="請輸入上方代碼" />
                </SP.FormRow>
                {failCount > 0 && (
                  <div className="text-sm" style={{ color: "var(--color-critical)" }}>
                    密碼錯誤 ({failCount}/5)，再 {5 - failCount} 次將鎖定 15 分鐘
                  </div>
                )}
                <SP.Button variant="primary" size="lg" onClick={realSubmit}>登入</SP.Button>
              </div>
            )}
          </SP.Card>

          {/* 資安要點卡 */}
          <SP.Card title="登入頁資安要點" subtitle="附錄九 資通系統防護基準（中級）">
            <ul style={{ paddingLeft: "1.25rem", margin: 0, fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)" }}>
              <li>NTP 校時：<code>time.stdtime.gov.tw</code></li>
              <li>Session 30 分鐘逾時自動登出</li>
              <li>密碼複雜度：≥12 碼，大小寫 + 數字 + 符號</li>
              <li>bcrypt + salt（cost factor ≥ 12）</li>
              <li>連續 5 次失敗 → 鎖定 15 分鐘</li>
              <li>預設密碼首次登入強制變更</li>
              <li>HTTPS 強制 + HSTS</li>
              <li>登入紀錄寫入稽核日誌（SHA-256 防竄改）</li>
            </ul>
          </SP.Card>
        </div>
      </div>
    </>
  );
};

/* ---------- styles ---------- */
const loginGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
  gap: "var(--space-5)",
};

const quickBtnStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: "var(--space-3)",
  width: "100%",
  padding: "var(--space-3) var(--space-4)",
  margin: "var(--space-1) 0",
  border: "1px solid " + (active ? "var(--tw-primary)" : "var(--border-base)"),
  borderRadius: "var(--radius-md)",
  background: active ? "var(--bg-low)" : "var(--bg-surface)",
  cursor: "pointer",
  transition: "background 120ms, border-color 120ms",
});

const captchaStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "var(--space-3)",
  background: "linear-gradient(135deg, oklch(0.95 0.02 250), oklch(0.97 0.01 250))",
  border: "1px solid var(--border-base)",
  borderRadius: "var(--radius-md)",
};
