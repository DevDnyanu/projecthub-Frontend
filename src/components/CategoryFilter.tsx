import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Smartphone, Palette, FileText, TrendingUp,
  BarChart3, Code2, Megaphone, Video, DollarSign,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Globe:       <Globe className="h-4 w-4" />,
  Smartphone:  <Smartphone className="h-4 w-4" />,
  Palette:     <Palette className="h-4 w-4" />,
  FileText:    <FileText className="h-4 w-4" />,
  TrendingUp:  <TrendingUp className="h-4 w-4" />,
  BarChart3:   <BarChart3 className="h-4 w-4" />,
  Code2:       <Code2 className="h-4 w-4" />,
  Megaphone:   <Megaphone className="h-4 w-4" />,
  Video:       <Video className="h-4 w-4" />,
  DollarSign:  <DollarSign className="h-4 w-4" />,
};

const FALLBACK_CATEGORIES: Category[] = [
  { id: "web-dev",           name: "Web Development",      icon: "Globe",       count: 0 },
  { id: "mobile",            name: "Mobile Apps",           icon: "Smartphone",  count: 0 },
  { id: "design",            name: "UI/UX & Design",        icon: "Palette",     count: 0 },
  { id: "writing",           name: "Content & Writing",     icon: "FileText",    count: 0 },
  { id: "marketing",         name: "Social Media Marketing",icon: "TrendingUp",  count: 0 },
  { id: "data",              name: "Data Science & AI",     icon: "BarChart3",   count: 0 },
  { id: "prog-tech",         name: "Programming & Tech",    icon: "Code2",       count: 0 },
  { id: "digital-marketing", name: "Digital Marketing",     icon: "Megaphone",   count: 0 },
  { id: "video",             name: "Video & Animation",     icon: "Video",       count: 0 },
  { id: "finance",           name: "Finance & Accounting",  icon: "DollarSign",  count: 0 },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>("/categories")
      .then((data) => setCategories(data.length > 0 ? data : FALLBACK_CATEGORIES))
      .catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onSelect("")}>
        <Badge
          variant={selected === "" ? "default" : "secondary"}
          className="cursor-pointer px-3 py-1.5 text-sm transition-colors"
        >
          All Projects
        </Badge>
      </button>
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => onSelect(cat.id)}>
          <Badge
            variant={selected === cat.id ? "default" : "secondary"}
            className="cursor-pointer gap-1.5 px-3 py-1.5 text-sm transition-colors"
          >
            {iconMap[cat.icon]}
            {cat.name}
            {cat.count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-black/10 dark:bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold leading-none min-w-[18px]">
                {cat.count}
              </span>
            )}
          </Badge>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
