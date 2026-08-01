import "server-only"
import fs from "fs"
import path from "path"
import { BlogPost, BlogPostInput, CATEGORIES, slugify } from "@/lib/blog-types"

export type { BlogPost, BlogPostInput }
export { CATEGORIES, slugify }

const DATA_FILE = path.join(process.cwd(), "data", "posts.json")

/** Initial seed data fallback if JSON file doesn't exist */
export const SEED_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: "timeless-art-of-madhubani-painting",
    title: "The Timeless Art of Madhubani Painting",
    excerpt:
      "From the mud walls of Mithila homes to galleries across the world — the story of Madhubani art, its motifs, and the women who kept it alive.",
    content:
      "Madhubani painting, also known as Mithila art, is one of the oldest and most celebrated folk art traditions of India. Traditionally painted by women on the freshly plastered walls and floors of their homes, the art form dates back centuries and was passed down from mother to daughter.\n\nThe motifs are deeply symbolic — fish for fertility and good luck, peacocks for love, the sun and moon for cosmic order, and the lotus for purity. Natural pigments derived from turmeric, indigo, soot, and flowers give the paintings their characteristic warm palette.\n\nToday, Madhubani art has found a global audience, adorning everything from sarees to postage stamps, yet its soul remains rooted in the villages of Mithila where it was born.",
    category: "Art",
    author: "Anjali Jha",
    coverImage: "/images/blog-madhubani.png",
    featured: true,
    isPublished: true,
    readMinutes: 6,
    publishedAt: "2026-06-20",
  },
  {
    id: 2,
    slug: "chhath-puja-great-festival-of-the-sun",
    title: "Chhath Puja: The Great Festival of the Sun",
    excerpt:
      "A four-day festival of discipline, devotion, and gratitude to the Sun God — Chhath is the beating heart of Mithila's spiritual calendar.",
    content:
      "Chhath Puja is among the most revered festivals of the Mithila region and the wider Bihar belt. Dedicated to the Sun God, Surya, and his sister Chhathi Maiya, it is a celebration of gratitude for sustaining life on earth.\n\nThe festival spans four days of rigorous rituals: Nahay Khay, Kharna, Sandhya Arghya (evening offerings to the setting sun), and Usha Arghya (morning offerings to the rising sun). Devotees observe a strict fast, sometimes without water, and stand in rivers and ponds to offer prayers.\n\nWhat makes Chhath unique is its purity and its lack of priestly mediation — the devotee connects directly with the divine. It is a festival of the people, celebrated with unmatched fervor.",
    category: "Festivals",
    author: "Ramesh Mishra",
    coverImage: "/images/blog-chhath.png",
    featured: true,
    isPublished: true,
    readMinutes: 5,
    publishedAt: "2026-06-14",
  },
  {
    id: 3,
    slug: "sita-and-the-soul-of-janakpur",
    title: "Sita and the Soul of Janakpur",
    excerpt:
      "Janakpur, the birthplace of Sita, is where mythology and living tradition meet. A journey through its temples, ponds, and legends.",
    content:
      "Janakpur, located in present-day Nepal, is the ancient capital of the Videha kingdom ruled by King Janak. It is revered as the birthplace of Sita (Janaki) and the site of her marriage to Lord Rama.\n\nThe magnificent Janaki Mandir, built in the Koiri-Rajput architectural style, stands as the spiritual centre of the city. Every year, the Vivaha Panchami festival re-enacts the celestial wedding of Sita and Rama, drawing pilgrims from across the subcontinent.\n\nBeyond the temples, Janakpur's sacred ponds and its deep connection to the Ramayana make it a living museum of Mithila's cultural and religious heritage.",
    category: "Heritage",
    author: "Sunita Devi",
    coverImage: "/images/blog-janakpur.png",
    featured: false,
    isPublished: true,
    readMinutes: 7,
    publishedAt: "2026-06-08",
  },
  {
    id: 4,
    slug: "makhana-mithila-superfood",
    title: "Makhana: Mithila's Superfood Gift to the World",
    excerpt:
      "Grown in the ponds of Mithila for generations, fox nuts have become a global health sensation. Here is the story behind the crop.",
    content:
      "Makhana, or fox nuts, are the seeds of the prickly water lily that grows abundantly in the ponds and wetlands of the Mithila region. For generations, the Mallah community has cultivated and harvested this crop through painstaking manual labour.\n\nRich in protein, low in fat, and packed with antioxidants, makhana has recently exploded in popularity as a healthy snack around the world. Bihar produces the vast majority of the world's supply, and Mithila lies at its heart.\n\nBeyond nutrition, makhana holds cultural significance — it is offered in pujas and features in traditional Mithila cuisine, from kheer to curries.",
    category: "Cuisine",
    author: "Priya Karn",
    coverImage: "/images/blog-makhana.png",
    featured: false,
    isPublished: true,
    readMinutes: 4,
    publishedAt: "2026-05-30",
  },
  {
    id: 5,
    slug: "vidyapati-poet-of-the-people",
    title: "Vidyapati: The Poet of the People",
    excerpt:
      "The 14th-century poet whose Maithili verses shaped the language and devotion of an entire region. Meet the Maithil Kavi Kokil.",
    content:
      "Vidyapati Thakur, honoured as the 'Maithil Kavi Kokil' (the poet-cuckoo of Mithila), was a 14th-century poet and scholar whose influence on Maithili literature is immeasurable.\n\nWriting in the language of the common people rather than Sanskrit, Vidyapati brought poetry to the masses. His songs of love and devotion, especially those centred on Radha and Krishna, are still sung across Mithila and Bengal today.\n\nHis work elevated Maithili to a language of high literature and devotion, and his legacy endures in every folk song and festival of the region.",
    category: "Literature",
    author: "Dr. Mohan Thakur",
    coverImage: "/images/blog-vidyapati.png",
    featured: false,
    isPublished: true,
    readMinutes: 6,
    publishedAt: "2026-05-22",
  },
  {
    id: 6,
    slug: "sama-chakeva-festival-of-sibling-love",
    title: "Sama-Chakeva: A Festival of Sibling Love",
    excerpt:
      "As winter birds migrate to Mithila, sisters craft clay figurines and sing folk songs celebrating the bond between brothers and sisters.",
    content:
      "Sama-Chakeva is a beautiful folk festival of Mithila that celebrates the bond between brothers and sisters, much like Raksha Bandhan but with its own unique traditions.\n\nCelebrated during the winter when migratory birds arrive in the region, sisters craft colourful clay figurines of birds and characters from the legend of Sama and her brother Chakeva. In the evenings, girls gather to sing traditional folk songs and enact the story.\n\nThe festival concludes with the symbolic 'farewell' of Sama, reflecting themes of love, sacrifice, and the enduring hope for a sibling's wellbeing.",
    category: "Festivals",
    author: "Kavita Jha",
    coverImage: "/images/blog-sama-chakeva.png",
    featured: false,
    isPublished: true,
    readMinutes: 5,
    publishedAt: "2026-05-15",
  },
]

