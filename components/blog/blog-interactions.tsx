"use client"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Send, User, CheckCircle2 } from "lucide-react"
import type { BlogComment } from "@/lib/blog-types"

type Props = {
  postId: number
  initialLikes?: number
  initialComments?: BlogComment[]
}

export function BlogInteractions({ postId, initialLikes = 0, initialComments = [] }: Props) {
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(false)
  const [liking, setLiking] = useState(false)

  const [comments, setComments] = useState<BlogComment[]>(initialComments)
  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]")
    if (likedPosts.includes(postId)) {
      setHasLiked(true)
    }
  }, [postId])

  async function handleLike() {
    if (hasLiked || liking) return

    setLiking(true)
    // Optimistic UI update
    setLikes((prev) => prev + 1)
    setHasLiked(true)

    try {
      const res = await fetch(`/api/blog/${postId}/like`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likesCount)
        const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]")
        localStorage.setItem("liked_posts", JSON.stringify([...likedPosts, postId]))
      } else {
        // Revert on error
        setLikes((prev) => prev - 1)
        setHasLiked(false)
      }
    } catch {
      setLikes((prev) => prev - 1)
      setHasLiked(false)
    } finally {
      setLiking(false)
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/blog/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, content }),
      })

      if (res.ok) {
        const data = await res.json()
        setComments(data.comments)
        setContent("")
        setSuccessMsg(true)
        setTimeout(() => setSuccessMsg(false), 3000)
      }
    } catch (err) {
      console.error("Failed submitting comment:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12 space-y-12">
      {/* ── Like & Action Row ───────────────────────────── */}
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={hasLiked || liking}
            className={`group inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
              hasLiked
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
            }`}
          >
            <Heart
              className={`size-5 transition-transform duration-300 group-hover:scale-110 ${
                hasLiked ? "fill-white" : ""
              }`}
            />
            <span>{hasLiked ? "Liked" : "Like this article"}</span>
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
              {likes}
            </span>
          </button>

          <span className="text-xs text-muted-foreground">
            {likes} {likes === 1 ? "person liked" : "people liked"} this story
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="size-4 text-primary" />
          <span>{comments.length} Comments</span>
        </div>
      </div>

      {/* ── Comments Section ────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border pb-4">
          <MessageSquare className="size-5 text-primary" />
          <h3 className="font-serif text-2xl font-bold text-foreground">
            Discussion & Comments ({comments.length})
          </h3>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mt-6 space-y-4">
          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Thank you! Your comment has been posted.</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="commentAuthor" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="commentAuthor"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Ramesh Jha"
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="commentContent" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Add a Comment *
            </label>
            <textarea
              id="commentContent"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts or feedback about this article..."
              required
              className="w-full rounded-xl border border-input bg-background p-3.5 text-sm font-medium leading-relaxed placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Send className="size-4" />
              )}
              <span>Post Comment</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="mt-8 space-y-4 border-t border-border pt-6">
          {comments.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground italic">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-serif font-bold">
                  {(c.author || "A")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-serif text-sm font-bold text-foreground">
                      {c.author}
                    </h4>
                    <span className="text-xs text-muted-foreground">{c.createdAt}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {c.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
