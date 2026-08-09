import { pool } from '../config/database';
import { getIO } from '../socket';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  // First, check user preferences
  let settingKey = '';
  if (params.type === 'CHALLAN_CREATED' || params.type === 'CHALLAN_CONFIRMED' || params.type === 'CHALLAN_CANCELLED') {
    settingKey = 'notify_challan';
  } else if (params.type === 'LOW_STOCK' || params.type === 'STOCK_MOVEMENT') {
    settingKey = 'notify_stock';
  } else if (params.type === 'CUSTOMER_CREATED') {
    settingKey = 'notify_customer';
  }

  if (settingKey) {
    const { rows: settingsRows } = await pool.query(
      `SELECT preferences FROM user_settings WHERE user_id = $1`,
      [params.userId]
    );
    if (settingsRows.length > 0) {
      const prefs = settingsRows[0].preferences;
      if (prefs && prefs[settingKey] === false) {
        // User explicitly disabled this type of notification
        return null;
      }
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [params.userId, params.type, params.title, params.message, params.entityType ?? null, params.entityId ?? null]
  );
  
  const notification = rows[0];

  try {
    const io = getIO();
    io.to(params.userId).emit('notification', notification);
  } catch (err) {
    // Socket.io might not be initialized during some tests, or fail. Do not break business logic.
    console.error('Failed to emit socket event', err);
  }

  return notification;
}

export async function getNotifications(userId: string, limit = 20, offset = 0) {
  const { rows } = await pool.query(
    `SELECT * FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
}

export async function getUnreadCount(userId: string) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return rows[0].count;
}

export async function markAsRead(id: string, userId: string) {
  const { rows } = await pool.query(
    `UPDATE notifications 
     SET is_read = TRUE, read_at = NOW() 
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [id, userId]
  );
  return rows[0];
}

export async function markAllAsRead(userId: string) {
  await pool.query(
    `UPDATE notifications 
     SET is_read = TRUE, read_at = NOW() 
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
}

export async function getUserSettings(userId: string) {
  const { rows } = await pool.query(
    `SELECT preferences FROM user_settings WHERE user_id = $1`,
    [userId]
  );
  if (rows.length === 0) {
    return { notify_challan: true, notify_stock: true, notify_customer: true };
  }
  return rows[0].preferences;
}

export async function updateUserSettings(userId: string, preferences: Record<string, boolean>) {
  const { rows } = await pool.query(
    `INSERT INTO user_settings (user_id, preferences)
     VALUES ($1, $2)
     ON CONFLICT (user_id) 
     DO UPDATE SET preferences = $2, updated_at = NOW()
     RETURNING preferences`,
    [userId, JSON.stringify(preferences)]
  );
  return rows[0].preferences;
}
