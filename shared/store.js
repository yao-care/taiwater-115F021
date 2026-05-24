/* ============================================================
   shared/store.js — 中央 Store
   原則 2：React Context + useReducer + localStorage
   任一處 dispatch，所有訂閱元件自動 re-render
   ============================================================ */

window.SP = window.SP || {};

SP.STORAGE_KEY = "shuili_poc_state_v3";
SP.STORAGE_VERSION = 3;

/* ---------- uid helper ---------- */
SP.uid = function (prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
};

SP.nowIso = function () {
  return new Date().toISOString();
};

SP.StoreContext = React.createContext(null);

/* ---------- 從 localStorage 載入 ---------- */
SP.loadFromStorage = function () {
  try {
    const raw = localStorage.getItem(SP.STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.__version !== SP.STORAGE_VERSION) return null;
    // toasts / modal 不持久化，反序列化後補回
    return { ...parsed, toasts: [], modal: null };
  } catch (e) {
    console.warn("[Store] load failed:", e);
    return null;
  }
};

SP.saveToStorage = function (state) {
  try {
    localStorage.setItem(
      SP.STORAGE_KEY,
      JSON.stringify({ ...state, __version: SP.STORAGE_VERSION })
    );
  } catch (e) {
    console.warn("[Store] save failed:", e);
  }
};

SP.clearStorage = function () {
  try { localStorage.removeItem(SP.STORAGE_KEY); } catch (e) {}
};

/* ---------- 初始 state ---------- */
SP.buildInitialState = function () {
  // 由 mock-data.js 提供業務資料
  const mock = (SP.generateMockData && SP.generateMockData()) || {};
  return {
    // 認證
    currentUser: null,
    currentRegion: "第四區",
    authMode: "demo",     // 'demo' | 'real'

    // 業務資料
    users:        mock.users        || [],
    cases:        mock.cases        || [],
    dispatches:   mock.dispatches   || [],
    inspections:  mock.inspections  || [],
    repairs:      mock.repairs      || [],
    pipes:        mock.pipes        || [],

    // 系統資料
    notifications: mock.notifications || [],
    auditLogs:     mock.auditLogs     || [],
    integrations:  mock.integrations  || [],
    documents:     mock.documents     || [],
    vendors:       mock.vendors       || [],

    // 專案管理
    milestones:    mock.milestones    || [],
    team:          mock.team          || [],
    trainings:     mock.trainings     || [],

    // 階段 2 補強（dashboard 用衍生資料）
    loginLogs:        mock.loginLogs        || [],
    kpiSnapshots:     mock.kpiSnapshots     || [],
    regionRanking:    mock.regionRanking    || [],
    accountRequests:  mock.accountRequests  || [],
    plantPerformance: mock.plantPerformance || [],
    monthlyReports:   mock.monthlyReports   || [],
    dbHealth:         mock.dbHealth         || null,
    annualPlan:       mock.annualPlan       || null,
    onlineUsers:      mock.onlineUsers      || null,
    csMetrics:        mock.csMetrics        || null,

    // UI 暫態（不持久化也可）
    toasts: [],
    modal: null,
  };
};

