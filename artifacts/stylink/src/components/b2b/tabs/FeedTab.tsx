import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  Bookmark,
  Check,
  Handshake,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppStore, type BusinessRole } from "@/contexts/AppStore";
import {
  getDesignerById,
  mockFeedPosts,
  type FeedPost,
} from "@/data/mockData";
import {
  createFeedPost,
  deleteFeedPost,
  fetchFeedPosts,
  updateFeedPost,
} from "@/lib/feedApi";
import { useB2BShell } from "@/components/b2b/B2BShellContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleLabels: Record<BusinessRole, string> = {
  boutique: "Boutique",
  designer: "Designer",
  atelier: "Atelier",
  "fabric-retailer": "Maison de tissus",
};

const designerTypeLabels: Record<string, string> = {
  designer: "Designer",
  atelier: "Atelier",
  boutique: "Boutique",
  "fabric-retailer": "Maison de tissus",
};

const ME_AUTHOR_ID = "_me";
const PAGE_SIZE = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

interface LocalComment {
  text: string;
  author: string;
}

function PostCard({
  post,
  isMe,
  liked,
  saved,
  onToggleLike,
  onToggleSave,
  onConnect,
  onProposeCollab,
  connectStatus,
  commentOpen,
  commentValue,
  onCommentChange,
  onCommentSubmit,
  localComments,
  meName,
  meRole,
  meInitials,
  onDelete,
  onEdit,
}: {
  post: FeedPost;
  isMe: boolean;
  liked: boolean;
  saved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onConnect: () => void;
  onProposeCollab: () => void;
  connectStatus?: "pending" | "connected";
  commentOpen: boolean;
  commentValue: string;
  onCommentChange: (v: string) => void;
  onCommentSubmit: () => void;
  localComments: LocalComment[];
  meName: string;
  meRole: string;
  meInitials: string;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const [, navigate] = useLocation();
  const author = isMe ? undefined : getDesignerById(post.authorId);

  const name = isMe ? meName : (post.authorName ?? author?.name ?? "Membre Stylink");
  const role = isMe
    ? meRole
    : post.authorRole ?? designerTypeLabels[author?.type ?? "designer"] ?? "Designer";
  const city = isMe ? undefined : author?.city;
  const avatarSrc = isMe ? undefined : author?.image;
  const initials = isMe
    ? meInitials || "ST"
    : name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("");

  const commentCount = post.comments + localComments.length;
  const profileHref = isMe ? undefined : `/designers/${post.authorId}`;

  return (
    <article
      className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden"
      data-testid={`feed-post-${post.id}`}
    >
      {/* Header */}
      <div className="p-5 flex items-start gap-3">
        <button
          type="button"
          onClick={() => profileHref && navigate(profileHref)}
          className={profileHref ? "cursor-pointer" : "cursor-default"}
          aria-label={profileHref ? `Voir le profil de ${name}` : undefined}
          tabIndex={profileHref ? 0 : -1}
        >
          <Avatar className="h-11 w-11">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
            <AvatarFallback className="text-xs bg-primary/15">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => profileHref && navigate(profileHref)}
              className={
                profileHref
                  ? "font-serif text-base text-foreground leading-tight hover:underline cursor-pointer"
                  : "font-serif text-base text-foreground leading-tight cursor-default"
              }
            >
              {name}
            </button>
            <span
              className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full"
              data-testid={`badge-role-${post.id}`}
            >
              {role}
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
            {city ? `${city} · ` : ""}
            {post.timestamp}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? "Retirer des favoris" : "Sauvegarder"}
            data-testid={`button-save-${post.id}`}
            className={`p-2 rounded-full transition-colors ${
              saved
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${saved ? "fill-current" : ""}`}
              strokeWidth={1.75}
            />
          </button>

          {isMe && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Options"
                  data-testid={`button-post-options-${post.id}`}
                >
                  <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={onEdit}
                    data-testid={`button-edit-post-${post.id}`}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                    data-testid={`button-delete-post-${post.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-4">
        <p className="text-sm text-foreground/90 font-light leading-relaxed whitespace-pre-line">
          {post.body}
        </p>
      </div>

      {/* Visual */}
      {post.image && (
        <div className="bg-muted">
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="w-full max-h-[520px] object-cover"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-black/5">
        <span data-testid={`text-like-count-${post.id}`}>
          {post.likes + (liked ? 1 : 0)} j'aime
        </span>
        <span>
          {commentCount} commentaires
          {post.shares ? ` · ${post.shares} partages` : ""}
        </span>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 grid grid-cols-2 sm:grid-cols-4 gap-1 border-t border-black/5">
        {!isMe && (
          <button
            onClick={onConnect}
            disabled={!!connectStatus}
            data-testid={`button-connect-${post.id}`}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors col-span-2 sm:col-span-1 ${
              connectStatus === "connected"
                ? "text-emerald-700 bg-emerald-50"
                : connectStatus === "pending"
                  ? "text-muted-foreground bg-muted cursor-default"
                  : "text-primary-foreground bg-primary hover:bg-primary/90"
            }`}
          >
            {connectStatus === "connected" ? (
              <Check className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <UserPlus className="w-4 h-4" strokeWidth={1.75} />
            )}
            {connectStatus === "connected"
              ? "Connecté"
              : connectStatus === "pending"
                ? "En attente…"
                : "Connecter"}
          </button>
        )}
        {!isMe && (
          <button
            onClick={onProposeCollab}
            data-testid={`button-propose-collab-${post.id}`}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/70 transition-colors"
          >
            <Handshake className="w-4 h-4" strokeWidth={1.75} />
            Proposer collab
          </button>
        )}
        <button
          onClick={onToggleLike}
          aria-pressed={liked}
          data-testid={`button-like-${post.id}`}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            liked
              ? "text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          } ${isMe ? "col-span-1 sm:col-span-2" : ""}`}
        >
          <Heart
            className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
            strokeWidth={1.75}
          />
          J'aime
        </button>
        <button
          onClick={() => onCommentChange(commentOpen ? "\x00toggle-close" : "\x00toggle-open")}
          data-testid={`button-comment-${post.id}`}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            commentOpen
              ? "text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          } ${isMe ? "col-span-1 sm:col-span-2" : ""}`}
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
          Commenter
        </button>
      </div>

      {/* Inline comments */}
      {localComments.length > 0 && (
        <div className="px-5 pb-3 space-y-2 border-t border-black/5 pt-3">
          {localComments.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-[10px] bg-primary/15">
                  {c.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-xl px-3 py-2 text-sm font-light leading-snug min-w-0">
                <span className="font-medium text-xs text-foreground/70 mr-1">
                  {c.author}
                </span>
                {c.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      {commentOpen && (
        <div className="px-4 pb-4 border-t border-black/5 pt-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-[10px] bg-primary/15">
                {meInitials || "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={commentValue}
                onChange={(e) => onCommentChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && commentValue.trim()) {
                    e.preventDefault();
                    onCommentSubmit();
                  }
                }}
                placeholder="Écrire un commentaire…"
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm font-light placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid={`input-comment-${post.id}`}
                autoFocus
              />
              <button
                onClick={onCommentSubmit}
                disabled={!commentValue.trim()}
                className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
                data-testid={`button-submit-comment-${post.id}`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function FeedTab() {
  const { user, pushNotification, isConnected, pendingConnections, addPendingConnection } = useAppStore();
  const { search } = useB2BShell();
  const [, navigate] = useLocation();

  const [draft, setDraft] = useState("");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [commentOpen, setCommentOpen] = useState<Record<string, boolean>>({});
  const [commentValue, setCommentValue] = useState<Record<string, string>>({});
  const [localComments, setLocalComments] = useState<Record<string, LocalComment[]>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const baseFeed = useMemo<FeedPost[]>(() => {
    const cycles = 5;
    const out: FeedPost[] = [];
    for (let i = 0; i < cycles; i++) {
      for (const p of mockFeedPosts) {
        out.push(i === 0 ? p : { ...p, id: `${p.id}-r${i}` });
      }
    }
    return out;
  }, []);

  useEffect(() => {
    async function loadFeed() {
      setIsLoadingFeed(true);
      try {
        const posts = await fetchFeedPosts();
        setFeedPosts(posts);
      } catch (error) {
        console.error("Failed to load feed posts", error);
      } finally {
        setIsLoadingFeed(false);
      }
    }

    loadFeed();
  }, []);

  const allPosts = useMemo<FeedPost[]>(
    () => [...feedPosts, ...baseFeed],
    [feedPosts, baseFeed],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allPosts;
    return allPosts.filter((p) => {
      const author = getDesignerById(p.authorId);
      return (
        p.body.toLowerCase().includes(q) ||
        (p.authorName?.toLowerCase().includes(q) ?? false) ||
        (p.authorRole?.toLowerCase().includes(q) ?? false) ||
        (author?.name.toLowerCase().includes(q) ?? false) ||
        (author?.specialty.toLowerCase().includes(q) ?? false) ||
        (author?.city.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allPosts, search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search]);

  const visiblePosts = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "200px 0px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [hasMore, filtered.length, visiblePosts.length]);

  const isBusiness = !!user && user.type === "business";
  const myName = !user
    ? "Vous"
    : user.type === "business"
      ? user.brandName
      : user.name;
  const myRole = isBusiness && user ? roleLabels[user.role] : "Membre";
  const initials = myName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const myAuthorId = user ? `me-${user.email.trim().toLowerCase()}` : null;

  function pickImage() {
    fileInputRef.current?.click();
  }

  function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Sélectionnez un fichier image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image trop lourde (max 4 Mo).");
      return;
    }
    setImageError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setDraftImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function publish() {
    const body = draft.trim();
    if (!body && !draftImage) return;

    const authorId = myAuthorId ?? ME_AUTHOR_ID;
    const postPayload = {
      id: `feed-${Date.now()}`,
      authorId,
      authorName: myName,
      authorRole: myRole,
      body: body || "",
      image: draftImage ?? undefined,
      timestamp: "à l'instant",
      likes: 0,
      comments: 0,
    };

    try {
      const created = await createFeedPost({
        id: postPayload.id,
        authorId: postPayload.authorId,
        authorName: postPayload.authorName,
        authorRole: postPayload.authorRole,
        body: postPayload.body,
        image: postPayload.image,
      });
      setFeedPosts((prev) => [created, ...prev]);
      setDraft("");
      setDraftImage(null);
      setImageError(null);
    } catch (error) {
      console.error("Failed to publish feed post", error);
    }
  }

  function handleConnect(postId: string, authorId: string, authorName: string) {
    if (authorId === ME_AUTHOR_ID || authorId === myAuthorId) return;
    if (pendingConnections.includes(authorId) || isConnected(authorId)) return;
    addPendingConnection(authorId);
    pushNotification({
      kind: "connect-request",
      title: "Demande de connexion",
      description: `${myName} souhaite se connecter avec vous.`,
      connectRequestStatus: "pending",
      requesterId: authorId,
    });
  }

  function handleProposeCollab(authorId: string) {
    if (authorId === ME_AUTHOR_ID || authorId === myAuthorId) return;
    const params = new URLSearchParams({ with: authorId, context: "collaborate" });
    navigate(`/b2b/messages?${params.toString()}`);
  }

  function handleToggleLike(postId: string, isMe: boolean) {
    const wasLiked = !!liked[postId];
    setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!wasLiked && !isMe) {
      pushNotification({
        kind: "like",
        title: "Nouveau j'aime",
        description: `${myName} a aimé votre publication.`,
      });
    }
  }

  function handleCommentChange(postId: string, value: string) {
    if (value === "\x00toggle-close") {
      setCommentOpen((prev) => ({ ...prev, [postId]: false }));
    } else if (value === "\x00toggle-open") {
      setCommentOpen((prev) => ({ ...prev, [postId]: true }));
    } else {
      setCommentValue((prev) => ({ ...prev, [postId]: value }));
    }
  }

  function handleCommentSubmit(postId: string, isPostByMe: boolean) {
    const text = (commentValue[postId] ?? "").trim();
    if (!text) return;
    setLocalComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), { text, author: myName }],
    }));
    setCommentValue((prev) => ({ ...prev, [postId]: "" }));
    setCommentOpen((prev) => ({ ...prev, [postId]: false }));
    if (!isPostByMe) {
      pushNotification({
        kind: "comment",
        title: "Nouveau commentaire",
        description: `${myName} a commenté votre publication : « ${text.slice(0, 60)}${text.length > 60 ? "…" : ""} »`,
      });
    }
  }

  async function handleDeletePost(postId: string) {
    try {
      await deleteFeedPost(postId);
      setFeedPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Failed to delete feed post", error);
    }
  }

  function handleStartEdit(postId: string, currentBody: string) {
    setEditingPostId(postId);
    setEditDraft(currentBody);
  }

  async function handleSaveEdit(postId: string) {
    const body = editDraft.trim();
    if (!body) return;
    try {
      const updated = await updateFeedPost(postId, { body });
      setFeedPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, body: updated.body } : p)),
      );
      setEditingPostId(null);
      setEditDraft("");
    } catch (error) {
      console.error("Failed to update feed post", error);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div className="max-w-2xl mx-auto w-full space-y-5">
        {/* Composer */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-black/5 p-4"
          data-testid="card-composer"
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-xs bg-primary/15">
                {initials || "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Partagez votre idée, design ou besoin de collaboration…"
                rows={2}
                className="w-full bg-[#F5F3EE] rounded-xl px-4 py-3 text-sm font-light placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                data-testid="textarea-feed-composer"
              />

              {draftImage && (
                <div className="relative mt-3 rounded-xl overflow-hidden border border-black/5">
                  <img
                    src={draftImage}
                    alt="Aperçu"
                    className="w-full max-h-72 object-cover"
                    data-testid="img-composer-preview"
                  />
                  <button
                    type="button"
                    onClick={() => setDraftImage(null)}
                    aria-label="Retirer l'image"
                    data-testid="button-remove-image"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {imageError && (
                <p
                  className="mt-2 text-xs text-destructive"
                  data-testid="text-image-error"
                >
                  {imageError}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onImageSelected}
                className="hidden"
                data-testid="input-image-file"
              />

              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={pickImage}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-add-image"
                >
                  <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
                  {draftImage ? "Changer l'image" : "Ajouter une image"}
                </button>
                <Button
                  size="sm"
                  onClick={publish}
                  disabled={!draft.trim() && !draftImage}
                  className="rounded-full gap-1.5"
                  data-testid="button-publish-post"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publier
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed list */}
        {visiblePosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-10 text-center">
            <Sparkles
              className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3"
              strokeWidth={1.25}
            />
            <p className="font-serif text-lg text-foreground mb-1">
              Aucune publication
            </p>
            <p className="text-sm text-muted-foreground font-light">
              Essayez un autre terme de recherche.
            </p>
          </div>
        ) : (
          visiblePosts.map((post) => {
            const isPostByMe =
              post.authorId === ME_AUTHOR_ID || post.authorId === myAuthorId;
            const author = isPostByMe ? null : getDesignerById(post.authorId);
            const authorName =
              post.authorName ?? author?.name ?? "Membre Stylink";
            const isEditing = editingPostId === post.id;
            return (
              <div key={post.id}>
                {isEditing ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans">Modifier la publication</p>
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={4}
                      className="w-full bg-[#F5F3EE] rounded-xl px-4 py-3 text-sm font-light focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => { setEditingPostId(null); setEditDraft(""); }}>
                        Annuler
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(post.id)} disabled={!editDraft.trim()}>
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <PostCard
                    post={post}
                    isMe={isPostByMe}
                    liked={!!liked[post.id]}
                    saved={!!saved[post.id]}
                    onToggleLike={() => handleToggleLike(post.id, isPostByMe)}
                    onToggleSave={() =>
                      setSaved((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                    }
                    onConnect={() => handleConnect(post.id, post.authorId, authorName)}
                    onProposeCollab={() => handleProposeCollab(post.authorId)}
                    connectStatus={isConnected(post.authorId) ? "connected" : pendingConnections.includes(post.authorId) ? "pending" : undefined}
                    commentOpen={!!commentOpen[post.id]}
                    commentValue={commentValue[post.id] ?? ""}
                    onCommentChange={(v) => handleCommentChange(post.id, v)}
                    onCommentSubmit={() => handleCommentSubmit(post.id, isPostByMe)}
                    localComments={localComments[post.id] ?? []}
                    meName={myName}
                    meRole={myRole}
                    meInitials={initials}
                    onDelete={isPostByMe ? () => handleDeletePost(post.id) : undefined}
                    onEdit={isPostByMe ? () => handleStartEdit(post.id, post.body) : undefined}
                  />
                )}
              </div>
            );
          })
        )}

        {hasMore && (
          <div
            ref={sentinelRef}
            className="py-6 text-center text-xs text-muted-foreground"
            data-testid="feed-load-more-sentinel"
          >
            Chargement de nouvelles publications…
          </div>
        )}
        {!hasMore && visiblePosts.length > 0 && (
          <div className="py-6 text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Vous avez tout vu
          </div>
        )}
      </div>

      {/* Right sidebar (desktop only) */}
      <aside className="hidden lg:block">
        <div className="sticky top-32 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3 font-medium">
              À la une
            </p>
            <ul className="space-y-3 text-sm">
              <li className="text-foreground/90 font-light leading-snug">
                Nouveaux brocarts dorés disponibles chez Brocart & Soie
              </li>
              <li className="text-foreground/90 font-light leading-snug">
                3 ateliers ouvrent leur calendrier production pour septembre
              </li>
              <li className="text-foreground/90 font-light leading-snug">
                Capsule "Tamurt" lancée — broderies kabyles modernes
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary mb-3 font-medium">
              Conseil du jour
            </p>
            <p className="text-sm text-foreground/90 font-light leading-relaxed">
              Complétez votre profil pour apparaître dans les suggestions de
              partenaires. Les profils complets reçoivent 3× plus de demandes.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
