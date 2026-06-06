import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  Lock,
  MessageSquare,
  Paperclip,
  Play,
  RotateCcw,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/contexts/AppStore";
import {
  PROJECT_STAGE_DEFS,
  blockingStageTitle,
  todayISO,
  type Project,
  type ProjectStage,
  type ProjectStageKey,
  type ProjectStageStatus,
} from "@/data/mockData";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_MIMES =
  "image/png,image/jpeg,image/webp,image/gif,application/pdf,application/zip";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function formatRelative(iso: string) {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours} h`;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

interface ParticipantSummary {
  id: string;
  name: string;
  subtitle: string;
  image?: string;
}

interface WorkflowSectionProps {
  project: Project;
  participants: ParticipantSummary[];
  currentBusinessId: string | null;
  isOwner: boolean;
}

interface StageStyle {
  pillBg: string;
  pillText: string;
  pillLabel: string;
  border: string;
  bar: string;
  dot: string;
  icon: typeof CheckCircle2;
}

function statusStyle(
  status: ProjectStageStatus,
  isDelayed: boolean,
): StageStyle {
  if (isDelayed) {
    return {
      pillBg: "bg-rose-50",
      pillText: "text-rose-700",
      pillLabel: "En retard",
      border: "border-rose-200",
      bar: "bg-rose-500",
      dot: "bg-rose-500",
      icon: Circle,
    };
  }
  switch (status) {
    case "completed":
      return {
        pillBg: "bg-emerald-50",
        pillText: "text-emerald-700",
        pillLabel: "Terminée",
        border: "border-emerald-200",
        bar: "bg-emerald-500",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };
    case "in-progress":
      return {
        pillBg: "bg-amber-50",
        pillText: "text-amber-700",
        pillLabel: "En cours",
        border: "border-amber-200",
        bar: "bg-amber-500",
        dot: "bg-amber-500",
        icon: Play,
      };
    default:
      return {
        pillBg: "bg-muted",
        pillText: "text-muted-foreground",
        pillLabel: "À démarrer",
        border: "border-black/5",
        bar: "bg-muted-foreground/30",
        dot: "bg-muted-foreground/40",
        icon: Circle,
      };
  }
}

function isStageDelayed(stage: ProjectStage, today: string): boolean {
  return (
    stage.status !== "completed" && !!stage.deadline && stage.deadline < today
  );
}

function StageCard({
  project,
  stage,
  index,
  participants,
  currentBusinessId,
  isOwner,
}: {
  project: Project;
  stage: ProjectStage;
  index: number;
  participants: ParticipantSummary[];
  currentBusinessId: string | null;
  isOwner: boolean;
}) {
  const def = PROJECT_STAGE_DEFS.find((d) => d.key === stage.key)!;
  const today = todayISO();
  const delayed = isStageDelayed(stage, today);
  const style = statusStyle(stage.status, delayed);
  const StatusIcon = style.icon;

  const {
    setStageStatus,
    setStageDeadline,
    setStageAssignees,
    addStageComment,
    addProjectFile,
    removeProjectFile,
  } = useAppStore();
  const { toast } = useToast();

  const [commentInput, setCommentInput] = useState("");
  const [assigneePopover, setAssigneePopover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAssignee =
    !!currentBusinessId && stage.assignedIds.includes(currentBusinessId);
  const canChangeStatus = isOwner || isAssignee;
  // Sequential gate: only relevant when the stage is "not-started" — at that
  // point every earlier stage must be completed before this one can be started.
  const blockingTitle =
    stage.status === "not-started" ? blockingStageTitle(project, stage.key) : null;
  const isBlocked = blockingTitle !== null;

  const stageFiles = useMemo(
    () => project.files.filter((f) => f.stageKey === stage.key),
    [project.files, stage.key],
  );

  const assignees = useMemo(
    () =>
      stage.assignedIds
        .map((id) => participants.find((p) => p.id === id))
        .filter((p): p is ParticipantSummary => !!p),
    [stage.assignedIds, participants],
  );

  const sortedComments = useMemo(
    () =>
      [...stage.comments].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      ),
    [stage.comments],
  );

  const advanceStatus = (next: ProjectStageStatus) => {
    if (!canChangeStatus) {
      toast({
        title: "Action impossible",
        description: "Seul le créateur ou un assigné peut modifier ce statut.",
        variant: "destructive",
      });
      return;
    }
    const ok = setStageStatus(project.id, stage.key, next);
    if (ok) {
      toast({
        title:
          next === "completed"
            ? `${def.title} : terminée`
            : next === "in-progress"
              ? `${def.title} : démarrée`
              : `${def.title} : à démarrer`,
      });
    }
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value || null;
    setStageDeadline(project.id, stage.key, val);
  };

  const toggleAssignee = (participantId: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...stage.assignedIds, participantId]))
      : stage.assignedIds.filter((id) => id !== participantId);
    setStageAssignees(project.id, stage.key, next);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = addStageComment(project.id, stage.key, commentInput);
    if (ok) setCommentInput("");
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
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
      stageKey: stage.key,
    });
    if (ok) {
      toast({ title: `Fichier ajouté à « ${def.title} »`, description: file.name });
    } else {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border ${style.border} shadow-sm overflow-hidden transition-all duration-300`}
      data-testid={`stage-card-${stage.key}`}
    >
      {/* Color bar */}
      <div className={`h-1.5 ${style.bar} transition-colors duration-500`} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
              Étape {index + 1}
            </p>
            <h3 className="font-serif text-lg text-foreground leading-tight mt-0.5">
              {def.title}
            </h3>
            <p className="text-[11px] text-muted-foreground font-light mt-1">
              {def.description}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1 ${style.pillBg} ${style.pillText} text-[10px] uppercase tracking-[0.16em] font-medium px-2.5 py-1 rounded-full`}
            data-testid={`stage-status-${stage.key}`}
          >
            <StatusIcon className="w-3 h-3" strokeWidth={2} />
            {style.pillLabel}
          </span>
        </div>

        {/* Deadline + Assignees row */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} />
            {isOwner ? (
              <input
                type="date"
                value={stage.deadline ?? ""}
                onChange={handleDeadlineChange}
                className="bg-transparent text-foreground border-0 p-0 text-xs font-light focus:outline-none focus:ring-0"
                data-testid={`stage-deadline-${stage.key}`}
              />
            ) : (
              <span className="font-light">
                {stage.deadline ? formatDateShort(stage.deadline) : "—"}
              </span>
            )}
            {delayed && (
              <span className="text-rose-600 font-medium">· en retard</span>
            )}
          </div>
        </div>

        {/* Assignees */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              <Users className="w-3 h-3" strokeWidth={1.75} />
              Assignés
            </div>
            {isOwner && (
              <Popover open={assigneePopover} onOpenChange={setAssigneePopover}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-[0.18em] text-primary hover:underline font-medium"
                    data-testid={`button-manage-assignees-${stage.key}`}
                  >
                    Gérer
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium px-2 pt-2 pb-1">
                    Assigner à…
                  </p>
                  <ul className="max-h-56 overflow-auto">
                    {participants.map((p) => {
                      const checked = stage.assignedIds.includes(p.id);
                      return (
                        <li key={p.id}>
                          <label className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/60 cursor-pointer">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) =>
                                toggleAssignee(p.id, v === true)
                              }
                              data-testid={`checkbox-assignee-${stage.key}-${p.id}`}
                            />
                            <Avatar className="h-6 w-6">
                              {p.image && (
                                <AvatarImage src={p.image} alt={p.name} />
                              )}
                              <AvatarFallback className="text-[9px] bg-primary/15">
                                {initials(p.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-light text-foreground truncate">
                              {p.name}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </PopoverContent>
              </Popover>
            )}
          </div>
          {assignees.length === 0 ? (
            <p className="text-[11px] text-muted-foreground font-light italic">
              Personne assigné
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {assignees.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 bg-muted/70 rounded-full pl-0.5 pr-2.5 py-0.5"
                  data-testid={`stage-assignee-chip-${stage.key}-${p.id}`}
                >
                  <Avatar className="h-5 w-5">
                    {p.image && <AvatarImage src={p.image} alt={p.name} />}
                    <AvatarFallback className="text-[8px] bg-primary/15">
                      {initials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-foreground font-light truncate max-w-[120px]">
                    {p.name}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Files */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              <Paperclip className="w-3 h-3" strokeWidth={1.75} />
              Fichiers · {stageFiles.length}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={ACCEPTED_MIMES}
              onChange={handleFilePick}
              data-testid={`input-stage-file-${stage.key}`}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] uppercase tracking-[0.18em] text-primary hover:underline font-medium"
              data-testid={`button-stage-upload-${stage.key}`}
            >
              + Ajouter
            </button>
          </div>
          {stageFiles.length === 0 ? (
            <p className="text-[11px] text-muted-foreground font-light italic">
              Aucun fichier lié
            </p>
          ) : (
            <ul className="space-y-1.5">
              {stageFiles.map((f) => {
                const isImage = f.mime.startsWith("image/");
                return (
                  <li
                    key={f.id}
                    className="group flex items-center gap-2 p-2 rounded-lg border border-black/5 hover:border-primary/30 transition-colors"
                    data-testid={`stage-file-${stage.key}-${f.id}`}
                  >
                    {isImage ? (
                      <div className="w-7 h-7 rounded-md overflow-hidden bg-muted shrink-0">
                        <img
                          src={f.url}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </div>
                    )}
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={f.name}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-xs text-foreground font-light truncate">
                        {f.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-light">
                        {formatBytes(f.size)}
                      </p>
                    </a>
                    <button
                      type="button"
                      onClick={() => removeProjectFile(project.id, f.id)}
                      className="text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      aria-label={`Supprimer ${f.name}`}
                      data-testid={`button-remove-stage-file-${f.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
            <MessageSquare className="w-3 h-3" strokeWidth={1.75} />
            Commentaires · {sortedComments.length}
          </div>
          {sortedComments.length > 0 && (
            <ul className="space-y-2 mb-3 max-h-40 overflow-auto pr-1">
              {sortedComments.map((c) => {
                const author = participants.find((p) => p.id === c.authorId);
                return (
                  <li
                    key={c.id}
                    className="flex gap-2"
                    data-testid={`stage-comment-${c.id}`}
                  >
                    <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                      {author?.image && (
                        <AvatarImage src={author.image} alt={author.name} />
                      )}
                      <AvatarFallback className="text-[8px] bg-primary/15">
                        {initials(author?.name ?? "??")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 bg-muted/40 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-medium text-foreground truncate">
                          {author?.name ?? "Membre"}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-light shrink-0">
                          {formatRelative(c.createdAt)}
                        </p>
                      </div>
                      <p className="text-xs text-foreground font-light whitespace-pre-wrap break-words">
                        {c.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <form onSubmit={handleAddComment} className="flex items-center gap-1.5">
            <Input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Ajouter une note…"
              className="rounded-full bg-muted border-transparent focus-visible:bg-background h-8 text-xs"
              data-testid={`input-stage-comment-${stage.key}`}
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="rounded-full h-8 px-3 text-[11px]"
              disabled={commentInput.trim().length === 0}
              data-testid={`button-stage-comment-${stage.key}`}
            >
              Envoyer
            </Button>
          </form>
        </div>

        {/* Action buttons */}
        <div className="mt-auto pt-2 border-t border-black/5 flex items-center gap-2">
          {stage.status === "not-started" && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full gap-1.5 flex-1"
              onClick={() => {
                if (isBlocked) {
                  toast({
                    title: "Étape verrouillée",
                    description: `Terminez d'abord l'étape « ${blockingTitle} ».`,
                    variant: "destructive",
                  });
                  return;
                }
                advanceStatus("in-progress");
              }}
              disabled={!canChangeStatus || isBlocked}
              title={
                isBlocked
                  ? `Terminez d'abord l'étape « ${blockingTitle} »`
                  : undefined
              }
              data-testid={`button-stage-start-${stage.key}`}
            >
              {isBlocked ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              {isBlocked ? "Verrouillée" : "Démarrer"}
            </Button>
          )}
          {stage.status === "in-progress" && (
            <Button
              size="sm"
              className="rounded-full gap-1.5 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => advanceStatus("completed")}
              disabled={!canChangeStatus}
              data-testid={`button-stage-complete-${stage.key}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marquer terminée
            </Button>
          )}
          {stage.status === "completed" && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full gap-1.5 flex-1"
              onClick={() => advanceStatus("in-progress")}
              disabled={!canChangeStatus}
              data-testid={`button-stage-reopen-${stage.key}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réouvrir
            </Button>
          )}
          {stage.status !== "not-started" && (
            <button
              type="button"
              onClick={() => advanceStatus("not-started")}
              disabled={!canChangeStatus}
              className="text-muted-foreground/70 hover:text-destructive disabled:opacity-30 transition-colors p-1"
              aria-label="Réinitialiser l'étape"
              data-testid={`button-stage-reset-${stage.key}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowSection({
  project,
  participants,
  currentBusinessId,
  isOwner,
}: WorkflowSectionProps) {
  // Sort stages to match canonical PROJECT_STAGE_DEFS order.
  const orderedStages = useMemo(() => {
    return PROJECT_STAGE_DEFS.map(
      (def) => project.stages.find((s) => s.key === def.key)!,
    ).filter(Boolean);
  }, [project.stages]);

  const completedCount = orderedStages.filter(
    (s) => s.status === "completed",
  ).length;
  const totalCount = orderedStages.length;
  const progressPct =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <section
      className="bg-white rounded-2xl shadow-sm border border-black/5 p-7"
      data-testid="section-workflow"
    >
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          <ChevronRight
            className="w-4 h-4 text-primary"
            strokeWidth={1.5}
          />
          <h2 className="font-serif text-lg text-foreground">
            Workflow
          </h2>
          <span className="text-xs text-muted-foreground font-light ml-1">
            · {completedCount}/{totalCount} étapes terminées
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
          {progressPct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%` }}
          data-testid="workflow-progress-bar"
        />
      </div>

      {/* Stage timeline (mini) */}
      <div className="hidden md:flex items-center gap-2 mb-6">
        {orderedStages.map((stage, idx) => {
          const today = todayISO();
          const delayed = isStageDelayed(stage, today);
          const style = statusStyle(stage.status, delayed);
          return (
            <div key={stage.key} className="flex items-center gap-2 flex-1">
              <div
                className={`w-2.5 h-2.5 rounded-full ${style.dot} shrink-0 transition-colors duration-300`}
              />
              <span className="text-[11px] text-muted-foreground font-light truncate flex-1">
                {PROJECT_STAGE_DEFS[idx]?.title}
              </span>
              {idx < orderedStages.length - 1 && (
                <div className="h-px bg-black/10 flex-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {orderedStages.map((stage, idx) => (
          <StageCard
            key={stage.key}
            project={project}
            stage={stage}
            index={idx}
            participants={participants}
            currentBusinessId={currentBusinessId}
            isOwner={isOwner}
          />
        ))}
      </div>

      {!isOwner && (
        <p className="text-[11px] text-muted-foreground font-light text-center mt-5">
          Seul le créateur peut modifier les échéances et les assignations.
          Vous pouvez mettre à jour le statut des étapes qui vous sont
          assignées.
        </p>
      )}
    </section>
  );
}

// Helper exported in case parent needs it:
export function getProjectStageDef(key: ProjectStageKey) {
  return PROJECT_STAGE_DEFS.find((d) => d.key === key);
}
