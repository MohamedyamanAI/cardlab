"use server";

import { headers } from "next/headers";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export type ForgotPasswordState = {
  errors?: {
    email?: string[];
  };
  success?: boolean;
} | null;

export async function resetPassword(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const validated = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();

  // Always show success to prevent email enumeration
  await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/auth/update-password`,
  });

  return { success: true };
}