/* ---------- reducer ---------- */
SP.reducer = function (state, action) {
  switch (action.type) {

    /* ---- 認證 ---- */
    case "LOGIN":
      return { ...state, currentUser: action.payload, authMode: action.authMode || "demo" };
    case "LOGOUT":
      return { ...state, currentUser: null };
    case "SET_REGION":
      return { ...state, currentRegion: action.payload };
    case "SWITCH_ROLE":
      return { ...state, currentUser: action.payload };

    /* ---- 案件 ---- */
    case "ADD_CASE":
      return { ...state, cases: [action.payload, ...state.cases] };
    case "UPDATE_CASE":
      return {
        ...state,
        cases: state.cases.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c
        ),
      };
    case "DELETE_CASE":
      return { ...state, cases: state.cases.filter(c => c.id !== action.payload) };

    /* ---- 派工/檢漏/修漏 ---- */
    case "ADD_DISPATCH":
      return { ...state, dispatches: [action.payload, ...state.dispatches] };
    case "ADD_INSPECTION":
      return { ...state, inspections: [action.payload, ...state.inspections] };
    case "ADD_REPAIR":
      return { ...state, repairs: [action.payload, ...state.repairs] };

    /* ---- 通知 ---- */
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map(n =>
          action.recipient ? (n.recipient === action.recipient ? { ...n, read: true } : n) : { ...n, read: true }
        ),
      };

    /* ---- 稽核日誌 ---- */
    case "LOG_AUDIT":
      return { ...state, auditLogs: [action.payload, ...state.auditLogs].slice(0, 500) };

    /* ---- Toast（暫態） ---- */
    case "PUSH_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    /* ---- Modal ---- */
    case "OPEN_MODAL":
      return { ...state, modal: action.payload };
    case "CLOSE_MODAL":
      return { ...state, modal: null };

    /* ---- 重置示範 ---- */
    case "RESET_DEMO":
      SP.clearStorage();
      return SP.buildInitialState();

    /* ---- 一般合併 ---- */
    case "MERGE":
      return { ...state, ...action.payload };

    /* ============================================================
       流程 A 跨角色連動 actions
       ============================================================ */

    /* ---- 客服建立案件 → 自動推派廠所 + 通知 ---- */
    case "CREATE_CASE_FROM_CS": {
      const p = action.payload;
      const caseNo = "115-" + String(state.cases.length + 1).padStart(4, "0");
      const id = SP.uid("C");
      const now = SP.nowIso();
      // 找出對應廠所主管
      const plantUser = state.users.find(u => u.role === "plant" && u.region === p.region);
      const newCase = {
        id, caseNo,
        title: p.title || "新案件待補",
        region: p.region,
        plant: p.plant || plantUser?.plant || "—",
        district: p.district || "—",
        address: p.address || p.title,
        lng: p.lng || 120.65,
        lat: p.lat || 24.15,
        severity: p.severity || "high",
        status: "申報",
        source: "1910 客服",
        reporter: p.reporter || "民眾",
        reporterPhone: p.reporterPhone || "—",
        assignedTo: null,
        createdAt: now,
        updatedAt: now,
        estimatedLoss: p.estimatedLoss || 100,
        photos: [],
        timeline: [
          { at: now, by: p.byUserId || "U007", action: "案件建立", note: "客服 " + (p.byName || "蔡美玲") + " 從 1910 受理：" + (p.reason || p.title) },
        ],
        rfp: "附錄一 四(三)",
      };
      const notification = plantUser ? {
        id: SP.uid("N"),
        recipient: plantUser.id,
        from: p.byUserId || "U007",
        kind: "new_case",
        title: "新案件待派工",
        body: "客服建立案件 " + caseNo + " ・ " + newCase.title,
        at: now,
        read: false,
        caseId: id,
      } : null;
      const audit = {
        id: SP.uid("L"),
        userId: p.byUserId || "U007",
        action: "CREATE_CASE",
        target: id,
        ip: "10.10.5.1",
        ua: "POC Demo",
        at: now,
        hash: "sha256:demo" + Date.now().toString(36),
      };
      return {
        ...state,
        cases: [newCase, ...state.cases],
        notifications: notification ? [notification, ...state.notifications] : state.notifications,
        auditLogs: [audit, ...state.auditLogs].slice(0, 500),
      };
    }

    /* ---- 廠所派工給檢漏員 ---- */
    case "DISPATCH_TO_INSPECTOR": {
      const p = action.payload;
      const now = SP.nowIso();
      const c = state.cases.find(x => x.id === p.caseId);
      if (!c) return state;
      const inspector = state.users.find(u => u.id === p.inspectorId);
      const fromUser = state.users.find(u => u.id === p.fromUserId);
      const dispatchRec = {
        id: SP.uid("DI"),
        caseId: p.caseId,
        from: p.fromUserId,
        to:   p.inspectorId,
        at: now,
        note: p.note || "派工檢漏",
        kind: "inspect",
      };
      const updatedCase = {
        ...c,
        status: "派工",
        assignedTo: p.inspectorId,
        updatedAt: now,
        timeline: [
          ...(c.timeline || []),
          { at: now, by: p.fromUserId, action: "派工", note: "派檢漏員 " + (inspector?.name || p.inspectorId) },
        ],
      };
      const notification = {
        id: SP.uid("N"),
        recipient: p.inspectorId,
        from: p.fromUserId,
        kind: "dispatched",
        title: "你被派工到案件 " + c.caseNo,
        body: c.title + " ・ " + (fromUser?.name || "廠所") + " 指派",
        at: now,
        read: false,
        caseId: p.caseId,
      };
      const audit = {
        id: SP.uid("L"),
        userId: p.fromUserId,
        action: "DISPATCH",
        target: p.caseId,
        ip: "10.10.4.1",
        ua: "POC Demo",
        at: now,
        hash: "sha256:demo" + Date.now().toString(36),
      };
      return {
        ...state,
        cases: state.cases.map(x => x.id === p.caseId ? updatedCase : x),
        dispatches: [dispatchRec, ...state.dispatches],
        notifications: [notification, ...state.notifications],
        auditLogs: [audit, ...state.auditLogs].slice(0, 500),
      };
    }

    /* ---- 檢漏員上傳檢漏結果 ---- */
    case "SUBMIT_INSPECTION": {
      const p = action.payload;
      const now = SP.nowIso();
      const c = state.cases.find(x => x.id === p.caseId);
      if (!c) return state;
      const inspector = state.users.find(u => u.id === p.inspectorId);
      const plantUser = state.users.find(u => u.role === "plant" && u.region === c.region);
      const inspectionRec = {
        id: SP.uid("IN"),
        caseId: p.caseId,
        by: p.inspectorId,
        at: now,
        method: p.method || "聲學",
        confirmed: true,
        gps: p.gps || [c.lng, c.lat],
        photos: p.photos || [],
        note: p.note || "現場確認漏水",
      };
      const updatedCase = {
        ...c,
        status: "待修",
        updatedAt: now,
        photos: [...(c.photos || []), ...(p.photos || [])],
        timeline: [
          ...(c.timeline || []),
          { at: now, by: p.inspectorId, action: "檢漏完成", note: (inspector?.name || "檢漏員") + " 現場拍照 " + (p.photos?.length || 0) + " 張，確認漏水" },
        ],
      };
      const notification = plantUser ? {
        id: SP.uid("N"),
        recipient: plantUser.id,
        from: p.inspectorId,
        kind: "dispatched",
        title: "案件 " + c.caseNo + " 檢漏完成，待派修",
        body: (inspector?.name || "檢漏員") + " 已上傳現場資料",
        at: now,
        read: false,
        caseId: p.caseId,
      } : null;
      const audit = {
        id: SP.uid("L"),
        userId: p.inspectorId,
        action: "UPLOAD_PHOTO",
        target: p.caseId,
        ip: "10.10.4.52",
        ua: "POC Mobile",
        at: now,
        hash: "sha256:demo" + Date.now().toString(36),
      };
      return {
        ...state,
        cases: state.cases.map(x => x.id === p.caseId ? updatedCase : x),
        inspections: [inspectionRec, ...state.inspections],
        notifications: notification ? [notification, ...state.notifications] : state.notifications,
        auditLogs: [audit, ...state.auditLogs].slice(0, 500),
      };
    }

    /* ---- 廠所派修漏員 ---- */
    case "DISPATCH_TO_REPAIRER": {
      const p = action.payload;
      const now = SP.nowIso();
      const c = state.cases.find(x => x.id === p.caseId);
      if (!c) return state;
      const repairer = state.users.find(u => u.id === p.repairerId);
      const dispatchRec = {
        id: SP.uid("DI"),
        caseId: p.caseId,
        from: p.fromUserId,
        to:   p.repairerId,
        at: now,
        note: p.note || "派工修漏",
        kind: "repair",
      };
      const updatedCase = {
        ...c,
        status: "修復中",
        updatedAt: now,
        timeline: [
          ...(c.timeline || []),
          { at: now, by: p.fromUserId, action: "派修漏員", note: "派修漏員 " + (repairer?.name || p.repairerId) },
        ],
      };
      const notification = {
        id: SP.uid("N"),
        recipient: p.repairerId,
        from: p.fromUserId,
        kind: "dispatched",
        title: "修漏任務：" + c.caseNo,
        body: c.title + " ・ 已完成檢漏，請前往修復",
        at: now,
        read: false,
        caseId: p.caseId,
      };
      const audit = {
        id: SP.uid("L"),
        userId: p.fromUserId,
        action: "DISPATCH",
        target: p.caseId,
        ip: "10.10.4.1",
        ua: "POC Demo",
        at: now,
        hash: "sha256:demo" + Date.now().toString(36),
      };
      return {
        ...state,
        cases: state.cases.map(x => x.id === p.caseId ? updatedCase : x),
        dispatches: [dispatchRec, ...state.dispatches],
        notifications: [notification, ...state.notifications],
        auditLogs: [audit, ...state.auditLogs].slice(0, 500),
      };
    }

    /* ---- 修漏員結案 ---- */
    case "SUBMIT_REPAIR": {
      const p = action.payload;
      const now = SP.nowIso();
      const c = state.cases.find(x => x.id === p.caseId);
      if (!c) return state;
      const repairer = state.users.find(u => u.id === p.repairerId);
      const csUser = state.users.find(u => u.role === "cs");
      const repairRec = {
        id: SP.uid("RE"),
        caseId: p.caseId,
        by: p.repairerId,
        at: now,
        method: p.method || "管材更新",
        excavation: p.excavation || "0.8m×1.5m",
        cost: p.cost || 20000,
        supervisor: p.supervisor || null,
        photos: p.photos || [],
        note: p.note || "已修復完成",
      };
      const updatedCase = {
        ...c,
        status: "結案",
        updatedAt: now,
        timeline: [
          ...(c.timeline || []),
          { at: now, by: p.repairerId, action: "結案", note: (repairer?.name || "修漏員") + " 已修復，費用 " + (p.cost || 20000).toLocaleString() + " 元" },
        ],
      };
      const notification = csUser ? {
        id: SP.uid("N"),
        recipient: csUser.id,
        from: p.repairerId,
        kind: "kpi",
        title: "案件 " + c.caseNo + " 已結案",
        body: c.title + " ・ 請知會通報民眾",
        at: now,
        read: false,
        caseId: p.caseId,
      } : null;
      const audit = {
        id: SP.uid("L"),
        userId: p.repairerId,
        action: "REPAIR_DONE",
        target: p.caseId,
        ip: "10.10.4.52",
        ua: "POC Mobile",
        at: now,
        hash: "sha256:demo" + Date.now().toString(36),
      };
      return {
        ...state,
        cases: state.cases.map(x => x.id === p.caseId ? updatedCase : x),
        repairs: [repairRec, ...state.repairs],
        notifications: notification ? [notification, ...state.notifications] : state.notifications,
        auditLogs: [audit, ...state.auditLogs].slice(0, 500),
      };
    }

    default:
      return state;
  }
};

