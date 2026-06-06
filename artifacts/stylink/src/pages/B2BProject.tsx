import { useMemo, useRef, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock,
  FileText,
  FolderKanban,
  ListChecks,
  MessageCircle,
  Paperclip,
  Plus,
  Trash2,
  UserPlus2,
  Users,
} from "lucide-react";
import B2BPage from "@/components/b2b/B2BPage";
import NetworkSelectorDialog from "@/components/b2b/NetworkSelectorDialog";
import WorkflowSection from "@/components/b2b/WorkflowSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/contexts/AppStore";
import { deriveProjectStatus, getDesignerById } from "@/data/mockData";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const ACCEPTED_MIMES =
  "image/png,image/jpeg,image/webp,image/gif,application/pdf,application/zip";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function B2BProject() {
  const [, params] = useRoute<{ id: string }>("/b2b/projects/:id");
  const {
    getProjectById,
    currentBusinessId,
    user,
    addProjectParticipant,
    addProjectFile,
    removeProjectFile,
    addProjectTask,
    toggleProjectTask,
    removeProjectTask,
    setProjectDeadline,
  } = useAppStore();
  const { toast } = useToast();
  const project = params?.id ? getProjectById(params.id) : undefined;

  const [networkOpen, setNetworkOpen] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const meName =
    user?.type === "business" ? user.brandName : user?.name ?? "Vous";

  const participants = useMemo(() => {
    if (!project) return [];
    return project.participantIds.map((id) => {
      if (id === currentBusinessId) {
        return {
          id,
          name: meName,
          subtitle:
            user?.type === "business"
              ? `${user.role === "designer" ? "Designer" : user.role === "atelier" ? "Atelier" : user.role === "boutique" ? "Boutique" : "Tissus"} · ${user.city}`
              : "Vous",
          image: undefined as string | undefined,
        };
      }
      const designer = getDesignerById(id);
      return {
        id,
        name: designer?.name ?? id,
        subtitle: designer
          ? `${designer.type} · ${designer.city}`
          : "Compte business",
        image: designer?.image,
      };
    });
  }, [project, currentBusinessId, meName, user]);

  // Read authorization: only project participants can view full project content.
  // We deliberately render the same "introuvable" view for both missing and
  // unauthorized projects to avoid leaking the existence of other users' projects.
  const canRead =
    !!project &&
    currentBusinessId !== null &&
    project.participantIds.includes(currentBusinessId);

  const projectStatus = useMemo(
    () => (project ? deriveProjectStatus(project) : null),
    [project],
  );

  if (!project || !canRead) {
    return (
      <B2BPage>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-12 text-center">
          <FolderKanban
            className="w-8 h-8 mx-auto text-muted-foreground mb-4"
            strokeWidth={1.25}
          />
          <h1 className="font-serif text-2xl text-foreground mb-2">
            Projet introuvable
          </h1>
          <p className="text-sm text-muted-foreground font-light mb-6">
            Le projet que vous cherchez n'existe pas ou ne vous est pas
            accessible.
          </p>
          <Link href="/b2b/messages">
            <Button
              variant="outline"
              className="rounded-full"
              data-testid="button-back-messages"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux messages
            </Button>
          </Link>
        </div>
      </B2BPage>
    );
  }

  const isOwner = project.ownerId === currentBusinessId;
  const isParticipant = true; // canRead implies participant
  const partner = participants.find((p) => p.id !== currentBusinessId);

  const completedCount = project.tasks.filter((t) => t.done).length;

  const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 8 Mo.",
        variant: "destructive",
      });
      return;
    }
    const url = URL.createObjectURL(file);
    const ok = addProjectFile(project.id, {
      name: file.name,
      url,
      size: file.size,
      mime: file.type || "application/octet-stream",
    });
    if (ok) {
      toast({
        title: "Fichier ajouté",
        description: file.name,
      });
    } else {
      URL.revokeObjectURL(url);
      toast({
        title: "Action impossible",
        description: "Vous devez être participant du projet.",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = (event: React.FormEvent) => {
    event.preventDefault();
    const ok = addProjectTask(project.id, taskInput);
    if (ok) {
      setTaskInput("");
    } else if (taskInput.trim().length === 0) {
      // ignore — empty
    } else {
      toast({
        title: "Action impossible",
        description: "Vous devez être participant du projet.",
        variant: "destructive",
      });
    }
  };

  return (
    <B2BPage>
      <div className="space-y-6 max-w-5xl">
        {/* Back link */}
        <Link
          href="/b2b/messages"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
          data-testid="link-back-messages"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Messages
        </Link>

        {/* Header card */}
        <header
          className="bg-white rounded-2xl shadow-sm border border-black/5 p-8"
          data-testid={`project-header-${project.id}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FolderKanban className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-medium">
                  Projet
                </p>
                <ProjectStatusPill status={projectStatus!} />
              </div>
              <h1
                className="font-serif text-3xl text-foreground leading-tight"
                data-testid="text-project-name"
              >
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-light mt-3">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Créé le {formatDate(project.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {participants.length} collaborateurs
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Échéance :
                  {isOwner ? (
                    <input
                      type="date"
                      value={project.deadline ?? ""}
                      onChange={(e) =>
                        setProjectDeadline(project.id, e.target.value || null)
                      }
                      className="bg-transparent text-foreground border-0 p-0 text-xs font-light focus:outline-none focus:ring-0"
                      data-testid="input-project-deadline"
                    />
                  ) : (
                    <span className="text-foreground">
                      {project.deadline
                        ? formatDate(project.deadline)
                        : "Non définie"}
                    </span>
                  )}
                </span>
              </div>
            </div>
            {partner && (
              <Link
                href={`/b2b/messages?with=${encodeURIComponent(partner.id)}`}
              >
                <Button
                  variant="outline"
                  className="rounded-full gap-2"
                  data-testid="button-open-chat"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ouvrir le chat
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Two-column dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collaborators */}
          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-7 lg:col-span-1">
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <Users
                  className="w-4 h-4 text-primary"
                  strokeWidth={1.5}
                />
                <h2 className="font-serif text-lg text-foreground">
                  Collaborateurs
                </h2>
              </div>
              <span className="text-xs text-muted-foreground font-light">
                {participants.length}
              </span>
            </div>
            <ul className="space-y-2.5 mb-4">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-black/5"
                  data-testid={`project-participant-${p.id}`}
                >
                  <Avatar className="h-10 w-10">
                    {p.image && <AvatarImage src={p.image} alt={p.name} />}
                    <AvatarFallback className="text-[11px] bg-primary/15">
                      {initials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-light truncate">
                      {p.subtitle}
                    </p>
                  </div>
                  {p.id === project.ownerId && (
                    <span className="text-[9px] uppercase tracking-[0.18em] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Créateur
                    </span>
                  )}
                  {p.id !== currentBusinessId && (
                    <Link
                      href={`/b2b/messages?with=${encodeURIComponent(p.id)}`}
                      className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      data-testid={`button-message-participant-${p.id}`}
                      aria-label={`Message ${p.name}`}
                    >
                      <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {isOwner ? (
              <Button
                variant="outline"
                className="w-full rounded-full gap-2"
                onClick={() => setNetworkOpen(true)}
                data-testid="button-add-collaborator"
              >
                <UserPlus2 className="w-4 h-4" />
                Ajouter un collaborateur
              </Button>
            ) : (
              <p className="text-[11px] text-muted-foreground font-light text-center">
                Seul le créateur peut ajouter des membres.
              </p>
            )}
          </section>

          {/* Files + Tasks (right column, 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Files */}
            <section
              className="bg-white rounded-2xl shadow-sm border border-black/5 p-7"
              data-testid="section-files"
            >
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <Paperclip
                    className="w-4 h-4 text-primary"
                    strokeWidth={1.5}
                  />
                  <h2 className="font-serif text-lg text-foreground">
                    Fichiers
                  </h2>
                  <span className="text-xs text-muted-foreground font-light ml-1">
                    · {project.files.length}
                  </span>
                </div>
                {isParticipant && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept={ACCEPTED_MIMES}
                      onChange={handleFilePick}
                      data-testid="input-project-file"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-1.5 h-8"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload-file"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter
                    </Button>
                  </>
                )}
              </div>

              {project.files.length === 0 ? (
                <div className="border border-dashed border-black/10 rounded-xl py-10 text-center">
                  <FileText
                    className="w-7 h-7 mx-auto text-muted-foreground/50 mb-3"
                    strokeWidth={1.25}
                  />
                  <p className="text-sm text-foreground font-serif mb-1">
                    Aucun fichier partagé
                  </p>
                  <p className="text-xs text-muted-foreground font-light">
                    Ajoutez briefs, tech packs, moodboards (≤ 8 Mo).
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.files.map((f) => {
                    const isImage = f.mime.startsWith("image/");
                    return (
                      <li
                        key={f.id}
                        className="group relative border border-black/5 rounded-xl overflow-hidden bg-muted/30 hover:border-primary/30 transition-colors"
                        data-testid={`project-file-${f.id}`}
                      >
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={f.name}
                          className="flex items-center gap-3 p-3"
                        >
                          {isImage ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                              <img
                                src={f.url}
                                alt={f.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <FileText
                                className="w-5 h-5"
                                strokeWidth={1.5}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-sm text-foreground truncate">
                              {f.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-light">
                              {formatBytes(f.size)}
                              {isImage ? " · Image" : " · Document"}
                            </p>
                          </div>
                        </a>
                        {isParticipant && (
                          <button
                            type="button"
                            onClick={() => removeProjectFile(project.id, f.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 border border-black/10 text-muted-foreground hover:text-destructive hover:border-destructive/40 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center"
                            aria-label={`Supprimer ${f.name}`}
                            data-testid={`button-remove-file-${f.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Tasks */}
            <section
              className="bg-white rounded-2xl shadow-sm border border-black/5 p-7"
              data-testid="section-tasks"
            >
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <ListChecks
                    className="w-4 h-4 text-primary"
                    strokeWidth={1.5}
                  />
                  <h2 className="font-serif text-lg text-foreground">
                    Tâches
                  </h2>
                  <span className="text-xs text-muted-foreground font-light ml-1">
                    · {completedCount}/{project.tasks.length}
                  </span>
                </div>
              </div>

              {isParticipant && (
                <form
                  onSubmit={handleAddTask}
                  className="flex items-center gap-2 mb-4"
                >
                  <Input
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Ajouter une tâche…"
                    className="rounded-full bg-muted border-transparent focus-visible:bg-background"
                    data-testid="input-new-task"
                  />
                  <Button
                    type="submit"
                    className="rounded-full gap-1.5 shrink-0"
                    disabled={taskInput.trim().length === 0}
                    data-testid="button-add-task"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                </form>
              )}

              {project.tasks.length === 0 ? (
                <div className="border border-dashed border-black/10 rounded-xl py-10 text-center">
                  <CheckCircle2
                    className="w-7 h-7 mx-auto text-muted-foreground/50 mb-3"
                    strokeWidth={1.25}
                  />
                  <p className="text-sm text-foreground font-serif mb-1">
                    Aucune tâche
                  </p>
                  <p className="text-xs text-muted-foreground font-light">
                    Listez les prochaines étapes du projet.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {project.tasks.map((t) => (
                    <li
                      key={t.id}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-black/5 hover:border-primary/30 transition-colors"
                      data-testid={`project-task-${t.id}`}
                    >
                      <Checkbox
                        checked={t.done}
                        onCheckedChange={() =>
                          toggleProjectTask(project.id, t.id)
                        }
                        disabled={!isParticipant}
                        data-testid={`checkbox-task-${t.id}`}
                      />
                      <span
                        className={`flex-1 text-sm font-light ${
                          t.done
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {t.title}
                      </span>
                      {isParticipant && (
                        <button
                          type="button"
                          onClick={() => removeProjectTask(project.id, t.id)}
                          className="text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Supprimer ${t.title}`}
                          data-testid={`button-remove-task-${t.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        {/* Workflow / Traffic tracker — full width below the dashboard */}
        <WorkflowSection
          project={project}
          participants={participants}
          currentBusinessId={currentBusinessId}
          isOwner={isOwner}
        />
      </div>

      <NetworkSelectorDialog
        open={networkOpen}
        onOpenChange={setNetworkOpen}
        existingParticipantIds={project.participantIds}
        onAdd={(designerId) => {
          const ok = addProjectParticipant(project.id, designerId);
          if (ok) {
            toast({
              title: "Collaborateur ajouté",
              description:
                getDesignerById(designerId)?.name ?? "Membre du réseau",
            });
          }
          return ok;
        }}
      />
    </B2BPage>
  );
}

function ProjectStatusPill({
  status,
}: {
  status: "active" | "completed" | "delayed";
}) {
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
      className={`inline-flex items-center gap-1 ${config.cls} text-[10px] uppercase tracking-[0.18em] font-medium px-2.5 py-1 rounded-full transition-colors duration-300`}
      data-testid={`project-status-pill-${status}`}
    >
      <Icon className="w-3 h-3" strokeWidth={2} />
      {config.label}
    </span>
  );
}
