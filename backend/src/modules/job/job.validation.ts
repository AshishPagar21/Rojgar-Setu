import { z } from "zod";

export const jobPlaceholderSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});
