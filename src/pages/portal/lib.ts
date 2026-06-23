import { supabase } from "@/integrations/supabase/client";

export type Brand = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  category: string | null;
  hq_city: string | null;
  hq_state: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  is_featured: boolean;
  is_sponsored: boolean;
};

export type Distributor = {
  id: string;
  slug: string;
  company_name: string;
  contact_person: string | null;
  description: string | null;
  logo_url: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  coverage_states: string[] | null;
  coverage_districts: string[] | null;
  categories: string[] | null;
  brands_handled: string[] | null;
  is_featured: boolean;
  is_sponsored: boolean;
};

export type BrandDistributorConnection = {
  id: string;
  brand_id: string;
  distributor_id: string;
  initiated_by: "brand" | "distributor";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message: string | null;
  territory_notes: string | null;
  responded_at: string | null;
  created_at: string;
  brand?: { id: string; name: string; logo_url: string | null } | null;
  distributor?: { id: string; company_name: string; logo_url: string | null } | null;
};

export type BrandProduct = {
  id: string;
  brand_id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  price: number | null;
  mrp: number | null;
  is_featured: boolean;
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) + "-" + Math.random().toString(36).slice(2, 6);
}

export async function listBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("status", "active")
    .order("is_sponsored", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Brand[];
}

export async function listDistributors() {
  const { data, error } = await supabase
    .from("distributors")
    .select("*")
    .eq("status", "active")
    .order("is_sponsored", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Distributor[];
}

export async function listProducts() {
  const { data, error } = await supabase
    .from("brand_products")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BrandProduct[];
}

export async function getMyBrand(userId: string) {
  const { data } = await supabase.from("brands").select("*").eq("user_id", userId).maybeSingle();
  return data as Brand | null;
}

export async function getMyDistributor(userId: string) {
  const { data } = await supabase.from("distributors").select("*").eq("user_id", userId).maybeSingle();
  return data as Distributor | null;
}

export async function getMyLeads(userId: string) {
  const { data: brand } = await supabase.from("brands").select("id").eq("user_id", userId).maybeSingle();
  const { data: dist } = await supabase.from("distributors").select("id").eq("user_id", userId).maybeSingle();
  const ids: string[] = [];
  const brandId = brand?.id; const distId = dist?.id;
  if (!brandId && !distId) return [];
  const filters: string[] = [];
  if (brandId) filters.push(`brand_id.eq.${brandId}`);
  if (distId) filters.push(`distributor_id.eq.${distId}`);
  const { data, error } = await supabase
    .from("portal_leads")
    .select("*")
    .or(filters.join(","))
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
