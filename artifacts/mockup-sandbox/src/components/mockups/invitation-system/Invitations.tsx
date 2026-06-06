import { useMemo, useState } from "react";

type User = { id: string; name: string };

type Project = {
  id: string;
  name: string;
  description: string;
  collaborators: string[];
};

type InvitationStatus = "pending" | "accepted" | "declined";

type Invitation = {
  id: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  status: InvitationStatus;
};

const USERS: User[] = [
  { id: "u-me", name: "You" },
  { id: "u-amal", name: "Amal Bensaïd" },
  { id: "u-karim", name: "Karim Haddad" },
  { id: "u-leila", name: "Leïla Cherif" },
];

const ME_ID = "u-me";

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p-1",
    name: "Summer Collection",
    description: "Lightweight linen pieces for the June launch.",
    collaborators: [ME_ID, "u-amal"],
  },
  {
    id: "p-2",
    name: "Resort 2026",
    description: "Beachwear capsule with Algerian artisans.",
    collaborators: ["u-amal"],
  },
  {
    id: "p-3",
    name: "Atelier Reboot",
    description: "Workshop modernization & equipment refresh.",
    collaborators: ["u-karim"],
  },
  {
    id: "p-4",
    name: "Holiday Drop",
    description: "Limited capsule for end-of-year boutiques.",
    collaborators: ["u-leila"],
  },
];

const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: "inv-1",
    projectId: "p-2",
    senderId: "u-amal",
    receiverId: ME_ID,
    status: "pending",
  },
  {
    id: "inv-2",
    projectId: "p-3",
    senderId: "u-karim",
    receiverId: ME_ID,
    status: "pending",
  },
  {
    id: "inv-3",
    projectId: "p-4",
    senderId: "u-leila",
    receiverId: ME_ID,
    status: "pending",
  },
];

function userName(id: string): string {
  return USERS.find((u) => u.id === id)?.name ?? "Unknown";
}

