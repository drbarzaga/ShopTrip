import React from "react";

interface AuthLayoutProps {
  readonly children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      AuthLayout
      {children}
    </>
  );
}

export default AuthLayout;
