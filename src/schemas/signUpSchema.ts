import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be greater than 3 characters")
  .max(16, "Username must be no more than 16 characters");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
