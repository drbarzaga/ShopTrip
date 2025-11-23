import React from "react";

interface AuthLayoutProps {
  readonly children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <section className="min-h-screen bg-zinc-50 dark:bg-transparent">
      {children}
    </section>
  );
}

export default AuthLayout;
