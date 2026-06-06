import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch } from "wouter";
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  Star,
  X,
} from "lucide-react";
import {
  mockConversations,
  getDesignerById,
  type Conversation,
  type Message,
  type MessageAttachment,
} from "@/data/mockData";
import { useB2BShell } from "@/components/b2b/B2BShellContext";
import { useAppStore } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";
import ConvertToProjectDialog from "@/components/b2b/ConvertToProjectDialog";

const COLLAB_PREFILL =
  "Bonjour, votre publication a retenu mon attention — je serais ravi(e) d'échanger autour d'une collaboration. Quand seriez-vous disponible ?";

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8 MB cap for previews
const ACCEPTED_TYPES = "image/*,application/pdf,.pdf,.ai,.psd,.zip";

const ROLE_LABELS: Record<string, string> = {
  Designer: "Designer",
  Atelier: "Atelier",
  Tisseur: "Tisseur · Fournisseur",
  Boutique: "Boutique",
};

function opportunityPrefill(title?: string) {
  if (title) {
    return `Bonjour, je vous contacte au sujet de votre annonce « ${title} ». Pouvons-nous échanger pour en discuter plus en détail ?`;
  }
  return "Bonjour, je vous contacte au sujet de votre annonce. Pouvons-nous échanger pour en discuter plus en détail ?";
}

