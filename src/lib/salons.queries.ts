import { queryOptions } from "@tanstack/react-query";
import { getSalonBySlug } from "./salons.functions";

export const salonBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["salon", slug],
    queryFn: () => getSalonBySlug({ data: { slug } }),
  });
