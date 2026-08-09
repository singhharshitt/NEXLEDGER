import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

// Note: /api/settings/notifications is more canonical but we'll mount these on /api/notifications/settings for simplicity
router.get('/settings', notificationController.getUserSettings);
router.patch('/settings', notificationController.updateUserSettings);

export default router;
