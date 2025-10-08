import { useState, useEffect } from 'react';
import { getMarketplaceLocationData } from '../../modules/breadcrumbs';

/**
 * Hook to track marketplace location changes
 */
export const useMarketplaceLocation = () => {
    const [location, setLocation] = useState(() =>
        getMarketplaceLocationData(document, window)
    );

    useEffect(() => {
        // Check for location changes periodically
        const interval = setInterval(() => {
            const currentLocation = getMarketplaceLocationData(document, window);

            if (JSON.stringify(currentLocation) !== JSON.stringify(location)) {
                console.log('Marketplace location changed:', currentLocation);
                setLocation(currentLocation);
            }
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, [location]);

    return location;
};