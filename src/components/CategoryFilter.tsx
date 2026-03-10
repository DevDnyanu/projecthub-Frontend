import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types/project";
import {
  Globe, Smartphone, Palette, FileText, TrendingUp,
  BarChart3, Code2, Megaphone, Video, DollarSign,
} from "lucide-react";

/* ── icon map ── */
const iconMap: Record<string, React.ElementType> = {
  Globe, Smartphone, Palette, FileText, TrendingUp,
  BarChart3, Code2, Megaphone, Video, DollarSign,
};

/* ── subcategories per category ── */
const SUBCATEGORIES: Record<string, string[]> = {
  "web-dev":           ["React", "Node.js", "WordPress", "Next.js", "Vue.js", "PHP", "Full Stack", "Django", "Laravel"],
  "mobile":            ["React Native", "Flutter", "iOS (Swift)", "Android", "PWA", "Xamarin", "Ionic"],
  "design":            ["Figma", "Adobe XD", "Logo Design", "Brand Identity", "Illustration", "3D Design", "Prototyping"],
  "writing":           ["Blog Writing", "Copywriting", "Technical Writing", "SEO Content", "Translation", "Proofreading", "Ghostwriting"],
  "marketing":         ["Instagram", "Facebook Ads", "LinkedIn", "TikTok", "YouTube", "Content Strategy", "Influencer"],
  "data":              ["Machine Learning", "Python / Pandas", "Data Analysis", "NLP", "Computer Vision", "Deep Learning", "BI / Tableau"],
  "prog-tech":         ["Python", "Java", "C++ / C#", "DevOps", "AWS / GCP", "Docker", "Blockchain", "Cybersecurity"],
  "digital-marketing": ["SEO", "Google Ads", "Email Marketing", "PPC", "Analytics", "Affiliate", "App Store Optimization"],
  "video":             ["Motion Graphics", "2D Animation", "3D Animation", "Video Editing", "YouTube", "VFX", "Explainer Videos"],
  "finance":           ["Bookkeeping", "Tax Preparation", "Financial Modeling", "QuickBooks", "Excel / Sheets", "Budgeting", "Auditing"],
};

/* ── per-category color palette ── */
const CAT_COLORS: Record<string, {
  iconBg: string; iconColor: string;
  activeBg: string; activeRing: string;
  subChip: string; subChipActive: string;
}> = {
  "web-dev":           { iconBg: "bg-blue-500/15",    iconColor: "text-blue-500",    activeBg: "bg-blue-600",    activeRing: "ring-blue-500/40",    subChip: "bg-blue-500/10 border-blue-500/25 text-blue-700 dark:text-blue-400",    subChipActive: "bg-blue-600 border-blue-600 text-white"    },
  "mobile":            { iconBg: "bg-violet-500/15",  iconColor: "text-violet-500",  activeBg: "bg-violet-600",  activeRing: "ring-violet-500/40",  subChip: "bg-violet-500/10 border-violet-500/25 text-violet-700 dark:text-violet-400",  subChipActive: "bg-violet-600 border-violet-600 text-white"  },
  "design":            { iconBg: "bg-pink-500/15",    iconColor: "text-pink-500",    activeBg: "bg-pink-600",    activeRing: "ring-pink-500/40",    subChip: "bg-pink-500/10 border-pink-500/25 text-pink-700 dark:text-pink-400",    subChipActive: "bg-pink-600 border-pink-600 text-white"    },
  "writing":           { iconBg: "bg-amber-500/15",   iconColor: "text-amber-500",   activeBg: "bg-amber-600",   activeRing: "ring-amber-500/40",   subChip: "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400",   subChipActive: "bg-amber-600 border-amber-600 text-white"   },
  "marketing":         { iconBg: "bg-emerald-500/15", iconColor: "text-emerald-500", activeBg: "bg-emerald-600", activeRing: "ring-emerald-500/40", subChip: "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400", subChipActive: "bg-emerald-600 border-emerald-600 text-white" },
  "data":              { iconBg: "bg-cyan-500/15",    iconColor: "text-cyan-500",    activeBg: "bg-cyan-600",    activeRing: "ring-cyan-500/40",    subChip: "bg-cyan-500/10 border-cyan-500/25 text-cyan-700 dark:text-cyan-400",    subChipActive: "bg-cyan-600 border-cyan-600 text-white"    },
  "prog-tech":         { iconBg: "bg-indigo-500/15",  iconColor: "text-indigo-500",  activeBg: "bg-indigo-600",  activeRing: "ring-indigo-500/40",  subChip: "bg-indigo-500/10 border-indigo-500/25 text-indigo-700 dark:text-indigo-400",  subChipActive: "bg-indigo-600 border-indigo-600 text-white"  },
  "digital-marketing": { iconBg: "bg-orange-500/15",  iconColor: "text-orange-500",  activeBg: "bg-orange-600",  activeRing: "ring-orange-500/40",  subChip: "bg-orange-500/10 border-orange-500/25 text-orange-700 dark:text-orange-400",  subChipActive: "bg-orange-600 border-orange-600 text-white"  },
  "video":             { iconBg: "bg-red-500/15",     iconColor: "text-red-500",     activeBg: "bg-red-600",     activeRing: "ring-red-500/40",     subChip: "bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-400",     subChipActive: "bg-red-600 border-red-600 text-white"     },
  "finance":           { iconBg: "bg-green-500/15",   iconColor: "text-green-500",   activeBg: "bg-green-600",   activeRing: "ring-green-500/40",   subChip: "bg-green-500/10 border-green-500/25 text-green-700 dark:text-green-400",   subChipActive: "bg-green-600 border-green-600 text-white"   },
};

