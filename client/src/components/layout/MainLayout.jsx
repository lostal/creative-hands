/**
 * MainLayout - Primary layout wrapper with Navbar and Footer
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from './CartSidebar';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />

            {/* Cart sidebar overlay */}
            <CartSidebar />
        </div>
    );
};

export default MainLayout;
