import { queryOptions } from "@tanstack/react-query";
import { listWebsiteTemplates } from "./owner.functions";

export const websiteTemplatesQuery = () =>
  queryOptions({
    queryKey: ["website-templates"],
    queryFn: () => listWebsiteTemplates(),
    staleTime: 5 * 60 * 1000,
  });