export default function Invitations() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [invitations, setInvitations] =
    useState<Invitation[]>(INITIAL_INVITATIONS);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // My Projects: only projects where I'm a collaborator. Pending invitations
  // do NOT add me to collaborators, so the project stays hidden until I accept.
  const myProjects = useMemo(
    () => projects.filter((p) => p.collaborators.includes(ME_ID)),
    [projects],
  );

  // Notifications panel: only pending invitations addressed to me.
  const myPendingInvitations = useMemo(
    () =>
      invitations.filter(
        (inv) => inv.receiverId === ME_ID && inv.status === "pending",
      ),
    [invitations],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const acceptInvitation = (invitationId: string) => {
    const inv = invitations.find((i) => i.id === invitationId);
    if (!inv) return;
    setInvitations((prev) =>
      prev.map((i) =>
        i.id === invitationId ? { ...i, status: "accepted" } : i,
      ),
    );
    setProjects((prev) =>
      prev.map((p) =>
        p.id === inv.projectId && !p.collaborators.includes(ME_ID)
          ? { ...p, collaborators: [...p.collaborators, ME_ID] }
          : p,
      ),
    );
    showToast("You joined the project");
  };

  const declineInvitation = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((i) =>
        i.id === invitationId ? { ...i, status: "declined" } : i,
      ),
    );
  };

  const openProject = projects.find((p) => p.id === openProjectId) ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8 relative">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg"
          data-testid="toast-message"
        >
          {toast}
        </div>
      )}

      {/* Project detail modal-style overlay */}
      {openProject && (
        <ProjectDetail
          project={openProject}
          isCollaborator={openProject.collaborators.includes(ME_ID)}
          onClose={() => setOpenProjectId(null)}
        />
      )}

      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500 mb-2 font-medium">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">Hi, You</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your projects and respond to collaboration invites.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Notifications panel */}
          <section
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
            data-testid="panel-notifications"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Notifications</h2>
              <span
                className="text-[10px] uppercase tracking-[0.18em] bg-gray-900 text-white px-2 py-0.5 rounded-full"
                data-testid="count-pending"
              >
                {myPendingInvitations.length}
              </span>
            </div>

            {myPendingInvitations.length === 0 ? (
              <p
                className="text-sm text-gray-400 italic py-6 text-center"
                data-testid="empty-notifications"
              >
                No pending invitations
              </p>
            ) : (
              <ul className="space-y-3">
                {myPendingInvitations.map((inv) => {
                  const project = projects.find((p) => p.id === inv.projectId);
                  if (!project) return null;
                  return (
                    <li
                      key={inv.id}
                      className="border border-gray-100 rounded-xl p-3 bg-gray-50/60"
                      data-testid={`invitation-${inv.id}`}
                    >
                      <p className="text-sm text-gray-800 leading-snug">
                        <span className="font-medium">
                          {userName(inv.senderId)}
                        </span>{" "}
                        invited you to join{" "}
                        <span className="font-medium">{project.name}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => acceptInvitation(inv.id)}
                          className="flex-1 bg-gray-900 hover:bg-black text-white text-xs font-medium py-1.5 rounded-full transition-colors"
                          data-testid={`button-accept-${inv.id}`}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => declineInvitation(inv.id)}
                          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-medium py-1.5 rounded-full transition-colors"
                          data-testid={`button-decline-${inv.id}`}
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* My Projects panel */}
          <section
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
            data-testid="panel-my-projects"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">My Projects</h2>
              <span
                className="text-[10px] uppercase tracking-[0.18em] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                data-testid="count-my-projects"
              >
                {myProjects.length}
              </span>
            </div>

            {myProjects.length === 0 ? (
              <p
                className="text-sm text-gray-400 italic py-6 text-center"
                data-testid="empty-my-projects"
              >
                No projects yet
              </p>
            ) : (
              <ul className="space-y-2">
                {myProjects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setOpenProjectId(p.id)}
                      className="w-full text-left border border-gray-100 hover:border-gray-300 hover:bg-gray-50 rounded-xl p-3 transition-colors"
                      data-testid={`project-card-${p.id}`}
                    >
                      <p className="font-medium text-gray-900 text-sm">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {p.description}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 mt-1.5">
                        {p.collaborators.length} collaborator
                        {p.collaborators.length > 1 ? "s" : ""}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Hidden-projects probe — proves access control. The user can attempt
            to open a project they were never invited to. */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mt-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-1">
            Try direct access (access control demo)
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            These projects are not in your "My Projects" list. Click one to
            simulate opening it directly — you'll see the access-denied screen.
          </p>
          <div className="flex flex-wrap gap-2">
            {projects
              .filter((p) => !p.collaborators.includes(ME_ID))
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOpenProjectId(p.id)}
                  className="text-xs border border-dashed border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-full transition-colors"
                  data-testid={`probe-project-${p.id}`}
                >
                  Open "{p.name}"
                </button>
              ))}
            {projects.filter((p) => !p.collaborators.includes(ME_ID)).length ===
              0 && (
              <p className="text-xs text-gray-400 italic">
                You're a collaborator on every project — no access-denied case
                to demo.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProjectDetail({
  project,
  isCollaborator,
  onClose,
}: {
  project: Project;
  isCollaborator: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="project-overlay"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        data-testid={`project-detail-${project.id}`}
      >
        {!isCollaborator ? (
          <div className="text-center py-6" data-testid="access-denied">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <rect
                  x="4.5"
                  y="9"
                  width="11"
                  height="7.5"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M7 9V6.5a3 3 0 0 1 6 0V9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Access Denied</h3>
            <p className="text-sm text-gray-500 mb-5">
              You're not a collaborator on{" "}
              <span className="font-medium text-gray-700">{project.name}</span>.
              Ask the project owner to send you an invitation.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-700 hover:text-gray-900 underline underline-offset-4"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 mb-2 font-medium">
              Project Page
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{project.description}</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-1.5">
                Collaborators
              </p>
              <p className="text-sm text-gray-800">
                {project.collaborators.map(userName).join(", ")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-2.5 rounded-full transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
