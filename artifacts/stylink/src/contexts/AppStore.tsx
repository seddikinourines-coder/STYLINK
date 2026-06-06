import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PROJECT_STAGE_DEFS,
  blockingStageTitle,
  defaultProjectStages,
  getDesignerById,
  mockNotifications,
  mockOpportunities,
  mockOrders,
  mockRequests,
  orderStages,
  type B2BOrder,
  type B2BRequest,
  type NotificationItem,
  type Opportunity,
  type OrderStage,
  type Project,
  type ProjectStageKey,
  type ProjectStageStatus,
  type RequestStatus,
} from "@/data/mockData";

export type AccountType = "client" | "business";
export type BusinessRole =
  | "boutique"
  | "designer"
  | "atelier"
  | "fabric-retailer";

export interface ClientUser {
  type: "client";
  name: string;
  email: string;
  city?: string;
  bio?: string;
  avatar?: string;
  dbId?: number;
}

export interface BusinessUser {
  type: "business";
  role: BusinessRole;
  brandName: string;
  contactName: string;
  email: string;
  city?: string;
  bio?: string;
  avatar?: string;
  dbId?: number;
}

export type User = ClientUser | BusinessUser;

export type FavoriteCategory =
  | "wishlist"
  | "boutiques"
  | "designers"
  | "ateliers"
  | "fabric-retailers";

export interface CartItem {
  productId: string;
  qty: number;
}

interface AppState {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
  updateUser: (patch: Partial<ClientUser> | Partial<BusinessUser>) => void;

  favorites: Record<FavoriteCategory, string[]>;
  toggleFavorite: (category: FavoriteCategory, id: string) => void;
  isFavorite: (category: FavoriteCategory, id: string) => boolean;

  cart: CartItem[];
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;

  // B2B
  orders: B2BOrder[];
  requests: B2BRequest[];
  createOrder: (
    o: Omit<B2BOrder, "id" | "reference" | "createdAt" | "stage" | "history">,
  ) => B2BOrder;
  advanceOrderStage: (orderId: string, note?: string) => void;
  setOrderStage: (
    orderId: string,
    stage: OrderStage,
    note?: string,
  ) => void;
  setRequestStatus: (requestId: string, status: RequestStatus) => void;

  // Opportunity feed
  opportunities: Opportunity[];
  shortlist: string[];
  /** Stable id of the signed-in business user, or null if not signed in as business */
  currentBusinessId: string | null;
  createOpportunity: (
    o: Omit<Opportunity, "id" | "createdAt" | "status" | "authorId" | "authorRole">,
  ) => Opportunity | null;
  closeOpportunity: (opportunityId: string) => boolean;
  toggleShortlist: (opportunityId: string) => void;
  isShortlisted: (opportunityId: string) => boolean;
  connectOpportunity: (opportunityId: string, message: string) => B2BRequest | null;
  /** Invite a designer to one of the current user's open opportunities (projects). */
  inviteToProject: (
    designerId: string,
    opportunityId: string,
    message: string,
  ) => B2BRequest | null;
  /**
   * Invite a designer to join one of the current user's projects (chat-converted
   * Project records). Pushes a `project-invite` notification with Accept/Decline
   * actions into the bell. Returns the notification id, or null if not allowed.
   */
  inviteToProjectMembership: (
    projectId: string,
    designerId: string,
    message: string,
  ) => string | null;
  /** Accept a pending project-invite notification: adds invitee to participants
   *  and marks the notification as accepted. */
  acceptProjectInvite: (notificationId: string) => boolean;
  /** Decline a pending project-invite notification: removes it from the bell. */
  declineProjectInvite: (notificationId: string) => boolean;

  // Network connections (in-memory, mock)
  connections: string[];
  pendingConnections: string[];
  addPendingConnection: (designerId: string) => void;
  toggleConnection: (designerId: string) => void;
  /**
   * Atomic toggle that reports whether the designer was newly connected (true)
   * or was already connected and got removed (false). Use this when the caller
   * needs to dispatch a side effect (toast / notification) only on the actual
   * transition — avoids double-fires from rapid clicks.
   */
  requestConnectionToggle: (designerId: string) => boolean;
  isConnected: (designerId: string) => boolean;

  // Notifications (in-app feed shown in B2BShell bell)
  notifications: NotificationItem[];
  pushNotification: (
    n: Omit<NotificationItem, "id" | "timestamp" | "unread"> &
      Partial<Pick<NotificationItem, "timestamp" | "unread">>,
  ) => void;
  markAllNotificationsRead: () => void;
  acceptConnectRequest: (notificationId: string) => boolean;
  declineConnectRequest: (notificationId: string) => boolean;