const DEFAULT_COLORS = CAT_COLORS["web-dev"];

const FALLBACK_CATEGORIES: Category[] = [
  { id: "web-dev",           name: "Web Development",       icon: "Globe",       count: 0 },
  { id: "mobile",            name: "Mobile Apps",            icon: "Smartphone",  count: 0 },
  { id: "design",            name: "UI/UX & Design",         icon: "Palette",     count: 0 },
  { id: "writing",           name: "Content & Writing",      icon: "FileText",    count: 0 },
  { id: "marketing",         name: "Social Media Marketing", icon: "TrendingUp",  count: 0 },
  { id: "data",              name: "Data Science & AI",      icon: "BarChart3",   count: 0 },
  { id: "prog-tech",         name: "Programming & Tech",     icon: "Code2",       count: 0 },
  { id: "digital-marketing", name: "Digital Marketing",      icon: "Megaphone",   count: 0 },
  { id: "video",             name: "Video & Animation",      icon: "Video",       count: 0 },
  { id: "finance",           name: "Finance & Accounting",   icon: "DollarSign",  count: 0 },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
  selectedSubcategory: string;
  onSubcategorySelect: (sub: string) => void;
}

const CategoryFilter = ({
  selected,
  onSelect,
  selectedSubcategory,
  onSubcategorySelect,
}: CategoryFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subVisible, setSubVisible] = useState(false);
  const [subKey, setSubKey] = useState(0); // forces re-animation on category change

  useEffect(() => {
    api.get<Category[]>("/categories")
      .then((d) => setCategories(d.length > 0 ? d : FALLBACK_CATEGORIES))
      .catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  /* Trigger subcategory panel animation when selected category changes */
  useEffect(() => {
    if (selected) {
      setSubVisible(false);
      const t = setTimeout(() => { setSubVisible(true); setSubKey((k) => k + 1); }, 20);
      return () => clearTimeout(t);
    } else {
      setSubVisible(false);
    }
  }, [selected]);

  const subcats = SUBCATEGORIES[selected] ?? [];
  const activeCols = CAT_COLORS[selected] ?? DEFAULT_COLORS;

  return (
    <div className="space-y-3">

      {/* ── Category chips ── */}
      <div className="flex flex-wrap gap-2">

        {/* All Projects */}
        <button
          onClick={() => { onSelect(""); onSubcategorySelect(""); }}
          className={`card-enter inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
            selected === ""
              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30 scale-[1.03]"
              : "bg-card border-border text-foreground/70 hover:border-primary/40 hover:text-foreground hover:-translate-y-0.5 hover:shadow-sm"
          }`}
        >
          All Projects
        </button>

        {categories.map((cat, i) => {
          const Icon    = iconMap[cat.icon] ?? Globe;
          const col     = CAT_COLORS[cat.id] ?? DEFAULT_COLORS;
          const isActive = selected === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => { onSelect(cat.id); onSubcategorySelect(""); }}
              className={`card-enter inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? `${col.activeBg} text-white border-transparent shadow-lg ring-2 ${col.activeRing} scale-[1.03]`
                  : "bg-card border-border text-foreground/70 hover:border-primary/30 hover:text-foreground hover:-translate-y-0.5 hover:shadow-sm"
              }`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              {/* Icon badge */}
              <span className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                isActive ? "bg-white/25" : col.iconBg
              }`}>
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : col.iconColor}`} />
              </span>

              {cat.name}

              {cat.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none min-w-[18px] text-center transition-colors duration-200 ${
                  isActive ? "bg-white/25 text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Subcategory panel — animated slide-down ── */}
      <div
        className={`overflow-hidden transition-all duration-350 ease-out ${
          selected && subVisible && subcats.length > 0
            ? "opacity-100 max-h-[160px]"
            : "opacity-0 max-h-0 pointer-events-none"
        }`}
        style={{ transitionProperty: "max-height, opacity" }}
      >
        {subcats.length > 0 && (
          <div key={subKey} className="pt-1 pb-0.5">
            {/* Label */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <span className={`inline-block h-1.5 w-4 rounded-full ${activeCols.activeBg}`} />
              Subcategories
            </p>

            <div className="flex flex-wrap gap-1.5">
              {subcats.map((sub, i) => {
                const isActive = selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => onSubcategorySelect(isActive ? "" : sub)}
                    className={`bid-enter rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm ${
                      isActive ? activeCols.subChipActive : activeCols.subChip
                    }`}
                    style={{ animationDelay: `${i * 0.035}s` }}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CategoryFilter;
