"use server";

import { signOut } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export async function handleSignOut() {
  await signOut();
  redirect("/login");
}








