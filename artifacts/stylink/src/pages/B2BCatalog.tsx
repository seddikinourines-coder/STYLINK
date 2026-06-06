import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import B2BPage from "@/components/b2b/B2BPage";
import { useAppStore, type BusinessRole } from "@/contexts/AppStore";
import {
  mockDesigners,
  type Designer,
  type DesignerType,
} from "@/data/mockData";

interface CatalogSection {
  eyebrow: string;
  title: string;
  intro: string;
  href: string;
  items: Designer[];
}

function pickByType(type: DesignerType, count = 6): Designer[] {
  return mockDesigners.filter((d) => d.type === type).slice(0, count);
}

function sectionsForRole(role: BusinessRole): CatalogSection[] {
  const designers = pickByType("Designer");
  const ateliers = pickByType("Atelier");
  const fabrics = pickByType("Fournisseur");
  const boutiques = pickByType("Boutique");

  switch (role) {
    case "boutique":
      return [
        {
          eyebrow: "Designers",
          title: "Talents à sourcer",
          intro:
            "Découvrez les créateurs algériens dont vous pouvez distribuer les collections.",
          href: "/designers",
          items: designers,
        },
        {
          eyebrow: "Ateliers",
          title: "Production sur mesure",
          intro:
            "Confiez vos productions à nos ateliers partenaires sélectionnés.",
          href: "/ateliers",
          items: ateliers,
        },
        {
          eyebrow: "Tissus",
          title: "Matières premières",
          intro:
            "Sourcez des tissus d'exception pour vos collections privées.",
          href: "/fabric-retailers",
          items: fabrics,
        },
      ];
    case "designer":
      return [
        {
          eyebrow: "Ateliers",
          title: "Vos partenaires de production",
          intro:
            "Trouvez l'atelier idéal pour donner vie à vos collections.",
          href: "/ateliers",
          items: ateliers,
        },
        {
          eyebrow: "Tissus",
          title: "Matières & fournisseurs",
          intro:
            "Sélectionnez vos matières premières auprès de spécialistes.",
          href: "/fabric-retailers",
          items: fabrics,
        },
        {
          eyebrow: "Boutiques",
          title: "Distribuez vos collections",
          intro:
            "Identifiez les boutiques qui pourraient porter votre univers.",
          href: "/directory",
          items: boutiques,
        },
      ];
    case "atelier":
      return [
        {
          eyebrow: "Designers",
          title: "Créateurs à servir",
          intro:
            "Mettez votre savoir-faire au service des designers algériens.",
          href: "/designers",
          items: designers,
        },
        {
          eyebrow: "Tissus",
          title: "Vos fournisseurs de matières",
          intro:
            "Maintenez à jour vos sources de tissus pour vos productions.",
          href: "/fabric-retailers",
          items: fabrics,
        },
      ];
    case "fabric-retailer":
      return [
        {
          eyebrow: "Designers",
          title: "Vos clients créateurs",
          intro:
            "Les designers qui pourraient adopter vos matières d'exception.",
          href: "/designers",
          items: designers,
        },
        {
          eyebrow: "Ateliers",
          title: "Ateliers en sourcing",
          intro:
            "Les ateliers à la recherche de matières premières de qualité.",
          href: "/ateliers",
          items: ateliers,
        },
      ];
  }
}

export default function B2BCatalog() {
  const { user } = useAppStore();
  if (!user || user.type !== "business") {
    return <B2BPage>{null}</B2BPage>;
  }

  const sections = sectionsForRole(user.role);

  return (
    <B2BPage>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2 font-medium">
            Sourcing
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            Catalogue B2B
          </h2>
          <p className="text-muted-foreground font-light mt-3 max-w-2xl">
            Une sélection des partenaires de la plateforme adaptée à votre rôle
            — designers, ateliers, fournisseurs de tissus et boutiques.
          </p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.eyebrow}
              className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8"
            >
              <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2 font-medium">
                    {section.eyebrow}
                  </p>
                  <h3 className="font-serif text-2xl text-foreground">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light mt-1 max-w-xl">
                    {section.intro}
                  </p>
                </div>
                <Link
                  href={section.href}
                  data-testid={`link-explore-${section.eyebrow.toLowerCase()}`}
                  className="text-xs uppercase tracking-[0.2em] text-foreground hover:text-primary inline-flex items-center gap-2 whitespace-nowrap font-medium"
                >
                  Tout explorer <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {section.items.map((item) => (
                  <article
                    key={item.id}
                    data-testid={`catalog-card-${item.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-muted rounded-2xl mb-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h4 className="font-serif text-lg text-foreground leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 font-light line-clamp-2">
                      {item.specialty}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-2">
                      {item.city}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </B2BPage>
  );
}
