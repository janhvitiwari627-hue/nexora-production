
-- 1. Realtime
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='bookings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END $$;

-- 2. Full-text search on shops
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(tagline,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(category,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(area,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(city,'')), 'C')
  ) STORED;
CREATE INDEX IF NOT EXISTS shops_search_vector_idx
  ON public.shops USING gin (search_vector);

CREATE OR REPLACE FUNCTION public.shops_search(
  _q text DEFAULT NULL,
  _category text DEFAULT NULL,
  _limit int DEFAULT 50
) RETURNS TABLE (
  id uuid, slug text, name text, tagline text, category text,
  city text, area text, cover_image text, rating double precision,
  review_count int, price_level text, is_verified boolean,
  rank real
) LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT s.id, s.slug, s.name, s.tagline, s.category, s.city, s.area,
         s.cover_image, s.rating, s.review_count, s.price_level, s.is_verified,
         CASE WHEN _q IS NULL OR _q = '' THEN 0
              ELSE ts_rank(s.search_vector, websearch_to_tsquery('simple', _q))
         END AS rank
    FROM public.shops s
   WHERE (_category IS NULL OR s.category = _category)
     AND (
       _q IS NULL OR _q = ''
       OR s.search_vector @@ websearch_to_tsquery('simple', _q)
       OR s.name ILIKE '%'||_q||'%'
     )
   ORDER BY rank DESC, s.rating DESC NULLS LAST
   LIMIT _limit;
$$;
GRANT EXECUTE ON FUNCTION public.shops_search(text, text, int) TO anon, authenticated;

-- 3. Booking notification triggers
CREATE OR REPLACE FUNCTION public.notify_on_new_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  owner_row record;
  salon_name text;
BEGIN
  SELECT name INTO salon_name FROM public.salons WHERE id = NEW.salon_id;
  FOR owner_row IN
    SELECT user_id FROM public.salon_owners
     WHERE salon_id = NEW.salon_id AND is_approved = true
  LOOP
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (
      owner_row.user_id,
      'New booking received',
      coalesce(salon_name,'Your salon') || ' — ' || NEW.service_name ||
        ' on ' || to_char(NEW.booking_date,'DD Mon') ||
        ' at ' || to_char(NEW.booking_time,'HH12:MI AM'),
      'booking',
      '/owner/bookings'
    );
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_on_new_booking ON public.bookings;
CREATE TRIGGER trg_notify_on_new_booking
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_booking();

CREATE OR REPLACE FUNCTION public.notify_on_booking_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  salon_name text;
  title_text text;
  body_text text;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;
  SELECT name INTO salon_name FROM public.salons WHERE id = NEW.salon_id;
  title_text := CASE NEW.status
    WHEN 'confirmed' THEN 'Booking confirmed'
    WHEN 'cancelled' THEN 'Booking cancelled'
    WHEN 'completed' THEN 'Booking completed'
    WHEN 'expired'   THEN 'Booking expired'
    ELSE 'Booking updated'
  END;
  body_text := coalesce(salon_name,'Your salon') || ' — ' || NEW.service_name ||
               ' on ' || to_char(NEW.booking_date,'DD Mon');
  INSERT INTO public.notifications (user_id, title, body, type, link)
  VALUES (NEW.user_id, title_text, body_text, 'booking', '/dashboard/bookings');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_on_booking_status_change ON public.bookings;
CREATE TRIGGER trg_notify_on_booking_status_change
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking_status_change();
