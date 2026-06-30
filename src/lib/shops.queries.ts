import { queryOptions } from "@tanstack/react-query";
import { listShops } from "./shops.functions";

export const shopsQueryOptions = (input?: {
  q?: string;
  category?: string;
  area?: string;
  limit?: number;
}) =>
  queryOptions({
    queryKey: ["shops", input ?? {}],
    queryFn: () => listShops({ data: input }),
  });
