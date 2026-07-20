import { supabase } from "@/integrations/supabase/client";

export type Brand = {
  id: string;
  slug: string;
  name: string;
  company_name: string | null;
  owner_name: string | null;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  category: string | null;
  hq_city: string | null;
  hq_state: string | null;
  address: string | null;
  pincode: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  pan_number: string | null;
  business_type: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  document_urls: string[] | null;
  gallery_urls: string[] | null;
  is_featured: boolean;
  is_sponsored: boolean;
};

export type Distributor = {
  id: string;
  slug: string;
  company_name: string;
  owner_name: string | null;
  contact_person: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  address: string | null;
  pincode: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  gst_number: string | null;
  pan_number: string | null;
  business_type: string | null;
  years_in_business: number | null;
  coverage_states: string[] | null;
  coverage_districts: string[] | null;
  categories: string[] | null;
  brands_handled: string[] | null;
  document_urls: string[] | null;
  gallery_urls: string[] | null;
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
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

export async function listBrands() {
  const { data, error } = await supabase
    .from("brands_public")
    .select("*")
    .eq("status", "active")
    .order("is_sponsored", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Brand[];
}

export async function listDistributors() {
  const { data, error } = await supabase
    .from("distributors_public")
    .select("*")
    .eq("status", "active")
    .order("is_sponsored", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Distributor[];
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

// Private queries for authenticated user's own data - these remain on private tables
export async function getMyBrand(userId: string) {
  const { data } = await supabase.from("brands").select("*").eq("user_id", userId).maybeSingle();
  return data as Brand | null;
}

export async function getMyDistributor(userId: string) {
  const { data } = await supabase
    .from("distributors")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data as Distributor | null;
}

export async function getMyLeads(userId: string) {
  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  const { data: dist } = await supabase
    .from("distributors")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  const brandId = brand?.id;
  const distId = dist?.id;
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

// ---- Brand <-> Distributor connections ----

const BDC = "brand_distributor_connections" as any;

export async function listMyConnections(userId: string): Promise<BrandDistributorConnection[]> {
  const { data, error } = await (supabase as any)
    .from(BDC)
    .select("*, brand:brands(id,name,logo_url), distributor:distributors(id,company_name,logo_url)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BrandDistributorConnection[];
}

export async function createConnection(args: {
  brand_id: string;
  distributor_id: string;
  initiated_by: "brand" | "distributor";
  message?: string;
  territory_notes?: string;
}) {
  const { error } = await (supabase as any).from(BDC).insert({
    brand_id: args.brand_id,
    distributor_id: args.distributor_id,
    initiated_by: args.initiated_by,
    message: args.message || null,
    territory_notes: args.territory_notes || null,
  });
  if (error) throw error;
}

export async function respondConnection(id: string, status: "accepted" | "rejected" | "cancelled") {
  const { error } = await (supabase as any)
    .from(BDC)
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// Public discovery queries - use public views
export async function listBrandsLite() {
  const { data, error } = await supabase
    .from("brands_public")
    .select("id,name,logo_url")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function listDistributorsLite() {
  const { data, error } = await supabase
    .from("distributors_public")
    .select("id,company_name,logo_url,state")
    .eq("status", "active")
    .order("company_name");
  if (error) throw error;
  return data ?? [];
}

export async function getBrandBySlug(slug: string) {
  const { data, error } = await supabase
    .from("brands_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Brand | null) ?? null;
}

export async function getDistributorBySlug(slug: string) {
  const { data, error } = await supabase
    .from("distributors_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Distributor | null) ?? null;
}

export async function listProductsByBrand(brandId: string) {
  const { data, error } = await supabase
    .from("brand_products")
    .select("*")
    .eq("brand_id", brandId)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BrandProduct[];
}
