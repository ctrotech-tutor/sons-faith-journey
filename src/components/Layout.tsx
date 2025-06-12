
import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="">
      <Navigation />
      <main className="">
        {children}
      </main>
    </div>
  );
};

export default Layout;