function nowTimestamp() {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function MessagesTab() {
  const { search } = useB2BShell();
  const queryString = useSearch();
  const { opportunities } = useAppStore();
  const { toast } = useToast();

  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string>(
    mockConversations[0]?.id ?? "",
  );
  const [draft, setDraft] = useState("");
  const [pendingAttachment, setPendingAttachment] =
    useState<MessageAttachment | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const lastHandledQueryRef = useRef<string>("");
  const threadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React to URL query params: ?with=<designerId>&context=collaborate
  useEffect(() => {
    if (!queryString) return;
    if (queryString === lastHandledQueryRef.current) return;
    const params = new URLSearchParams(queryString);
    const withId = params.get("with");
    if (!withId) return;
    const designer = getDesignerById(withId);
    if (!designer) return;

    const intent = params.get("context");
    lastHandledQueryRef.current = queryString;

    setConversations((prev) => {
      const existing = prev.find((c) => c.designerId === withId);
      if (existing) {
        setActiveId(existing.id);
        return prev;
      }
      const newConv: Conversation = {
        id: `conv-${withId}-${Date.now()}`,
        designerId: withId,
        lastMessage:
          intent === "collaborate"
            ? "Demande de collaboration — brouillon"
            : "Nouvelle conversation",
        lastTimestamp: nowTimestamp(),
        unread: 0,
        messages: [],
      };
      setActiveId(newConv.id);
      return [newConv, ...prev];
    });

    if (intent === "collaborate") {
      setDraft(COLLAB_PREFILL);
    } else if (intent === "opportunity") {
      const oppId = params.get("opp");
      const opp = oppId ? opportunities.find((o) => o.id === oppId) : undefined;
      setDraft(opportunityPrefill(opp?.title));
    } else {
      setDraft("");
    }
  }, [queryString, opportunities]);

  const filteredConvs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const designer = getDesignerById(c.designerId);
      return (
        (designer?.name.toLowerCase().includes(q) ?? false) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [conversations, search]);

  const active = conversations.find((c) => c.id === activeId);
  const activeDesigner = active ? getDesignerById(active.designerId) : undefined;

  // Auto-scroll thread to bottom on new message / conversation switch.
  useEffect(() => {
    const node = threadRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [activeId, active?.messages.length]);

  // Reset draft + pending file when switching conversations.
  useEffect(() => {
    setPendingAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [activeId]);

  function handlePickFile(file: File) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille maximale est de ${formatBytes(MAX_ATTACHMENT_BYTES)}.`,
        variant: "destructive",
      });
      return;
    }
    const isImage = file.type.startsWith("image/");
    const url = URL.createObjectURL(file);
    setPendingAttachment({
      kind: isImage ? "image" : "file",
      url,
      name: file.name,
      size: file.size,
      mime: file.type,
    });
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handlePickFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function clearPendingAttachment() {
    if (pendingAttachment?.url.startsWith("blob:")) {
      URL.revokeObjectURL(pendingAttachment.url);
    }
    setPendingAttachment(null);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    const text = draft.trim();
    if (!text && !pendingAttachment) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender: "me",
      text,
      timestamp: nowTimestamp(),
      attachment: pendingAttachment ?? undefined,
    };
    const previewLast = pendingAttachment
      ? text || `📎 ${pendingAttachment.name}`
      : text;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: previewLast,
              lastTimestamp: newMsg.timestamp,
            }
          : c,
      ),
    );
    setDraft("");
    setPendingAttachment(null);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-medium mb-2">
          Vos échanges
        </p>
        <h2 className="font-serif text-3xl text-foreground">Messages</h2>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[600px]">
        {/* Conversation list */}
        <aside className="border-b md:border-b-0 md:border-r border-black/5 overflow-y-auto max-h-[600px]">
          {filteredConvs.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground font-light">
              Aucune conversation pour cette recherche.
            </p>
          )}
          {filteredConvs.map((c) => {
            const designer = getDesignerById(c.designerId);
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-4 border-b border-black/5 transition-colors ${
                  isActive ? "bg-primary/5" : "hover:bg-muted/40"
                }`}
                data-testid={`button-conversation-${c.id}`}
              >
                <div className="flex items-center gap-3">
                  {designer && (
                    <img
                      src={designer.image}
                      alt={designer.name}
                      className="w-11 h-11 object-cover rounded-full"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-serif text-sm text-foreground truncate">
                        {designer?.name ?? "Conversation"}
                      </p>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground ml-2 shrink-0">
                        {c.lastTimestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-light truncate">
                      {c.lastMessage}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </aside>

        {/* Active thread */}
        <div className="flex flex-col min-h-[600px]">
          {active && activeDesigner ? (
            <>
              <header className="p-4 border-b border-black/5 flex items-center gap-3">
                <img
                  src={activeDesigner.image}
                  alt={activeDesigner.name}
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-serif text-base truncate"
                    data-testid="text-active-designer"
                  >
                    {activeDesigner.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">
                    {ROLE_LABELS[activeDesigner.type] ?? activeDesigner.type} ·{" "}
                    {activeDesigner.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConvertOpen(true)}
                  className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors px-3.5 py-2 rounded-full"
                  data-testid="button-convert-to-project"
                >
                  <Star className="w-3.5 h-3.5" />
                  Convertir en projet
                </button>
                <button
                  type="button"
                  onClick={() => setConvertOpen(true)}
                  aria-label="Convertir en projet"
                  className="sm:hidden p-2 rounded-full text-primary border border-primary/30 hover:bg-primary/10 transition-colors"
                  data-testid="button-convert-to-project-mobile"
                >
                  <Star className="w-4 h-4" />
                </button>
              </header>

              <div
                ref={threadRef}
                className="flex-1 p-5 space-y-3 overflow-y-auto bg-[#FBFAF7]"
              >
                {active.messages.length === 0 && (
                  <p
                    className="text-center text-xs text-muted-foreground font-light py-12"
                    data-testid="text-thread-empty"
                  >
                    Aucun message pour le moment. Envoyez le premier !
                  </p>
                )}
                {active.messages.map((m) => {
                  const isMine = m.sender === "me";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          isMine
                            ? "bg-foreground text-background rounded-br-sm"
                            : "bg-white border border-black/5 text-foreground rounded-bl-sm"
                        }`}
                        data-testid={`message-${m.id}`}
                      >
                        {m.attachment && (
                          <div className="mb-2">
                            {m.attachment.kind === "image" ? (
                              <a
                                href={m.attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                                data-testid={`attachment-image-${m.id}`}
                              >
                                <img
                                  src={m.attachment.url}
                                  alt={m.attachment.name}
                                  className="rounded-xl max-h-64 w-auto object-cover border border-black/5"
                                />
                              </a>
                            ) : (
                              <a
                                href={m.attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                download={m.attachment.name}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${
                                  isMine
                                    ? "border-background/20 bg-background/10 hover:bg-background/15"
                                    : "border-black/10 bg-muted/40 hover:bg-muted/60"
                                } transition-colors`}
                                data-testid={`attachment-file-${m.id}`}
                              >
                                <FileText className="w-4 h-4 shrink-0" />
                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-medium truncate max-w-[180px]">
                                    {m.attachment.name}
                                  </p>
                                  <p
                                    className={`text-[10px] uppercase tracking-[0.15em] ${
                                      isMine
                                        ? "text-background/60"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {formatBytes(m.attachment.size)}
                                  </p>
                                </div>
                              </a>
                            )}
                          </div>
                        )}
                        {m.text && (
                          <p className="text-sm font-light leading-relaxed whitespace-pre-wrap break-words">
                            {m.text}
                          </p>
                        )}
                        <p
                          className={`text-[10px] uppercase tracking-[0.15em] mt-1.5 ${
                            isMine
                              ? "text-background/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {m.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pending attachment preview */}
              {pendingAttachment && (
                <div
                  className="border-t border-black/5 px-3 pt-3 pb-0 bg-white"
                  data-testid="pending-attachment"
                >
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 border border-black/5">
                    {pendingAttachment.kind === "image" ? (
                      <img
                        src={pendingAttachment.url}
                        alt={pendingAttachment.name}
                        className="w-12 h-12 rounded-md object-cover border border-black/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <FileText className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {pendingAttachment.name}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {pendingAttachment.kind === "image" ? (
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Image
                          </span>
                        ) : (
                          "Fichier"
                        )}{" "}
                        · {formatBytes(pendingAttachment.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearPendingAttachment}
                      className="p-1.5 rounded-full hover:bg-black/5 text-muted-foreground"
                      aria-label="Retirer la pièce jointe"
                      data-testid="button-clear-attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSend}
                className="border-t border-black/5 p-3 flex items-center gap-2 bg-white"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  className="hidden"
                  onChange={handleFileInput}
                  data-testid="input-message-attachment"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Joindre un fichier"
                  data-testid="button-attach-file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Écrire un message…"
                  className="flex-1 bg-[#F5F3EE] rounded-full px-4 py-2.5 text-sm font-light placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="input-message-draft"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() && !pendingAttachment}
                  className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-light">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>

      {active && activeDesigner && (
        <ConvertToProjectDialog
          open={convertOpen}
          onOpenChange={setConvertOpen}
          partner={activeDesigner}
          conversationId={active.id}
        />
      )}
    </div>
  );
}
