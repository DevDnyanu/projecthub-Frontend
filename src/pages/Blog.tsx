import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const posts = [
  {
    slug: "how-to-write-winning-bid",
    title: "How to Write a Winning Bid on ProjectHub",
    excerpt: "Learn the 5 key elements that make a bid stand out and increase your chances of being hired.",
    date: "Feb 15, 2025",
    readTime: "5 min read",
    tag: "Freelancer Tips",
    tagColor: "bg-blue-500/10 text-blue-500",
  },
  {
    slug: "post-project-best-practices",
    title: "Post Projects That Attract Top Talent",
    excerpt: "Clear project briefs get better bids. Here's exactly what to include in your project description.",
    date: "Feb 10, 2025",
    readTime: "4 min read",
    tag: "Client Guide",
    tagColor: "bg-purple-500/10 text-purple-500",
  },
  {
    slug: "india-freelance-market-2025",
    title: "India's Freelance Market: What's Trending in 2025",
    excerpt: "AI, Web3, and short-form video dominate demand. Here's the data on what clients are hiring for.",
    date: "Feb 5, 2025",
    readTime: "7 min read",
    tag: "Industry Insights",
    tagColor: "bg-green-500/10 text-green-500",
  },
  {
    slug: "building-a-portfolio",
    title: "Build a Portfolio That Clients Can't Ignore",
    excerpt: "Your ProjectHub profile is your first impression. Make it count with these proven strategies.",
    date: "Jan 28, 2025",
    readTime: "6 min read",
    tag: "Freelancer Tips",
    tagColor: "bg-blue-500/10 text-blue-500",
  },
  {
    slug: "pricing-your-services",
    title: "How to Price Your Freelance Services in India",
    excerpt: "Stop undercharging. Use this framework to set rates that reflect your skills and market demand.",
    date: "Jan 20, 2025",
    readTime: "8 min read",
    tag: "Freelancer Tips",
    tagColor: "bg-blue-500/10 text-blue-500",
  },
  {
    slug: "client-onboarding",
    title: "The Client Onboarding Checklist Every Freelancer Needs",
    excerpt: "Avoid scope creep and misunderstandings with this step-by-step client onboarding process.",
    date: "Jan 12, 2025",
    readTime: "5 min read",
    tag: "Freelancer Tips",
    tagColor: "bg-blue-500/10 text-blue-500",
  },
];

const Blog = () => (
  <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
    <div className="text-center mb-12 space-y-3">
      <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
        Blog
      </span>
      <h1 className="font-heading text-4xl font-bold text-foreground">Resources & Insights</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Tips for freelancers, guides for clients, and industry trends — all in one place.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="group rounded-xl border border-border bg-card p-6 flex flex-col justify-between gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-200"
        >
          <div className="space-y-3">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${post.tagColor}`}>
              {post.tag}
            </span>
            <h2 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
            </div>
            <Link
              to={`/blog/${post.slug}`}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Read <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  </div>
);

export default Blog;
