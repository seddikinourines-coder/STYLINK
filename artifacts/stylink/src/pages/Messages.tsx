import { useRef, useState } from "react";
import { Send, Paperclip, X, Ruler } from "lucide-react";
import {
  mockConversations,
  getDesignerById,
  Conversation,
  Message,
  MessageAttachment,
} from "@/data/mockData";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Messages() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string>(mockConversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);

  const active = conversations.find((c) => c.id === activeId);
  const activeDesigner = active ? getDesignerById(active.designerId) : undefined;

  function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const kind = file.type.startsWith("image/") ? "image" : "file";

    setAttachment({
      kind,
      url,
      name: file.name,
      size: file.size,
      mime: file.type,
    });
  }

  function handleRemoveAttachment() {
    if (attachment?.url) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachment(null);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!draft.trim() && !attachment) || !active) return;

    const attachmentToSend = attachment;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender: "me",
      text: draft.trim(),
      timestamp: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachment: attachmentToSend ?? undefined,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text || "Pièce jointe",
              lastTimestamp: newMsg.timestamp,
            }
          : c,
      ),
    );
    setDraft("");
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section className="container mx-auto px-4 md:px-8 py-12">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          Vos échanges
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground">
          Messages
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 border border-border min-h-[600px]">
        {/* Conversation list */}
        <aside className="border-b md:border-b-0 md:border-r border-border overflow-y-auto">
          {conversations.map((c) => {
            const designer = getDesignerById(c.designerId);
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-5 border-b border-border transition-colors ${
                  isActive ? "bg-muted" : "hover:bg-muted/50"
                }`}
                data-testid={`button-conversation-${c.id}`}
              >
                <div className="flex items-center gap-3">
                  {designer && (
                    <img
                      src={designer.image}
                      alt={designer.name}
                      className="w-12 h-12 object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-serif text-base text-foreground truncate">
                        {designer?.name ?? "Conversation"}
                      </p>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground ml-2">
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
        <div className="md:col-span-2 flex flex-col">
          {active && activeDesigner ? (
            <>
              <header className="p-5 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeDesigner.image}
                    alt={activeDesigner.name}
                    className="w-10 h-10 object-cover"
                  />
                  <div>
                    <p className="font-serif text-lg" data-testid="text-active-designer">
                      {activeDesigner.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {activeDesigner.type} · {activeDesigner.city}
                    </p>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
                      aria-label="Voir comment mesurer à la maison"
                    >
                      <Ruler className="w-4 h-4" />
                      Mesures
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Mesurez-vous à la maison</DialogTitle>
                      <DialogDescription>
                        Suivez ces étapes pour prendre vos mesures correctement et envoyer les informations au designer.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="overflow-x-auto pt-4">
                    <table className="w-full min-w-[680px] border-separate border-spacing-y-2 text-sm text-foreground">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Zone de mesure</th>
                          <th className="px-3 py-2 text-center">Illustration</th>
                          <th className="px-3 py-2">Comment mesurer</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-background/80 rounded-lg border border-border">
                          <td className="px-3 py-4 font-semibold">1</td>
                          <td className="px-3 py-4 font-medium">Tour de poitrine</td>
                          <td className="px-3 py-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                              <svg viewBox="0 0 64 64" className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 20c0-6 4-12 12-12s12 6 12 12v24c0 6-4 12-12 12s-12-6-12-12z" />
                                <line x1="14" y1="28" x2="50" y2="28" strokeLinecap="round" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-muted-foreground">
                            Mesurez autour de la partie la plus large de votre poitrine, en gardant le mètre bien horizontal.
                          </td>
                        </tr>
                        <tr className="bg-background/80 rounded-lg border border-border">
                          <td className="px-3 py-4 font-semibold">2</td>
                          <td className="px-3 py-4 font-medium">Tour de taille</td>
                          <td className="px-3 py-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                              <svg viewBox="0 0 64 64" className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 20c0-6 4-12 12-12s12 6 12 12v24c0 6-4 12-12 12s-12-6-12-12z" />
                                <line x1="16" y1="34" x2="48" y2="34" strokeLinecap="round" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-muted-foreground">
                            Mesurez au niveau de votre taille naturelle, là où le corps se plie lorsque vous vous penchez.
                          </td>
                        </tr>
                        <tr className="bg-background/80 rounded-lg border border-border">
                          <td className="px-3 py-4 font-semibold">3</td>
                          <td className="px-3 py-4 font-medium">Tour de hanche</td>
                          <td className="px-3 py-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                              <svg viewBox="0 0 64 64" className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 18c0-5 4-10 12-10s12 5 12 10v10h-24v-10z" />
                                <path d="M16 30h32v16c0 6-4 10-12 10s-12-4-12-10v-16z" />
                                <line x1="16" y1="36" x2="48" y2="36" strokeLinecap="round" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-muted-foreground">
                            Mesurez autour de la partie la plus large des hanches et des fesses.
                          </td>
                        </tr>
                        <tr className="bg-background/80 rounded-lg border border-border">
                          <td className="px-3 py-4 font-semibold">4</td>
                          <td className="px-3 py-4 font-medium">Tour de bras</td>
                          <td className="px-3 py-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                              <svg viewBox="0 0 64 64" className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M22 20c0-6 4-10 10-10s10 4 10 10v24" />
                                <path d="M32 44l10 4v6" />
                                <path d="M22 24l-6 6" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-muted-foreground">
                            Mesurez la partie la plus ronde du bras, bras détendu le long du corps.
                          </td>
                        </tr>
                        <tr className="bg-background/80 rounded-lg border border-border">
                          <td className="px-3 py-4 font-semibold">5</td>
                          <td className="px-3 py-4 font-medium">Longueur de jambe</td>
                          <td className="px-3 py-4">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                              <svg viewBox="0 0 64 64" className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M28 18h8" />
                                <path d="M30 18v30" />
                                <path d="M25 48h14" />
                                <path d="M30 18c-6 8-10 22-12 30" />
                                <path d="M34 18c6 8 10 22 12 30" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-muted-foreground">
                            Mesurez de la taille jusqu'à la cheville ou jusqu'à la longueur souhaitée pour une jupe ou une robe.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="mt-4 rounded-lg border border-border bg-muted/80 p-4 text-sm text-muted-foreground">
                      <strong className="block mb-2 text-foreground">Astuce du designer</strong>
                      Utilisez un mètre ruban souple et demandez à quelqu'un de vous aider pour une mesure précise. Gardez le mètre bien à plat, sans trop serrer.
                    </div>
                  </div>
                  </DialogContent>
                  </Dialog>
                </header>

              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 ${
                        m.sender === "me"
                          ? "bg-foreground text-background"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {m.text && (
                        <p className="text-sm font-light leading-relaxed">{m.text}</p>
                      )}

                      {m.attachment && (
                        <div className="mt-3">
                          {m.attachment.kind === "image" ? (
                            <img
                              src={m.attachment.url}
                              alt={m.attachment.name}
                              className="max-w-full rounded-md border border-border"
                            />
                          ) : (
                            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background/80 px-3 py-2 text-sm">
                              <Paperclip className="w-4 h-4" />
                              <span>{m.attachment.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <p
                        className={`text-[10px] uppercase tracking-[0.15em] mt-2 ${
                          m.sender === "me" ? "text-background/60" : "text-muted-foreground"
                        }`}
                      >
                        {m.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-border p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Ajouter une pièce jointe"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFilePick}
                    data-testid="input-attachment"
                  />

                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Écrire un message..."
                    className="flex-1 bg-transparent border-b border-border py-2 text-sm font-light focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                    data-testid="input-message-draft"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-foreground text-background hover:bg-primary transition-colors"
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {attachment && (
                  <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/80 p-3">
                    <div className="flex items-center gap-3 truncate">
                      <Paperclip className="w-4 h-4" />
                      <div className="min-w-0 truncate">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(attachment.size ?? 0 / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="rounded-full border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                      aria-label="Supprimer la pièce jointe"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-light">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
