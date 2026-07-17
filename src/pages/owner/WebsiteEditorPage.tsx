import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getOrCreateMyWebsite,
  getMyWebsiteBundle,
  updateSection,
  updateTheme,
  publishWebsite,
  reorderSections,
  listWebsiteVersions,
  saveDraftVersion,
  restoreWebsiteVersion,
  getWebsiteVersionSnapshot,
  type WebsiteSection,
  type SectionType,
} from "@/lib/website-editor.functions";
import { getMyOwnedSalons, listOwnerServices } from "@/lib/owner.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Globe, Plus, Trash2, Upload, Image as ImageIcon, Palette, GripVertical, History, Undo2, Save, GitCompare, Monitor, Tablet, Smartphone, Wand2, MapPinned, ListChecks } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type NavLink = { id: string; label: string; url: string };

type BgStyle = "solid" | "gradient" | "dots" | "grid" | "diagonal" | "soft-radial";

type ThemeExtras = {
  header_bg?: string;
  header_text?: string;
  link_color?: string;
  link_style?: "underline" | "none" | "hover-underline";
  nav_links?: NavLink[];
  site_title?: string;
  bg_style?: BgStyle;
  bg_gradient_from?: string;
  bg_gradient_to?: string;
  bg_gradient_angle?: number;
  bg_pattern_color?: string;
  bg_pattern_size?: number;
};

type ThemeState = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  button_style: string;
  extras: ThemeExtras;
};

const DEFAULT_NAV: NavLink[] = [
  { id: "n1", label: "About", url: "#about" },
  { id: "n2", label: "Services", url: "#services" },
  { id: "n3", label: "Contact", url: "#contact" },
];

const DEFAULT_EXTRAS: ThemeExtras = {
  header_bg: "#FFFFFF",
  header_text: "#111827",
  link_color: "#4F46E5",
  link_style: "hover-underline",
  nav_links: DEFAULT_NAV,
  site_title: "Home",
  bg_style: "solid",
  bg_gradient_from: "#FFFFFF",
  bg_gradient_to: "#F1F5F9",
  bg_gradient_angle: 135,
  bg_pattern_color: "#E5E7EB",
  bg_pattern_size: 24,
};

const BG_STYLES: { value: BgStyle; label: string; description: string }[] = [
  { value: "solid", label: "Solid", description: "Flat background color" },
  { value: "gradient", label: "Gradient", description: "Two-color smooth blend" },
  { value: "soft-radial", label: "Soft Glow", description: "Radial highlight from center" },
  { value: "dots", label: "Dots", description: "Subtle dotted pattern" },
  { value: "grid", label: "Grid", description: "Fine grid lines" },
  { value: "diagonal", label: "Stripes", description: "Diagonal stripes" },
];

const DEFAULT_THEME: ThemeState = {
  primary_color: "#111827",
  secondary_color: "#F59E0B",
  accent_color: "#10B981",
  background_color: "#FFFFFF",
  text_color: "#111827",
  heading_font: "Inter",
  body_font: "Inter",
  button_style: "rounded",
  extras: DEFAULT_EXTRAS,
};

const FONT_OPTIONS = ["Inter", "Poppins", "Playfair Display", "Montserrat", "Lora", "Roboto", "Merriweather", "Space Grotesk"];
const BUTTON_STYLES = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
];

const THEME_PRESETS: { key: string; name: string; description: string; theme: ThemeState }[] = [
  {
    key: "default",
    name: "Default",
    description: "Reset to defaults",
    theme: DEFAULT_THEME,
  },
  {
    key: "classic",
    name: "Classic Elegance",
    description: "Warm gold on navy · serif",
    theme: {
      primary_color: "#1E293B",
      secondary_color: "#D4A24C",
      accent_color: "#B45309",
      background_color: "#FAF7F2",
      text_color: "#1E293B",
      heading_font: "Playfair Display",
      body_font: "Lora",
      button_style: "rounded",
      extras: {
        header_bg: "#1E293B", header_text: "#FAF7F2", link_color: "#D4A24C", link_style: "hover-underline",
        bg_style: "soft-radial", bg_gradient_from: "#FAF7F2", bg_gradient_to: "#EFE7D6", bg_gradient_angle: 135,
      },
    },
  },
  {
    key: "modern",
    name: "Modern Studio",
    description: "Indigo · clean sans · gradient",
    theme: {
      primary_color: "#4F46E5",
      secondary_color: "#F59E0B",
      accent_color: "#10B981",
      background_color: "#FFFFFF",
      text_color: "#0F172A",
      heading_font: "Space Grotesk",
      body_font: "Inter",
      button_style: "pill",
      extras: {
        header_bg: "#FFFFFF", header_text: "#0F172A", link_color: "#4F46E5", link_style: "hover-underline",
        bg_style: "gradient", bg_gradient_from: "#EEF2FF", bg_gradient_to: "#FFFFFF", bg_gradient_angle: 160,
      },
    },
  },
  {
    key: "minimal",
    name: "Minimal Mono",
    description: "Monochrome · Swiss grid",
    theme: {
      primary_color: "#000000",
      secondary_color: "#111111",
      accent_color: "#666666",
      background_color: "#FFFFFF",
      text_color: "#111111",
      heading_font: "Montserrat",
      body_font: "Inter",
      button_style: "square",
      extras: {
        header_bg: "#FFFFFF", header_text: "#111111", link_color: "#111111", link_style: "underline",
        bg_style: "grid", bg_pattern_color: "#EEEEEE", bg_pattern_size: 32,
      },
    },
  },
  {
    key: "luxury",
    name: "Luxury Noir",
    description: "Rose gold on charcoal",
    theme: {
      primary_color: "#111111",
      secondary_color: "#E5B8A6",
      accent_color: "#8B5E3C",
      background_color: "#0F0F0F",
      text_color: "#F5F0EB",
      heading_font: "Playfair Display",
      body_font: "Montserrat",
      button_style: "pill",
      extras: {
        header_bg: "#0F0F0F", header_text: "#F5F0EB", link_color: "#E5B8A6", link_style: "hover-underline",
        bg_style: "soft-radial", bg_gradient_from: "#1A1A1A", bg_gradient_to: "#0F0F0F", bg_gradient_angle: 135,
      },
    },
  },
  {
    key: "fresh",
    name: "Fresh Mint",
    description: "Mint & coral · playful",
    theme: {
      primary_color: "#0F766E",
      secondary_color: "#FB7185",
      accent_color: "#FDE68A",
      background_color: "#F0FDFA",
      text_color: "#134E4A",
      heading_font: "Poppins",
      body_font: "Poppins",
      button_style: "rounded",
      extras: {
        header_bg: "#0F766E", header_text: "#F0FDFA", link_color: "#FB7185", link_style: "hover-underline",
        bg_style: "dots", bg_pattern_color: "#A7F3D0", bg_pattern_size: 22,
      },
    },
  },
  {
    key: "editorial",
    name: "Editorial Ink",
    description: "Serif magazine · paper",
    theme: {
      primary_color: "#1A1A1A",
      secondary_color: "#B91C1C",
      accent_color: "#7C2D12",
      background_color: "#F5F3EE",
      text_color: "#1A1A1A",
      heading_font: "Playfair Display",
      body_font: "Merriweather",
      button_style: "square",
      extras: {
        header_bg: "#F5F3EE", header_text: "#1A1A1A", link_color: "#B91C1C", link_style: "underline",
        bg_style: "solid",
      },
    },
  },
  {
    key: "ocean",
    name: "Ocean Deep",
    description: "Teal gradient · airy",
    theme: {
      primary_color: "#0C2340",
      secondary_color: "#5CBDB9",
      accent_color: "#2D8A9E",
      background_color: "#F0F9FF",
      text_color: "#0C2340",
      heading_font: "Space Grotesk",
      body_font: "Inter",
      button_style: "rounded",
      extras: {
        header_bg: "#0C2340", header_text: "#F0F9FF", link_color: "#2D8A9E", link_style: "hover-underline",
        bg_style: "gradient", bg_gradient_from: "#E0F2FE", bg_gradient_to: "#F0F9FF", bg_gradient_angle: 180,
      },
    },
  },
  {
    key: "sunset",
    name: "Sunset Blaze",
    description: "Warm gradient · bold",
    theme: {
      primary_color: "#6C5CE7",
      secondary_color: "#FF6B35",
      accent_color: "#E84393",
      background_color: "#FFF7ED",
      text_color: "#1F2937",
      heading_font: "Poppins",
      body_font: "Inter",
      button_style: "pill",
      extras: {
        header_bg: "#FFFFFF", header_text: "#1F2937", link_color: "#E84393", link_style: "hover-underline",
        bg_style: "gradient", bg_gradient_from: "#FED7AA", bg_gradient_to: "#FBCFE8", bg_gradient_angle: 135,
      },
    },
  },
  {
    key: "botanical",
    name: "Botanical",
    description: "Sage & cream · organic",
    theme: {
      primary_color: "#1A3C2A",
      secondary_color: "#A8C0A0",
      accent_color: "#7D9B76",
      background_color: "#F5F0E8",
      text_color: "#1A3C2A",
      heading_font: "Lora",
      body_font: "Nunito Sans",
      button_style: "rounded",
      extras: {
        header_bg: "#1A3C2A", header_text: "#F5F0E8", link_color: "#7D9B76", link_style: "hover-underline",
        bg_style: "dots", bg_pattern_color: "#DCE5D4", bg_pattern_size: 26,
      },
    },
  },
  {
    key: "brutalist",
    name: "Brutalist Pop",
    description: "High contrast · yellow accent",
    theme: {
      primary_color: "#0A0A0A",
      secondary_color: "#FFEB3B",
      accent_color: "#FF5722",
      background_color: "#FFFFFF",
      text_color: "#0A0A0A",
      heading_font: "Space Grotesk",
      body_font: "Inter",
      button_style: "square",
      extras: {
        header_bg: "#0A0A0A", header_text: "#FFEB3B", link_color: "#FF5722", link_style: "underline",
        bg_style: "diagonal", bg_pattern_color: "#F5F5F5", bg_pattern_size: 20,
      },
    },
  },
  {
    key: "midnight",
    name: "Midnight Tech",
    description: "Dark indigo · neon glow",
    theme: {
      primary_color: "#818CF8",
      secondary_color: "#F472B6",
      accent_color: "#34D399",
      background_color: "#0A0A1A",
      text_color: "#E0E7FF",
      heading_font: "Space Grotesk",
      body_font: "Inter",
      button_style: "pill",
      extras: {
        header_bg: "#0A0A1A", header_text: "#E0E7FF", link_color: "#818CF8", link_style: "hover-underline",
        bg_style: "soft-radial", bg_gradient_from: "#1E1B4B", bg_gradient_to: "#0A0A1A", bg_gradient_angle: 135,
      },
    },
  },
];

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero / Banner",
  about: "About Us",
  services: "Services",
  rate_card: "Rate Card",
  packages: "Packages",
  offers: "Current Offers",
  staff: "Meet the Team",
  membership: "Membership",
  gallery: "Gallery",
  blog: "Blog",
  contact: "Contact",
};

