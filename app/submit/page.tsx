import type { Metadata } from "next"
import { SubmitPostForm } from "@/components/blog/submit-post-form"

export const metadata: Metadata = {
  title: "Submit an Article",
  description:
    "Share your Mithila story, festival memory, or cultural article. Submissions are reviewed by OurMithla admins before publishing.",
}

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Community</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Submit an Article
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Share stories of Mithila — art, festivals, food, heritage, or literature. An admin will
          review your draft before it appears on the blog.
        </p>
      </div>
      <SubmitPostForm />
    </div>
  )
}