/* ---------- StoreProvider ---------- */
SP.StoreProvider = function StoreProvider({ children }) {
  const [state, dispatch] = React.useReducer(
    SP.reducer,
    null,
    () => SP.loadFromStorage() || SP.buildInitialState()
  );

  // 持久化（toasts/modal 屬於 UI 暫態，過濾掉）
  React.useEffect(() => {
    const { toasts, modal, ...persistable } = state;
    SP.saveToStorage(persistable);
  }, [state]);

  const value = React.useMemo(() => ({ state, dispatch }), [state]);

  return React.createElement(SP.StoreContext.Provider, { value }, children);
};

/* ---------- hook ---------- */
SP.useStore = function () {
  const ctx = React.useContext(SP.StoreContext);
  if (!ctx) throw new Error("useStore 必須在 StoreProvider 內使用");
  return ctx;
};

/* ---------- toast helper ---------- */
SP.useToast = function () {
  const { dispatch } = SP.useStore();
  return React.useCallback((toast) => {
    const id = "t-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    dispatch({
      type: "PUSH_TOAST",
      payload: { id, kind: "info", duration: 3500, ...toast },
    });
    setTimeout(() => dispatch({ type: "DISMISS_TOAST", payload: id }), toast.duration || 3500);
  }, [dispatch]);
};

/* ---------- 衍生 selector（讀資料的便利函式） ---------- */
SP.selectors = {
  caseById: (state, id) => state.cases.find(c => c.id === id),
  userById: (state, id) => state.users.find(u => u.id === id),
  casesByRegion: (state, region) => state.cases.filter(c => c.region === region),
  unreadFor: (state, userId) =>
    state.notifications.filter(n => n.recipient === userId && !n.read),
  kpisByRegion: (state, region) => {
    const cs = state.cases.filter(c => !region || c.region === region);
    return {
      total: cs.length,
      open: cs.filter(c => c.status !== "結案").length,
      critical: cs.filter(c => c.severity === "critical").length,
      closedThisMonth: cs.filter(c => c.status === "結案").length,
    };
  },
};
