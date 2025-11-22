interface AppLayoutProps {
  readonly children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      AppLayout
      {children}
    </>
  );
}

export default AppLayout;
