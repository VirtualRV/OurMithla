"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  LogOut,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  Filter,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import type { BlogPost, BlogPostInput } from "@/lib/blog-types"
import { CATEGORIES } from "@/lib/blog-types"
import { BlogEditorModal } from "@/components/admin/blog-editor-modal"

type Props = {
  initialPosts: BlogPost[]
}

export function BlogAdminView({ initialPosts }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.author.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === "All" || post.category === categoryFilter
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Published" && post.isPublished) ||
      (statusFilter === "Drafts" && !post.isPublished) ||
      (statusFilter === "Featured" && post.featured)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Stats calculation
  const totalCount = posts.length
  const publishedCount = posts.filter((p) => p.isPublished).length
  const draftCount = totalCount - publishedCount
  const featuredCount = posts.filter((p) => p.featured).length

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin/login")
    router.refresh()
  }

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/blog")
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (err) {
      console.error("Failed fetching posts:", err)
    }
  }

  async function handleSavePost(input: BlogPostInput) {
    if (editingPost) {
      // Update
      const res = await fetch(`/api/admin/blog/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error("Failed to update post")
    } else {
      // Create
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error("Failed to create post")
    }
    await fetchPosts()
  }

  async function handleTogglePublish(post: BlogPost) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      })
      if (res.ok) await fetchPosts()
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleFeatured(post: BlogPost) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !post.featured }),
      })
      if (res.ok) await fetchPosts()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
        setDeleteConfirmId(null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-serif text-lg font-bold shadow-sm">
              ॐ
            </span>
            <div>
              <h1 className="font-serif text-lg font-bold leading-none text-foreground">
                Blog Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">Manage OurMithila articles & publications</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="size-3.5 text-muted-foreground" />
              <span>View Public Blog</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ───────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* ── Stat Summary Cards ─────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Posts</p>
              <h3 className="mt-1 font-serif text-3xl font-bold text-foreground">{totalCount}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Published</p>
              <h3 className="mt-1 font-serif text-3xl font-bold text-emerald-700 dark:text-emerald-400">{publishedCount}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Drafts</p>
              <h3 className="mt-1 font-serif text-3xl font-bold text-amber-700 dark:text-amber-400">{draftCount}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-5" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">Featured</p>
              <h3 className="mt-1 font-serif text-3xl font-bold text-purple-700 dark:text-purple-400">{featuredCount}</h3>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="size-5" />
            </div>
          </div>
        </div>

        {/* ── Toolbar & Filters ──────────────────────────── */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles or authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-input bg-card px-3.5 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-input bg-card px-3.5 py-2 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published Only</option>
                <option value="Drafts">Drafts Only</option>
                <option value="Featured">Featured Only</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingPost(null)
              setModalOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
          >
            <Plus className="size-4" />
            <span>Create New Post</span>
          </button>
        </div>

        {/* ── Posts List Table / Cards ──────────────────── */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="size-12 text-muted-foreground/40 mb-3" />
              <h3 className="font-serif text-lg font-bold text-foreground">No posts found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                No articles match your current search or category filter. Try clearing filters or create a new post.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Article</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Author</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                      {/* Title & Cover */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5 max-w-md">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                            <Image
                              src={post.coverImage || "/placeholder.jpg"}
                              alt={post.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="font-serif font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                            >
                              {post.title}
                            </Link>
                            <p className="text-xs text-muted-foreground font-mono truncate">/{post.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 font-medium text-foreground">
                        <span className="inline-flex items-center rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                          {post.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-4 text-muted-foreground font-medium">
                        {post.author}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {post.publishedAt}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              post.isPublished
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            }`}
                          >
                            {post.isPublished ? "Published" : "Draft"}
                          </span>

                          {post.featured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                              <Star className="size-3 fill-purple-600 dark:fill-purple-300" />
                              Featured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Publish */}
                          <button
                            onClick={() => handleTogglePublish(post)}
                            disabled={loading}
                            title={post.isPublished ? "Unpublish (Move to Draft)" : "Publish Article"}
                            className={`p-2 rounded-lg transition-colors ${
                              post.isPublished
                                ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {post.isPublished ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                          </button>

                          {/* Toggle Featured */}
                          <button
                            onClick={() => handleToggleFeatured(post)}
                            disabled={loading}
                            title={post.featured ? "Remove from Featured" : "Mark as Featured"}
                            className={`p-2 rounded-lg transition-colors ${
                              post.featured
                                ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <Star className={`size-4 ${post.featured ? "fill-amber-500" : ""}`} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingPost(post)
                              setModalOpen(true)
                            }}
                            title="Edit Article"
                            className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Edit2 className="size-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(post.id)}
                            title="Delete Article"
                            className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Editor Modal ──────────────────────────────────── */}
      <BlogEditorModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingPost(null)
        }}
        onSave={handleSavePost}
        post={editingPost}
      />

      {/* ── Delete Confirmation Dialog ───────────────────── */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-serif text-lg font-bold text-foreground">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
