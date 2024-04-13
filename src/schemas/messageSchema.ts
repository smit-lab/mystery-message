import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Message must have atleast 10 or more characters" })
    .max(100, { message: "Message should not be more than 100 characters" }),
});
