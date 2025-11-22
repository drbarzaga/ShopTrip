"use server";

import type { ActionState, ActionResult } from "@/types/actions";
import type { SignInInput } from "@/schemas/auth";
import { signInSchema } from "@/schemas/auth";
import { validate, success, failure } from "@/lib/actions/helpers";
import { auth } from "@/lib/auth";

export const signInAction = async (
  prevState: ActionState<SignInInput>,
  formData: FormData
): Promise<ActionResult<void>> => {
  const result = validate(formData, signInSchema);
  if ("success" in result && !result.success) {
    return result;
  }

  const { email, password } = result as SignInInput;

  try {
    await auth.api.signInEmail({
      body: { email, password },
    });

    return success(undefined, "Successfully signed in!");
  } catch (error) {
    return failure(
      error instanceof Error
        ? error.message
        : "An error occurred during sign in",
      undefined,
      { email, password }
    );
  }
};
