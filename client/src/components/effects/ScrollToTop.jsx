/**
 * ScrollToTop - Scrolls to top on route change
 * 
 * Essential for good UX - ensures users start at the top of each page
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
