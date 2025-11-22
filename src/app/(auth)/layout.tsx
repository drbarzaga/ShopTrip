import React from "react";

interface AuthLayoutProps {
  readonly children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      {children}
    </section>
  );
}

export default AuthLayout;
