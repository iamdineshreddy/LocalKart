import { useState, useEffect, useCallback } from 'react';

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
}

export function useLocation() {
    const [location, setLocation] = useState<LocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: true,
    });

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
                loading: false,
            }));
            return;
        }

        setLocation(prev => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                let message = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied. Enable it in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out.';
                        break;
                }
                setLocation(prev => ({
                    ...prev,
                    error: message,
                    loading: false,
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    }, []);

    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    return {
        ...location,
        refresh: requestLocation,
        hasLocation: location.latitude !== null && location.longitude !== null,
    };
}
