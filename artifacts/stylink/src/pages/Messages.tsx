import { useState } from "react";
import { Send } from "lucide-react";
import {
  mockConversations,
  getDesignerById,
  Conversation,
  Message,
} from "@/data/mockData";

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string>(mockConversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId);
  const activeDesigner = active ? getDesignerById(active.designerId) : undefined;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender: "me",
      text: draft.trim(),
      timestamp: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text,
              lastTimestamp: newMsg.timestamp,
            }
          : c,
      ),
    );
    setDraft("");
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
              <header className="p-5 border-b border-border flex items-center gap-3">
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
                      <p className="text-sm font-light leading-relaxed">{m.text}</p>
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
                className="border-t border-border p-4 flex items-center gap-3"
              >
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
