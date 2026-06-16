import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Heart, User, ShoppingBag, Briefcase, LogOut, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthDialog from "@/components/AuthDialog";
import { useAppStore } from "@/contexts/AppStore";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut, cartCount } = useAppStore();
  const overHero = location === "/";
  const isBusiness = user?.type === "business";

  const navItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.boutiques"), href: "/boutiques" },
    { label: t("nav.designers"), href: "/designers" },
    { label: t("nav.ateliers"), href: "/ateliers" },
    { label: t("nav.fabric_retailers"), href: "/fabric-retailers" },
    { label: t("nav.about"), href: "/about" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = overHero && !scrolled;

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,color] duration-500 ease-out ${
          transparent
            ? "bg-transparent backdrop-blur-0 border-b border-transparent text-white"
            : "bg-background/90 backdrop-blur-md border-b border-border/50 text-foreground"
        }`}
      >
        <div className="px-4 md:px-8 pt-5 pb-3 max-w-[1400px] mx-auto">
          {/* Top row: logo centered, icons right */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-3">
            <div className="flex items-center gap-1 md:gap-2 justify-self-start">
               {/* Language Switcher on the left */}
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 text-current hover:text-primary transition-colors flex items-center gap-1.5"
                    aria-label="Change language"
                  >
                    <Globe className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-widest font-sans hidden sm:inline">
                      {i18n.language.toUpperCase()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
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
            </div>
            
            <Link
              href="/"
              className="justify-self-center"
              data-testid="link-home-logo"
            >
              <span
                className="text-2xl md:text-3xl uppercase select-none"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                STYLINK
              </span>
            </Link>

            {/* Icons — left to right: B2B (business only), Heart, Bag, User (extreme right) */}
            <div className="flex items-center gap-1 md:gap-2 justify-self-end">
              {isBusiness && (
                <Link
                  href="/b2b"
                  className="p-2 text-current hover:text-primary transition-colors"
                  data-testid="link-b2b"
                  aria-label="Espace B2B"
                  title="Espace B2B"
                >
                  <Briefcase className="w-5 h-5" strokeWidth={1.5} />
                </Link>
              )}

              {!isBusiness && (
                <>
                  <Link
                    href="/favorites"
                    className="p-2 text-current hover:text-primary transition-colors"
                    data-testid="link-favorites"
                    aria-label="Favoris"
                    title="Favoris"
                  >
                    <Heart className="w-5 h-5" strokeWidth={1.5} />
                  </Link>

                  <Link
                    href="/cart"
                    className="p-2 text-current hover:text-primary transition-colors relative"
                    data-testid="link-cart"
                    aria-label="Panier"
                    title="Panier"
                  >
                    <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                    {cartCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center"
                        data-testid="badge-cart-count"
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Extreme right: Sign up / Sign in */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-2 text-current hover:text-primary transition-colors"
                      data-testid="button-account-menu"
                      aria-label="Mon compte"
                    >
                      <User className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-serif">
                      <span>{user.type === "client" ? user.name : user.brandName}</span>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans mt-1">
                        {user.type === "client" ? t("account.client") : t("account.business")}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" data-testid="menu-profile">
                        <User className="w-4 h-4 mr-2" /> {t("account.my_profile")}
                      </Link>
                    </DropdownMenuItem>
                    {isBusiness && (
                      <DropdownMenuItem asChild>
                        <Link href="/b2b" data-testid="menu-b2b">
                          <Briefcase className="w-4 h-4 mr-2" /> Espace B2B
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {!isBusiness && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/favorites" data-testid="menu-favorites">
                            <Heart className="w-4 h-4 mr-2" /> {t("account.my_favorites")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/cart" data-testid="menu-cart">
                            <ShoppingBag className="w-4 h-4 mr-2" /> {t("account.my_cart")}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => signOut()}
                      data-testid="menu-signout"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> {t("account.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="p-2 text-current hover:text-primary transition-colors"
                  data-testid="button-signup"
                  aria-label="S'inscrire ou se connecter"
                  title="S'inscrire / Se connecter"
                >
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          {/* Bottom row: horizontal nav links under STYLINK */}
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex items-center justify-center gap-x-3 sm:gap-x-5 md:gap-x-7 lg:gap-x-9 whitespace-nowrap min-w-max mx-auto w-fit">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`text-[10px] md:text-[11px] uppercase tracking-[0.14em] md:tracking-[0.18em] lg:tracking-[0.22em] font-sans font-medium transition-colors py-1 border-b whitespace-nowrap ${
                        active
                          ? "border-current text-current"
                          : "border-transparent text-current/80 hover:text-current"
                      }`}
                      data-testid={`link-nav-${item.href.replace(/\W+/g, "-")}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
