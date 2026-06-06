import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  FolderOpen,
  Plus,
  Users,
} from "lucide-react";
import B2BPage from "@/components/b2b/B2BPage";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import {
  deriveProjectStatus,
  getDesignerById,
  opportunityRoleLabels,
  type Project,
  type ProjectStatus,
} from "@/data/mockData";
import type { BusinessRole } from "@/contexts/AppStore";

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const config =
    status === "completed"
      ? {
          icon: CheckCircle2,
          label: "Terminé",
          cls: "bg-emerald-50 text-emerald-700",
        }
      : status === "delayed"
        ? {
            icon: AlertCircle,
            label: "En retard",
            cls: "bg-rose-50 text-rose-700",
          }
        : {
            icon: CircleDot,
            label: "Actif",
            cls: "bg-amber-50 text-amber-700",
          };
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 ${config.cls} text-[10px] uppercase tracking-[0.18em] font-medium px-2.5 py-1 rounded-full`}
      data-testid={`pill-status-${status}`}
    >
      <Icon className="w-3 h-3" strokeWidth={2} />
      {config.label}
    </span>
  );
}

function ProjectCard({
  project,
  isOwner,
  myRole,
}: {
  project: Project;
  isOwner: boolean;
  myRole: BusinessRole | null;
}) {
  const status = deriveProjectStatus(project);
  const completedCount = project.stages.filter(
    (s) => s.status === "completed",
  ).length;
  const totalStages = project.stages.length || 1;
  const pct = Math.round((completedCount / totalStages) * 100);

  // Build collaborator chips (max 3 visible, +N for the rest).
  const otherIds = project.participantIds.slice(0, 4);
  const collaboratorNames = otherIds
    .map((id) => getDesignerById(id)?.name ?? "Vous")
    .slice(0, 3);
  const extra = project.participantIds.length - collaboratorNames.length;

  return (
    <Link
      href={`/b2b/projects/${project.id}`}
      data-testid={`card-project-${project.id}`}
      className="group block bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-serif text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <StatusPill status={status} />
      </div>

      <div className="text-xs text-muted-foreground font-light mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1">
          <Users className="w-3 h-3" />
          {project.participantIds.length} collaborateur
          {project.participantIds.length > 1 ? "s" : ""}
        </span>
        <span>·</span>
        <span>
          Échéance&nbsp;
          <span className="text-foreground/80">
            {formatDate(project.deadline)}
          </span>
        </span>
        {isOwner && (
          <>
            <span>·</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-primary">
              Créateur
            </span>
          </>
        )}
        {myRole && (
          <>
            <span>·</span>
            <span
              className="text-[10px] uppercase tracking-[0.18em] bg-foreground/5 text-foreground/70 px-2 py-0.5 rounded-full"
              data-testid={`chip-myrole-${project.id}`}
            >
              Vous : {opportunityRoleLabels[myRole]}
            </span>
          </>
        )}
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>Avancement</span>
          <span className="text-foreground/80">
            {completedCount}/{totalStages} étapes
          </span>
        </div>
        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
            data-testid={`progress-${project.id}`}
          />
        </div>
      </div>

      {collaboratorNames.length > 0 && (
        <p className="text-xs text-muted-foreground font-light truncate">
          {collaboratorNames.join(", ")}
          {extra > 0 && ` + ${extra} autre${extra > 1 ? "s" : ""}`}
        </p>
      )}
    </Link>
  );
}

export default function B2BProjects() {
  const { projects, currentBusinessId, user } = useAppStore();
  const [, navigate] = useLocation();
  const myRole: BusinessRole | null =
    user?.type === "business" ? user.role : null;

  // Show every project where the user is a participant (owner OR collaborator).
  const myProjects = useMemo(
    () =>
      currentBusinessId
        ? projects.filter((p) => p.participantIds.includes(currentBusinessId))
        : [],
    [projects, currentBusinessId],
  );

  const ownedCount = myProjects.filter(
    (p) => p.ownerId === currentBusinessId,
  ).length;

  return (
    <B2BPage>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
            Project Integration
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-1">
            Mes projets
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {myProjects.length === 0
              ? "Vous n'êtes membre d'aucun projet pour l'instant."
              : `${myProjects.length} projet${myProjects.length > 1 ? "s" : ""} · ${ownedCount} en tant que créateur`}
          </p>
        </header>

        {myProjects.length === 0 ? (
          <div
            className="bg-white rounded-2xl border border-dashed border-black/10 p-10 text-center"
            data-testid="empty-projects"
          >
            <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-serif text-lg text-foreground mb-1">
              Aucun projet pour le moment
            </p>
            <p className="text-sm text-muted-foreground font-light max-w-md mx-auto mb-5">
              Démarrez un projet en convertissant une conversation depuis l'onglet
              Messages — ou attendez qu'un partenaire vous y invite.
            </p>
            <Button
              onClick={() => navigate("/b2b/messages")}
              className="rounded-full"
              data-testid="button-go-messages"
            >
              <Plus className="w-4 h-4 mr-2" />
              Convertir une conversation
            </Button>
          </div>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="grid-projects"
          >
            {myProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                isOwner={p.ownerId === currentBusinessId}
                myRole={myRole}
              />
            ))}
          </div>
        )}
      </div>
    </B2BPage>
  );
}
