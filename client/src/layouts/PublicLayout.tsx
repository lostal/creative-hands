/**
 * PublicLayout - Layout for public pages that include the Footer
 * Used for Home, Products, About, and other consumer-facing pages
 */
import { ReactNode } from "react";
import Footer from "../components/Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default PublicLayout;