  // Opportunity applications
  /** Map of opportunityId → applicant business IDs (most recent first). */
  applications: Record<string, string[]>;
  applyToOpportunity: (
    opportunityId: string,
    message?: string,
  ) => B2BRequest | null;
  hasApplied: (opportunityId: string) => boolean;
  getApplicantIds: (opportunityId: string) => string[];
  acceptApplication: (notificationId: string) => boolean;
  declineApplication: (notificationId: string) => boolean;
  hasApplicationAccepted: (opportunityId: string) => boolean;

  // Projects (created from chat conversion)
  projects: Project[];
  createProject: (
    name: string,
    partnerId: string,
    sourceConversationId?: string,
  ) => Project | null;
  getProjectById: (projectId: string) => Project | undefined;
  /** Add a participant (designer/atelier/retailer/boutique) to a project. Owner-only. Idempotent. */
  addProjectParticipant: (projectId: string, participantId: string) => boolean;
  /** Add a file (already turned into an object URL) to a project. Participant-only. */
  addProjectFile: (
    projectId: string,
    file: {
      name: string;
      url: string;
      size: number;
      mime: string;
      stageKey?: ProjectStageKey;
    },
  ) => boolean;
  /** Remove a file from a project. Participant-only. */
  removeProjectFile: (projectId: string, fileId: string) => boolean;
  /** Add a task to a project. Participant-only. */
  addProjectTask: (projectId: string, title: string) => boolean;
  /** Toggle a task done state. Participant-only. */
  toggleProjectTask: (projectId: string, taskId: string) => boolean;
  /** Remove a task from a project. Participant-only. */
  removeProjectTask: (projectId: string, taskId: string) => boolean;

  // Workflow / stage tracking
  /** Set the project's overall deadline (YYYY-MM-DD or null to clear). Owner-only. */
  setProjectDeadline: (projectId: string, deadline: string | null) => boolean;
  /** Set a stage's status. Assignee or owner only. Pushes a notification on change. */
  setStageStatus: (
    projectId: string,
    stageKey: ProjectStageKey,
    status: ProjectStageStatus,
  ) => boolean;
  /** Set a stage's deadline (YYYY-MM-DD or null). Owner-only. */
  setStageDeadline: (
    projectId: string,
    stageKey: ProjectStageKey,
    deadline: string | null,
  ) => boolean;
  /** Set a stage's assigned participants. Owner-only. */
  setStageAssignees: (
    projectId: string,
    stageKey: ProjectStageKey,
    assigneeIds: string[],
  ) => boolean;
  /** Add a comment to a stage. Participant-only. */
  addStageComment: (
    projectId: string,
    stageKey: ProjectStageKey,
    body: string,
  ) => boolean;
}

function businessIdFor(user: User | null): string | null {
  if (!user || user.type !== "business") return null;
  return `me-${user.email.trim().toLowerCase()}`;
}

const STORAGE_KEY = "stylink_state_v7";

const defaultFavorites: Record<FavoriteCategory, string[]> = {
  wishlist: [],
  boutiques: [],
  designers: [],
  ateliers: [],
  "fabric-retailers": [],
};

const AppContext = createContext<AppState | null>(null);

interface PersistedState {
  user: User | null;
  favorites: Record<FavoriteCategory, string[]>;
  cart: CartItem[];
  orders: B2BOrder[];
  requests: B2BRequest[];
  opportunities: Opportunity[];
  shortlist: string[];
  connections: string[];
  pendingConnections: string[];
  applications: Record<string, string[]>;
  acceptedApplications: string[];
  projects: Project[];
  notifications: NotificationItem[];
}

