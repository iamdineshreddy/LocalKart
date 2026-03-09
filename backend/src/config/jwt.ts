/**
 * Centralized JWT Configuration
 * Fails fast if JWT_SECRET is not set — never uses a fallback.
 */

const JWT_SECRET = process.env.JWT_SECRET;

export function getJwtSecret(): string {
    if (!JWT_SECRET) {
        throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot start without it.');
    }
    return JWT_SECRET;
}

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRE || '30d';
