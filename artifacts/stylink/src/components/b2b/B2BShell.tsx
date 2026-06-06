import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Bell,
  Bookmark,
  Briefcase,
  ClipboardList,
  FolderKanban,
  Home,
  Inbox,
  Library,
  LogOut,
  MessageCircle,
  Search,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAppStore, type BusinessRole } from "@/contexts/AppStore";
import { useB2BShell } from "@/components/b2b/B2BShellContext";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<BusinessRole, string> = {
  boutique: "Boutique",
  designer: "Designer",
  atelier: "Atelier",
  "fabric-retailer": "Maison de tissus",
};

interface TabDef {
  href: string;
  label: string;
  icon: typeof Home;
}

const tabs: TabDef[] = [
  { href: "/b2b", label: "Feed", icon: Home },
  { href: "/b2b/network", label: "My Network", icon: Users },
  { href: "/b2b/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/b2b/messages", label: "Messages", icon: MessageCircle },
];

function initialsFor(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function B2BShell({ children }: { children: ReactNode }) {
  const {
    user,
    signOut,
    notifications,
    markAllNotificationsRead,
    acceptProjectInvite,
    declineProjectInvite,
    acceptConnectRequest,
    declineConnectRequest,
    acceptApplication,
    declineApplication,
    projects,
  } = useAppStore();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { search, setSearch } = useB2BShell();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const isBusiness = !!user && user.type === "business";
  const displayName = !user
    ? ""
    : user.type === "business"
      ? user.brandName
      : user.name;
  const role = isBusiness && user ? roleLabels[user.role] : "";

  return (
    <div className="min-h-[100dvh] bg-[#F5F3EE] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-black/5 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center gap-3 md:gap-6">
          {/* Logo */}
          <Link href="/b2b" data-testid="link-b2b-logo" className="shrink-0">
            <span
              className="text-xl md:text-2xl uppercase select-none text-foreground"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                letterSpacing: "0.12em",
              }}
            >
              STYLINK
            </span>
          </Link>

          {/* Search — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto relative">
            <Search
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans le réseau, opportunités, messages…"
              className="w-full pl-11 pr-4 h-10 text-sm bg-[#F5F3EE] rounded-full border border-transparent focus:border-primary/40 focus:bg-white focus:outline-none transition-colors placeholder:text-muted-foreground/70"
              data-testid="input-b2b-search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Effacer la recherche"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            {/* Mobile search trigger */}
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="md:hidden p-2 rounded-full text-foreground hover:bg-muted transition-colors"
              aria-label="Rechercher"
              data-testid="button-mobile-search-toggle"
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Notifications */}
            <Popover
              onOpenChange={(open) => {
                if (open && unreadCount > 0) markAllNotificationsRead();
              }}
            >
              <PopoverTrigger asChild>
                <button
                  className="relative p-2 rounded-full text-foreground hover:bg-muted transition-colors"
                  aria-label="Notifications"
                  data-testid="button-notifications"
                >
                  <Bell className="w-5 h-5" strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center"
                      data-testid="badge-notifications-count"
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 p-0 rounded-2xl shadow-lg border-black/5"
                data-testid="popover-notifications"
              >
                <div className="p-4 border-b border-black/5 flex items-center justify-between">
                  <p className="font-serif text-base text-foreground">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary">
                      {unreadCount} nouvelles
                    </span>
                  )}
                </div>
                <ul className="max-h-[360px] overflow-y-auto divide-y divide-black/5">
                  {notifications.length === 0 && (
                    <li className="p-6 text-center text-sm text-muted-foreground font-light">
                      Aucune notification pour le moment.
                    </li>
                  )}
                  {notifications.map((n) => {
                    const isInvite = n.kind === "project-invite";
                    const project = isInvite && n.projectId
                      ? projects.find((p) => p.id === n.projectId)
                      : undefined;
                    return (
                      <li
                        key={n.id}
                        className="p-4 hover:bg-muted/40 transition-colors"
                        data-testid={`notification-${n.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                              n.unread ? "bg-primary" : "bg-transparent"
                            }`}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground font-medium leading-snug">
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground font-light leading-relaxed mt-0.5">
                              {n.description}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1.5">
                              {n.timestamp}
                            </p>

                            {isInvite && n.inviteStatus === "pending" && (
                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  size="sm"
                                  className="rounded-full h-8 px-4 text-xs"
                                  data-testid={`button-accept-invite-${n.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const ok = acceptProjectInvite(n.id);
                                    if (ok) {
                                      toast({
                                        title: "Vous avez rejoint le projet",
                                        description: project
                                          ? `« ${project.name} » est désormais visible dans votre tableau de bord.`
                                          : "Le projet est désormais visible dans votre tableau de bord.",
                                      });
                                    }
                                  }}
                                >
                                  Accepter
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full h-8 px-4 text-xs"
                                  data-testid={`button-decline-invite-${n.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const ok = declineProjectInvite(n.id);
                                    if (ok) {
                                      toast({
                                        title: "Invitation refusée",
                                      });
                                    }
                                  }}
                                >
                                  Refuser
                                </Button>
                              </div>
                            )}

                            {n.kind === "connect-request" &&
                              n.connectRequestStatus === "pending" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    className="rounded-full h-8 px-4 text-xs"
                                    data-testid={`button-accept-connect-${n.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const ok = acceptConnectRequest(n.id);
                                      if (ok) {
                                        toast({
                                          title: "Connexion acceptée",
                                          description:
                                            "Vous êtes maintenant connectés.",
                                        });
                                      }
                                    }}
                                  >
                                    Accepter
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full h-8 px-4 text-xs"
                                    data-testid={`button-decline-connect-${n.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      declineConnectRequest(n.id);
                                      toast({ title: "Demande refusée" });
                                    }}
                                  >
                                    Refuser
                                  </Button>
                                </div>
                              )}

                            {n.kind === "connect-request" &&
                              n.connectRequestStatus === "accepted" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
                                    data-testid={`badge-connect-accepted-${n.id}`}
                                  >
                                    Connexion établie
                                  </span>
                                </div>
                              )}

                            {n.kind === "application" &&
                              n.applicationStatus === "pending" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    className="rounded-full h-8 px-4 text-xs"
                                    data-testid={`button-accept-app-${n.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const ok = acceptApplication(n.id);
                                      if (ok) {
                                        toast({
                                          title: "Candidature acceptée",
                                          description:
                                            "Le candidat peut maintenant ouvrir le chat.",
                                        });
                                      }
                                    }}
                                  >
                                    Accepter
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full h-8 px-4 text-xs"
                                    data-testid={`button-decline-app-${n.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      declineApplication(n.id);
                                      toast({ title: "Candidature refusée" });
                                    }}
                                  >
                                    Refuser
                                  </Button>
                                </div>
                              )}

                            {n.kind === "application" &&
                              n.applicationStatus === "accepted" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                                    Acceptée
                                  </span>
                                </div>
                              )}

                            {n.kind === "application" &&
                              n.applicationStatus === "declined" && (
                                <div className="flex items-center gap-2 mt-3">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                                    Refusée
                                  </span>
                                </div>
                              )}

                            {n.kind === "application-accepted" && (
                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  size="sm"
                                  className="rounded-full h-8 px-4 text-xs gap-1.5"
                                  data-testid={`button-open-chat-app-${n.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (n.ownerId) {
                                      const params = new URLSearchParams({
                                        with: n.ownerId,
                                        ...(n.opportunityId
                                          ? { opp: n.opportunityId }
                                          : {}),
                                      });
                                      navigate(
                                        `/b2b/messages?${params.toString()}`,
                                      );
                                    }
                                  }}
                                >
                                  Ouvrir le chat
                                </Button>
                              </div>
                            )}

                            {isInvite && n.inviteStatus === "accepted" && (
                              <div className="flex items-center gap-2 mt-3">
                                <span
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
                                  data-testid={`badge-invite-accepted-${n.id}`}
                                >
                                  Acceptée
                                </span>
                                {project && (
                                  <Link
                                    href={`/b2b/projects/${project.id}`}
                                    onClick={() => markAllNotificationsRead()}
                                    className="text-xs underline-offset-4 hover:underline text-foreground/80"
                                    data-testid={`link-open-project-${project.id}`}
                                  >
                                    Ouvrir le projet
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </PopoverContent>
            </Popover>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded-full hover:ring-2 hover:ring-primary/30 transition"
                  aria-label="Mon compte"
                  data-testid="button-avatar-menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage alt={displayName} />
                    <AvatarFallback className="text-xs font-medium bg-primary/15 text-foreground">
                      {initialsFor(displayName) || "ST"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-2xl shadow-lg border-black/5 p-1.5"
                data-testid="dropdown-avatar"
              >
                <DropdownMenuLabel className="font-serif px-3 py-3">
                  <p className="text-base text-foreground leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans mt-1">
                    {role}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link
                    href="/b2b/projects"
                    data-testid="menu-projects"
                    className="cursor-pointer"
                  >
                    <FolderKanban className="w-4 h-4 mr-2" /> Mes projets
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link
                    href="/b2b/orders"
                    data-testid="menu-orders"
                    className="cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" /> Commandes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link
                    href="/b2b/requests"
                    data-testid="menu-requests"
                    className="cursor-pointer"
                  >
                    <Inbox className="w-4 h-4 mr-2" /> Demandes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link
                    href="/b2b/catalog"
                    data-testid="menu-catalog"
                    className="cursor-pointer"
                  >
                    <Library className="w-4 h-4 mr-2" /> Catalogue
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link
                    href="/b2b/shortlist"
                    data-testid="menu-shortlist"
                    className="cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 mr-2" /> Shortlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    signOut();
                    navigate("/");
                  }}
                  className="rounded-lg cursor-pointer"
                  data-testid="menu-signout"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile expandable search */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 -mt-1">
            <div className="relative">
              <Search
                className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-11 pr-4 h-10 text-sm bg-[#F5F3EE] rounded-full border border-transparent focus:border-primary/40 focus:bg-white focus:outline-none transition-colors"
                data-testid="input-b2b-search-mobile"
              />
            </div>
          </div>
        )}

        {/* Tabs strip */}
        <nav
          className="border-t border-black/5 bg-white/95"
          aria-label="Sections principales"
        >
          <div className="max-w-[1400px] mx-auto px-2 md:px-6">
            <ul
              role="tablist"
              className="flex gap-1 md:gap-2 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active =
                  tab.href === "/b2b"
                    ? location === "/b2b" || location === "/b2b/"
                    : location === tab.href ||
                      location.startsWith(tab.href + "/");
                return (
                  <li
                    key={tab.href}
                    role="presentation"
                    className="snap-start shrink-0"
                  >
                    <Link
                      href={tab.href}
                      role="tab"
                      aria-selected={active}
                      data-testid={`tab-${tab.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        active
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-black/10"
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                      <span>{tab.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* Content area */}
      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
