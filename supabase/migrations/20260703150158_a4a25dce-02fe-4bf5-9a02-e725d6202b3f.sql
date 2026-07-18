
-- Admin moderation for reviews
CREATE POLICY "Admins update all reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins delete all reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));

-- Admin management for profiles (suspend/reactivate)
CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()));
