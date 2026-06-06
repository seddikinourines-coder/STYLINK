import { useState } from "react";
import { Bell, FolderOpen, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InvitationStatus = "pending" | "accepted";

type Invitation = {
  id: string;
  projectName: string;
  inviter: string;
  status: InvitationStatus;
};

type AcceptedProject = {
  id: string;
  projectName: string;
};

const SEED_INVITATIONS: Invitation[] = [
  {
    id: "inv-1",
    projectName: "Summer Collection",
    inviter: "Maison Chouikh",
    status: "pending",
  },
  {
    id: "inv-2",
    projectName: "Resort 2026",
    inviter: "Atelier Bensaïd",
    status: "pending",
  },
  {
    id: "inv-3",
    projectName: "Holiday Drop",
    inviter: "Boutique Leïla",
    status: "pending",
  },
  {
    id: "inv-4",
    projectName: "Atelier Reboot",
    inviter: "Karim Haddad",
    status: "pending",
  },
];

export default function InvitationsDemo() {
  const [invitations, setInvitations] =
    useState<Invitation[]>(SEED_INVITATIONS);
  const [myProjects, setMyProjects] = useState<AcceptedProject[]>([]);

  const pending = invitations.filter((i) => i.status === "pending");

  const handleAccept = (invitationId: string) => {
    const target = invitations.find((i) => i.id === invitationId);
    if (!target || target.status !== "pending") return;
    setInvitations((prev) =>
      prev.map((i) =>
        i.id === invitationId ? { ...i, status: "accepted" } : i,
      ),
    );
    setMyProjects((prev) =>
      prev.some((p) => p.id === invitationId)
        ? prev
        : [...prev, { id: invitationId, projectName: target.projectName }],
    );
  };

  const handleDecline = (invitationId: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
  };

  return (
    <div className="bg-background flex-1 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <header className="mb-10 text-center sm:text-left">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
            Project Invitations
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-2">
            Invitations Demo
          </h1>
          <p className="text-sm text-muted-foreground font-light max-w-xl">
            Accept an invitation to add a project to your list. Declined
            invitations are removed.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* === Notifications === */}
          <section
            className="bg-white rounded-2xl border border-black/5 shadow-sm p-6"
            data-testid="section-notifications"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-foreground/70" strokeWidth={1.5} />
                <h2 className="font-serif text-xl text-foreground">
                  Notifications
                </h2>
              </div>
              <span
                className="text-[10px] uppercase tracking-[0.18em] bg-foreground text-background px-2.5 py-1 rounded-full font-medium"
                data-testid="count-notifications"
              >
                {pending.length}
              </span>
            </div>

            {pending.length === 0 ? (
              <p
                className="text-sm text-muted-foreground font-light italic text-center py-8"
                data-testid="empty-notifications"
              >
                No pending invitations
              </p>
            ) : (
              <ul className="space-y-3" data-testid="list-notifications">
                {pending.map((inv) => (
                  <li
                    key={inv.id}
                    className="border border-black/5 rounded-xl p-4 bg-background/40"
                    data-testid={`invitation-${inv.id}`}
                  >
                    <p className="text-sm text-foreground leading-snug mb-3">
                      <span className="font-medium">{inv.inviter}</span>{" "}
                      <span className="text-muted-foreground">
                        invited you to join
                      </span>{" "}
                      <span className="font-medium">{inv.projectName}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(inv.id)}
                        className="rounded-full flex-1 gap-1.5"
                        data-testid={`button-accept-${inv.id}`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(inv.id)}
                        className="rounded-full flex-1 gap-1.5"
                        data-testid={`button-decline-${inv.id}`}
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* === My Projects === */}
          <section
            className="bg-white rounded-2xl border border-black/5 shadow-sm p-6"
            data-testid="section-my-projects"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FolderOpen
                  className="w-4 h-4 text-foreground/70"
                  strokeWidth={1.5}
                />
                <h2 className="font-serif text-xl text-foreground">
                  My Projects
                </h2>
              </div>
              <span
                className="text-[10px] uppercase tracking-[0.18em] bg-foreground/5 text-foreground/70 px-2.5 py-1 rounded-full font-medium"
                data-testid="count-my-projects"
              >
                {myProjects.length}
              </span>
            </div>

            {myProjects.length === 0 ? (
              <p
                className="text-sm text-muted-foreground font-light italic text-center py-8"
                data-testid="empty-my-projects"
              >
                No projects yet
              </p>
            ) : (
              <ul className="space-y-2" data-testid="list-my-projects">
                {myProjects.map((p) => (
                  <li
                    key={p.id}
                    className="border border-black/5 rounded-xl p-4 bg-background/40 flex items-center justify-between"
                    data-testid={`my-project-${p.id}`}
                  >
                    <span className="font-serif text-base text-foreground">
                      {p.projectName}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Joined
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
