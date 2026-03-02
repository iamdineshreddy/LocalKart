import axios from 'axios';
import { Store } from '../models/Store';
import { Product } from '../models/Product';

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

// Find nearest stores within a radius
export const findNearestStores = async (
    latitude: number,
    longitude: number,
    radius: number = 10, // km
    limit: number = 10
): Promise<any[]> => {
    try {
        const stores = await Store.find({
            isActive: true,
            isOpen: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radius * 1000 // Convert to meters
                }
            }
        }).limit(limit);

        // Add distance to each store
        return stores.map(store => ({
            ...store.toObject(),
            distance: calculateDistance(
                latitude,
                longitude,
                store.location.coordinates[1],
                store.location.coordinates[0]
            )
        }));
    } catch (error) {
        console.error('Error finding nearest stores:', error);
        // Fallback to manual calculation
        return findNearestStoresManual(latitude, longitude, radius, limit);
    }
};

// Fallback method using aggregation
const findNearestStoresManual = async (
    latitude: number,
    longitude: number,
    radius: number,
    limit: number
): Promise<any[]> => {
    const stores = await Store.find({
        isActive: true,
        isOpen: true
    });

    const storesWithDistance = stores
        .map(store => ({
            ...store.toObject(),
            distance: calculateDistance(
                latitude,
                longitude,
                store.location.coordinates[1],
                store.location.coordinates[0]
            )
        }))
        .filter(store => store.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

    return storesWithDistance;
};

// Get user's current location from IP
export const getLocationFromIP = async (ip: string): Promise<{ latitude: number; longitude: number; city?: string } | null> => {
    try {
        // Use a free IP geolocation service
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=lat,lon,city`);
        return {
            latitude: response.data.lat,
            longitude: response.data.lon,
            city: response.data.city
        };
    } catch (error) {
        console.error('Error getting location from IP:', error);
        return null;
    }
};

// Calculate delivery fee based on distance
export const calculateDeliveryFee = (
    baseFee: number,
    distance: number,
    freeDeliveryAbove: number = 500,
    subtotal: number = 0
): { deliveryFee: number; isFree: boolean } => {
    const isFree = subtotal >= freeDeliveryAbove;
    return {
        deliveryFee: isFree ? 0 : baseFee,
        isFree
    };
};

// Estimate delivery time based on distance
export const estimateDeliveryTime = (distance: number): string => {
    // Assume average speed of 20 km/h for delivery
    const timeInMinutes = (distance / 20) * 60 + 15; // +15 min for packing
    return `${Math.round(timeInMinutes)}-${Math.round(timeInMinutes + 15)} mins`;
};

// Get store's delivery area boundaries
export const getDeliveryAreaPolygon = (centerLat: number, centerLon: number, radiusKm: number): any => {
    // Create a simple bounding box for the delivery area
    const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
    const lonDelta = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180));

    return {
        type: 'Polygon',
        coordinates: [[
            [centerLon - lonDelta, centerLat - latDelta],
            [centerLon + lonDelta, centerLat - latDelta],
            [centerLon + lonDelta, centerLat + latDelta],
            [centerLon - lonDelta, centerLat + latDelta],
            [centerLon - lonDelta, centerLat - latDelta]
        ]]
    };
};

// Check if a location is within delivery radius
export const isWithinDeliveryRadius = (
    userLat: number,
    userLon: number,
    storeLat: number,
    storeLon: number,
    deliveryRadius: number
): boolean => {
    const distance = calculateDistance(userLat, userLon, storeLat, storeLon);
    return distance <= deliveryRadius;
};

// Get all products from nearest stores
export const getProductsFromNearestStores = async (
    latitude: number,
    longitude: number,
    category?: string,
    limit: number = 50
): Promise<any[]> => {
    const stores = await findNearestStores(latitude, longitude, 10, 10);
    const storeIds = stores.map(s => s._id);

    const productQuery: any = {
        storeId: { $in: storeIds },
        isActive: true,
        isAvailable: true,
        stock: { $gt: 0 }
    };

    if (category && category !== 'all') {
        productQuery.category = category;
    }

    const products = await Product.find(productQuery)
        .populate('storeId', 'storeName rating location')
        .sort({ rating: -1, totalSold: -1 })
        .limit(limit);

    // Add distance to each product based on store location
    return products.map(product => ({
        ...product.toObject(),
        storeDistance: calculateDistance(
            latitude,
            longitude,
            (product as any).storeId.location.coordinates[1],
            (product as any).storeId.location.coordinates[0]
        )
    }));
};
