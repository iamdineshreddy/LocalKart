import { Request, Response } from 'express';
import { FraudReport } from '../models/FraudReport';
import { Store } from '../models/Store';
import { analyzeSeller, takeActionOnSeller } from '../services/fraudService';
import { calculateTrustScore } from '../services/trustScoreService';

/**
 * Fraud Controller
 * Handles buyer reports and admin fraud management
 */

// Submit a fraud report (authenticated buyers)
export const submitReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const reporterId = (req as any).user?.id;
        const { sellerId, storeId, orderId, type, description, evidence } = req.body;

        if (!sellerId || !storeId || !type || !description) {
            res.status(400).json({ success: false, message: 'sellerId, storeId, type, and description are required' });
            return;
        }

        const validTypes = ['fake_product', 'scam', 'harassment', 'counterfeit', 'non_delivery', 'other'];
        if (!validTypes.includes(type)) {
            res.status(400).json({ success: false, message: `type must be one of: ${validTypes.join(', ')}` });
            return;
        }

        // Auto-escalate severity based on existing report count
        const existingCount = await FraudReport.countDocuments({ storeId, status: { $ne: 'dismissed' } });
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        if (existingCount >= 5) severity = 'critical';
        else if (existingCount >= 3) severity = 'high';

        const report = new FraudReport({
            reporterId,
            sellerId,
            storeId,
            orderId,
            type,
            description,
            evidence: evidence || [],
            severity,
        });
        await report.save();

        // Recalculate trust score after new report
        try {
            await calculateTrustScore(sellerId, storeId);
        } catch (e) {
            console.error('Trust score update after report failed:', e);
        }

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. Our team will review it.',
            report: { id: report._id, severity, status: 'open' },
        });
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Get all fraud reports
export const getAdminReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, status, severity } = req.query;

        const query: any = {};
        if (status && status !== 'all') query.status = status;
        if (severity && severity !== 'all') query.severity = severity;

        const reports = await FraudReport.find(query)
            .populate('reporterId', 'name email phone')
            .populate('sellerId', 'name email phone')
            .populate('storeId', 'storeName city')
            .sort({ createdAt: -1 })
            .skip((parseInt(page as string) - 1) * parseInt(limit as string))
            .limit(parseInt(limit as string));

        const total = await FraudReport.countDocuments(query);

        res.status(200).json({
            success: true,
            reports,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string)),
        });
    } catch (error) {
        console.error('Get admin reports error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Take action on a report (warn/suspend seller)
export const actionOnReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.id;
        const { action, adminNotes } = req.body;

        const report = await FraudReport.findById(id);
        if (!report) {
            res.status(404).json({ success: false, message: 'Report not found' });
            return;
        }

        const validActions = ['warning', 'suspension', 'ban', 'dismiss'];
        if (!validActions.includes(action)) {
            res.status(400).json({ success: false, message: `action must be one of: ${validActions.join(', ')}` });
            return;
        }

        if (action === 'dismiss') {
            report.status = 'dismissed';
            report.adminNotes = adminNotes || '';
            report.resolvedAt = new Date();
            report.resolvedBy = adminId;
            await report.save();
        } else {
            // Take action on the seller
            const result = await takeActionOnSeller(
                report.storeId.toString(),
                action as 'warning' | 'suspension' | 'ban',
                adminId,
                adminNotes || 'Action taken based on fraud report'
            );

            report.status = 'resolved';
            report.actionTaken = action as any;
            report.adminNotes = adminNotes || '';
            report.resolvedAt = new Date();
            report.resolvedBy = adminId;
            await report.save();

            // Recalculate trust score
            await calculateTrustScore(report.sellerId.toString(), report.storeId.toString());
        }

        res.status(200).json({
            success: true,
            message: `Report ${action === 'dismiss' ? 'dismissed' : 'resolved'} with action: ${action}`,
        });
    } catch (error) {
        console.error('Action on report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin: Analyze a seller for fraud risk
export const analyzeSellerRisk = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sellerId, storeId } = req.params;
        const risk = await analyzeSeller(sellerId, storeId);
        res.status(200).json({ success: true, risk });
    } catch (error) {
        console.error('Analyze seller risk error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
