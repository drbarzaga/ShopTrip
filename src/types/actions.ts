// src/types/actions.ts

// Generic type for the action result
export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

// Generic type for an action that handles form data
export type FormAction<T = void> = (
  prevState: ActionResult<T> | null,
  formData: FormData
) => Promise<ActionResult<T>>;

export type ActionState<T = void> = ActionResult<T> | null;
