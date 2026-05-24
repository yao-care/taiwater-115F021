# 05 — 中央 Store 設計（連動的核心）

## State 結構

```js
const initialState = {
  // 認證
  currentUser: null,
  currentRegion: '第四區',
  authMode: 'demo',  // 'demo' | 'real'

  // 業務資料（核心，跨角色共用）
  users: [...11 個使用者 + 30 個檢漏/修漏員],
  cases: [...50 個案件，含 status timeline],
  dispatches: [...派工紀錄],
  inspections: [...檢漏實作紀錄],
  repairs: [...修漏實作紀錄，含挖填/費用/監工],
  pipes: [...200+ 管段，含管齡/材質/風險評分],

  // 系統資料
  notifications: [...通知，含未讀標記],
  auditLogs: [...操作日誌，含 SHA-256],
  integrations: [...14 個介接系統健康度],
  documents: [...交付文件清單與版本],

  // 專案管理
  milestones: [...5 階段驗收],
  team: [...專案團隊名單],
  trainings: [...教育訓練場次],
};
```

## 連動範例（這是 POC 最重要的差異化）

### 範例 1：客服 → 廠所 → 檢漏員（跨 3 角色即時連動）

1. **客服「蔡美玲」**在客服頁按「+ 新案件」→ 自動帶民眾通報資訊 → 一鍵成立案件
2. → store.cases 多 1 筆 → store.notifications 推給「中港廠所」
3. → 廠所「賴伯毅」dashboard 紅點 +1，派工列表立即多 1 筆
4. 廠所按「派工 →王志強」（一鍵）→ store.dispatches 多 1 筆 → 通知檢漏員
5. → 檢漏員「王志強」行動版任務清單立即多 1 筆 → push notification
6. 檢漏員到現場按「拍照 + 上傳」（一鍵）→ store.inspections 更新 → 區處主管 dashboard KPI 即時 +1

### 範例 2：年度報告書（連動成果計算）

- 廠所結案 → store.repairs 更新 → 區處月報自動重算 → 總處年報 KPI 即時連動

## 一鍵化操作（原則 3 的具體實作）

| 動作 | 一鍵展示行為（不需填表）|
|------|------------------------|
| 客服「新案件」 | 自動帶民眾資訊 / GPS / 推派廠所 |
| 廠所「派工」 | 自動帶最近檢漏員 / 自動排程 / 自動通知 |
| 檢漏員「上傳」 | 自動帶 GPS / 自動連結案件 / 自動通知廠所 |
| 修漏員「結案」 | 自動算漏水量 / 自動算費用 / 自動回客服 |
| 區處主管「核准年報」 | 自動產生 16 章內容 / 自動匯出 ODF |

## localStorage 持久化

- 所有 state 寫入 `localStorage['shuili_poc_state']`
- 重新整理頁面不丟資料
- `⚙ 重置示範` 按鈕清空後重新初始化

## React Context 範例

```jsx
const StoreContext = React.createContext();

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, loadFromStorage() || initialState);
  useEffect(() => saveToStorage(state), [state]);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

// 任一頁面
const { state, dispatch } = useContext(StoreContext);
// → 修改 state 後所有訂閱的元件自動 re-render
```
