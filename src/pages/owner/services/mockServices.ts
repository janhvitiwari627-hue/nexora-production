export type Gender = "all" | "male" | "female";

export interface OwnerService {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  offerPrice?: number;
  gender: Gender;
  image?: string;
  featured: boolean;
  active: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
}

export const initialCategories: ServiceCategory[] = [
  { id: "hair", name: "Hair" },
  { id: "skin", name: "Skin & Facials" },
  { id: "nails", name: "Nails" },
  { id: "makeup", name: "Makeup" },
  { id: "spa", name: "Spa & Massage" },
];

export const initialServices: OwnerService[] = [
  { id: "s1", categoryId: "hair", name: "Haircut & Style", description: "Professional cut with blow-dry finish.", durationMin: 45, price: 800, offerPrice: 650, gender: "all", featured: true, active: true },
  { id: "s2", categoryId: "hair", name: "Hair Color (Global)", description: "Full-head ammonia-free color.", durationMin: 90, price: 3500, offerPrice: 2999, gender: "all", featured: false, active: true },
  { id: "s3", categoryId: "hair", name: "Keratin Treatment", description: "Smoothing keratin therapy for frizz-free hair.", durationMin: 120, price: 5500, gender: "female", featured: true, active: true },
  { id: "s4", categoryId: "hair", name: "Beard Styling", description: "Beard trim and shape.", durationMin: 25, price: 350, gender: "male", featured: false, active: true },
  { id: "s5", categoryId: "skin", name: "Hydrating Facial", description: "Deep cleanse + hydration mask.", durationMin: 60, price: 1500, offerPrice: 1199, gender: "all", featured: true, active: true },
  { id: "s6", categoryId: "skin", name: "Anti-Aging Facial", description: "Collagen-boosting facial therapy.", durationMin: 75, price: 2500, gender: "all", featured: false, active: true },
  { id: "s7", categoryId: "nails", name: "Classic Manicure", description: "Nail shape, cuticle care, polish.", durationMin: 40, price: 600, gender: "all", featured: false, active: true },
  { id: "s8", categoryId: "nails", name: "Gel Pedicure", description: "Long-lasting gel polish pedicure.", durationMin: 55, price: 1200, offerPrice: 999, gender: "all", featured: true, active: true },
  { id: "s9", categoryId: "makeup", name: "Bridal Makeup", description: "Full bridal look with HD makeup.", durationMin: 120, price: 12000, offerPrice: 9999, gender: "female", featured: true, active: true },
  { id: "s10", categoryId: "makeup", name: "Party Makeup", description: "Glam evening look.", durationMin: 60, price: 3500, gender: "female", featured: false, active: true },
  { id: "s11", categoryId: "spa", name: "Swedish Massage", description: "Relaxing full-body massage.", durationMin: 60, price: 2200, gender: "all", featured: false, active: true },
  { id: "s12", categoryId: "spa", name: "Deep Tissue Massage", description: "Targets muscle tension and knots.", durationMin: 75, price: 2800, offerPrice: 2499, gender: "all", featured: false, active: false },
];
