-- Switch nearby_salons to SECURITY INVOKER (it only reads publicly-readable salons)
ALTER FUNCTION public.nearby_salons(double precision, double precision, double precision, int)
  SECURITY INVOKER;

-- Lock down release_expired_bookings to service_role only
REVOKE EXECUTE ON FUNCTION public.release_expired_bookings() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.release_expired_bookings() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_bookings() TO service_role;