function loadState(): PersistedState {
  const empty: PersistedState = {
    user: null,
    favorites: defaultFavorites,
    cart: [],
    orders: mockOrders,
    requests: mockRequests,
    opportunities: mockOpportunities,
    shortlist: [],
    connections: [],
    pendingConnections: [],
    applications: {},
    acceptedApplications: [],
    projects: [],
    notifications: mockNotifications,
  };
  if (typeof window === "undefined") return empty;
  try {
    // Read current v6 first; fall back to the previous v5 snapshot so
    // existing users don't lose their data on the schema bump. The v5 record
    // is left in place as a backup; the very next state change persists v6.
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem("stylink_state_v5");
      if (legacy) raw = legacy;
    }
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      user: parsed.user ?? null,
      favorites: { ...defaultFavorites, ...(parsed.favorites ?? {}) },
      cart: parsed.cart ?? [],
      orders: parsed.orders && parsed.orders.length > 0 ? parsed.orders : mockOrders,
      requests:
        parsed.requests && parsed.requests.length > 0
          ? parsed.requests
          : mockRequests,
      opportunities:
        parsed.opportunities && parsed.opportunities.length > 0
          ? parsed.opportunities
          : mockOpportunities,
      shortlist: parsed.shortlist ?? [],
      connections: parsed.connections ?? [],
      pendingConnections: (parsed as any).pendingConnections ?? [],
      applications: parsed.applications ?? {},
      acceptedApplications: (parsed as any).acceptedApplications ?? [],
      projects: (parsed.projects ?? []).map((p) => ({
        ...p,
        files: p.files ?? [],
        tasks: p.tasks ?? [],
        stages:
          Array.isArray(p.stages) && p.stages.length === 4
            ? p.stages
            : defaultProjectStages(),
      })),
      notifications:
        parsed.notifications && parsed.notifications.length > 0
          ? parsed.notifications
          : mockNotifications,
    };
  } catch {
    return empty;
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const initial = loadState();
  const [user, setUser] = useState<User | null>(initial.user);
  const [favorites, setFavorites] = useState(initial.favorites);
  const [cart, setCart] = useState<CartItem[]>(initial.cart);
  const [orders, setOrders] = useState<B2BOrder[]>(initial.orders);
  const [requests, setRequests] = useState<B2BRequest[]>(initial.requests);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    initial.opportunities,
  );
  const [shortlist, setShortlist] = useState<string[]>(initial.shortlist);
  const [connections, setConnections] = useState<string[]>(initial.connections);
  const [pendingConnections, setPendingConnections] = useState<string[]>(
    (initial as any).pendingConnections ?? [],
  );
  const [applications, setApplications] = useState<Record<string, string[]>>(
    initial.applications,
  );
  const [acceptedApplications, setAcceptedApplications] = useState<string[]>(
    (initial as any).acceptedApplications ?? [],
  );
  const [projects, setProjects] = useState<Project[]>(initial.projects);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initial.notifications,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          favorites,
          cart,
          orders,
          requests,
          opportunities,
          shortlist,
          connections,
          applications,
          projects,
          notifications,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [
    user,
    favorites,
    cart,
    orders,
    requests,
    opportunities,
    shortlist,
    connections,
    applications,
    projects,
    notifications,
  ]);

  const signIn = useCallback((u: User) => setUser(u), []);
  const updateUser = useCallback(
    (patch: Partial<ClientUser> | Partial<BusinessUser>) =>
      setUser((prev) => (prev ? { ...prev, ...patch } as User : prev)),
    [],
  );
  const signOut = useCallback(() => {
    setUser(null);
    // Avoid cross-account contamination in shared-device usage
    setShortlist([]);
    setConnections([]);
  }, []);

  const currentBusinessId = businessIdFor(user);

  const toggleFavorite = useCallback(
    (category: FavoriteCategory, id: string) => {
      setFavorites((prev) => {
        const current = prev[category];
        const next = current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id];
        return { ...prev, [category]: next };
      });
    },
    [],
  );

  const isFavorite = useCallback(
    (category: FavoriteCategory, id: string) =>
      favorites[category].includes(id),
    [favorites],
  );

  const addToCart = useCallback((productId: string, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) {
        return prev.map((c) =>
          c.productId === productId ? { ...c, qty: c.qty + qty } : c,
        );
      }
      return [...prev, { productId, qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((c) => c.productId !== productId)
        : prev.map((c) => (c.productId === productId ? { ...c, qty } : c)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(
    () => cart.reduce((sum, c) => sum + c.qty, 0),
    [cart],
  );

  // ===== B2B actions =====
  const todayIso = () => new Date().toISOString().slice(0, 10);

  const createOrder = useCallback<AppState["createOrder"]>((draft) => {
    const id = `ord-${Date.now()}`;
    const ref = `STK-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const created: B2BOrder = {
      ...draft,
      id,
      reference: ref,
      createdAt: todayIso(),
      stage: "pending",
      history: [
        { stage: "pending", date: todayIso(), note: "Commande créée." },
      ],
    };
    setOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  const setOrderStage = useCallback<AppState["setOrderStage"]>(
    (orderId, stage, note) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                stage,
                history: [
                  ...o.history,
                  { stage, date: todayIso(), note },
                ],
              }
            : o,
        ),
      );
    },
    [],
  );

  const advanceOrderStage = useCallback<AppState["advanceOrderStage"]>(
    (orderId, note) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const idx = orderStages.indexOf(o.stage);
          if (idx < 0 || idx >= orderStages.length - 1) return o;
          const next = orderStages[idx + 1];
          return {
            ...o,
            stage: next,
            history: [
              ...o.history,
              { stage: next, date: todayIso(), note },
            ],
          };
        }),
      );
    },
    [],
  );

  const setRequestStatus = useCallback<AppState["setRequestStatus"]>(
    (requestId, status) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r)),
      );
    },
    [],
  );

  // ===== Opportunity actions =====
  const createOpportunity = useCallback<AppState["createOpportunity"]>(
    (draft) => {
      if (!user || user.type !== "business") return null;
      const meId = businessIdFor(user);
      if (!meId) return null;
      const created: Opportunity = {
        ...draft,
        id: `opp-${Date.now()}`,
        authorId: meId,
        authorRole: user.role,
        createdAt: todayIso(),
        status: "open",
      };
      setOpportunities((prev) => [created, ...prev]);
      return created;
    },
    [user],
  );

  const closeOpportunity = useCallback<AppState["closeOpportunity"]>(
    (opportunityId) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didClose = false;
      setOpportunities((prev) =>
        prev.map((o) => {
          if (o.id !== opportunityId) return o;
          if (o.authorId !== meId) return o;
          didClose = true;
          return { ...o, status: "closed" };
        }),
      );
      return didClose;
    },
    [user],
  );

  const toggleShortlist = useCallback<AppState["toggleShortlist"]>(
    (opportunityId) => {
      setShortlist((prev) =>
        prev.includes(opportunityId)
          ? prev.filter((id) => id !== opportunityId)
          : [...prev, opportunityId],
      );
    },
    [],
  );

  const isShortlisted = useCallback<AppState["isShortlisted"]>(
    (opportunityId) => shortlist.includes(opportunityId),
    [shortlist],
  );

  const toggleConnection = useCallback<AppState["toggleConnection"]>(
    (designerId) => {
      setConnections((prev) =>
        prev.includes(designerId)
          ? prev.filter((id) => id !== designerId)
          : [...prev, designerId],
      );
    },
    [],
  );

  const requestConnectionToggle = useCallback<
    AppState["requestConnectionToggle"]
  >((designerId) => {
    let nowConnected = true;
    setConnections((prev) => {
      if (prev.includes(designerId)) {
        nowConnected = false;
        return prev.filter((id) => id !== designerId);
      }
      nowConnected = true;
      return [...prev, designerId];
    });
    return nowConnected;
  }, []);

  const isConnected = useCallback<AppState["isConnected"]>(
    (designerId) => connections.includes(designerId),
    [connections],
  );

  const pushNotification = useCallback<AppState["pushNotification"]>((n) => {
    setNotifications((prev) => [
      {
        ...n,
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: n.timestamp ?? "À l'instant",
        unread: n.unread ?? true,
      },
      ...prev,
    ]);
  }, []);

  const acceptConnectRequest = useCallback<AppState["acceptConnectRequest"]>(
    (notificationId) => {
      let found = false;
      let designerIdToAdd: string | null = null;
      setNotifications((prev) => {
        const idx = prev.findIndex((n) => n.id === notificationId);
        if (idx < 0) return prev;
        const n = prev[idx];
        if (n.kind !== "connect-request" || n.connectRequestStatus !== "pending")
          return prev;
        found = true;
        if (n.requesterId && n.requesterId !== "me") {
          designerIdToAdd = n.requesterId;
        }
        const updated = [...prev];
        updated[idx] = { ...n, connectRequestStatus: "accepted", unread: false };
        return updated;
      });
      if (designerIdToAdd) {
        setConnections((prev) =>
          prev.includes(designerIdToAdd!) ? prev : [...prev, designerIdToAdd!],
        );
        setPendingConnections((prev) =>
          prev.filter((id) => id !== designerIdToAdd),
        );
      }
      return found;
    },
    [],
  );

  const declineConnectRequest = useCallback<AppState["declineConnectRequest"]>(
    (notificationId) => {
      let found = false;
      let requesterId: string | null = null;
      setNotifications((prev) => {
        const idx = prev.findIndex((n) => n.id === notificationId);
        if (idx < 0) return prev;
        const n = prev[idx];
        if (n.kind !== "connect-request" || n.connectRequestStatus !== "pending")
          return prev;
        found = true;
        requesterId = n.requesterId ?? null;
        return prev.filter((_, i) => i !== idx);
      });
      if (requesterId) {
        setPendingConnections((prev) =>
          prev.filter((id) => id !== requesterId),
        );
      }
      return found;
    },
    [],
  );

  const addPendingConnection = useCallback(
    (designerId: string) => {
      setPendingConnections((prev) =>
        prev.includes(designerId) ? prev : [...prev, designerId],
      );
    },
    [],
  );

  const acceptApplication = useCallback<AppState["acceptApplication"]>(
    (notificationId) => {
      let found = false;
      let oppId: string | null = null;
      let ownerId: string | null = null;
      let oppTitle: string | null = null;
      setNotifications((prev) => {
        const idx = prev.findIndex((n) => n.id === notificationId);
        if (idx < 0) return prev;
        const n = prev[idx];
        if (n.kind !== "application" || n.applicationStatus !== "pending")
          return prev;
        found = true;
        oppId = n.opportunityId ?? null;
        ownerId = n.ownerId ?? null;
        oppTitle = n.opportunityTitle ?? null;
        const updated = [...prev];
        updated[idx] = { ...n, applicationStatus: "accepted", unread: false };
        return updated;
      });
      if (found && oppId) {
        setAcceptedApplications((prev) =>
          prev.includes(oppId!) ? prev : [...prev, oppId!],
        );
        setNotifications((prev) => [
          {
            id: `notif-app-accepted-${Date.now()}`,
            kind: "application-accepted" as const,
            title: "Candidature acceptée",
            description: oppTitle
              ? `Votre candidature pour « ${oppTitle} » a été acceptée. Vous pouvez maintenant ouvrir le chat.`
              : "Votre candidature a été acceptée.",
            timestamp: "À l'instant",
            unread: true,
            opportunityId: oppId!,
            opportunityTitle: oppTitle ?? undefined,
            ownerId: ownerId ?? undefined,
            applicationStatus: "accepted",
          },
          ...prev,
        ]);
      }
      return found;
    },
    [],
  );

  const declineApplication = useCallback<AppState["declineApplication"]>(
    (notificationId) => {
      let found = false;
      let declinedOppId: string | null = null;
      let declinedApplicantId: string | null = null;
      setNotifications((prev) => {
        const idx = prev.findIndex((n) => n.id === notificationId);
        if (idx < 0) return prev;
        const n = prev[idx];
        if (n.kind !== "application" || n.applicationStatus !== "pending")
          return prev;
        found = true;
        declinedOppId = n.opportunityId ?? null;
        declinedApplicantId = n.applicantId ?? null;
        const updated = [...prev];
        updated[idx] = { ...n, applicationStatus: "declined", unread: false };
        return updated;
      });
      if (declinedOppId && declinedApplicantId) {
        setApplications((prev) => {
          const current = prev[declinedOppId!] ?? [];
          const next = current.filter((id) => id !== declinedApplicantId);
          return { ...prev, [declinedOppId!]: next };
        });
      }
      return found;
    },
    [],
  );

  const hasApplicationAccepted = useCallback<AppState["hasApplicationAccepted"]>(
    (opportunityId) => acceptedApplications.includes(opportunityId),
    [acceptedApplications],
  );

  const markAllNotificationsRead = useCallback<
    AppState["markAllNotificationsRead"]
  >(() => {
    setNotifications((prev) =>
      prev.every((n) => !n.unread)
        ? prev
        : prev.map((n) => (n.unread ? { ...n, unread: false } : n)),
    );
  }, []);

  const connectOpportunity = useCallback<AppState["connectOpportunity"]>(
    (opportunityId, message) => {
      const opp = opportunities.find((o) => o.id === opportunityId);
      if (!opp || !user || user.type !== "business") return null;
      if (opp.status === "closed") return null;
      const meId = businessIdFor(user);
      if (!meId) return null;
      // Block self-connect
      if (meId === opp.authorId) return null;
      const typeMap: Record<Opportunity["type"], B2BRequest["type"]> = {
        "designer-seeks-atelier": "production",
        "designer-seeks-fabric": "fabric",
        "designer-collaboration": "collaboration",
        "atelier-capacity": "production",
        "atelier-specialty": "production",
        "boutique-seeks-collection": "design",
        "boutique-private-label": "collaboration",
        "fabric-new-stock": "fabric",
        "fabric-exclusive": "fabric",
      };
      const req: B2BRequest = {
        id: `req-${Date.now()}`,
        type: typeMap[opp.type],
        fromId: meId,
        toId: opp.authorId,
        title: `Connect — ${opp.title}`,
        message,
        status: "open",
        createdAt: todayIso(),
      };
      setRequests((prev) => [req, ...prev]);
      return req;
    },
    [user, opportunities],
  );

  const applyToOpportunity = useCallback<AppState["applyToOpportunity"]>(
    (opportunityId, message) => {
      if (!user || user.type !== "business") return null;
      const meId = businessIdFor(user);
      if (!meId) return null;
      const opp = opportunities.find((o) => o.id === opportunityId);
      if (!opp) return null;
      if (opp.status === "closed") return null;
      // Cannot apply to your own opportunity
      if (opp.authorId === meId) return null;
      // Block double-apply
      const existing = applications[opportunityId] ?? [];
      if (existing.includes(meId)) return null;

      const finalMessage =
        (message?.trim() ?? "") ||
        `Bonjour, je souhaite postuler à votre annonce « ${opp.title} ». Je serais ravi(e) d'en discuter.`;

      const typeMap: Record<Opportunity["type"], B2BRequest["type"]> = {
        "designer-seeks-atelier": "production",
        "designer-seeks-fabric": "fabric",
        "designer-collaboration": "collaboration",
        "atelier-capacity": "production",
        "atelier-specialty": "production",
        "boutique-seeks-collection": "design",
        "boutique-private-label": "collaboration",
        "fabric-new-stock": "fabric",
        "fabric-exclusive": "fabric",
      };

      const req: B2BRequest = {
        id: `req-${Date.now()}`,
        type: typeMap[opp.type],
        fromId: meId,
        toId: opp.authorId,
        title: `Candidature — ${opp.title}`,
        message: finalMessage,
        status: "open",
        createdAt: todayIso(),
      };
      setRequests((prev) => [req, ...prev]);
      setApplications((prev) => ({
        ...prev,
        [opportunityId]: [meId, ...existing],
      }));
      return req;
    },
    [user, opportunities, applications],
  );

  const hasApplied = useCallback<AppState["hasApplied"]>(
    (opportunityId) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      return (applications[opportunityId] ?? []).includes(meId);
    },
    [user, applications],
  );

  const getApplicantIds = useCallback<AppState["getApplicantIds"]>(
    (opportunityId) => applications[opportunityId] ?? [],
    [applications],
  );

  const createProject = useCallback<AppState["createProject"]>(
    (name, partnerId, sourceConversationId) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const meId = businessIdFor(user);
      if (!meId) return null;
      if (!partnerId || partnerId === meId) return null;
      const created: Project = {
        id: `proj-${Date.now()}`,
        name: trimmed,
        ownerId: meId,
        participantIds: [meId, partnerId],
        sourceConversationId,
        createdAt: todayIso(),
        files: [],
        tasks: [],
        stages: defaultProjectStages(),
      };
      setProjects((prev) => [created, ...prev]);
      return created;
    },
    [user],
  );

  const getProjectById = useCallback<AppState["getProjectById"]>(
    (projectId) => projects.find((p) => p.id === projectId),
    [projects],
  );

  const addProjectParticipant = useCallback<AppState["addProjectParticipant"]>(
    (projectId, participantId) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didAdd = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          // Owner-only
          if (p.ownerId !== meId) return p;
          if (p.participantIds.includes(participantId)) return p;
          didAdd = true;
          return { ...p, participantIds: [...p.participantIds, participantId] };
        }),
      );
      return didAdd;
    },
    [user],
  );

  const addProjectFile = useCallback<AppState["addProjectFile"]>(
    (projectId, file) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didAdd = false;
      let projectName = "";
      let participantCount = 0;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          // Participant-only
          if (!p.participantIds.includes(meId)) return p;
          didAdd = true;
          projectName = p.name;
          participantCount = p.participantIds.length;
          return {
            ...p,
            files: [
              {
                id: `file-${Date.now()}`,
                name: file.name,
                url: file.url,
                size: file.size,
                mime: file.mime,
                uploadedById: meId,
                uploadedAt: todayIso(),
                stageKey: file.stageKey,
              },
              ...p.files,
            ],
          };
        }),
      );
      // Notify other project members of the upload (skipped on solo projects).
      if (didAdd && participantCount > 1) {
        const stageDef = file.stageKey
          ? PROJECT_STAGE_DEFS.find((d) => d.key === file.stageKey)
          : undefined;
        const stageSuffix = stageDef ? ` (étape « ${stageDef.title} »)` : "";
        const meName = user?.type === "business" ? user.brandName : "Un membre";
        setNotifications((prev) => [
          {
            id: `notif-file-${Date.now()}`,
            title: `Nouveau fichier dans « ${projectName} »`,
            description: `${meName} a téléversé ${file.name}${stageSuffix}.`,
            timestamp: "à l'instant",
            unread: true,
          },
          ...prev,
        ]);
      }
      return didAdd;
    },
    [user],
  );

  const removeProjectFile = useCallback<AppState["removeProjectFile"]>(
    (projectId, fileId) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didRemove = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (!p.participantIds.includes(meId)) return p;
          if (!p.files.some((f) => f.id === fileId)) return p;
          didRemove = true;
          return { ...p, files: p.files.filter((f) => f.id !== fileId) };
        }),
      );
      return didRemove;
    },
    [user],
  );

  const addProjectTask = useCallback<AppState["addProjectTask"]>(
    (projectId, title) => {
      const trimmed = title.trim();
      if (!trimmed) return false;
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didAdd = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (!p.participantIds.includes(meId)) return p;
          didAdd = true;
          return {
            ...p,
            tasks: [
              ...p.tasks,
              {
                id: `task-${Date.now()}`,
                title: trimmed,
                done: false,
                createdAt: todayIso(),
              },
            ],
          };
        }),
      );
      return didAdd;
    },
    [user],
  );

  const toggleProjectTask = useCallback<AppState["toggleProjectTask"]>(
    (projectId, taskId) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didToggle = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (!p.participantIds.includes(meId)) return p;
          if (!p.tasks.some((t) => t.id === taskId)) return p;
          didToggle = true;
          return {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === taskId ? { ...t, done: !t.done } : t,
            ),
          };
        }),
      );
      return didToggle;
    },
    [user],
  );

  const removeProjectTask = useCallback<AppState["removeProjectTask"]>(
    (projectId, taskId) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didRemove = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (!p.participantIds.includes(meId)) return p;
          if (!p.tasks.some((t) => t.id === taskId)) return p;
          didRemove = true;
          return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
        }),
      );
      return didRemove;
    },
    [user],
  );

  // ===== Workflow / stage actions =====

  const setProjectDeadline = useCallback<AppState["setProjectDeadline"]>(
    (projectId, deadline) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didSet = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (p.ownerId !== meId) return p; // owner-only
          didSet = true;
          return { ...p, deadline: deadline ?? undefined };
        }),
      );
      return didSet;
    },
    [user],
  );

  const setStageStatus = useCallback<AppState["setStageStatus"]>(
    (projectId, stageKey, status) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didSet = false;
      let projectName = "";
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          // Permission: owner OR assignee of this stage
          const stage = p.stages.find((s) => s.key === stageKey);
          if (!stage) return p;
          const isOwner = p.ownerId === meId;
          const isAssignee = stage.assignedIds.includes(meId);
          if (!isOwner && !isAssignee) return p;
          if (stage.status === status) return p;
          // Sequential gate: starting a "not-started" stage requires every
          // earlier stage in PROJECT_STAGE_DEFS order to be "completed".
          // Reopening already-running stages, completing in-progress ones,
          // and resetting any stage are always allowed.
          if (stage.status === "not-started" && status !== "not-started") {
            if (blockingStageTitle(p, stageKey) !== null) return p;
          }
          didSet = true;
          projectName = p.name;
          return {
            ...p,
            stages: p.stages.map((s) =>
              s.key === stageKey ? { ...s, status } : s,
            ),
          };
        }),
      );
      if (didSet) {
        const def = PROJECT_STAGE_DEFS.find((d) => d.key === stageKey);
        const stageTitle = def?.title ?? stageKey;
        const statusLabel =
          status === "completed"
            ? "terminée"
            : status === "in-progress"
              ? "démarrée"
              : "réinitialisée";
        const actorName =
          user?.type === "business" ? user.brandName : "un membre";
        setNotifications((prev) => [
          {
            id: `notif-stage-${Date.now()}`,
            title: `Étape « ${stageTitle} » ${statusLabel}`,
            description: `${projectName} — par ${actorName}`,
            timestamp: "à l'instant",
            unread: true,
          },
          ...prev,
        ]);
      }
      return didSet;
    },
    [user],
  );

  const setStageDeadline = useCallback<AppState["setStageDeadline"]>(
    (projectId, stageKey, deadline) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didSet = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (p.ownerId !== meId) return p; // owner-only
          if (!p.stages.some((s) => s.key === stageKey)) return p;
          didSet = true;
          return {
            ...p,
            stages: p.stages.map((s) =>
              s.key === stageKey ? { ...s, deadline: deadline ?? undefined } : s,
            ),
          };
        }),
      );
      return didSet;
    },
    [user],
  );

  const setStageAssignees = useCallback<AppState["setStageAssignees"]>(
    (projectId, stageKey, assigneeIds) => {
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didSet = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (p.ownerId !== meId) return p; // owner-only
          if (!p.stages.some((s) => s.key === stageKey)) return p;
          // Restrict to actual participants only
          const valid = assigneeIds.filter((id) =>
            p.participantIds.includes(id),
          );
          didSet = true;
          return {
            ...p,
            stages: p.stages.map((s) =>
              s.key === stageKey ? { ...s, assignedIds: valid } : s,
            ),
          };
        }),
      );
      return didSet;
    },
    [user],
  );

  const addStageComment = useCallback<AppState["addStageComment"]>(
    (projectId, stageKey, body) => {
      const trimmed = body.trim();
      if (!trimmed) return false;
      const meId = businessIdFor(user);
      if (!meId) return false;
      let didAdd = false;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          if (!p.participantIds.includes(meId)) return p;
          if (!p.stages.some((s) => s.key === stageKey)) return p;
          didAdd = true;
          return {
            ...p,
            stages: p.stages.map((s) =>
              s.key === stageKey
                ? {
                    ...s,
                    comments: [
                      ...s.comments,
                      {
                        id: `cmt-${Date.now()}`,
                        authorId: meId,
                        body: trimmed,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : s,
            ),
          };
        }),
      );
      return didAdd;
    },
    [user],
  );

  const inviteToProject = useCallback<AppState["inviteToProject"]>(
    (designerId, opportunityId, message) => {
      if (!user || user.type !== "business") return null;
      const meId = businessIdFor(user);
      if (!meId) return null;
      const opp = opportunities.find((o) => o.id === opportunityId);
      if (!opp) return null;
      // Only the project owner can invite to it
      if (opp.authorId !== meId) return null;
      // Cannot invite yourself
      if (designerId === meId) return null;
      const req: B2BRequest = {
        id: `req-${Date.now()}`,
        type: "collaboration",
        fromId: meId,
        toId: designerId,
        title: `Invitation au projet — ${opp.title}`,
        message,
        status: "open",
        createdAt: todayIso(),
      };
      setRequests((prev) => [req, ...prev]);
      return req;
    },
    [user, opportunities],
  );

  const inviteToProjectMembership = useCallback<
    AppState["inviteToProjectMembership"]
  >(
    (projectId, designerId, message) => {
      if (!user || user.type !== "business") return null;
      const meId = businessIdFor(user);
      if (!meId) return null;
      const project = projects.find((p) => p.id === projectId);
      if (!project) return null;
      // Only the project owner can invite to one of their own projects
      if (project.ownerId !== meId) return null;
      if (designerId === meId) return null;
      // Already a participant — silently no-op (return null)
      if (project.participantIds.includes(designerId)) return null;
      const meName = user.brandName;
      const inviteeName =
        getDesignerById(designerId)?.name ?? "un membre du réseau";
      const notifId = `notif-invite-${Date.now()}`;
      setNotifications((prev) => [
        {
          id: notifId,
          kind: "project-invite",
          title: `${meName} vous a invité(e) à rejoindre « ${project.name} »`,
          description: message?.trim()
            ? message.trim()
            : `${inviteeName} a été invité(e) à collaborer sur le projet.`,
          timestamp: "à l'instant",
          unread: true,
          projectId,
          inviterId: meId,
          inviteeId: designerId,
          inviteMessage: message?.trim() || undefined,
          inviteStatus: "pending",
        },
        ...prev,
      ]);
      return notifId;
    },
    [user, projects],
  );

  // NOTE: accept/decline are intentionally not gated on
  // `currentBusinessId === notif.inviteeId`. STYLINK is a frontend-only,
  // single-session simulation per the spec ("simulate logic in frontend / no
  // backend needed"). The signed-in user role-plays as the invitee when
  // accepting an invite they themselves sent, mirroring how the recipient
  // would see and action the bell card in a real multi-user system.
  const acceptProjectInvite = useCallback<AppState["acceptProjectInvite"]>(
    (notificationId) => {
      // Atomically resolve the latest notification snapshot inside the
      // updater so rapid clicks can't race on a stale closure value.
      let resolved: { projectId: string; inviteeId: string } | null = null;
      setNotifications((prev) => {
        const idx = prev.findIndex((n) => n.id === notificationId);
        if (idx < 0) return prev;
        const n = prev[idx];
        if (
          n.kind !== "project-invite" ||
          n.inviteStatus !== "pending" ||
          !n.projectId ||
          !n.inviteeId
        ) {
          return prev;
        }
        resolved = { projectId: n.projectId, inviteeId: n.inviteeId };
        const next = prev.slice();
        next[idx] = { ...n, inviteStatus: "accepted", unread: false };
        return next;
      });
      if (!resolved) return false;
      const { projectId, inviteeId } = resolved as {
        projectId: string;
        inviteeId: string;
      };
      setProjects((prev) =>
        prev.map((p) =>
          p.id !== projectId || p.participantIds.includes(inviteeId)
            ? p
            : { ...p, participantIds: [...p.participantIds, inviteeId] },
        ),
      );
      return true;
    },
    [],
  );

  const declineProjectInvite = useCallback<AppState["declineProjectInvite"]>(
    (notificationId) => {
      let removed = false;
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === notificationId);
        if (
          !target ||
          target.kind !== "project-invite" ||
          target.inviteStatus !== "pending"
        ) {
          return prev;
        }
        removed = true;
        return prev.filter((n) => n.id !== notificationId);
      });
      return removed;
    },
    [],
  );

  const value: AppState = {
    user,
    signIn,
    signOut,
    updateUser,
    favorites,
    toggleFavorite,
    isFavorite,
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    cartCount,
    orders,
    requests,
    createOrder,
    advanceOrderStage,
    setOrderStage,
    setRequestStatus,
    opportunities,
    shortlist,
    currentBusinessId,
    createOpportunity,
    closeOpportunity,
    toggleShortlist,
    isShortlisted,
    connectOpportunity,
    inviteToProject,
    inviteToProjectMembership,
    acceptProjectInvite,
    declineProjectInvite,
    acceptConnectRequest,
    declineConnectRequest,
    connections,
    pendingConnections,
    addPendingConnection,
    toggleConnection,
    requestConnectionToggle,
    isConnected,
    notifications,
    pushNotification,
    markAllNotificationsRead,
    applications,
    applyToOpportunity,
    hasApplied,
    getApplicantIds,
    acceptApplication,
    declineApplication,
    hasApplicationAccepted,
    acceptedApplications,
    projects,
    createProject,
    getProjectById,
    addProjectParticipant,
    addProjectFile,
    removeProjectFile,
    addProjectTask,
    toggleProjectTask,
    removeProjectTask,
    setProjectDeadline,
    setStageStatus,
    setStageDeadline,
    setStageAssignees,
    addStageComment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
