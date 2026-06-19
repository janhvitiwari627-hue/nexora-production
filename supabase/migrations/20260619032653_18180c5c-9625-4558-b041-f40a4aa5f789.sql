
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  address TEXT,
  cover_image TEXT,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  price_level INT NOT NULL DEFAULT 2,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shops TO anon, authenticated;
GRANT ALL ON public.shops TO service_role;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shops are publicly viewable" ON public.shops FOR SELECT USING (true);

INSERT INTO public.shops (slug, name, tagline, description, category, city, area, address, cover_image, rating, review_count, price_level, is_verified) VALUES
('glow-studio-jaipur','Glow Studio','Premium unisex salon in C-Scheme','Award-winning stylists, organic products, and a calm modern space in the heart of Jaipur.','Unisex Salon','Jaipur','C-Scheme','12 Ashok Marg, C-Scheme','https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',4.8,342,3,true),
('the-mane-room','The Mane Room','Specialty hair colour & balayage','Boutique hair studio focused on colour, balayage, and Olaplex treatments.','Hair Salon','Jaipur','Vaishali Nagar','24 Amrapali Circle','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',4.7,218,3,true),
('serene-spa','Serene Spa & Wellness','Ayurvedic massage and facials','Full-service day spa offering Ayurvedic therapies, facials, and body treatments.','Spa','Jaipur','Malviya Nagar','Sector 4, Near Triveni','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',4.9,512,4,true),
('barber-co','Barber & Co.','Classic cuts. Modern men.','Old-school barbershop vibe with hot-towel shaves and skin fades.','Barber Shop','Jaipur','Raja Park','3 Devi Marg','https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80',4.6,189,2,false),
('lush-nails','Lush Nail Bar','Nail art studio','Gel, acrylic, and nail art by certified technicians.','Nail Studio','Jaipur','Mansarovar','Shop 18, Aravali Marg','https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80',4.5,97,2,false),
('the-brow-room','The Brow Room','Brows. Lashes. Confidence.','Specialists in brow lamination, threading, lash lifts and extensions.','Beauty Salon','Jaipur','C-Scheme','7 Bhagwan Das Road','https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80',4.8,264,3,true);
