# 台灣自來水公司 — 檢修漏管理資訊系統改版整合案 POC

**案號**：115F021
**機關**：台灣自來水股份有限公司（總管理處資訊處）
**承辦**：賴伯毅　(04)22244191 #804　jui8751093@mail.water.gov.tw
**徵求期**：2026-05-22 ~ 2026-05-29

**製作**：藥提醒科技有限公司
**用途**：公開徵求 POC 沙盒 — 承辦可從任一角色 / 任一流程切入，即時操作完整系統

---

## 🚀 線上體驗

直接打開 https://yao-care.github.io/taiwater-115F021/

無需登入、無需安裝。所有資料模擬，可在瀏覽器內完整操作。

---

## 🎯 5 條核心原則

1. **10 帳號下拉直達**：點選帳號即進對應角色儀表板，不需密碼（演示模式）。真實演示模式才會走 AD + 雙因素。
2. **元件連動修改**：React Context + useReducer + localStorage。任一角色操作（建案 / 派工 / 上傳 / 結案）會即時反映在其他角色畫面。
3. **日常工作即完成**：所有關鍵動作一鍵化（派工 / 結案 / 上傳自動帶 GPS / 推派廠所 / 通知）。
4. **字體最小 18px**：符合 design-tokens 規範，老花用戶友善。
5. **oklch 配色**：全 `oklch()`，hex 僅作 `@supports not` fallback。台水深藍 `oklch(0.34 0.08 250)` (#003366)。

---

## 👥 11 個角色儀表板

| # | 角色 | 範例帳號 | 主場景 |
|---|------|---------|--------|
| 1 | 系統管理員 | 李宗翰 | 介接健康度 + 待審帳號 + 操作日誌 |
| 2 | 總處管理員 | 周明德 | 全國 KPI + 13 區處排名 + 年度計畫 |
| 3 | 區處主管 | 陳大華（第四區）| 廠所績效 + 月報審核 + 年度報告書 |
| 4 | 廠所人員 | 賴伯毅（中港廠所）| 派工看板 + PCCES + 廠商管理 |
| 5 | 檢漏員 | 王志強 | **行動版**：今日任務 / 拍照 / 一鍵上傳 |
| 6 | 修漏員 | 林文雄 | **行動版**：派工 / 實修登錄 / 一鍵結案 |
| 7 | 客服人員 | 蔡美玲 | 1910 來電紀錄 + 一鍵新案件 |
| 8 | DBA | 周大維 | DB 效能 + 備份 + 慢查詢 + SSRS |
| 9 | 資安人員 | 何雅婷 | 12 構面合規率 + SBOM + 第三方檢測 |
| 10 | 內部稽核員 | 吳明憲 | 唯讀 + 稽核發現追蹤 |
| 11 | 外部稽核員 | 鄭立群（ISO 27001 LA）| 唯讀 + 匯出 ISO 27001 報告 |

---

## 🎬 演示流程 A：案件生命週期跨角色

打開首頁後可開兩個分頁（一個客服 / 一個廠所）平行觀察：

1. **客服 蔡美玲** 進入儀表板，按「+ 新案件（一鍵）」 → 自動帶民眾資訊 / GPS / 推派廠所 → 通知中港廠所
2. **廠所 賴伯毅** 儀表板紅點 +1 → 進「派工看板」 → 點「派檢漏員」 → 通知檢漏員王志強
3. **檢漏員 王志強** 行動版任務 +1 → 點「開始處理」 → 自動帶 GPS（WGS84 + TWD97）→ 「拍照」3 張 → 「一鍵送出」 → 廠所收到「待派修」通知
4. **廠所** 看板 0053 移到「待修」欄位 → 點「派修漏員」 → 通知修漏員林文雄
5. **修漏員 林文雄** 行動版 → 「實修登錄」 → 填挖填 / 漏水量 / 費用 → 「一鍵結案」 → 自動回客服 + 寫稽核日誌
6. **任一角色** 進「角色儀表板 → 案件即時追蹤」可看到 0053 完整 timeline 跨 4 角色

---

## 🧩 6 條其他演示流程

- **流程 B**：行動版檢漏員一日（純行動版 5 頁可玩）
- **流程 C**：廠所派工管理（看板 + 派工紀錄）
- **流程 D**：年度成果報告書（16 章自動從 store 計算 → 一鍵匯出 ODF）
- **流程 E**：PCCES 工程預算書 5 步驟精靈（XML 4.3 + 編碼正確率 ≥ 40% 自動檢核）
- **流程 F**：資安合規檢核（12 構面 + SBOM + 弱掃 / 滲透 + ISMS + 稽核日誌 + 內外稽核唯讀視角）
- **流程 G**：介接管理（14 系統健康度 + 節點關聯架構圖 + WMTS / WMS 圖層）

---

## 📋 RFP 對應

完整對應 RFP 附錄一功能規範書 126 葉子，所有 nav 項目都可點開看到對應頁面 + RFP 章節追溯標籤。詳見 [sitemap.md](sitemap.md)。

設計文件（從原則 / 角色 / 登入 / 佈局 / Store 到 6 階段開發計畫）詳見 [設計/](設計/)。

---

## 🔧 技術骨架

- **單一前端** ・ 無後端依賴 ・ 所有資料模擬嵌入 JavaScript
- React 18 + React Router v6（HashRouter）+ D3 v7 + Babel Standalone（CDN）
- design-tokens：oklch 配色 + 18px 字級 + 台水深藍
- Context + useReducer + localStorage 持久化（重新整理不丟資料）
- 5 大 shared module：components / charts / maps / mobile-kit / business-widgets
- 10 個 subsystem module：login / dashboard / inspection / repair / pcces / integration / mobile / annual-report / security / project
- 共約 11,000 行程式碼

---

## 📁 檔案結構

```
.
├── index.html               主入口 + CDN + Router
├── shared/
│   ├── tokens.css          oklch + 18px 字級
│   ├── layout.css          版面骨架 + 卡片 + 表格 + 對話框 + 浮動訊息
│   ├── store.js            Context + useReducer + localStorage + 7 reducer actions
│   ├── mock-data.js        41 員工 / 53 案件 / 200 管段 / 14 介接 / 20 廠商
│   ├── components.js       17 個基礎 UI 元件
│   ├── charts.js           D3：直條 / 排名 / 折線 / 圓餅 / 甘特 / 微縮折線 / 熱區 / 進度
│   ├── maps.js             GisMap（台灣輪廓 + 13 區處 + WMTS/WMS toggle）
│   ├── mobile-kit.js       PhoneFrame / StatusBar / AppBar / TabBar / PhotoGrid / Coordinate
│   ├── business-widgets.js CaseCard / CaseTimeline / DispatchBoard / IntegrationStatus 等
│   ├── layout.js           上方列 + 側邊導覽（10 子系統 + 角色動態過濾）
│   └── home.js             系統首頁（KPI + 最新案件 + 通知 + 介接狀態）
├── subsystems/
│   ├── login.js            11 帳號直達 + 真實演示模式
│   ├── dashboard.js        11 角色 子儀表板 + 案件即時追蹤
│   ├── inspection.js       檢漏子系統 B（首頁 + 案件處理單 + 進階作業 + 年度作業 + 報表 + 規定 + 管理）
│   ├── repair.js           修漏子系統 C（首頁 + 派工看板 + 案件詳情 + 申報 + 記錄 + 統計 + 報表 + 管理）
│   ├── pcces.js            工程預算書 + PCCES XML 4.3 精靈
│   ├── integration.js      14 系統清單 + 健康度 + 架構圖 + 圖層 + 同步記錄
│   ├── mobile.js           檢漏員 + 修漏員行動版（各 5 頁 + 真實可操作）
│   ├── annual-report.js    16 章自動產生 + 10 章年度版 + ODF 匯出
│   ├── security.js         12 構面 + 存取控制 + SBOM + 第三方檢測 + ISMS + 稽核
│   └── project.js          5 階段 Gantt + 付款 + 團隊 + 訓練 + 罰則 + 文件 + 需求追溯 + 程式支數
├── 設計/                    12 份系統設計文件 + 1 份系統全圖
└── sitemap.md               126 葉子完整 RFP 對照表
```

---

## ⚖️ 授權

POC 沙盒，僅供台水公開徵求 115F021 評估使用。商業實作合約後另議。

聯絡：藥提醒科技有限公司 ・ service@yao.care
