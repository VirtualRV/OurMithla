"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Image as ImageIcon, BookOpen, User, Tag, Clock, FileText, Check } from "lucide-react"
import type { BlogPost, BlogPostInput } from "@/lib/blog-types"
import { CATEGORIES, slugify } from "@/lib/blog-types"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: BlogPostInput) => Promise<void>
  post?: BlogPost | null
}

export function BlogEditorModal({ isOpen, onClose, onSave, post }: Props) {
  const [formData, setFormData] = useState<BlogPostInput>({
    title: "",
    slug: "",
    category: "Art",
    author: "",
    coverImage: "/images/blog-madhubani.png",
    excerpt: "",
    content: "",
    readMinutes: 5,
    featured: false,
    isPublished: true,
    publishedAt: new Date().toISOString().slice(0, 10),
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSlug, setAutoSlug] = useState(true)

  useEffect(() => {
    if (post) {
      setFormData({
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        author: post.author,
        coverImage: post.coverImage,
        excerpt: post.excerpt,
        content: post.content,
        readMinutes: post.readMinutes,
        featured: post.featured,
        isPublished: post.isPublished !== undefined ? post.isPublished : true,
        publishedAt: post.publishedAt || new Date().toISOString().slice(0, 10),
      })
      setAutoSlug(false)
    } else {
      setFormData({
        title: "",
        slug: "",
        category: "Art",
        author: "OurMithila Team",
        coverImage: "/images/blog-madhubani.png",
        excerpt: "",
        content: "",
        readMinutes: 5,
        featured: false,
        isPublished: true,
        publishedAt: new Date().toISOString().slice(0, 10),
      })
      setAutoSlug(true)
    }
    setError(null)
  }, [post, isOpen])

  if (!isOpen) return null

  function handleTitleChange(val: string) {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug ? slugify(val) : prev.slug,
    }))
  }

  function handleContentChange(val: string) {
    // Estimate read time automatically if not explicitly set
    const words = val.trim().split(/\s+/).filter(Boolean).length
    const estimatedMinutes = Math.max(1, Math.ceil(words / 200))
    setFormData((prev) => ({
      ...prev,
      content: val,
      readMinutes: estimatedMinutes,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title || !formData.excerpt || !formData.content) {
      setError("Title, Excerpt, and Content are required fields.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave({
        ...formData,
        slug: formData.slug ? slugify(formData.slug) : slugify(formData.title),
      })
      onClose()
    } catch (err) {
      setError((err as Error).message || "Failed to save blog post")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">
                {post ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {post ? `Editing Post #${post.id}` : "Publish or draft a new article for OurMithila"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Title & Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. The Heritage of Madhubani Art"
                required
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  {autoSlug ? "Manual Slug" : "Auto-generate"}
                </button>
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setAutoSlug(false)
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }}
                placeholder="heritage-of-madhubani-art"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-mono text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Category & Author */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Tag className="size-3.5 text-primary" /> Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <User className="size-3.5 text-primary" /> Author *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Author Name"
                required
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" /> Read Time (Mins)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.readMinutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, readMinutes: parseInt(e.target.value) || 1 }))}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-primary" /> Cover Image URL
            </label>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
              placeholder="/images/blog-madhubani.png or https://..."
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" /> Excerpt / Summary *
            </label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Short catchy summary displayed on post cards..."
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Article Content * (Paragraphs separated by double line breaks)
            </label>
            <textarea
              rows={8}
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write the article content here..."
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Controls / Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/20 p-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="size-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm font-semibold text-foreground">
                Publish Immediately
              </span>
              <span className="text-xs text-muted-foreground">
                ({formData.isPublished ? "Visible to public" : "Saved as Draft"})
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                className="size-4 rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-500 fill-amber-500/20" />
                Featured Post
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Check className="size-4" />
              )}
              <span>{post ? "Save Changes" : "Create Article"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
