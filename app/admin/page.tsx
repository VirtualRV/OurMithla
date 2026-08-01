import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAllAdminPosts } from "@/lib/blog"
import { BlogAdminView } from "@/components/admin/blog-admin-view"

export const metadata = {
  title: "Admin Dashboard | OurMithila",
  description: "Blog Admin Management Panel",
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")

  if (token?.value !== "authenticated") {
    redirect("/admin/login")
  }

  const posts = await getAllAdminPosts()

  return <BlogAdminView initialPosts={posts} />
}
