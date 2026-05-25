/* ============================================================
   shared/tour-steps.js — 10 步全站導覽腳本
   ============================================================ */

window.SP = window.SP || {};

SP.TOUR_STEPS = [
  {
    id: "welcome",
    title: "👋 歡迎進入演示沙盒",
    body: (
      <>
        本系統包含 <strong>11 個角色</strong>、<strong>10 個子系統</strong>、<strong>126 個操作葉子</strong>，完整對應 RFP 附錄一功能規範書。
        <br /><br />
        以下 9 個步驟帶您走過核心功能與跨角色流程。
      </>
    ),
    selector: null,
    position: "center",
    switchRole: "U001",
    navigate: "/",
  },
  {
    id: "header-role",
    title: "🎭 角色快切",
    body: (
      <>
        本系統有 <strong>11 個角色</strong>（系統管理員、總處、區處、廠所、檢漏員、修漏員、客服、DBA、資安、內外稽核）。
        <br /><br />
        從這個按鈕可即時切換角色，每個角色看到的儀表板、導覽選單、權限都不同。
      </>
    ),
    selector: '[data-tour="role-switcher"]',
    position: "bottom",
  },
  {
    id: "app-nav",
    title: "📂 動態側邊選單",
    body: (
      <>
        左側選單依當前角色自動過濾。
        <br /><br />
        例：客服只看到「案件申報」、檢漏員只看到「行動版」、稽核員只能讀稽核日誌。共 10 個子系統群組。
      </>
    ),
    selector: '[data-tour="app-nav"]',
    position: "right",
  },
  {
    id: "kpi",
    title: "📊 即時業務 KPI",
    body: (
      <>
        儀表板即時顯示業務數據：案件總數、進行中、緊急案件、結案率、介接系統健康度、高風險管段⋯⋯
        <br /><br />
        所有數字從中央資料即時計算，跨角色操作會立刻反映在此。
      </>
    ),
    selector: ".kpi-grid",
    position: "bottom",
    navigate: "/dashboard",
  },
  {
    id: "bell",
    title: "🔔 跨角色通知",
    body: (
      <>
        任一角色的操作（建案、派工、上傳、結案）都會即時推送通知給相關角色。
        <br /><br />
        鈴鐺紅點顯示當前角色的未讀通知數。等下會看到跨角色連動的實際效果。
      </>
    ),
    selector: '[data-tour="bell"]',
    position: "bottom",
  },
  {
    id: "dispatch",
    title: "🗂️ 派工看板（廠所人員視角）",
    body: (
      <>
        切換到「賴伯毅 廠所人員」視角的派工看板。
        <br /><br />
        4 個狀態欄位（申報 / 派工 / 待修 / 修復中）即時呈現案件分佈。<strong>點「派檢漏員」一鍵</strong>會自動通知對應檢漏員，狀態即刻流轉。
      </>
    ),
    selector: ".app-main",
    position: "left",
    switchRole: "U004",
    navigate: "/repair/dispatch-board",
  },
  {
    id: "mobile",
    title: "📱 檢漏員行動版（真實可操作）",
    body: (
      <>
        切到「王志強 檢漏員」視角的行動端。
        <br /><br />
        非靜態 mockup — PhoneFrame 內每個按鈕都可真實點擊。任務列表 / 拍照 / 自動 GPS（WGS84+TWD97）/ 一鍵上傳，全部即時觸發跨角色連動。
      </>
    ),
    selector: ".app-main",
    position: "left",
    switchRole: "U005",
    navigate: "/mobile/inspector",
  },
  {
    id: "case-track",
    title: "🔭 案件即時追蹤",
    body: (
      <>
        切回系統管理員視角，進入「案件即時追蹤」。
        <br /><br />
        左側案件清單、右側完整 timeline，跨 4 個角色（客服 → 廠所 → 檢漏員 → 修漏員）的所有操作即時呈現。
      </>
    ),
    selector: ".app-main",
    position: "left",
    switchRole: "U001",
    navigate: "/dashboard/case-track",
  },
  {
    id: "reset",
    title: "⚙ 重置示範",
    body: (
      <>
        測試完想重來？點此按鈕清空所有演示資料，回到初始 53 案件、14 介接、20 廠商的標準起點。
        <br /><br />
        所有資料存在瀏覽器 localStorage，<strong>不會送回伺服器</strong>。
      </>
    ),
    selector: '[data-tour="reset"]',
    position: "bottom",
  },
  {
    id: "help",
    title: "❓ 隨時可重啟教學",
    body: (
      <>
        導覽完成！隨時可從這個按鈕重新開啟教學。
        <br /><br />
        建議您：
        <br />・點「🎭 角色快切」試 11 個角色
        <br />・到 <code>客服</code> 點「+ 新案件」觸發跨角色連動
        <br />・打開「案件即時追蹤」看 timeline 變化
        <br /><br />
        如有任何問題請聯繫 <strong>藥提醒科技</strong> service@yao.care
      </>
    ),
    selector: '[data-tour="help"]',
    position: "bottom",
  },
];
