/**
 * MinimalLayout - Layout for pages without Footer
 * Used for auth pages, checkout, admin, etc.
 */
import { ReactNode } from "react";

interface MinimalLayoutProps {
    children: ReactNode;
}

const MinimalLayout = ({ children }: MinimalLayoutProps) => {
    return <>{children}</>;
};

export default MinimalLayout;
