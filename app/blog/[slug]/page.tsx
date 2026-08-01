import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, CalendarDays, User, Tag, ArrowRight, Heart, MessageSquare } from "lucide-react"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { BlogInteractions } from "@/components/blog/blog-interactions"
import { BlogTranslationWrapper } from "@/components/blog/blog-translation-wrapper"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Post Not Found" }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  }
}

// Category accent colours (matches blog-view pills)
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Art:        { bg: "bg-violet-100 dark:bg-violet-900/30",  text: "text-violet-700 dark:text-violet-300" },
  Festivals:  { bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-300" },
  Heritage:   { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  Cuisine:    { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  Literature: { bg: "bg-sky-100 dark:bg-sky-900/30",       text: "text-sky-700 dark:text-sky-300" },
}

function formatDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getAllPosts()])

  if (!post) notFound()

  const catColor = CATEGORY_COLORS[post.category] ?? {
    bg: "bg-primary/10",
    text: "text-primary",
  }

  // Related posts: same category, excluding current
  const related = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3)

  // If not enough related, fill with other recent posts
  const moreRecent = allPosts
    .filter((p) => p.slug !== slug && !related.find((r) => r.id === p.id))
    .slice(0, 3 - related.length)

  const relatedPosts = [...related, ...moreRecent]

  // Split content into paragraphs
  const paragraphs = post.content.split(/\n\n+/).filter(Boolean)

  return (
    <div className="bg-background">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative h-[55vh] min-h-[320px] w-full overflow-hidden sm:h-[65vh]">
        <Image
          src={post.coverImage || "/placeholder.jpg"}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back link */}
        <div className="absolute left-0 right-0 top-0 mx-auto max-w-4xl px-4 pt-6 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ArrowLeft className="size-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* ── Article Body with Dynamic Language Translation ── */}
        <BlogTranslationWrapper
          originalTitle={post.title}
          originalExcerpt={post.excerpt}
          originalParagraphs={paragraphs}
          category={post.category}
          author={post.author}
          publishedAtFormatted={formatDate(post.publishedAt)}
          readMinutes={post.readMinutes}
          likesCount={post.likesCount ?? 0}
          commentsCount={post.comments?.length ?? 0}
          catColor={catColor}
          pdfUrl={post.pdfUrl}
          pdfTitle={post.pdfTitle}
        />

        {/* Interactive Likes & Comments */}
        <BlogInteractions
          postId={post.id}
          initialLikes={post.likesCount ?? 0}
          initialComments={post.comments || []}
        />

        {/* Tags / share row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 pb-16 mt-8">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${catColor.bg} ${catColor.text}`}
          >
            <Tag className="size-3" />
            {post.category}
          </span>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all articles
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* ── Related Posts ─────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="font-serif text-2xl text-foreground">More to Read</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => {
                const rc = CATEGORY_COLORS[rp.category] ?? { bg: "bg-primary/10", text: "text-primary" }
                return (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={rp.coverImage || "/placeholder.jpg"}
                        alt={rp.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${rc.bg} ${rc.text}`}
                      >
                        {rp.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-serif text-base leading-snug text-foreground text-balance transition-colors group-hover:text-primary">
                        {rp.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {rp.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{rp.author}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {rp.readMinutes} min
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
