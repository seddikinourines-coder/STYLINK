import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid,
  List as ListIcon,
  MessageCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import {
  mockDesigners,
  type Designer,
  type DesignerType,
} from "@/data/mockData";
import { useB2BShell } from "@/components/b2b/B2BShellContext";
import PortfolioHoverGallery from "@/components/b2b/PortfolioHoverGallery";

type RoleFilter = "all" | DesignerType;
type ViewMode = "grid" | "list";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function messagesHref(designerId: string) {
  return `/b2b/messages?with=${encodeURIComponent(designerId)}`;
}

type ConnectStatus = "idle" | "pending" | "connected";

function ConnectButton({
  designerId,
  status,
  onConnect,
  onNavigate,
  fullWidth = false,
}: {
  designerId: string;
  status: ConnectStatus;
  onConnect: () => void;
  onNavigate: () => void;
  fullWidth?: boolean;
}) {
  const { t } = useTranslation();
  const base = `rounded-full text-xs gap-1.5 px-3 ${fullWidth ? "w-full" : ""}`;
  if (status === "connected") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={onNavigate}
        data-testid={`button-message-${designerId}`}
        className={base}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {t('b2b.tabs.messages')}
      </Button>
    );
  }
  if (status === "pending") {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        data-testid={`button-pending-${designerId}`}
        className={`${base} text-muted-foreground`}
      >
        {t('b2b.feed.pending')}
      </Button>
    );
  }
  return (
    <Button
      size="sm"
      variant="default"
      onClick={onConnect}
      data-testid={`button-connect-${designerId}`}
      className={base}
    >
      <UserPlus className="w-3.5 h-3.5" />
      {t('b2b.feed.connect')}
    </Button>
  );
}

function ConnectionCard({
  designer,
  connectStatus,
  onConnect,
  onDisconnect,
}: {
  designer: Designer;
  connectStatus: ConnectStatus;
  onConnect: () => void;
  onDisconnect?: () => void;
}) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="group bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-primary/30"
      data-testid={`network-card-${designer.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={-1}
    >
      <div className="relative aspect-[5/3] bg-muted overflow-hidden">
        <img
          src={designer.image}
          alt={designer.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <PortfolioHoverGallery designerId={designer.id} active={hovered} />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => navigate(`/designers/${designer.id}`)}
            className="font-serif text-base text-foreground leading-tight flex-1 text-left hover:underline cursor-pointer"
          >
            {designer.name}
          </button>
          <span
            className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap"
            data-testid={`badge-role-card-${designer.id}`}
          >
            {designer.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-light mt-1.5 leading-snug">
          {designer.specialty} · {designer.city}
        </p>
        <p className="text-[11px] text-muted-foreground/80 mt-1">
          {Math.max(2, Math.round(designer.rating * 4))} {t('b2b.network.common_connections')}
        </p>

        <div className="mt-4 flex gap-2">
          {onDisconnect ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(messagesHref(designer.id))}
                data-testid={`button-message-${designer.id}`}
                className="rounded-full text-xs gap-1.5 px-3 flex-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {t('b2b.tabs.messages')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDisconnect}
                data-testid={`button-disconnect-${designer.id}`}
                className="rounded-full text-xs gap-1.5 px-3 text-muted-foreground hover:text-destructive"
              >
                {t('b2b.feed.delete')}
              </Button>
            </>
          ) : (
            <ConnectButton
              designerId={designer.id}
              status={connectStatus}
              onConnect={onConnect}
              onNavigate={() => navigate(messagesHref(designer.id))}
              fullWidth
            />
          )}
        </div>
      </div>
    </article>
  );
}

function ConnectionListItem({
  designer,
  connectStatus,
  onConnect,
  onDisconnect,
}: {
  designer: Designer;
  connectStatus: ConnectStatus;
  onConnect: () => void;
  onDisconnect?: () => void;
}) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="group bg-white rounded-2xl shadow-sm border border-black/5 p-4 flex items-center gap-4 transition-all duration-300 ease-out hover:shadow-lg hover:border-primary/30"
      data-testid={`network-list-${designer.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-muted">
        <Avatar className="h-16 w-16 rounded-xl">
          <AvatarImage
            src={designer.image}
            alt={designer.name}
            className="object-cover"
          />
          <AvatarFallback className="text-xs bg-primary/15 rounded-xl">
            {initials(designer.name)}
          </AvatarFallback>
        </Avatar>
        <PortfolioHoverGallery designerId={designer.id} active={hovered} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(`/designers/${designer.id}`)}
            className="font-serif text-base text-foreground truncate hover:underline cursor-pointer"
          >
            {designer.name}
          </button>
          <span
            className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap"
            data-testid={`badge-role-list-${designer.id}`}
          >
            {designer.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-light truncate mt-0.5">
          {designer.specialty} · {designer.city}
        </p>
        <p className="text-[11px] text-muted-foreground/80 mt-1 truncate">
          {Math.max(2, Math.round(designer.rating * 4))} {t('b2b.network.common_connections')}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onDisconnect ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(messagesHref(designer.id))}
              data-testid={`button-message-list-${designer.id}`}
              className="rounded-full text-xs gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('b2b.tabs.messages')}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDisconnect}
              data-testid={`button-disconnect-list-${designer.id}`}
              className="rounded-full text-xs gap-1.5 text-muted-foreground hover:text-destructive"
            >
              <span className="hidden sm:inline">{t('b2b.feed.delete')}</span>
            </Button>
          </>
        ) : (
          <ConnectButton
            designerId={designer.id}
            status={connectStatus}
            onConnect={onConnect}
            onNavigate={() => navigate(messagesHref(designer.id))}
          />
        )}
      </div>
    </article>
  );
}


