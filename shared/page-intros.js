/* ============================================================
   shared/page-intros.js — 每頁進入時自動跳的功能說明
   依 location.pathname 對應；前綴匹配（短的吃不到時找上層）
   ============================================================ */

window.SP = window.SP || {};

SP.PAGE_INTROS = {

  /* ============ 首頁 / 登入 ============ */
  "/": {
    title: "系統首頁",
    body: "歡迎進入檢修漏管理系統。本頁顯示登入角色的整體概況與最常用入口。",
    tips: [
      "上方 4 個關鍵 KPI（全國案件 / 進行中 / 緊急 / 結案率）即時計算",
      "左側列出最新案件與我的待辦；右側為通知與介接系統狀態",
      "頁面標題旁的 ℹ️ 可隨時重新查閱本頁說明",
    ],
  },
  "/login": {
    title: "登入頁",
    body: "左側 11 個帳號可一鍵直達對應角色（POC 演示用）。右側為真實環境登入流程預覽。",
    tips: [
      "點任一帳號可直接進入該角色的儀表板，不需密碼",
      "切換「真實演示模式」可看 AD + OTP + CAPTCHA 完整流程",
      "下方列出附錄九資安要點：NTP 校時 / Session 逾時 / 密碼複雜度 / 失敗鎖定",
    ],
  },

  /* ============ 角色儀表板 ============ */
  "/dashboard": {
    title: "角色儀表板",
    body: "依當前角色顯示不同儀表板。本系統共 11 種角色（系統管理員 / 總處 / 區處 / 廠所 / 檢漏員 / 修漏員 / 客服 / DBA / 資安 / 內外稽核）。",
    tips: [
      "右上「🎭 角色快切」可立即切換 11 種角色觀察差異",
      "切到檢漏員 / 修漏員會自動跳到行動版",
      "客服角色按「+ 新案件」可觸發跨角色連動演示",
    ],
  },
  "/dashboard/case-track": {
    title: "案件即時追蹤（流程 A 跨角色觀察）",
    body: "左側為案件清單，右側為該案件的完整 timeline。",
    steps: [
      { selector: ".page-header", position: "bottom", rfp: "流程 A", title: "案件 360 度追蹤", body: "本頁讓您即時觀察任一案件的完整生命週期，跨 4 個角色（客服 → 廠所 → 檢漏員 → 修漏員）所有操作都會記錄在此。" },
      { selector: ".app-main", position: "left", rfp: "三(三)1", title: "左：案件清單", body: "預設列出 53 件案件，依建立時間排序。點任一案件可在右側看詳情與 timeline。" },
      { selector: ".app-main", position: "left", rfp: "三(三)2", title: "右上：案件資訊", body: "案件基本資料：區處、廠所、嚴重度、狀態、案件來源、負責人、GPS 座標、建立時間。" },
      { selector: ".app-main", position: "left", rfp: "流程 A", title: "右下：完整 timeline", body: "每筆事件含操作人、時間、行動類別與備註。建議搭配「客服」一鍵新案件 + 派工看板演示，看 timeline 即時新增。" },
    ],
  },

  /* ============ 檢漏子系統 ============ */
  "/inspection": {
    title: "檢漏子系統 — 首頁",
    body: "依角色顯示通知變更與未輸入案件一覽。檢漏員看到的是「我的待辦」，廠所主管看到的是「全廠所未檢漏案件」。",
    tips: [
      "右側地圖以 D3 SVG 繪製 13 區處與案件 markers",
      "點地圖上的 marker 直接跳到該案件詳情",
      "對應 RFP 附錄一 三(一) 檢漏首頁需求",
    ],
  },
  "/inspection/work": {
    title: "檢漏作業 / 案件處理單",
    body: "依案件狀態（全部 / 派工中 / 檢漏中 / 已檢漏 / 結案）過濾的案件清單。檢漏員從這裡接收派工任務。",
    tips: [
      "點「查看」進入案件詳情，可一鍵上傳檢漏結果",
      "對應 RFP 附錄一 三(三) 1",
    ],
  },
  "/inspection/advanced": {
    title: "進階作業（水壓 / 流量 / 熱區）",
    body: "5 個進階分析功能：水壓調查、流量調查、漏水頻率熱區、水壓記錄歷線、流量分析圖表。",
    tips: [
      "水壓調查支援 TXT / CSV 上傳 → 圖台分析 → 前後比較",
      "流量調查整合超音波流量計與流向計算",
      "漏水熱區分析以 GIS 圖層呈現高頻區域",
      "對應 RFP 附錄一 三(四)",
    ],
  },
  "/inspection/annual": {
    title: "年度作業",
    body: "年度檢漏計畫（13 子項）+ 系統成果報告書（16 章）+ 年度成果報告書（10 章）+ 績效統計。",
    tips: [
      "點「進入 16 章編輯」可進到報告書自動產生畫面",
      "下方績效統計顯示各檢漏員的月件數、達標率、生產力指標",
    ],
  },
  "/inspection/reports": {
    title: "報表查詢中心",
    body: "14 個檢漏相關子報表清單，每筆可線上預覽、列印或匯出 ODF。",
    tips: [
      "依頻率分為月報 / 週報 / 季報",
      "點「ODF」按鈕可一鍵匯出 OpenDocument 試算表",
      "對應 RFP 附錄一 三(六)",
    ],
  },
  "/inspection/regulations": {
    title: "規定紀錄（檢漏知識管理中心）",
    body: "10 類分類：規定 / 紀錄 / 下載 / 規範 / 歷年數據 / 檢漏基礎 / 進階 / 考題 / 教材 / 案例分享。",
    tips: [
      "右側顯示每類的資料數量",
      "對應 RFP 附錄一 三(七)",
    ],
  },
  "/inspection/admin": {
    title: "檢漏系統管理",
    body: "7 個系統管理項目：帳號權限、登入查詢、共同費用、隊員資料、月薪設定、工作區、儀具設備。",
    tips: [
      "下方矩陣為 11 角色 × 7 模組權限矩陣（示範）",
      "對應 RFP 附錄一 三(二)",
    ],
  },

  /* ============ 修漏子系統 ============ */
  "/repair": {
    title: "修漏子系統 — 首頁",
    body: "依當前角色顯示待派工、進行中、逾期案件一覽。廠所主管的核心入口。",
    tips: [
      "上方 4 個 KPI 即時顯示本廠所案件狀況",
      "逾期 > 7 天的案件會以 critical 標示",
      "點任一案件可進入案件詳情",
    ],
  },
  "/repair/dispatch-board": {
    title: "派工看板（廠所人員核心功能）",
    body: "4 欄位看板 + 一鍵派工 + 跨角色通知。",
    steps: [
      { selector: ".page-header", position: "bottom", rfp: "附錄一 四(四)", title: "派工看板總覽", body: "本頁是廠所人員的核心入口。4 個狀態欄位即時呈現本廠所案件分佈。" },
      { selector: ".app-main", position: "left", rfp: "四(四)1", title: "申報欄位（最左）", body: "新建未派工案件落在此。卡片下方有「派檢漏員」按鈕，點一下自動派工 + 寫派工紀錄 + 推通知給檢漏員。" },
      { selector: ".app-main", position: "left", rfp: "四(四)3", title: "派工 / 待修 / 修復中", body: "案件流轉：派工 → 檢漏員上傳 → 待修 → 廠所派修漏員 → 修復中。待修欄位卡片有「派修漏員」按鈕。" },
      { selector: ".app-main", position: "left", rfp: "四(四)5", title: "一鍵派工原理", body: "系統自動帶最近檢漏員 / 修漏員（demo 為清單第一個）+ 寫 dispatch 紀錄 + 推通知 + 寫稽核日誌 + 案件 status 更新，全程一個按鈕。" },
      { selector: ".app-main", position: "left", rfp: "四(四)", title: "本區處團隊", body: "下方列出本區處可派的檢漏員與修漏員清單。實際導入後可整合 AD 群組與班表，依負載自動分派。" },
    ],
  },
  "/repair/dispatch": {
    title: "派工管理（歷史紀錄）",
    body: "過往所有派工紀錄（含檢漏 + 修漏），可依時間 / 案號 / 派工人 / 受派人查詢。",
    tips: [
      "點案號可直接跳到該案件詳情",
      "對應 RFP 附錄一 四(四)",
    ],
  },
  "/repair/cases": {
    title: "案件申報（客服 / 廠所共用）",
    body: "客服或廠所人員手動建立新案件的表單。送出後自動推派最近廠所並寫稽核日誌。",
    tips: [
      "標題與地址必填，其他欄位皆有合理預設值",
      "客服角色按本頁可快速建案",
      "對應 RFP 附錄一 四(三)",
    ],
  },
  "/repair/records": {
    title: "修漏記錄查詢",
    body: "本月修漏紀錄 + 9 個修漏相關子報表（漏水管制月報 / 漏水原因 / 記錄簿 / 管線統計 / 路平專案 / 搶修器材 / 修復速率）。",
    tips: [
      "上方表格列出最近修漏紀錄",
      "下方 9 個子報表可逐一預覽或匯出 ODF",
      "對應 RFP 附錄一 四(五)",
    ],
  },
  "/repair/statistics": {
    title: "統計分析",
    body: "7 個統計子項：物料用量、登錄時間追蹤、管線財產、委外實修、回收廢料、自訂統計圖表、久未結案。",
    tips: [
      "上方 4 個關鍵指標即時計算",
      "對應 RFP 附錄一 四(六)",
    ],
  },
  "/repair/reports": {
    title: "報表列印",
    body: "4 個修漏報表：申報案件列印、廠商實修報表、進階條件式查詢 1 / 2。",
    tips: [
      "支援 A4 直印與多條件組合查詢",
      "對應 RFP 附錄一 四(七)",
    ],
  },
  "/repair/admin": {
    title: "修漏系統管理",
    body: "6 個管理項目：帳號權限、登入查詢、廠商管理、案件轉移、廠所轄區、權限審核。",
    tips: [
      "廠商管理含 20 家配合廠商評分",
      "對應 RFP 附錄一 四(二)",
    ],
  },

  /* ============ 工程預算 / PCCES ============ */
  "/pcces": {
    title: "PCCES 工程預算書 — 首頁",
    body: "工項編碼資料庫 + 5 步驟預算書精靈 + 預算書查詢。RFP 要求 PCCES XML 4.3 + 編碼正確率 ≥ 40%。",
    tips: [
      "本系統自動編碼正確率達 83%（遠超門檻）",
      "右側「快速入口」可直接進精靈或編碼資料庫",
      "對應 RFP 附錄一 四(八)",
    ],
  },
  "/pcces/wizard": {
    title: "PCCES 預算書精靈（5 步驟）",
    body: "工程預算書編製引導程序。",
    steps: [
      { selector: ".page-header", position: "bottom", rfp: "附錄一 四(八)3", title: "PCCES 精靈總覽", body: "工程細目編碼 PCCES XML 4.3 編製作業。RFP 要求編碼正確率 ≥ 40%。" },
      { selector: ".app-main", position: "left", rfp: "四(八)3", title: "頂部 5 步驟條", body: "整個流程分 5 個步驟：1.選案件 2.系統建議工項 3.編碼正確率檢核 4.XML 預覽 5.上傳工程會。" },
      { selector: ".app-main", position: "left", rfp: "四(八)1", title: "步驟 1：選擇案件", body: "從已完成檢漏 / 修漏的案件中選一個編製預算書。系統會帶入案件基本資料。" },
      { selector: ".app-main", position: "left", rfp: "四(八)2", title: "步驟 2：系統建議工項", body: "依案件性質自動推薦工項，含 PCCES 8 碼編碼、單位、單價。數量可即時調整，小計自動重算。" },
      { selector: ".app-main", position: "left", rfp: "四(八)3", title: "步驟 3：編碼正確率檢核", body: "本系統自動檢核 PCCES 編碼正確率，本範例為 83%（≥ 40% 門檻 ✓）。下方列出所有檢核項目。" },
      { selector: ".app-main", position: "left", rfp: "四(八)7", title: "步驟 4-5：XML + 上傳", body: "預覽完整 PCCES 4.3 XML 格式（可下載 ODS / XML），最後一鍵上傳工程會 PCCES 平台。" },
    ],
  },
  "/pcces/items": {
    title: "工項編碼資料庫",
    body: "PCCES 4.3 工程會標準工項清單，含 8 碼編碼、單位、單價、Level。",
    tips: [
      "依工項類別：路面 / 管溝 / 管材 / 接頭 / 圍籬 / 監工 / 保險 / 紀錄",
      "Level 4 為細目層級，符合工程會編碼規範",
    ],
  },
  "/pcces/budget": {
    title: "預算書查詢",
    body: "已建立的工程預算書清單，含 6 個分頁（封面 / 總表 / 進度 / 詳細 / 單價 / 資源）。",
    tips: [
      "上方 KPI 即時統計本月新增 / 總金額 / 已核 / 待簽",
      "點「下載 XML」可取得該預算書的 PCCES XML",
    ],
  },

  /* ============ 介接管理 ============ */
  "/integration": {
    title: "介接系統清單",
    body: "14 個外部介接系統的統一管理介面（CIS / GIS / SCADA / AMI / ERP / 1999 / EIP / AD / PCCES / PMIS / DM / BI / 氣象局 / Open Data）。",
    tips: [
      "表格顯示協定、主責、端點、狀態、延遲、錯誤率",
      "對應 RFP 附錄一 四(九)~(十五)",
    ],
  },
  "/integration/health": {
    title: "健康度監控",
    body: "即時系統可用率：健康 / 降級 / 離線 三種狀態，平均延遲、最後同步時間。",
    tips: [
      "每筆右側「手動同步」按鈕可立即觸發重試",
      "離線系統會以紅色標示",
    ],
  },
  "/integration/topology": {
    title: "介接架構圖",
    body: "14 系統節點關聯。",
    steps: [
      { selector: ".page-header", position: "bottom", rfp: "D03", title: "介接架構圖總覽", body: "D3 SVG 繪製 14 個外部介接系統的 topology 關聯。中央為本系統「檢修漏管理系統」，外圍 14 系統呈放射狀。" },
      { selector: ".app-main", position: "left", rfp: "附錄一 四(九)~(十五)", title: "節點識別", body: "外圍節點為：CIS / GIS / SCADA / AMI / ERP / 1999 / EIP / AD / PCCES / PMIS / DM / BI / 氣象局 / Open Data。每節點下方標示協定（REST / WMTS / OPC-UA / MQTT / SOAP / OIDC / LDAP / ODBC 等）。" },
      { selector: ".app-main", position: "left", rfp: "D03", title: "顏色編碼", body: "白色 = 正常、橘色 = 降級、紅色 = 離線。連線顏色同步反映該系統健康度。" },
      { selector: ".page-header", position: "bottom", rfp: "附錄一 四(九)", title: "點節點查細節", body: "未來版本：點任一節點可看該系統的健康度歷史、延遲分布、最近錯誤 log、SLA 達成率。目前可從上方「14 系統清單」/「健康度監控」查詢。" },
    ],
  },
  "/integration/wmts": {
    title: "WMTS / WMS 圖層",
    body: "整合內政部 WMTS 底圖 + WMS 道路圖層 + 本系統管段與案件 markers。",
    tips: [
      "頂部勾選控制各圖層顯示 / 隱藏",
      "對應 RFP 附錄一 四(四)2",
    ],
  },
  "/integration/logs": {
    title: "介接同步記錄",
    body: "近期介接同步紀錄，含時間、系統、事件、狀態、延遲。",
    tips: [
      "降級 / 離線狀態會以對應色彩標示",
    ],
  },

  /* ============ 行動版 ============ */
  "/mobile": {
    title: "行動版（演示選擇）",
    body: "選擇要演示的角色行動版：檢漏員（外業檢漏）或修漏員（外業修復）。",
    tips: [
      "POC 用 React 元件模擬 React Native 風格，真實可操作",
      "對應 RFP 附錄一 二",
    ],
  },
  "/mobile/inspector": {
    title: "檢漏員行動版",
    body: "外業檢漏員手機 App，5 個分頁真實可操作。",
    steps: [
      { selector: ".page-header", position: "bottom", rfp: "附錄一 二(二)", title: "檢漏員行動版總覽", body: "POC 用 React 元件模擬 React Native 風格手機介面。PhoneFrame 內每個按鈕都可真實點擊。" },
      { selector: ".app-main", position: "left", rfp: "二(二)1", title: "今日任務（首頁）", body: "依距離排序的待處理案件。每張卡有「導航」（連 Google Maps）+「開始處理」兩個按鈕。緊急案件以紅色嚴重度條標示。" },
      { selector: ".app-main", position: "left", rfp: "二(二)2", title: "案件詳情 + GPS", body: "點「開始處理」進入案件詳情。系統自動定位 WGS84 (24.5500°N, 120.6500°E) + TWD97 (X=215000, Y=2715500) 雙坐標。" },
      { selector: ".app-main", position: "left", rfp: "二(二)3", title: "拍照 + 一鍵上傳", body: "「拍照」按鈕自動嵌入 GPS EXIF。最多 9 張照片。「一鍵送出」自動 dispatch SUBMIT_INSPECTION → 案件 status=待修 → 推通知給廠所 → 寫稽核日誌。" },
      { selector: ".app-main", position: "left", rfp: "二(二)5", title: "底部 5 Tab", body: "案件 / 地圖 / 拍照 / 日報 / 設定。地圖頁顯示我的任務 GIS 分佈，日報頁可一鍵產生今日工作日報。" },
    ],
  },
  "/mobile/repairer": {
    title: "修漏員行動版",
    body: "5 個分頁：派工 / 地圖 / 實修 / 統計 / 設定。",
    tips: [
      "派工任務自「待修」狀態的案件帶入",
      "實修登錄含：修復方法 / 挖填規格 / 漏水量 / 費用 / 監工照片",
      "「一鍵結案」自動回客服 + 寫稽核日誌",
      "對應 RFP 附錄一 二(三)",
    ],
  },

  /* ============ 報表 / 年報書 ============ */
  "/annual-report": {
    title: "年度成果報告書中心",
    body: "兩種版本：系統成果報告書（16 章 / 月季半年提交）+ 年度成果報告書（10 章 / 年度核發）。",
    tips: [
      "所有章節內容由系統自動從 cases / repairs / inspections 即時計算",
      "對應 RFP 附錄一 三(五) 2 + 3",
    ],
  },
  "/annual-report/16": {
    title: "16 章系統成果報告書",
    body: "區處主管月 / 季 / 半年提交給總處的報告書。",
    steps: [
      { selector: ".page-header", position: "bottom", rfp: "附錄一 三(五)2", title: "16 章系統成果報告書", body: "區處主管月 / 季 / 半年提交給總處。所有章節內容由系統自動從 cases / repairs / inspections 即時計算，不需手填。" },
      { selector: ".app-main", position: "left", rfp: "三(五)2", title: "左側：16 章清單", body: "1.執行摘要 2.區處概況 3.年度目標 4.案件統計 5.漏水原因 6.管網狀況 7.修漏成果 8.檢漏成果 9.工程預算 10.介接 11.資安 12.教育訓練 13.廠商 14.KPI 15.改善建議 16.附錄。已完成 13 / 16 章。" },
      { selector: ".app-main", position: "left", rfp: "三(五)2", title: "右側：章節內容預覽", body: "預設「預覽」模式顯示自動產生內容（A4 風格排版）。切「編輯」模式可手動修改。" },
      { selector: ".page-header", position: "bottom", rfp: "三(五)2", title: "一鍵匯出 ODF + 送總處", body: "頂部「一鍵匯出 ODF」下載 .odt 檔；「送總處核發」觸發審核流程；底部「上一章 / 下一章」可逐章瀏覽。" },
    ],
  },
  "/annual-report/10": {
    title: "10 章年度成果報告書",
    body: "區處主管年度提交、總處核發的精簡版本。年度執行摘要 / 整體績效 / 檢漏修漏統計 / 漏水率歷年比較 / 重大事件 / 教訓 / 明年計畫 / 附錄。",
    tips: [
      "對應 RFP 附錄一 三(五) 3",
    ],
  },

  /* ============ 資安合規 ============ */
  "/security": {
    title: "資安合規矩陣（12 構面 / 8 大類）",
    body: "資通系統防護基準（中級）。",
    steps: [
      { selector: ".page-header", position: "bottom", rfp: "附錄九", title: "資安合規矩陣總覽", body: "依國家資通安全研究院「資通系統防護基準」中級。8 大構面、127 控制措施、本系統實作率 93%。" },
      { selector: ".app-main", position: "left", rfp: "附錄九", title: "8 構面合規進度", body: "存取控制 / 識別鑑別 / 系統通訊保護 / 資訊完整性 / 營運持續（RPO/RTO）/ 配置管理（SDLC）/ 事件應變（日誌 12 月）/ 人員安全。每構面進度條即時顯示。" },
      { selector: ".app-main", position: "left", rfp: "附錄九", title: "細項查閱", body: "點構面名稱可進「存取控制細項」（28 項）等子頁，每個控制措施都列出實作狀態（✓/部份/不適用）。" },
      { selector: ".page-header", position: "bottom", rfp: "附錄九", title: "進階：SBOM + 第三方檢測 + ISMS", body: "上方按鈕進入更深層：SBOM 軟體物料清單（4 商用 + 12 開源 + CVE 監控）、第三方檢測（弱掃 + 滲透 + 源碼 12 大類）、ISMS 標準書（14 開發 + 15 委外 + 4 切結書）、稽核日誌（SHA-256 防竄改）、稽核發現追蹤（CAPA）。" },
    ],
  },
  "/security/access-control": {
    title: "存取控制（28 項）",
    body: "細分 4 大類：帳號管理（6 項）/ 最小權限（1 項）/ 遠端存取（5 項）/ 其他。所有項目均已實作。",
    tips: [
      "帳號管理涵蓋申請→開通→停用→刪除四階段",
      "閒置帳號半年未登入自動禁用",
      "Session 30 分鐘逾時自動登出",
    ],
  },
  "/security/sbom": {
    title: "SBOM 軟體物料清單",
    body: "4 個商用軟體 + 12 個開源軟體的版本、授權、CVE 監控狀態。",
    tips: [
      "整合 NICS SBOM 工具",
      "CVE 監控自動偵測高風險套件",
      "jQuery 目前列為監控中（無高風險 CVE）",
    ],
  },
  "/security/vapt": {
    title: "第三方資安檢測",
    body: "弱點掃描 + 滲透測試 + 源碼掃描 三項皆通過。下方矩陣為滲透測試 12 大類檢核結果。",
    tips: [
      "OWASP Top10 覆蓋率 100%",
      "所有 12 大類（含 Ajax / Web Service 等）均通過",
    ],
  },
  "/security/isms": {
    title: "ISMS 標準書遵循",
    body: "14 開發-03-010 + 15 委外-03-009 兩本 ISMS 標準書 + 4 種切結書管理。",
    tips: [
      "切結書含：委外廠商 / 員工同意書 / 資訊處理 / 資料銷毀",
      "員工同意書 5 / 5 已簽",
    ],
  },
  "/security/audit-log": {
    title: "稽核日誌",
    body: "保存 12 個月 + SHA-256 防竄改。可依事件類型（登入 / 建案 / 派工 / 上傳 / 結案）過濾。",
    tips: [
      "每筆日誌含時間、使用者、事件、對象、IP、Hash",
      "對應附錄九 事件應變構面",
    ],
  },
  "/security/finding": {
    title: "稽核發現追蹤（CAPA）",
    body: "Corrective and Preventive Actions。列出所有稽核發現項目，含負責人、嚴重度、完成日期。",
    tips: [
      "已改善 / 進行中 / 待處理 三種狀態",
      "內外稽核員皆可查閱（唯讀）",
    ],
  },

  /* ============ 專案管理 ============ */
  "/project": {
    title: "專案管理儀表板",
    body: "履約 28 個月、5 階段驗收。本頁為總覽，下方有付款 / 罰則 / 文件 三個常用區塊。",
    tips: [
      "上方 5 階段甘特圖顯示專案進度（含「今日」紅虛線）",
      "對應 RFP 附錄六 + 伍管理 / 陸驗收 / 柒付款 / 捌罰則",
    ],
  },
  "/project/gantt": {
    title: "5 階段甘特圖",
    body: "M1 需求分析 → M2 系統設計 → M3 雛型/UAT → M4 上線部署 → M5 教育訓練/結案。",
    tips: [
      "今日紅虛線顯示當前進度",
      "綠色 = 已完成、淺藍 = 進行中、灰色 = 待開始",
    ],
  },
  "/project/payment": {
    title: "付款進度",
    body: "5 期付款 + 2 期維護款。階段一 50% / 階段二 40% / 教育訓練 10%。",
    tips: [
      "對應 RFP 柒付款",
    ],
  },
  "/project/team": {
    title: "專案團隊（10 人）",
    body: "藥提醒科技 10 位專案成員：PM、SA、技術主管、資安顧問、前後端工程師、DBA、QA。",
    tips: [
      "對應 RFP 附錄六 三",
    ],
  },
  "/project/training": {
    title: "教育訓練（8 場 / 264 人次）",
    body: "涵蓋 9 類角色：系統管理員、區處主管、廠所人員、檢漏員、修漏員、客服、DBA、資安、稽核員。",
    tips: [
      "對應 RFP 附錄四 教育訓練需求",
    ],
  },
  "/project/penalty": {
    title: "罰則對照表",
    body: "依 RFP 附錄捌：一般違反 0.1%/日、合計 ≥20% 終止契約、惡意程式 5%、資安改善逾期等。",
    tips: [
      "對應 RFP 附錄捌",
    ],
  },
  "/project/documents": {
    title: "文件中心（14 種交付文件）",
    body: "依階段分：階段一交付 + 階段二交付 + 持續交付。含切結書 + 附錄表單。",
    tips: [
      "對應 RFP 附錄六 二",
    ],
  },
  "/project/traceability": {
    title: "需求追溯矩陣（RFP → 功能 → 測試案例）",
    body: "RFP 逐條對應功能與測試案例。Demo 列出 8 條重要追溯。",
    tips: [
      "如附錄一三(三)2 → 功能 B10 → 測試案例 TC-B10-001",
    ],
  },
  "/project/code-counter": {
    title: "程式支數計算機",
    body: "複雜度判定 + 修改幅度。5% / 15% 維護門檻檢核。",
    tips: [
      "高 ≥2500 行 = 1.5 支、中 1300-2500 = 1.2 支、低 < 1300 = 1.0 支",
      "現行維護 3.2% / 5% 上限",
    ],
  },
};