type OwnerServiceOption = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  duration_minutes?: number | null;
  price?: number | string | null;
  image_url?: string | null;
};

type SalonBasics = {
  name?: string | null;
  address?: string | null;
  location?: string | null;
  phone?: string | null;
};

type BusinessRole = "Salon" | "Barber" | "Makeup Studio" | "Spa" | "Nail Studio";

const BUSINESS_ROLES: BusinessRole[] = ["Salon", "Barber", "Makeup Studio", "Spa", "Nail Studio"];

const STAFF_ROLE_OPTIONS = [
  "Senior Stylist",
  "Hair Stylist",
  "Master Barber",
  "Makeup Artist",
  "Nail Artist",
  "Beautician",
  "Spa Therapist",
  "Receptionist",
  "Manager",
];

function mapsEmbedFromAddress(address?: string | null) {
  const q = (address ?? "").trim();
  return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : "";
}

function mapsEmbedFromCoords(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=16&output=embed`;
}

function normalizeServiceItem(s: OwnerServiceOption): Item {
  return {
    id: s.id,
    name: s.name,
    price: s.price === null || s.price === undefined ? "" : String(s.price),
    duration: `${s.duration_minutes ?? 30} min`,
    description: s.description ?? "",
    image: s.image_url ?? "",
    category: s.category ?? "General",
  };
}

type StarterTemplate = {
  key: string;
  name: string;
  role: BusinessRole;
  description: string;
  theme: ThemeState;
  visibleOrder: SectionType[];
  content: Partial<Record<SectionType, (ctx: { salon?: SalonBasics | null; services: OwnerServiceOption[] }) => Record<string, unknown>>>;
};

const WEBSITE_STARTER_TEMPLATES: StarterTemplate[] = [
  {
    key: "salon-30-min",
    name: "30-min Salon Website",
    role: "Salon",
    description: "Hero, services, rate card, gallery, team, contact and map ready.",
    theme: THEME_PRESETS.find((p) => p.key === "classic")?.theme ?? DEFAULT_THEME,
    visibleOrder: ["hero", "about", "services", "rate_card", "gallery", "staff", "offers", "contact"],
    content: {
      hero: ({ salon }) => ({ heading: salon?.name ?? "Premium Salon", subheading: "Hair, beauty and care in one place", description: "Book trusted salon services with transparent pricing.", buttonText: "Book Now", buttonLink: "#services", imageUrl: "" }),
      about: ({ salon }) => ({ heading: "About Us", body: `${salon?.name ?? "Our salon"} delivers professional beauty services with trained experts and hygienic care.` }),
      services: ({ services }) => ({ heading: "Popular Services", description: "Choose services and publish instantly.", items: services.slice(0, 6).map(normalizeServiceItem) }),
      rate_card: ({ services }) => ({ heading: "Rate Card", description: "Transparent prices for quick booking decisions.", items: services.slice(0, 8).map(normalizeServiceItem) }),
      gallery: () => ({ heading: "Gallery", description: "Show your best salon work.", items: [], gridAspect: "square", gridColumns: 4, imageFit: "cover", gridGap: 12 }),
      staff: () => ({ heading: "Meet the Team", description: "Introduce your experts.", items: [] }),
      offers: () => ({ heading: "Current Offers", description: "Limited time deals for new and returning customers.", items: [{ id: newId(), name: "First Visit Offer", discount: "20% OFF", description: "Welcome offer for first-time customers." }] }),
      contact: ({ salon }) => ({ heading: "Contact Us", description: "Call, WhatsApp or visit us.", phone: salon?.phone ?? "", whatsapp: salon?.phone ?? "", email: "", address: salon?.address ?? salon?.location ?? "", mapEmbed: mapsEmbedFromAddress(salon?.address ?? salon?.location) }),
    },
  },
  {
    key: "barber-fast",
    name: "Barber Fast Booking",
    role: "Barber",
    description: "Bold layout for haircut, beard and grooming price lists.",
    theme: THEME_PRESETS.find((p) => p.key === "modern")?.theme ?? DEFAULT_THEME,
    visibleOrder: ["hero", "services", "rate_card", "gallery", "staff", "contact"],
    content: {
      hero: ({ salon }) => ({ heading: salon?.name ?? "Modern Barber Shop", subheading: "Sharp cuts. Clean fades. Fast booking.", description: "Pick your grooming service and visit today.", buttonText: "View Rates", buttonLink: "#rate_card", imageUrl: "" }),
      services: ({ services }) => ({ heading: "Grooming Services", description: "Haircut, beard, shave and styling.", items: services.slice(0, 6).map(normalizeServiceItem) }),
      rate_card: ({ services }) => ({ heading: "Barber Rate Card", description: "Quick list for walk-ins and bookings.", items: services.slice(0, 10).map(normalizeServiceItem) }),
      gallery: () => ({ heading: "Work Gallery", description: "Show fades, beard trims and transformations.", items: [], gridAspect: "landscape", gridColumns: 3, imageFit: "cover", gridGap: 10 }),
      staff: () => ({ heading: "Barbers", description: "Your grooming specialists.", items: [] }),
      contact: ({ salon }) => ({ heading: "Visit The Shop", description: "Directions and contact details.", phone: salon?.phone ?? "", whatsapp: salon?.phone ?? "", email: "", address: salon?.address ?? salon?.location ?? "", mapEmbed: mapsEmbedFromAddress(salon?.address ?? salon?.location) }),
    },
  },
  {
    key: "makeup-portfolio",
    name: "Makeup Portfolio",
    role: "Makeup Studio",
    description: "Portfolio-first template for bridal and event makeup.",
    theme: THEME_PRESETS.find((p) => p.key === "blush")?.theme ?? THEME_PRESETS.find((p) => p.key === "classic")?.theme ?? DEFAULT_THEME,
    visibleOrder: ["hero", "about", "services", "packages", "gallery", "offers", "contact"],
    content: {
      hero: ({ salon }) => ({ heading: salon?.name ?? "Makeup Studio", subheading: "Bridal, party and editorial makeup", description: "Showcase your best transformations and packages.", buttonText: "See Packages", buttonLink: "#packages", imageUrl: "" }),
      about: () => ({ heading: "Artist Profile", body: "Professional makeup services for weddings, shoots and special occasions." }),
      services: ({ services }) => ({ heading: "Makeup Services", description: "Choose from studio and event services.", items: services.slice(0, 6).map(normalizeServiceItem) }),
      packages: () => ({ heading: "Packages", description: "Ready-made offers customers can understand fast.", items: [{ id: newId(), name: "Bridal Glow Package", price: "12999", description: "Consultation, makeup trial and wedding-day look.", duration: "Full day" }] }),
      gallery: () => ({ heading: "Portfolio", description: "Upload bridal and before/after photos.", items: [], gridAspect: "portrait", gridColumns: 3, imageFit: "cover", gridGap: 12 }),
      offers: () => ({ heading: "Special Offers", description: "Promote seasonal bookings.", items: [] }),
      contact: ({ salon }) => ({ heading: "Book Consultation", description: "Share your event date and location.", phone: salon?.phone ?? "", whatsapp: salon?.phone ?? "", email: "", address: salon?.address ?? salon?.location ?? "", mapEmbed: mapsEmbedFromAddress(salon?.address ?? salon?.location) }),
    },
  },
  {
    key: "spa-calm",
    name: "Spa & Wellness",
    role: "Spa",
    description: "Calm wellness pages with memberships and packages.",
    theme: THEME_PRESETS.find((p) => p.key === "botanical")?.theme ?? THEME_PRESETS.find((p) => p.key === "fresh")?.theme ?? DEFAULT_THEME,
    visibleOrder: ["hero", "about", "services", "packages", "membership", "gallery", "contact"],
    content: {
      hero: ({ salon }) => ({ heading: salon?.name ?? "Spa & Wellness", subheading: "Relax, refresh and recharge", description: "A ready wellness website with service menu and booking CTA.", buttonText: "Book Session", buttonLink: "#services", imageUrl: "" }),
      about: () => ({ heading: "Our Wellness Space", body: "Relaxing treatments, trained therapists and a clean, peaceful environment." }),
      services: ({ services }) => ({ heading: "Spa Services", description: "Massages, facials and wellness rituals.", items: services.slice(0, 6).map(normalizeServiceItem) }),
      packages: () => ({ heading: "Wellness Packages", description: "Bundle your best services.", items: [{ id: newId(), name: "Relaxation Day", price: "4999", description: "Massage, facial and refreshment ritual.", duration: "3 hours" }] }),
      membership: () => ({ heading: "Membership", description: "Monthly wellness plans for repeat customers.", items: [{ id: newId(), name: "Gold Wellness", price: "999", description: "Priority booking and member discounts." }] }),
      gallery: () => ({ heading: "Spa Gallery", description: "Show ambience and treatment rooms.", items: [], gridAspect: "landscape", gridColumns: 3, imageFit: "cover", gridGap: 14 }),
      contact: ({ salon }) => ({ heading: "Find Us", description: "Call or get directions.", phone: salon?.phone ?? "", whatsapp: salon?.phone ?? "", email: "", address: salon?.address ?? salon?.location ?? "", mapEmbed: mapsEmbedFromAddress(salon?.address ?? salon?.location) }),
    },
  },
  {
    key: "nails-clean",
    name: "Nail Studio",
    role: "Nail Studio",
    description: "Visual grid for nail art, prices and offers.",
    theme: THEME_PRESETS.find((p) => p.key === "fresh")?.theme ?? DEFAULT_THEME,
    visibleOrder: ["hero", "services", "rate_card", "gallery", "offers", "contact"],
    content: {
      hero: ({ salon }) => ({ heading: salon?.name ?? "Nail Studio", subheading: "Nail art, extensions and care", description: "A simple template customers can scan quickly.", buttonText: "See Nail Menu", buttonLink: "#services", imageUrl: "" }),
      services: ({ services }) => ({ heading: "Nail Services", description: "Manicure, pedicure, nail art and extensions.", items: services.slice(0, 6).map(normalizeServiceItem) }),
      rate_card: ({ services }) => ({ heading: "Nail Rate Card", description: "Clear menu for every customer.", items: services.slice(0, 10).map(normalizeServiceItem) }),
      gallery: () => ({ heading: "Nail Art Gallery", description: "Upload your best designs.", items: [], gridAspect: "square", gridColumns: 4, imageFit: "cover", gridGap: 8 }),
      offers: () => ({ heading: "Offers", description: "Feature combo offers.", items: [{ id: newId(), name: "Mani + Pedi Combo", discount: "15% OFF", description: "Limited-time combo deal." }] }),
      contact: ({ salon }) => ({ heading: "Visit Studio", description: "Location and WhatsApp booking.", phone: salon?.phone ?? "", whatsapp: salon?.phone ?? "", email: "", address: salon?.address ?? salon?.location ?? "", mapEmbed: mapsEmbedFromAddress(salon?.address ?? salon?.location) }),
    },
  },
];

export function WebsiteEditorPage() {
  const fetchSalons = useServerFn(getMyOwnedSalons);
  const fetchServices = useServerFn(listOwnerServices);
  const fetchOrCreate = useServerFn(getOrCreateMyWebsite);
  const fetchBundle = useServerFn(getMyWebsiteBundle);
  const saveSection = useServerFn(updateSection);
  const saveTheme = useServerFn(updateTheme);
  const doPublish = useServerFn(publishWebsite);
  const saveOrder = useServerFn(reorderSections);
  const fetchVersions = useServerFn(listWebsiteVersions);
  const doSaveVersion = useServerFn(saveDraftVersion);
  const doRestoreVersion = useServerFn(restoreWebsiteVersion);
  const fetchVersionSnapshot = useServerFn(getWebsiteVersionSnapshot);



  const salonsQ = useQuery({ queryKey: ["my-owned-salons-editor"], queryFn: () => fetchSalons() });
  const selectedSalon = salonsQ.data?.[0]?.salon as (SalonBasics & { id?: string }) | undefined;
  const salonId = selectedSalon?.id;

  const ownerServicesQ = useQuery({
    queryKey: ["owner-services-for-website", salonId],
    queryFn: () => fetchServices({ data: { salon_id: salonId! } }),
    enabled: !!salonId,
  });

  const websiteQ = useQuery({
    queryKey: ["editor-website", salonId],
    queryFn: () => fetchOrCreate({ data: { salonId: salonId! } }),
    enabled: !!salonId,
  });
  const websiteId = websiteQ.data?.id;

  const bundleQ = useQuery({
    queryKey: ["editor-bundle", websiteId],
    queryFn: () => fetchBundle({ data: { websiteId: websiteId! } }),
    enabled: !!websiteId,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTheme, setShowTheme] = useState(false);
  const [localSections, setLocalSections] = useState<WebsiteSection[]>([]);
  const [localTheme, setLocalTheme] = useState<ThemeState>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [templateRole, setTemplateRole] = useState<BusinessRole>("Salon");
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const themeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    if (bundleQ.data?.sections) {
      setLocalSections(bundleQ.data.sections);
      if (!selectedId && !showTheme && bundleQ.data.sections.length) setSelectedId(bundleQ.data.sections[0].id);
    }
    if (bundleQ.data?.theme) {
      const t = bundleQ.data.theme as Partial<ThemeState> & { extras?: unknown };
      const extras = { ...DEFAULT_EXTRAS, ...(t.extras as ThemeExtras | undefined) };
      setLocalTheme({ ...DEFAULT_THEME, ...t, extras });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleQ.data]);

  // Push live-preview updates to iframe
  useEffect(() => {
    postPreviewBundle();
    const retry = window.setTimeout(postPreviewBundle, 300);
    return () => window.clearTimeout(retry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSections, localTheme]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "website-preview-ready") postPreviewBundle();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSections, localTheme]);

  const selected = useMemo(
    () => localSections.find((s) => s.id === selectedId) ?? null,
    [localSections, selectedId],
  );

  function postPreviewBundle() {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:bundle", bundle: { sections: localSections, theme: localTheme } },
      "*",
    );
  }

  function patchTheme(patch: Partial<ThemeState>) {
    markDirty();
    setLocalTheme((prev) => {
      const nextExtras = patch.extras ? { ...prev.extras, ...patch.extras } : prev.extras;
      const next = { ...prev, ...patch, extras: nextExtras };
      if (themeTimer.current) clearTimeout(themeTimer.current);
      const persistPatch: Partial<ThemeState> = { ...patch };
      if (patch.extras) persistPatch.extras = nextExtras;
      themeTimer.current = setTimeout(async () => {
        if (!websiteId) return;
        try {
          setSaving(true);
          await saveTheme({ data: { websiteId, patch: persistPatch } });
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Theme save failed");
        } finally {
          setSaving(false);
        }
      }, 600);
      return next;
    });
  }

  function patchSection(id: string, patch: Partial<WebsiteSection>) {
    markDirty();
    setLocalSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    // Debounced autosave
    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(async () => {
      try {
        setSaving(true);
        const target = { ...(localSections.find((s) => s.id === id) as WebsiteSection), ...patch };
        await saveSection({
          data: {
            sectionId: id,
            content: target.content as Record<string, unknown>,
            is_visible: target.is_visible,
          },
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  function updateContent(field: string, value: unknown) {
    if (!selected) return;
    const nextContent = { ...(selected.content as Record<string, unknown>), [field]: value };
    patchSection(selected.id, { content: nextContent as WebsiteSection["content"] });
  }

  // ---- Versions / Undo ----
  type VersionRow = { id: string; note: string | null; created_at: string };
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [savingVersion, setSavingVersion] = useState(false);
  const dirtySinceSnapshotRef = useRef(false);
  const lastAutoSnapshotRef = useRef<number>(Date.now());
  const [lastSnapshotAt, setLastSnapshotAt] = useState<number | null>(null);
  function markDirty() {
    dirtySinceSnapshotRef.current = true;
  }

  // ---- Diff viewer ----
  type DiffChange =
    | { kind: "added"; label: string }
    | { kind: "removed"; label: string }
    | { kind: "modified"; label: string; details: string[] };
  type DiffResult = { sections: DiffChange[]; theme: DiffChange[] };
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffVersion, setDiffVersion] = useState<VersionRow | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  function shortValue(v: unknown): string {
    if (v === null || v === undefined) return "—";
    if (typeof v === "string") return v.length > 60 ? v.slice(0, 60) + "…" : v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
      const s = JSON.stringify(v);
      return s.length > 60 ? s.slice(0, 60) + "…" : s;
    } catch {
      return String(v);
    }
  }
  function stableStringify(v: unknown): string {
    try { return JSON.stringify(v); } catch { return ""; }
  }
  function diffObjects(a: Record<string, unknown>, b: Record<string, unknown>): string[] {
    const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
    const out: string[] = [];
    for (const k of keys) {
      const av = a?.[k];
      const bv = b?.[k];
      if (stableStringify(av) !== stableStringify(bv)) {
        out.push(`${k}: ${shortValue(av)} → ${shortValue(bv)}`);
      }
    }
    return out;
  }

  async function handleViewDiff(v: VersionRow) {
    setDiffVersion(v);
    setDiffOpen(true);
    setDiffLoading(true);
    setDiffResult(null);
    try {
      const snap = await fetchVersionSnapshot({ data: { versionId: v.id } });
      const oldSections = (snap.sections as unknown as Array<{ id?: string; section_type: string; content: unknown; is_visible?: boolean; sort_order?: number }>) ?? [];
      const newSections = localSections;

      // Match by id when present, else fall back by section_type order.
      const oldById = new Map<string, typeof oldSections[number]>();
      const oldByType: Record<string, typeof oldSections[number][]> = {};
      for (const s of oldSections) {
        if (s.id) oldById.set(s.id, s);
        (oldByType[s.section_type] ??= []).push(s);
      }
      const usedOldIds = new Set<string>();
      const sectionChanges: DiffChange[] = [];

      for (const cur of newSections) {
        const label = (SECTION_LABELS as Record<string, string>)[cur.section_type] ?? cur.section_type;
        let match = cur.id && oldById.has(cur.id) ? oldById.get(cur.id)! : undefined;
        if (!match) {
          const bucket = oldByType[cur.section_type] ?? [];
          match = bucket.find((s) => !(s.id && usedOldIds.has(s.id)));
        }
        if (!match) {
          sectionChanges.push({ kind: "added", label });
          continue;
        }
        if (match.id) usedOldIds.add(match.id);
        const details: string[] = [];
        if ((match.is_visible ?? true) !== (cur.is_visible ?? true)) {
          details.push(`visibility: ${match.is_visible === false ? "hidden" : "visible"} → ${cur.is_visible === false ? "hidden" : "visible"}`);
        }
        if (stableStringify(match.content) !== stableStringify(cur.content)) {
          const inner = diffObjects(
            (match.content ?? {}) as Record<string, unknown>,
            (cur.content ?? {}) as Record<string, unknown>,
          );
          if (inner.length) details.push(...inner);
          else details.push("content changed");
        }
        if (details.length) sectionChanges.push({ kind: "modified", label, details });
      }
      // Anything in old not matched → removed
      for (const s of oldSections) {
        if (s.id && usedOldIds.has(s.id)) continue;
        if (!s.id) {
          // For id-less, if new has one of same type unmatched, we'd have used it above.
          const stillThere = newSections.some((n) => n.section_type === s.section_type);
          if (stillThere) continue;
        } else if (newSections.some((n) => n.id === s.id)) continue;
        sectionChanges.push({ kind: "removed", label: (SECTION_LABELS as Record<string, string>)[s.section_type] ?? s.section_type });
      }

      // Theme diff
      const oldTheme = (snap.theme as Record<string, unknown> | null) ?? {};
      const themeFields = [
        "primary_color", "secondary_color", "accent_color", "background_color",
        "text_color", "heading_font", "body_font", "button_style",
      ] as const;
      const themeChanges: DiffChange[] = [];
      for (const k of themeFields) {
        const ov = oldTheme[k];
        const nv = (localTheme as unknown as Record<string, unknown>)[k];
        if (stableStringify(ov) !== stableStringify(nv)) {
          themeChanges.push({ kind: "modified", label: k.replace(/_/g, " "), details: [`${shortValue(ov)} → ${shortValue(nv)}`] });
        }
      }
      const oldExtras = (oldTheme.extras as Record<string, unknown>) ?? {};
      const newExtras = (localTheme.extras as unknown as Record<string, unknown>) ?? {};
      const extraDiff = diffObjects(oldExtras, newExtras);
      if (extraDiff.length) themeChanges.push({ kind: "modified", label: "extras", details: extraDiff });

      setDiffResult({ sections: sectionChanges, theme: themeChanges });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load diff");
      setDiffOpen(false);
    } finally {
      setDiffLoading(false);
    }
  }


  async function refreshVersions() {
    if (!websiteId) return;
    setVersionsLoading(true);
    try {
      const rows = await fetchVersions({ data: { websiteId } });
      setVersions(rows as VersionRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setVersionsLoading(false);
    }
  }

  async function handleSaveVersion() {
    if (!websiteId) return;
    setSavingVersion(true);
    try {
      await doSaveVersion({ data: { websiteId } });
      toast.success("Version saved");
      await refreshVersions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save version failed");
    } finally {
      setSavingVersion(false);
    }
  }

  async function handleRestoreVersion(versionId: string) {
    if (!websiteId) return;
    setRestoring(versionId);
    try {
      await doRestoreVersion({ data: { versionId } });
      toast.success("Restored");
      await bundleQ.refetch();
      await refreshVersions();
      setVersionsOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setRestoring(null);
    }
  }


  async function handlePublish() {
    if (!websiteId) return;
    setPublishing(true);
    try {
      if (themeTimer.current) {
        clearTimeout(themeTimer.current);
        themeTimer.current = null;
      }
      Object.values(saveTimers.current).forEach((timer) => clearTimeout(timer));
      saveTimers.current = {};

      setSaving(true);
      await saveTheme({ data: { websiteId, patch: localTheme } });
      await Promise.all(
        localSections.map((section) =>
          saveSection({
            data: {
              sectionId: section.id,
              content: section.content as Record<string, unknown>,
              is_visible: section.is_visible,
            },
          }),
        ),
      );
      await saveOrder({ data: { websiteId, order: localSections.map((section) => section.id) } });
      await doPublish({ data: { websiteId } });
      toast.success("Final website saved and published");
      bundleQ.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(evt: DragEndEvent) {
    const { active, over } = evt;
    if (!over || active.id === over.id || !websiteId) return;
    const oldIndex = localSections.findIndex((s) => s.id === active.id);
    const newIndex = localSections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(localSections, oldIndex, newIndex).map((s, i) => ({ ...s, sort_order: i }));
    setLocalSections(next);
    try {
      setSaving(true);
      await saveOrder({ data: { websiteId, order: next.map((s) => s.id) } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setSaving(false);
    }
  }

  async function applyStarterTemplate(template: StarterTemplate) {
    if (!websiteId) return;
    setApplyingTemplate(template.key);
    try {
      if (themeTimer.current) {
        clearTimeout(themeTimer.current);
        themeTimer.current = null;
      }
      Object.values(saveTimers.current).forEach((timer) => clearTimeout(timer));
      saveTimers.current = {};

      const services = (ownerServicesQ.data ?? []) as OwnerServiceOption[];
      const ctx = { salon: selectedSalon, services };
      const visible = new Set<SectionType>(template.visibleOrder);
      const order = new Map<SectionType, number>(template.visibleOrder.map((type, index) => [type, index]));
      const nextTheme = {
        ...template.theme,
        extras: { ...DEFAULT_EXTRAS, ...template.theme.extras },
      };
      const nextSections = localSections
        .map((section, index) => {
          const buildContent = template.content[section.section_type];
          const currentContent = (section.content ?? {}) as Record<string, unknown>;
          return {
            ...section,
            content: (buildContent ? { ...currentContent, ...buildContent(ctx) } : currentContent) as WebsiteSection["content"],
            is_visible: visible.has(section.section_type),
            sort_order: order.get(section.section_type) ?? template.visibleOrder.length + index,
          };
        })
        .sort((a, b) => a.sort_order - b.sort_order);

      setSaving(true);
      setLocalTheme(nextTheme);
      setLocalSections(nextSections);
      setSelectedId(nextSections.find((section) => section.is_visible)?.id ?? nextSections[0]?.id ?? null);
      setShowTheme(false);

      await saveTheme({ data: { websiteId, patch: nextTheme } });
      await Promise.all(
        nextSections.map((section) =>
          saveSection({
            data: {
              sectionId: section.id,
              content: section.content as Record<string, unknown>,
              is_visible: section.is_visible,
              sort_order: section.sort_order,
            },
          }),
        ),
      );
      await saveOrder({ data: { websiteId, order: nextSections.map((section) => section.id) } });
      toast.success(`${template.name} applied`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Template apply failed");
    } finally {
      setSaving(false);
      setApplyingTemplate(null);
    }
  }


  if (salonsQ.isLoading || websiteQ.isLoading || bundleQ.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!salonId) {
    return (
      <div className="p-8">
        <p className="text-lg">You need to register a salon first.</p>
        <Link to="/app/owner" className="text-primary underline">
          Go to owner dashboard
        </Link>
      </div>
    );
  }

  const content = (selected?.content ?? {}) as Record<string, unknown>;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b bg-card px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">Final Website Editor</h1>
          <p className="text-xs text-muted-foreground">
            {saving ? "Saving latest changes..." : "Edit sections, theme and preview here."}
          </p>
        </div>
        <Button onClick={handlePublish} disabled={publishing || !websiteId} className="shrink-0">
          {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
          Final Save &amp; Publish
        </Button>
      </header>



      <div className="grid flex-1 grid-cols-[240px_1fr_1fr] overflow-hidden">
        {/* Section list */}
        <aside className="overflow-y-auto border-r bg-muted/30 p-3">
          <div className="mb-4 rounded-lg border bg-background p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5" /> Ready Templates
            </div>
            <Select value={templateRole} onValueChange={(v) => setTemplateRole(v as BusinessRole)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUSINESS_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-3 space-y-2">
              {WEBSITE_STARTER_TEMPLATES.filter((template) => template.role === templateRole).map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => void applyStarterTemplate(template)}
                  disabled={!!applyingTemplate || !websiteId}
                  className="w-full rounded-md border p-2 text-left text-xs transition hover:border-primary hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center justify-between gap-2 font-semibold">
                    {template.name}
                    {applyingTemplate === template.key && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{template.description}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Sections</div>
            <div className="text-[10px] text-muted-foreground">Drag to reorder</div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-1">
                {localSections.map((s) => (
                  <SortableSectionItem
                    key={s.id}
                    section={s}
                    label={SECTION_LABELS[s.section_type]}
                    active={selectedId === s.id && !showTheme}
                    onSelect={() => { setSelectedId(s.id); setShowTheme(false); }}
                    onToggleVisible={() => patchSection(s.id, { is_visible: !s.is_visible })}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <div className="mt-4 mb-2 text-xs font-semibold uppercase text-muted-foreground">Design</div>
          <button
            onClick={() => setShowTheme(true)}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
              showTheme ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <Palette className="h-4 w-4" /> Theme &amp; Typography
          </button>
        </aside>

        {/* Editor form */}
        <section className="overflow-y-auto p-6">
          {showTheme ? (
            <ThemeEditor theme={localTheme} onChange={patchTheme} />
          ) : selected ? (
            <SectionEditor
              section={selected}
              content={content}
              salonId={salonId ?? null}
              websiteId={websiteId ?? null}
              salon={selectedSalon ?? null}
              serviceOptions={(ownerServicesQ.data ?? []) as OwnerServiceOption[]}
              onFieldChange={updateContent}
              onToggleVisible={(v) => patchSection(selected.id, { is_visible: v })}
            />



          ) : (
            <p className="text-muted-foreground">Select a section to edit</p>
          )}
        </section>

        {/* Live preview */}
        <section className="flex flex-col overflow-hidden border-l bg-muted/20">
          <div className="flex items-center justify-between border-b bg-background/60 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              Preview · {previewDevice === "desktop" ? "Desktop" : previewDevice === "tablet" ? "Tablet 768px" : "Mobile 390px"}
            </span>
            <div className="inline-flex rounded-md border bg-background p-0.5">
              {([
                { key: "desktop", icon: Monitor, label: "Desktop" },
                { key: "tablet", icon: Tablet, label: "Tablet" },
                { key: "mobile", icon: Smartphone, label: "Mobile" },
              ] as const).map(({ key, icon: Icon, label }) => {
                const active = previewDevice === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreviewDevice(key)}
                    className={`inline-flex h-7 items-center gap-1 rounded px-2 text-xs transition ${
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    }`}
                    title={label}
                    aria-label={label}
                    aria-pressed={active}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-3">
            {websiteId && (
              <div
                className="h-full bg-background shadow-md transition-[max-width] duration-200"
                style={{
                  width: "100%",
                  maxWidth:
                    previewDevice === "mobile" ? 390 : previewDevice === "tablet" ? 768 : "100%",
                  borderRadius: previewDevice === "desktop" ? 0 : 12,
                  overflow: "hidden",
                  border: previewDevice === "desktop" ? "none" : "1px solid hsl(var(--border))",
                }}
              >
                <iframe
                  ref={iframeRef}
                  key={websiteId}
                  src={`/w/${websiteId}?preview=1`}
                  onLoad={postPreviewBundle}
                  className="h-full w-full border-0"
                  title="Live preview"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  content,
  salonId,
  websiteId,
  salon,
  serviceOptions,
  onFieldChange,
  onToggleVisible,
}: {
  section: WebsiteSection;
  content: Record<string, unknown>;
  salonId: string | null;
  websiteId: string | null;
  salon: SalonBasics | null;
  serviceOptions: OwnerServiceOption[];
  onFieldChange: (field: string, value: unknown) => void;
  onToggleVisible: (v: boolean) => void;
}) {
  const str = (k: string) => (content[k] as string) ?? "";
  const items = Array.isArray(content.items) ? (content.items as Item[]) : [];

  const setItems = (next: Item[]) => onFieldChange("items", next);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{SECTION_LABELS[section.section_type]}</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="visible" className="text-sm">Show</Label>
          <Switch id="visible" checked={section.is_visible} onCheckedChange={onToggleVisible} />
        </div>
      </div>

      {section.section_type === "hero" && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <Field label="Sub-heading" value={str("subheading")} onChange={(v) => onFieldChange("subheading", v)} />
          <TextField label="Description" value={str("description")} onChange={(v) => onFieldChange("description", v)} />
          <Field label="Button Text" value={str("buttonText")} onChange={(v) => onFieldChange("buttonText", v)} />
          <Field label="Button Link" value={str("buttonLink")} onChange={(v) => onFieldChange("buttonLink", v)} />
          <ImageField label="Background Image" value={str("imageUrl")} salonId={salonId} websiteId={websiteId} folder="hero" onChange={(v) => onFieldChange("imageUrl", v)} />
        </>
      )}

      {section.section_type === "about" && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <TextField label="Description" value={str("body")} onChange={(v) => onFieldChange("body", v)} />
          <Field label="Button Text" value={str("buttonText")} onChange={(v) => onFieldChange("buttonText", v)} />
          <Field label="Button Link" value={str("buttonLink")} onChange={(v) => onFieldChange("buttonLink", v)} />
          <ImageField label="Image" value={str("imageUrl")} salonId={salonId} websiteId={websiteId} folder="about" onChange={(v) => onFieldChange("imageUrl", v)} />
        </>
      )}

      {section.section_type === "contact" && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <TextField label="Description" value={str("description")} onChange={(v) => onFieldChange("description", v)} />
          <Field label="Phone" value={str("phone")} onChange={(v) => onFieldChange("phone", v)} />
          <Field label="WhatsApp" value={str("whatsapp")} onChange={(v) => onFieldChange("whatsapp", v)} />
          <Field label="Email" value={str("email")} onChange={(v) => onFieldChange("email", v)} />
          <MapEmbedControls
            address={str("address")}
            mapEmbed={str("mapEmbed")}
            salon={salon}
            onAddressChange={(v) => onFieldChange("address", v)}
            onMapEmbedChange={(v) => onFieldChange("mapEmbed", v)}
          />
        </>
      )}

      {(section.section_type === "services" ||
        section.section_type === "rate_card" ||
        section.section_type === "packages" ||
        section.section_type === "staff") && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <TextField label="Description" value={str("description")} onChange={(v) => onFieldChange("description", v)} />
          <ItemsEditor
            kind={section.section_type}
            items={items}
            serviceOptions={serviceOptions}
            salonId={salonId}
            websiteId={websiteId}
            onChange={setItems}
          />
        </>
      )}

      {(section.section_type === "offers" ||
        section.section_type === "membership" ||
        section.section_type === "gallery" ||
        section.section_type === "blog") && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <TextField label="Description" value={str("description")} onChange={(v) => onFieldChange("description", v)} />
          {section.section_type !== "gallery" && (
            <>
              <Field label="Button Text" value={str("buttonText")} onChange={(v) => onFieldChange("buttonText", v)} />
              <Field label="Button Link" value={str("buttonLink")} onChange={(v) => onFieldChange("buttonLink", v)} />
            </>
          )}
          {section.section_type === "gallery" && (
            <GalleryGridControls
              gridAspect={(content.gridAspect as string) || "square"}
              gridColumns={typeof content.gridColumns === "number" ? (content.gridColumns as number) : 4}
              imageFit={(content.imageFit as string) || "cover"}
              gap={typeof content.gridGap === "number" ? (content.gridGap as number) : 12}
              onChange={(patch) => {
                for (const [k, v] of Object.entries(patch)) onFieldChange(k, v);
              }}
            />
          )}
          <GenericItemsEditor
            kind={section.section_type}
            items={items}
            salonId={salonId}
            websiteId={websiteId}
            onChange={setItems}
          />
        </>
      )}
    </div>
  );
}


type Item = {
  id: string;
  name?: string;
  price?: string;
  duration?: string;
  description?: string;
  role?: string;
  bio?: string;
  image?: string;
  category?: string;
  date?: string;
  discount?: string;
  objectPosition?: string; // e.g. "center", "top", "left top", used for gallery crop focus
  thumbShape?: "square" | "portrait" | "landscape" | "wide" | "auto"; // per-image override
};


function newId() {
  return (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const custom = value && !STAFF_ROLE_OPTIONS.includes(value);
  return (
    <div className="space-y-1.5">
      <Label>Role</Label>
      <Select value={custom ? "custom" : value} onValueChange={(v) => onChange(v === "custom" ? value : v)}>
        <SelectTrigger><SelectValue placeholder="Choose role" /></SelectTrigger>
        <SelectContent>
          {STAFF_ROLE_OPTIONS.map((role) => (
            <SelectItem key={role} value={role}>{role}</SelectItem>
          ))}
          <SelectItem value="custom">Custom role</SelectItem>
        </SelectContent>
      </Select>
      {(custom || value === "") && (
        <Input placeholder="Type custom role" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function MapEmbedControls({
  address,
  mapEmbed,
  salon,
  onAddressChange,
  onMapEmbedChange,
}: {
  address: string;
  mapEmbed: string;
  salon: SalonBasics | null;
  onAddressChange: (v: string) => void;
  onMapEmbedChange: (v: string) => void;
}) {
  const [locating, setLocating] = useState(false);
  const salonAddress = salon?.address ?? salon?.location ?? "";

  const generateFromAddress = (value: string) => {
    if (!value.trim()) {
      toast.error("Address add karein pehle");
      return;
    }
    onMapEmbedChange(mapsEmbedFromAddress(value));
    toast.success("Map embed URL ready");
  };

  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Location access is not available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const text = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        onAddressChange(text);
        onMapEmbedChange(mapsEmbedFromCoords(latitude, longitude));
        setLocating(false);
        toast.success("Current location added");
      },
      () => {
        setLocating(false);
        toast.error("Location permission nahi mili");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MapPinned className="h-4 w-4 text-muted-foreground" /> Google Map & Location
      </div>
      <TextField label="Address / Location" value={address} onChange={onAddressChange} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="secondary" onClick={() => generateFromAddress(address)}>
          Generate map from address
        </Button>
        <Button type="button" variant="outline" onClick={useCurrentLocation} disabled={locating}>
          {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPinned className="mr-2 h-4 w-4" />}
          Use current location
        </Button>
      </div>
      {salonAddress && (
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-left"
          onClick={() => {
            onAddressChange(salonAddress);
            onMapEmbedChange(mapsEmbedFromAddress(salonAddress));
          }}
        >
          Use saved salon address: {salonAddress}
        </Button>
      )}
      <Field label="Google Map Embed URL" value={mapEmbed} onChange={onMapEmbedChange} />
      {mapEmbed && (
        <iframe title="Map preview" src={mapEmbed} className="h-44 w-full rounded-md border-0" loading="lazy" />
      )}
    </div>
  );
}

function ItemsEditor({
  kind,
  items,
  serviceOptions,
  salonId,
  websiteId,
  onChange,
}: {
  kind: "services" | "rate_card" | "packages" | "staff";
  items: Item[];
  serviceOptions: OwnerServiceOption[];
  salonId: string | null;
  websiteId: string | null;
  onChange: (next: Item[]) => void;
}) {
  const isStaff = kind === "staff";
  const canPickServices = kind === "services" || kind === "rate_card";
  const selectedServiceIds = new Set(items.map((item) => item.id));
  const addLabel =
    kind === "services" ? "Add Service" :
    kind === "rate_card" ? "Add Rate" :
    kind === "packages" ? "Add Package" : "Add Team Member";

  const patch = (id: string, p: Partial<Item>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...p } : it)));
  const remove = (id: string) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, { id: newId() }]);
  const toggleService = (service: OwnerServiceOption) => {
    if (selectedServiceIds.has(service.id)) {
      remove(service.id);
      return;
    }
    onChange([...items, normalizeServiceItem(service)]);
  };
  const addAllServices = () => {
    const existing = new Set(items.map((item) => item.id));
    const next = [
      ...items,
      ...serviceOptions.filter((service) => !existing.has(service.id)).map(normalizeServiceItem),
    ];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Items ({items.length})</Label>
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> {addLabel}
        </Button>
      </div>

      {canPickServices && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ListChecks className="h-4 w-4 text-muted-foreground" /> Select from saved services
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={addAllServices}>
              Add all
            </Button>
          </div>
          {serviceOptions.length === 0 ? (
            <p className="rounded-md border border-dashed bg-background p-3 text-xs text-muted-foreground">
              No saved services yet. Add services from the Services section or create manual items below.
            </p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              {serviceOptions.map((service) => {
              const selected = selectedServiceIds.has(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-xs transition ${
                    selected ? "border-primary bg-primary/10" : "bg-background hover:border-primary/60"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{service.name}</span>
                    <span className="block truncate text-muted-foreground">
                      {service.category ?? "General"} · {service.duration_minutes ?? 30} min
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold">₹{String(service.price ?? 0)}</span>
                </button>
              );
              })}
            </div>
          )}
        </div>
      )}

      {items.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No items yet. Click <strong>{addLabel}</strong> to create one.
        </p>
      )}

      <ul className="space-y-3">
        {items.map((it, idx) => (
          <li key={it.id} className="rounded-lg border bg-card p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-muted-foreground">#{idx + 1}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => remove(it.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <ImageField
              label="Image"
              value={it.image ?? ""}
              salonId={salonId}
              websiteId={websiteId}
              folder={isStaff ? "staff" : "services"}
              compact
              onChange={(v) => patch(it.id, { image: v })}
            />

            <Field label="Name" value={it.name ?? ""} onChange={(v) => patch(it.id, { name: v })} />

            {isStaff ? (
              <>
                <RoleSelect value={it.role ?? ""} onChange={(v) => patch(it.id, { role: v })} />
                <TextField label="Bio" value={it.bio ?? ""} onChange={(v) => patch(it.id, { bio: v })} />
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Price" value={it.price ?? ""} onChange={(v) => patch(it.id, { price: v })} />
                  {kind !== "packages" && (
                    <Field label="Duration" value={it.duration ?? ""} onChange={(v) => patch(it.id, { duration: v })} />
                  )}
                </div>
                <TextField label="Description" value={it.description ?? ""} onChange={(v) => patch(it.id, { description: v })} />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GenericItemsEditor({
  kind,
  items,
  salonId,
  websiteId,
  onChange,
}: {
  kind: "offers" | "membership" | "gallery" | "blog";
  items: Item[];
  salonId: string | null;
  websiteId: string | null;
  onChange: (next: Item[]) => void;
}) {
  const addLabel =
    kind === "offers" ? "Add Offer" :
    kind === "membership" ? "Add Plan" :
    kind === "gallery" ? "Add Image" : "Add Post";

  const patch = (id: string, p: Partial<Item>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...p } : it)));
  const remove = (id: string) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, { id: newId() }]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((it) => it.id === active.id);
    const to = items.findIndex((it) => it.id === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(items, from, to));
  };

  const renderBody = (it: Item) => (
    <>
      <ImageField
        label="Image"
        value={it.image ?? ""}
        salonId={salonId}
        websiteId={websiteId}
        folder={kind}
        compact
        onChange={(v) => patch(it.id, { image: v })}
      />

      {kind !== "gallery" && (
        <Field label="Title" value={it.name ?? ""} onChange={(v) => patch(it.id, { name: v })} />
      )}

      {kind === "offers" ? (
        <>
          <Field label="Discount (e.g. 20% OFF)" value={it.discount ?? ""} onChange={(v) => patch(it.id, { discount: v })} />
          <TextField label="Description" value={it.description ?? ""} onChange={(v) => patch(it.id, { description: v })} />
        </>
      ) : kind === "membership" ? (
        <>
          <Field label="Price" value={it.price ?? ""} onChange={(v) => patch(it.id, { price: v })} />
          <TextField label="Description" value={it.description ?? ""} onChange={(v) => patch(it.id, { description: v })} />
        </>
      ) : kind === "blog" ? (
        <>
          <Field label="Date" value={it.date ?? ""} onChange={(v) => patch(it.id, { date: v })} />
          <TextField label="Excerpt" value={it.description ?? ""} onChange={(v) => patch(it.id, { description: v })} />
        </>
      ) : (
        <>
          <TextField label="Caption" value={it.description ?? ""} onChange={(v) => patch(it.id, { description: v })} />
          {it.image && (
            <GalleryImageCropControl
              image={it.image}
              objectPosition={it.objectPosition ?? "center"}
              thumbShape={it.thumbShape ?? "auto"}
              onChange={(p) => patch(it.id, p)}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          Items ({items.length})
          {kind === "gallery" && items.length > 1 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">· drag to reorder</span>
          )}
        </Label>
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> {addLabel}
        </Button>
      </div>

      {items.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No items yet. Click <strong>{addLabel}</strong> to create one.
        </p>
      )}

      {kind === "gallery" && items.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (!over || active.id === over.id) return;
            const from = items.findIndex((it) => it.id === active.id);
            const to = items.findIndex((it) => it.id === over.id);
            if (from < 0 || to < 0) return;
            onChange(arrayMove(items, from, to));
          }}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-2 sm:grid-cols-4">
              {items.map((it, idx) => (
                <GalleryThumbTile key={it.id} item={it} index={idx} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {kind === "gallery" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3">
              {items.map((it, idx) => (
                <SortableItemCard
                  key={it.id}
                  id={it.id}
                  index={idx}
                  onRemove={() => remove(it.id)}
                >
                  {renderBody(it)}
                </SortableItemCard>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <ul className="space-y-3">
          {items.map((it, idx) => (
            <li key={it.id} className="rounded-lg border bg-card p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => remove(it.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {renderBody(it)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SortableItemCard({
  id,
  index,
  onRemove,
  children,
}: {
  id: string;
  index: number;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li ref={setNodeRef} style={style} className="rounded-lg border bg-card p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-6 cursor-grab items-center justify-center rounded text-muted-foreground opacity-70 hover:opacity-100 active:cursor-grabbing"
            aria-label="Drag to reorder"
            title="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      {children}
    </li>
  );
}

function GalleryThumbTile({ item, index }: { item: Item; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative aspect-square cursor-grab overflow-hidden rounded-md border bg-background active:cursor-grabbing"
      title="Drag to reorder"
    >
      {item.image ? (
        <img
          src={item.image}
          alt=""
          className="h-full w-full"
          style={{ objectFit: "cover", objectPosition: item.objectPosition ?? "center" }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
        </div>
      )}
      <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {index + 1}
      </div>
      <div className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100">
        <GripVertical className="h-3 w-3" />
      </div>
    </div>
  );
}



function SortableSectionItem({
  section,
  label,
  active,
  onSelect,
  onToggleVisible,
}: {
  section: WebsiteSection;
  label: string;
  active: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li ref={setNodeRef} style={style}>
      <div
        className={`flex items-center gap-1 rounded-md pr-1 text-sm ${
          active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`}
      >
        <button
          type="button"
          className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center opacity-60 hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="flex flex-1 items-center justify-between py-2 pr-2 text-left"
        >
          <span className={section.is_visible ? "" : "line-through opacity-60"}>{label}</span>
          {!section.is_visible && (
            <span className={`text-[10px] ${active ? "opacity-80" : "opacity-60"}`}>hidden</span>
          )}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${
            active ? "hover:bg-primary-foreground/20" : "hover:bg-background"
          }`}
          aria-label={section.is_visible ? "Hide section" : "Show section"}
          title={section.is_visible ? "Hide section" : "Show section"}
        >
          {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 opacity-60" />}
        </button>
      </div>
    </li>
  );
}

