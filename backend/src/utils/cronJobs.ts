import cron from 'node-cron';
import { updateAllTrustScores } from '../services/trustScoreService';
import { scanAllSellersForFraud } from '../services/fraudService';

/**
 * Cron Jobs
 * 
 * Schedules:
 *  - Daily at midnight: recalculate all seller trust scores
 *  - Weekly on Sunday: scan all sellers for fraud risk
 */

export const initCronJobs = () => {
    // Daily trust score recalculation at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Starting daily trust score update...');
        try {
            const result = await updateAllTrustScores();
            console.log(`[CRON] Trust scores updated: ${result.updated} success, ${result.errors} errors`);
        } catch (error) {
            console.error('[CRON] Trust score update failed:', error);
        }
    });

    // Weekly fraud scan on Sunday at 3 AM
    cron.schedule('0 3 * * 0', async () => {
        console.log('[CRON] Starting weekly fraud scan...');
        try {
            const risks = await scanAllSellersForFraud();
            console.log(`[CRON] Fraud scan complete: ${risks.length} risky sellers found`);
        } catch (error) {
            console.error('[CRON] Fraud scan failed:', error);
        }
    });

    console.log('Cron jobs initialized: Trust score (daily) + Fraud scan (weekly)');
};
