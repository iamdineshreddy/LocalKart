// Location utility functions

// Get user's current location
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes cache
            }
        );
    });
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
};

// Estimate delivery time
export const estimateDeliveryTime = (distanceKm: number): string => {
    const timeMinutes = (distanceKm / 20) * 60 + 15; // +15 min for packing
    return `${Math.round(timeMinutes)}-${Math.round(timeMinutes + 15)} mins`;
};

// Store location in localStorage
export const storeLocation = (latitude: number, longitude: number): void => {
    localStorage.setItem(
        'userLocation',
        JSON.stringify({ latitude, longitude, timestamp: Date.now() })
    );
};

// Get stored location
export const getStoredLocation = (): { latitude: number; longitude: number } | null => {
    const stored = localStorage.getItem('userLocation');
    if (!stored) return null;

    const { latitude, longitude, timestamp } = JSON.parse(stored);

    // Check if location is less than 30 minutes old
    if (Date.now() - timestamp > 30 * 60 * 1000) {
        return null;
    }

    return { latitude, longitude };
};
