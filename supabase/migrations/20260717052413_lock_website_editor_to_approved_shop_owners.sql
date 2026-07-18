-- Website creation/editing belongs only to an approved salon owner (or admin).
-- Authorization is based on user_roles + salon_owners, never user metadata.

DROP POLICY IF EXISTS "Owners manage own websites" ON public.user_websites;
CREATE POLICY "Approved shop owners manage own websites"
  ON public.user_websites
  FOR ALL
  TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    AND salon_id IS NOT NULL
    AND public.is_salon_owner((SELECT auth.uid()), salon_id)
    AND (
      public.has_role((SELECT auth.uid()), 'owner'::public.app_role)
      OR public.has_role((SELECT auth.uid()), 'shop_owner'::public.app_role)
    )
  )
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND salon_id IS NOT NULL
    AND public.is_salon_owner((SELECT auth.uid()), salon_id)
    AND (
      public.has_role((SELECT auth.uid()), 'owner'::public.app_role)
      OR public.has_role((SELECT auth.uid()), 'shop_owner'::public.app_role)
    )
  );

CREATE OR REPLACE FUNCTION public.create_user_website_from_template(
  _template_id uuid,
  _salon_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  tpl public.website_templates%ROWTYPE;
  new_website_id uuid;
  default_sections jsonb;
  section jsonb;
  idx int := 0;
  is_admin boolean := false;
  is_owner_role boolean := false;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  is_admin := public.has_role(uid, 'admin'::public.app_role)
    OR public.has_role(uid, 'super_admin'::public.app_role);
  is_owner_role := public.has_role(uid, 'owner'::public.app_role)
    OR public.has_role(uid, 'shop_owner'::public.app_role);

  IF NOT is_admin AND (
    _salon_id IS NULL
    OR NOT is_owner_role
    OR NOT public.is_salon_owner(uid, _salon_id)
  ) THEN
    RAISE EXCEPTION 'Only an approved shop owner can create a shop website'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO tpl
  FROM public.website_templates
  WHERE id = _template_id AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Template not found'; END IF;

  INSERT INTO public.user_websites (owner_id, salon_id, template_id, template_key)
  VALUES (uid, _salon_id, tpl.id, tpl.template_key)
  RETURNING id INTO new_website_id;

  INSERT INTO public.website_theme (website_id) VALUES (new_website_id);

  default_sections := jsonb_build_array(
    jsonb_build_object('type','hero',       'content', jsonb_build_object('heading','Welcome','subheading','','buttonText','Book Now','buttonLink','#services','imageUrl','')),
    jsonb_build_object('type','about',      'content', jsonb_build_object('heading','About Us','body','')),
    jsonb_build_object('type','services',   'content', jsonb_build_object('heading','Our Services','items','[]'::jsonb)),
    jsonb_build_object('type','rate_card',  'content', jsonb_build_object('heading','Rate Card','items','[]'::jsonb)),
    jsonb_build_object('type','packages',   'content', jsonb_build_object('heading','Packages','items','[]'::jsonb)),
    jsonb_build_object('type','offers',     'content', jsonb_build_object('heading','Current Offers','items','[]'::jsonb)),
    jsonb_build_object('type','staff',      'content', jsonb_build_object('heading','Meet the Team','items','[]'::jsonb)),
    jsonb_build_object('type','membership', 'content', jsonb_build_object('heading','Membership','items','[]'::jsonb)),
    jsonb_build_object('type','gallery',    'content', jsonb_build_object('heading','Gallery','images','[]'::jsonb)),
    jsonb_build_object('type','blog',       'content', jsonb_build_object('heading','Blog','posts','[]'::jsonb)),
    jsonb_build_object('type','contact',    'content', jsonb_build_object('heading','Contact Us','phone','','whatsapp','','email','','address','','mapEmbed',''))
  );

  FOR section IN SELECT * FROM jsonb_array_elements(default_sections) LOOP
    INSERT INTO public.website_sections (website_id, section_type, content, sort_order)
    VALUES (new_website_id, section->>'type', section->'content', idx);
    idx := idx + 1;
  END LOOP;

  RETURN new_website_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_user_website_from_template(uuid, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_user_website_from_template(uuid, uuid)
  TO authenticated;
