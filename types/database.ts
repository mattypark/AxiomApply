/** Row types mirrored from supabase/migrations/*.sql (hand-maintained). */

export type Profile = {
  id: string;
  role: "intern" | "startup" | null;
  is_admin: boolean;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  school: string | null;
  grade: string | null;
  preferred_seasons: string[];
  preferred_fields: string[];
  experience: string | null;
  company: string | null;
  linkedin: string | null;
  social: string | null;
  github: string | null;
  looking_for: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
};

export type Source = {
  id: string;
  name: string;
  url: string;
  adapter: "simplify_github" | "interndock_html" | "generic_json" | "manual";
  config: Record<string, unknown>;
  active: boolean;
  last_run_at: string | null;
  last_status: string | null;
  last_count: number | null;
  created_at: string;
};

export type Internship = {
  id: string;
  source_id: string | null;
  company: string;
  role: string;
  season: "summer" | "fall" | "winter" | "spring";
  year: number | null;
  locations: string[];
  url: string | null;
  sponsorship: string | null;
  categories: string[];
  is_open: boolean;
  featured: boolean;
  first_seen_at: string;
  last_seen_at: string;
  dedupe_key: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_url: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LearnModule = {
  id: string;
  slug: string;
  track: string;
  title: string;
  order_index: number;
  body_md: string;
  published: boolean;
  created_at: string;
};

export type Resource = {
  id: string;
  kind: "website" | "github_repo" | "guide" | "video";
  title: string;
  url: string;
  description: string | null;
  tags: string[];
  order_index: number;
  published: boolean;
  created_at: string;
};

export type Video = {
  id: string;
  title: string;
  embed_url: string;
  order_index: number;
  published: boolean;
  created_at: string;
};

export type StartupInquiry = {
  id: string;
  company: string;
  name: string;
  email: string;
  message: string | null;
  role_interest: string | null;
  handled: boolean;
  created_at: string;
};

export const SEASONS = ["summer", "fall", "winter", "spring"] as const;
export const FIELDS = [
  "AI",
  "Computer Science",
  "Marketing",
  "Finance",
  "Design",
  "Startups",
] as const;
