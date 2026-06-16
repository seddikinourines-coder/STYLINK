import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Bookmark,
  Briefcase,
  ClipboardList,
  FolderKanban,
  Globe,
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
  labelKey: string;
  icon: typeof Home;
}

const tabs: TabDef[] = [
  { href: "/b2b", labelKey: "b2b.tabs.feed", icon: Home },
  { href: "/b2b/network", labelKey: "b2b.tabs.network", icon: Users },
  { href: "/b2b/opportunities", labelKey: "b2b.tabs.opportunities", icon: Briefcase },
  { href: "/b2b/messages", labelKey: "b2b.tabs.messages", icon: MessageCircle },
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
  const { t, i18n } = useTranslation();
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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
              placeholder={t('b2b.search_placeholder')}
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
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                  aria-label="Change language"
                  data-testid="button-language-selector"
                >
                  <Globe className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-widest font-sans hidden sm:inline">
                    {i18n.language.toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onSelect={() => changeLanguage("en")}>
                  {t("languages.en")}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => changeLanguage("fr")}>
                  {t("languages.fr")}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => changeLanguage("ar")}>
                  {t("languages.ar")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </PopoverContent>
            </Popover>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-muted transition-colors"
                  data-testid="button-b2b-profile-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px] bg-primary/15">
                      {initialsFor(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-lg border-black/5">
                <DropdownMenuLabel className="font-serif text-base pb-0">
                  {displayName}
                </DropdownMenuLabel>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2 pb-2">
                  {role}
                </p>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/b2b/shortlist" className="cursor-pointer">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Mes favoris
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search bar — only if open */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top duration-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('b2b.search_placeholder')}
                className="w-full pl-11 pr-4 h-11 text-sm bg-[#F5F3EE] rounded-xl border-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Navigation tabs */}
      <nav className="bg-white border-b border-black/5 sticky top-16 z-30">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const active =
                tab.href === "/b2b"
                  ? location === "/b2b"
                  : location.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-all whitespace-nowrap ${
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`link-tab-${tab.labelKey}`}
                >
                  <tab.icon className="w-4 h-4" strokeWidth={active ? 2 : 1.5} />
                  <span className="text-sm font-medium">{t(tab.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          {children}
        </div>
      </main>

      {/* Bottom bar (Mobile only) */}
      <div className="md:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur border-t border-black/5 flex justify-around items-center h-16 px-2">
        <Link href="/b2b" className={`flex flex-col items-center gap-1 ${location === "/b2b" ? "text-primary" : "text-muted-foreground"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t('b2b.tabs.feed')}</span>
        </Link>
        <Link href="/b2b/projects" className={`flex flex-col items-center gap-1 ${location.startsWith("/b2b/projects") ? "text-primary" : "text-muted-foreground"}`}>
          <FolderKanban className="w-5 h-5" />
          <span className="text-[10px] font-medium">Projets</span>
        </Link>
        <Link href="/b2b/catalog" className={`flex flex-col items-center gap-1 ${location.startsWith("/b2b/catalog") ? "text-primary" : "text-muted-foreground"}`}>
          <Library className="w-5 h-5" />
          <span className="text-[10px] font-medium">Catalogue</span>
        </Link>
        <Link href="/b2b/orders" className={`flex flex-col items-center gap-1 ${location.startsWith("/b2b/orders") ? "text-primary" : "text-muted-foreground"}`}>
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-medium">Commandes</span>
        </Link>
      </div>
    </div>
  );
}
