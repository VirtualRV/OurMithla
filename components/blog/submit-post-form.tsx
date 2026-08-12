"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  Tag,
  Upload,
  User,
  Mail,
  FileText,
} from "lucide-react"
import { CATEGORIES } from "@/lib/blog-types"
import { useI18n } from "@/components/i18n-provider"
import { saveVisitorProfile } from "@/lib/visitor-profile"

export function SubmitPostForm() {
  const { t } = useI18n()
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("/placeholder.jpg")
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const data = new FormData()
      data.append("file", file)
      const res = await fetch("/api/blog/upload", { method: "POST", body: data })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Upload failed")
      setCoverImage(json.url)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/blog/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          submitterEmail: email,
          category,
          excerpt,
          content,
          coverImage,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Submission failed")
      saveVisitorProfile({ name: author, email, source: "submit" })
      setSuccess(true)
      setTitle("")
      setAuthor("")
      setEmail("")
      setExcerpt("")
      setContent("")
      setCoverImage("/placeholder.jpg")
      setCategory(CATEGORIES[0])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">{t("submit.successTitle")}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("submit.successDesc")}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
          >
            {t("submit.another")}
          </button>
          <Link
            href="/blog"
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t("blog.backToBlog")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
        {t("submit.notice")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="size-3.5 text-primary" /> {t("submit.form.title")} *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder={t("submit.form.titlePlaceholder")}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Tag className="size-3.5 text-primary" /> {t("submit.form.category")} *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <User className="size-3.5 text-primary" /> {t("submit.form.author")} *
          </label>
          <input
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t("submit.form.authorPlaceholder")}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Mail className="size-3.5 text-primary" /> {t("submit.form.email")} *
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("submit.form.emailPlaceholder")}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="size-3.5 text-primary" /> {t("submit.form.cover")}
          </span>
          <span className="font-normal normal-case tracking-normal text-[11px]">
            {t("submit.form.coverHint")}
          </span>
        </label>
        <div className="flex gap-2">
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-medium hover:bg-muted/80">
            {uploading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Upload className="size-4 text-primary" />
            )}
            <span>{t("submit.form.upload")}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleCoverUpload}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <FileText className="size-3.5 text-primary" /> {t("submit.form.excerpt")} *
        </label>
        <textarea
          required
          rows={2}
          maxLength={500}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder={t("submit.form.excerptPlaceholder")}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("submit.form.content")} *
        </label>
        <textarea
          required
          rows={10}
          maxLength={50000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("submit.form.contentPlaceholder")}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex items-center justify-end border-t border-border pt-5">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? (
            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Send className="size-4" />
          )}
          <span>{submitting ? t("submit.form.submitting") : t("submit.form.submit")}</span>
        </button>
      </div>
    </form>
  )
}