export default function NetworkTab() {
  const { t } = useTranslation();
  const {
    connections,
    toggleConnection,
    isConnected,
    pendingConnections,
    addPendingConnection,
    pushNotification,
    user,
  } = useAppStore();
  const { search } = useB2BShell();
  const q = search.trim().toLowerCase();

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const myName =
    user?.type === "business"
      ? (user as any).brandName ?? "Mon entreprise"
      : "Mon entreprise";

  const matchesQuery = (d: Designer) => {
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q)
    );
  };

  const matchesRole = (d: Designer) =>
    roleFilter === "all" ? true : d.type === roleFilter;

  function getConnectStatus(designerId: string): ConnectStatus {
    if (isConnected(designerId)) return "connected";
    if (pendingConnections.includes(designerId)) return "pending";
    return "idle";
  }

  function handleConnect(designer: Designer) {
    if (isConnected(designer.id) || pendingConnections.includes(designer.id))
      return;
    addPendingConnection(designer.id);
    pushNotification({
      kind: "connect-request",
      title: "Demande de connexion",
      description: `${myName} souhaite se connecter avec vous.`,
      connectRequestStatus: "pending",
      requesterId: designer.id,
    });
  }

  const myConnections = useMemo(
    () =>
      mockDesigners.filter(
        (d) => connections.includes(d.id) && matchesQuery(d) && matchesRole(d),
      ),
    [connections, q, roleFilter],
  );

  const suggestions = useMemo(
    () => mockDesigners.filter((d) => matchesQuery(d) && matchesRole(d)).slice(0, 12),
    [q, roleFilter],
  );

  const totalConnections = connections.length;

  const roleFilters: { value: RoleFilter; label: string }[] = [
    { value: "all", label: t('b2b.network.filter_all') },
    { value: "Designer", label: "Designers" },
    { value: "Atelier", label: "Ateliers" },
    { value: "Fournisseur", label: "Fournisseurs" },
    { value: "Boutique", label: "Boutiques" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-medium mb-2">
            {t('b2b.tabs.network')}
          </p>
          <h2 className="font-serif text-3xl text-foreground">
            {t('b2b.network.title')}
          </h2>
          <p className="text-sm text-muted-foreground font-light mt-2">
            {t('b2b.network.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span data-testid="text-connection-count">
              {totalConnections} {totalConnections > 1 ? t('b2b.network.connections') : t('b2b.network.connection')}
            </span>
          </div>
          <div
            className="inline-flex items-center rounded-full bg-muted p-1"
            role="group"
            aria-label="Changer la vue"
          >
            <button
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              data-testid="button-view-grid"
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Vue grille"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              data-testid="button-view-list"
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === "list"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Vue liste"
            >
              <ListIcon className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Role filters */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filtrer par rôle"
      >
        {roleFilters.map((f) => {
          const active = roleFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              aria-pressed={active}
              data-testid={`filter-role-${f.value.toLowerCase()}`}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] font-medium border transition-colors ${
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-white text-muted-foreground border-black/10 hover:text-foreground hover:border-black/20"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Suggestions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-foreground">
            {t('b2b.network.suggested')}
          </h3>
        </div>
        {suggestions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-black/5">
            <p className="text-muted-foreground font-light">{t('b2b.feed.empty_title')}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {suggestions.map((d) => (
              <ConnectionCard
                key={d.id}
                designer={d}
                connectStatus={getConnectStatus(d.id)}
                onConnect={() => handleConnect(d)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((d) => (
              <ConnectionListItem
                key={d.id}
                designer={d}
                connectStatus={getConnectStatus(d.id)}
                onConnect={() => handleConnect(d)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
