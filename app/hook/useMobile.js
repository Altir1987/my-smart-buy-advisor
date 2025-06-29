import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint) {
    const [isMobile, setIsMobile] = useState(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < breakpoint);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, [breakpoint]);

    return isMobile;
}