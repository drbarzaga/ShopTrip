// src/types/actions.ts

// Generic type for the action result
export type ActionResult<T = never> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; data?: never; fieldErrors?: Record<string, string[]>; formData?: Record<string, unknown> };

// Generic type for an action that handles form data
export type FormAction<T = void> = (
  prevState: ActionResult<T> | null,
  formData: FormData
) => Promise<ActionResult<T>>;

export type ActionState<T = void> = ActionResult<T> | null;