const GRID_ASPECTS: { value: string; label: string; ratio: string }[] = [
  { value: "square", label: "Square 1:1", ratio: "1 / 1" },
  { value: "portrait", label: "Portrait 3:4", ratio: "3 / 4" },
  { value: "landscape", label: "Landscape 4:3", ratio: "4 / 3" },
  { value: "wide", label: "Wide 16:9", ratio: "16 / 9" },
  { value: "auto", label: "Original (no crop)", ratio: "auto" },
];

function aspectRatioFor(v: string): string {
  return GRID_ASPECTS.find((a) => a.value === v)?.ratio ?? "1 / 1";
}

function GalleryGridControls({
  gridAspect,
  gridColumns,
  imageFit,
  gap,
  onChange,
}: {
  gridAspect: string;
  gridColumns: number;
  imageFit: string;
  gap: number;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Grid & Thumbnails</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Yeh controls sabhi gallery images par apply hoti hain — grid me perfect fit aur consistent look ke liye.
      </p>

      <div className="space-y-1.5">
        <Label>Thumbnail Aspect</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {GRID_ASPECTS.map((a) => {
            const active = gridAspect === a.value;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => onChange({ gridAspect: a.value })}
                className={`rounded-md border p-2 text-center text-[11px] transition ${
                  active ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/60"
                }`}
              >
                <div
                  className="mx-auto mb-1 w-8 rounded-sm bg-muted"
                  style={{ aspectRatio: a.ratio === "auto" ? "4 / 3" : a.ratio }}
                />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Columns: {gridColumns}</Label>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={gridColumns}
            onChange={(e) => onChange({ gridColumns: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Gap: {gap}px</Label>
          <input
            type="range"
            min={0}
            max={32}
            step={2}
            value={gap}
            onChange={(e) => onChange({ gridGap: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Image Fit</Label>
        <Select value={imageFit} onValueChange={(v) => onChange({ imageFit: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">Cover — fill the thumbnail (may crop)</SelectItem>
            <SelectItem value="contain">Contain — show entire image (letterbox)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

const CROP_POSITIONS: { value: string; label: string }[] = [
  { value: "left top", label: "↖" },
  { value: "top", label: "↑" },
  { value: "right top", label: "↗" },
  { value: "left", label: "←" },
  { value: "center", label: "•" },
  { value: "right", label: "→" },
  { value: "left bottom", label: "↙" },
  { value: "bottom", label: "↓" },
  { value: "right bottom", label: "↘" },
];

function GalleryImageCropControl({
  image,
  objectPosition,
  thumbShape,
  onChange,
}: {
  image: string;
  objectPosition: string;
  thumbShape: "square" | "portrait" | "landscape" | "wide" | "auto";
  onChange: (p: Partial<Item>) => void;
}) {
  const ratio = aspectRatioFor(thumbShape === "auto" ? "square" : thumbShape);
  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Crop / Focal Point</Label>
        <Select
          value={thumbShape}
          onValueChange={(v) => onChange({ thumbShape: v as Item["thumbShape"] })}
        >
          <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Use grid shape</SelectItem>
            {GRID_ASPECTS.filter((a) => a.value !== "auto").map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-start gap-3">
        <div
          className="relative w-28 shrink-0 overflow-hidden rounded-md border bg-background"
          style={{ aspectRatio: ratio }}
        >
          <img
            src={image}
            alt=""
            className="h-full w-full"
            style={{ objectFit: "cover", objectPosition }}
          />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {CROP_POSITIONS.map((p) => {
            const active = objectPosition === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onChange({ objectPosition: p.value })}
                className={`flex h-8 w-8 items-center justify-center rounded border text-sm transition ${
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/60"
                }`}
                title={p.value}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Preview me dekhein — jo hissa dikhna chahiye uske arrow par tap karein.
      </p>
    </div>
  );
}

function ImageField({
  label,
  value,
  salonId,
  websiteId,
  folder,
  compact,
  onChange,
}: {
  label: string;
  value: string;
  salonId: string | null;
  websiteId?: string | null;
  folder: string;
  compact?: boolean;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!salonId) {
      toast.error("Salon not ready yet");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${salonId}/${folder}/${Date.now()}.${ext}`;
    setUploading(true);
    const { error } = await supabase.storage.from("salon-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("salon-media").getPublicUrl(path);
    // Log into media_library (best-effort; do not block on failure)
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const ownerId = userRes.user?.id;
      if (ownerId) {
        await supabase.from("media_library").insert({
          owner_id: ownerId,
          website_id: websiteId ?? null,
          url: data.publicUrl,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          folder,
        });
      }
    } catch {
      // silent; media_library is only for reuse tracking
    }
    setUploading(false);
    onChange(data.publicUrl);
    toast.success("Image uploaded");
  };


  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className={`bg-muted flex ${compact ? "h-16 w-16" : "h-20 w-28"} shrink-0 items-center justify-center overflow-hidden rounded-md border`}>
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="text-muted-foreground h-6 w-6" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
              Upload
            </Button>
            {value && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
          <Input
            placeholder="…or paste image URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}


function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-md border bg-background p-1"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}

function buildBgPreview(style: BgStyle, theme: ThemeState): CSSProperties {
  const from = theme.extras.bg_gradient_from ?? theme.background_color;
  const to = theme.extras.bg_gradient_to ?? "#F1F5F9";
  const angle = theme.extras.bg_gradient_angle ?? 135;
  const patternColor = theme.extras.bg_pattern_color ?? "#E5E7EB";
  const size = theme.extras.bg_pattern_size ?? 24;
  const base = theme.background_color;
  switch (style) {
    case "gradient":
      return { background: `linear-gradient(${angle}deg, ${from}, ${to})` };
    case "soft-radial":
      return { background: `radial-gradient(circle at 30% 20%, ${from}, ${to})` };
    case "dots":
      return {
        backgroundColor: base,
        backgroundImage: `radial-gradient(${patternColor} 1.2px, transparent 1.2px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    case "grid":
      return {
        backgroundColor: base,
        backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    case "diagonal":
      return {
        backgroundColor: base,
        backgroundImage: `repeating-linear-gradient(45deg, ${patternColor} 0, ${patternColor} 1px, transparent 1px, transparent ${size}px)`,
      };
    case "solid":
    default:
      return { background: base };
  }
}

const CUSTOM_PRESETS_KEY = "lovable:website-editor:custom-theme-presets:v1";

type CustomPreset = { key: string; name: string; theme: ThemeState; createdAt: number };

function loadCustomPresets(): CustomPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomPreset[]) : [];
  } catch {
    return [];
  }
}

function saveCustomPresets(list: CustomPreset[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(list));
  } catch {
    // storage full or blocked; ignore
  }
}

function ThemeEditor({ theme, onChange }: { theme: ThemeState; onChange: (patch: Partial<ThemeState>) => void }) {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    setCustomPresets(loadCustomPresets());
  }, []);

  const persist = (next: CustomPreset[]) => {
    setCustomPresets(next);
    saveCustomPresets(next);
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) {
      toast.error("Preset ka naam daaliye");
      return;
    }
    if (customPresets.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Is naam se preset already exists");
      return;
    }
    const preset: CustomPreset = {
      key: `custom-${Date.now()}`,
      name,
      theme: JSON.parse(JSON.stringify(theme)) as ThemeState,
      createdAt: Date.now(),
    };
    persist([...customPresets, preset]);
    setPresetName("");
    setSaveOpen(false);
    toast.success(`"${name}" preset saved`);
  };

  const handleDeletePreset = (key: string, name: string) => {
    persist(customPresets.filter((p) => p.key !== key));
    toast.success(`"${name}" preset removed`);
  };

  const renderPresetCard = (p: { key: string; name: string; description?: string; theme: ThemeState }, opts?: { onDelete?: () => void }) => {
    const active =
      theme.primary_color === p.theme.primary_color &&
      theme.secondary_color === p.theme.secondary_color &&
      theme.heading_font === p.theme.heading_font &&
      theme.button_style === p.theme.button_style &&
      (theme.extras.bg_style ?? "solid") === (p.theme.extras.bg_style ?? "solid");
    const bgPreview = buildBgPreview(
      (p.theme.extras.bg_style as BgStyle | undefined) ?? "solid",
      p.theme,
    );
    return (
      <div key={p.key} className="relative">
        <button
          type="button"
          onClick={() => onChange(p.theme)}
          className={`group w-full overflow-hidden rounded-lg border text-left transition ${
            active ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/60"
          }`}
        >
          <div className="relative p-2" style={bgPreview}>
            <div className="flex gap-1">
              {[p.theme.primary_color, p.theme.secondary_color, p.theme.accent_color, p.theme.text_color].map((c, i) => (
                <span key={i} className="h-4 w-4 rounded-full border border-black/10 shadow-sm" style={{ background: c }} />
              ))}
            </div>
            <div
              className="mt-6 text-sm font-semibold leading-tight"
              style={{ color: p.theme.text_color, fontFamily: p.theme.heading_font }}
            >
              Aa
            </div>
            <span
              className="absolute right-1.5 top-1.5 inline-block px-2 py-0.5 text-[10px]"
              style={{
                background: p.theme.secondary_color,
                color: p.theme.background_color,
                fontFamily: p.theme.body_font,
                borderRadius:
                  p.theme.button_style === "pill" ? "9999px" :
                  p.theme.button_style === "square" ? "0" : "4px",
              }}
            >
              Book
            </span>
          </div>
          <div className="border-t bg-card px-2 py-1.5">
            <div className="truncate text-xs font-semibold" style={{ fontFamily: p.theme.heading_font }}>{p.name}</div>
            {p.description && <div className="truncate text-[10px] text-muted-foreground">{p.description}</div>}
          </div>
        </button>
        {opts?.onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); opts.onDelete?.(); }}
            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground"
            title="Delete preset"
            aria-label={`Delete preset ${p.name}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Theme &amp; Typography</h2>
        <p className="text-sm text-muted-foreground">Changes apply instantly to the live preview.</p>
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Presets</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSaveOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
            >
              <Save className="h-3.5 w-3.5" />
              Save current
            </button>
            <button
              type="button"
              onClick={() => onChange(DEFAULT_THEME)}
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ek click me colors, fonts, background style — sab kuch instantly apply ho jayega.
        </p>

        {saveOpen && (
          <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2">
            <Input
              autoFocus
              placeholder="Preset name (e.g. My Salon Look)"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleSavePreset(); }
                if (e.key === "Escape") { setSaveOpen(false); setPresetName(""); }
              }}
              className="h-8 text-sm"
              maxLength={40}
            />
            <Button type="button" size="sm" onClick={handleSavePreset}>Save</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setSaveOpen(false); setPresetName(""); }}>
              Cancel
            </Button>
          </div>
        )}

        {customPresets.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-medium uppercase text-muted-foreground">My presets</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {customPresets.map((p) =>
                renderPresetCard(
                  { ...p, description: `Saved ${new Date(p.createdAt).toLocaleDateString()}` },
                  { onDelete: () => handleDeletePreset(p.key, p.name) },
                ),
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {customPresets.length > 0 && (
            <div className="text-[11px] font-medium uppercase text-muted-foreground">Built-in</div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {THEME_PRESETS.map((p) => renderPresetCard(p))}
          </div>
        </div>
      </div>






      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Colors</h3>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Primary" value={theme.primary_color} onChange={(v) => onChange({ primary_color: v })} />
          <ColorField label="Secondary" value={theme.secondary_color} onChange={(v) => onChange({ secondary_color: v })} />
          <ColorField label="Accent" value={theme.accent_color} onChange={(v) => onChange({ accent_color: v })} />
          <ColorField label="Background" value={theme.background_color} onChange={(v) => onChange({ background_color: v })} />
          <ColorField label="Text" value={theme.text_color} onChange={(v) => onChange({ text_color: v })} />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Typography</h3>
        <div className="space-y-1.5">
          <Label>Heading Font</Label>
          <Select value={theme.heading_font} onValueChange={(v) => onChange({ heading_font: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Body Font</Label>
          <Select value={theme.body_font} onValueChange={(v) => onChange({ body_font: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Buttons</h3>
        <div className="space-y-1.5">
          <Label>Button Style</Label>
          <Select value={theme.button_style} onValueChange={(v) => onChange({ button_style: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUTTON_STYLES.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Preview:</span>
            <span
              className="inline-block px-5 py-2 text-sm font-medium"
              style={{
                background: theme.secondary_color,
                color: "#000",
                borderRadius: theme.button_style === "pill" ? "9999px" : theme.button_style === "square" ? "0" : "0.5rem",
                fontFamily: theme.body_font,
              }}
            >
              Book Now
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Background Style</h3>
        <p className="text-xs text-muted-foreground">Choose how the page background looks behind your sections.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BG_STYLES.map((s) => {
            const active = (theme.extras.bg_style ?? "solid") === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange({ extras: { bg_style: s.value } })}
                className={`rounded-lg border p-2 text-left transition ${
                  active ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/60"
                }`}
              >
                <div
                  className="h-12 w-full rounded"
                  style={buildBgPreview(s.value, theme)}
                />
                <div className="mt-1.5 text-xs font-semibold">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.description}</div>
              </button>
            );
          })}
        </div>

        {(theme.extras.bg_style ?? "solid") === "gradient" || (theme.extras.bg_style ?? "solid") === "soft-radial" ? (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Gradient From"
                value={theme.extras.bg_gradient_from ?? theme.background_color}
                onChange={(v) => onChange({ extras: { bg_gradient_from: v } })}
              />
              <ColorField
                label="Gradient To"
                value={theme.extras.bg_gradient_to ?? "#F1F5F9"}
                onChange={(v) => onChange({ extras: { bg_gradient_to: v } })}
              />
            </div>
            {(theme.extras.bg_style ?? "solid") === "gradient" && (
              <div className="space-y-1.5">
                <Label>Angle: {theme.extras.bg_gradient_angle ?? 135}°</Label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={theme.extras.bg_gradient_angle ?? 135}
                  onChange={(e) => onChange({ extras: { bg_gradient_angle: Number(e.target.value) } })}
                  className="w-full"
                />
              </div>
            )}
          </div>
        ) : null}

        {["dots", "grid", "diagonal"].includes(theme.extras.bg_style ?? "solid") && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <ColorField
              label="Pattern Color"
              value={theme.extras.bg_pattern_color ?? "#E5E7EB"}
              onChange={(v) => onChange({ extras: { bg_pattern_color: v } })}
            />
            <div className="space-y-1.5">
              <Label>Pattern Size: {theme.extras.bg_pattern_size ?? 24}px</Label>
              <input
                type="range"
                min={8}
                max={64}
                step={2}
                value={theme.extras.bg_pattern_size ?? 24}
                onChange={(e) => onChange({ extras: { bg_pattern_size: Number(e.target.value) } })}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="mt-3">
          <div className="text-xs text-muted-foreground mb-1">Live preview</div>
          <div
            className="h-24 w-full rounded-lg border"
            style={buildBgPreview(theme.extras.bg_style ?? "solid", theme)}
          />
        </div>
      </div>


      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Header</h3>
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Header Background"
            value={theme.extras.header_bg ?? "#FFFFFF"}
            onChange={(v) => onChange({ extras: { header_bg: v } })}
          />
          <ColorField
            label="Header Text"
            value={theme.extras.header_text ?? "#111827"}
            onChange={(v) => onChange({ extras: { header_text: v } })}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Links</h3>
        <ColorField
          label="Link Color"
          value={theme.extras.link_color ?? "#4F46E5"}
          onChange={(v) => onChange({ extras: { link_color: v } })}
        />
        <div className="space-y-1.5">
          <Label>Link Style</Label>
          <Select
            value={theme.extras.link_style ?? "hover-underline"}
            onValueChange={(v) => onChange({ extras: { link_style: v as ThemeExtras["link_style"] } })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No underline</SelectItem>
              <SelectItem value="hover-underline">Underline on hover</SelectItem>
              <SelectItem value="underline">Always underlined</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-2 text-sm" style={{ color: theme.text_color }}>
            Preview:{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={
                (theme.extras.link_style ?? "hover-underline") === "underline"
                  ? "underline"
                  : (theme.extras.link_style ?? "hover-underline") === "hover-underline"
                    ? "hover:underline"
                    : "no-underline"
              }
              style={{ color: theme.extras.link_color ?? "#4F46E5" }}
            >
              Sample link
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Header Navigation</h3>
        <Field
          label="Site title"
          value={theme.extras.site_title ?? ""}
          onChange={(v) => onChange({ extras: { site_title: v } })}
        />
        <NavLinksEditor
          links={theme.extras.nav_links ?? []}
          onChange={(next) => onChange({ extras: { nav_links: next } })}
        />
      </div>
    </div>
  );
}

function NavLinksEditor({ links, onChange }: { links: NavLink[]; onChange: (next: NavLink[]) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const patch = (id: string, p: Partial<NavLink>) =>
    onChange(links.map((l) => (l.id === id ? { ...l, ...p } : l)));
  const remove = (id: string) => onChange(links.filter((l) => l.id !== id));
  const add = () => onChange([...links, { id: newId(), label: "New link", url: "#" }]);
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...links];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const from = links.findIndex((l) => l.id === fromId);
    const to = links.findIndex((l) => l.id === toId);
    if (from < 0 || to < 0) return;
    const next = [...links];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Menu links ({links.length})</Label>
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> Add link
        </Button>
      </div>
      {links.length === 0 && (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          No menu links yet. Click <strong>Add link</strong> to create one.
        </p>
      )}
      {links.length > 0 && (
        <p className="text-xs text-muted-foreground">Drag the handle to reorder.</p>
      )}
      <ul className="space-y-2">
        {links.map((l, idx) => {
          const isDragging = dragId === l.id;
          const isOver = overId === l.id && dragId !== l.id;
          return (
            <li
              key={l.id}
              draggable
              onDragStart={(e) => {
                setDragId(l.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", l.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overId !== l.id) setOverId(l.id);
              }}
              onDragLeave={() => {
                if (overId === l.id) setOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromId = e.dataTransfer.getData("text/plain") || dragId;
                if (fromId) reorder(fromId, l.id);
                setDragId(null);
                setOverId(null);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              className={`rounded-md border bg-card p-2 transition ${
                isDragging ? "opacity-50" : ""
              } ${isOver ? "border-primary ring-2 ring-primary/30" : ""}`}
            >
              <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
                <span
                  className="flex h-9 w-6 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
                  title="Drag to reorder"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <Input
                  placeholder="Label"
                  value={l.label}
                  onChange={(e) => patch(l.id, { label: e.target.value })}
                />
                <Input
                  placeholder="URL or #section"
                  value={l.url}
                  onChange={(e) => patch(l.id, { url: e.target.value })}
                />
                <div className="flex items-center gap-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0}>↑</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === links.length - 1}>↓</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => remove(l.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