/* Helper to read posts from data/posts.json */
async function readJsonPosts(): Promise<BlogPost[]> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const dir = path.dirname(DATA_FILE)
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true })
      }
      await fs.promises.writeFile(DATA_FILE, JSON.stringify(SEED_POSTS, null, 2), "utf-8")
      return SEED_POSTS
    }
    const content = await fs.promises.readFile(DATA_FILE, "utf-8")
    const data = JSON.parse(content)
    return Array.isArray(data) ? data : SEED_POSTS
  } catch (err) {
    console.error("[Blog] Failed reading posts.json:", err)
    return SEED_POSTS
  }
}

/* Helper to write posts to data/posts.json */
async function writeJsonPosts(posts: BlogPost[]): Promise<void> {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), "utf-8")
}

/** Like a blog post by ID */
export async function likePost(id: number): Promise<number> {
  const posts = await readJsonPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return 0

  const currentLikes = posts[index].likesCount ?? 0
  const newLikes = currentLikes + 1
  posts[index].likesCount = newLikes

  await writeJsonPosts(posts)
  return newLikes
}

/** Add a comment to a blog post by ID */
export async function addComment(id: number, author: string, content: string) {
  const posts = await readJsonPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return null

  const existingComments = posts[index].comments || []
  const newComment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    author: author.trim() || "Anonymous Reader",
    content: content.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  }

  const updatedComments = [newComment, ...existingComments]
  posts[index].comments = updatedComments

  await writeJsonPosts(posts)
  return updatedComments
}

function computeReadMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function processPost(p: BlogPost): BlogPost {
  return {
    ...p,
    readMinutes: computeReadMinutes(p.content),
    likesCount: p.likesCount ?? 0,
    comments: p.comments || [],
  }
}

/** Fetch all published posts, newest first. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await readJsonPosts()
  return sortByDate(posts.filter((p) => p.isPublished !== false).map(processPost))
}

/** Fetch ALL posts (published and drafts) for admin dashboard */
export async function getAllAdminPosts(): Promise<BlogPost[]> {
  const posts = await readJsonPosts()
  return sortByDate(posts.map(processPost))
}

/** Fetch a single post by slug. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await readJsonPosts()
  const post = posts.find((p) => p.slug === slug && p.isPublished !== false)
  return post ? processPost(post) : null
}

/** Fetch a single post by ID. */
export async function getPostById(id: number): Promise<BlogPost | null> {
  const posts = await readJsonPosts()
  const post = posts.find((p) => p.id === id)
  return post ? processPost(post) : null
}

/** Create a new blog post */
export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const slug = input.slug ? slugify(input.slug) : slugify(input.title)
  const publishedAt = input.publishedAt || new Date().toISOString().slice(0, 10)
  const readMinutes = computeReadMinutes(input.content)
  const featured = Boolean(input.featured)
  const isPublished = input.isPublished !== undefined ? Boolean(input.isPublished) : true

  const posts = await readJsonPosts()
  const maxId = posts.reduce((max, p) => (p.id > max ? p.id : max), 0)
  const newPost: BlogPost = {
    id: maxId + 1,
    slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    category: input.category,
    author: input.author,
    coverImage: input.coverImage || "/placeholder.jpg",
    pdfUrl: input.pdfUrl || undefined,
    pdfTitle: input.pdfTitle || undefined,
    featured,
    isPublished,
    readMinutes,
    publishedAt,
    likesCount: 0,
    comments: [],
  }

  posts.unshift(newPost)
  await writeJsonPosts(posts)
  return newPost
}

/** Update an existing blog post */
export async function updatePost(id: number, input: Partial<BlogPostInput>): Promise<BlogPost | null> {
  const posts = await readJsonPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return null

  const existing = posts[index]
  const slug = input.slug ? slugify(input.slug) : existing.slug
  const title = input.title ?? existing.title
  const excerpt = input.excerpt ?? existing.excerpt
  const content = input.content ?? existing.content
  const category = input.category ?? existing.category
  const author = input.author ?? existing.author
  const coverImage = input.coverImage ?? existing.coverImage
  const pdfUrl = input.pdfUrl !== undefined ? input.pdfUrl : existing.pdfUrl
  const pdfTitle = input.pdfTitle !== undefined ? input.pdfTitle : existing.pdfTitle
  const featured = input.featured !== undefined ? Boolean(input.featured) : existing.featured
  const isPublished = input.isPublished !== undefined ? Boolean(input.isPublished) : existing.isPublished
  const readMinutes = computeReadMinutes(content)
  const publishedAt = input.publishedAt ?? existing.publishedAt

  const updated: BlogPost = {
    ...existing,
    slug,
    title,
    excerpt,
    content,
    category,
    author,
    coverImage,
    pdfUrl,
    pdfTitle,
    featured,
    isPublished,
    readMinutes,
    publishedAt,
  }

  posts[index] = updated
  await writeJsonPosts(posts)
  return updated
}

/** Delete a blog post by ID */
export async function deletePost(id: number): Promise<boolean> {
  const posts = await readJsonPosts()
  const filtered = posts.filter((p) => p.id !== id)
  if (filtered.length === posts.length) return false

  await writeJsonPosts(filtered)
  return true
}

function sortByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}


