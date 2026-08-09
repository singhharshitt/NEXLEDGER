import * as challanRepo from '../repositories/challan.repository';
import * as userRepo from '../repositories/user.repository';
import * as notificationService from './notification.service';
import { notFound } from '../utils/errors';

export async function listChallans(query: Record<string, unknown>) {
  return challanRepo.listChallansWithItems(query);
}

export async function getChallanById(id: string) {
  const result = await challanRepo.findChallanWithItems(id);
  if (!result) throw notFound('Challan');
  return result;
}

export async function createChallan(
  data: { customerId: string; items: { productId: string; quantity: number }[]; notes?: string },
  createdBy: string
) {
  const result = await challanRepo.createChallan(data, createdBy);
  if (!result) throw notFound('Challan');

  // Notify relevant users
  const notifyUserIds = await userRepo.findUsersByRoles(['ADMIN', 'SALES', 'WAREHOUSE']);
  for (const uid of notifyUserIds) {
    if (uid !== createdBy) {
      await notificationService.createNotification({
        userId: uid,
        type: 'CHALLAN_CREATED',
        title: 'New Challan Created',
        message: `Challan ${result.challan.challan_number} has been drafted.`,
        entityType: 'CHALLAN',
        entityId: result.challan.id
      });
    }
  }

  return result;
}

export async function updateChallan(
  id: string,
  data: { customerId?: string; items?: { productId: string; quantity: number }[]; notes?: string }
) {
  const result = await challanRepo.updateChallan(id, data);
  if (!result) throw notFound('Challan');
  return result;
}

export async function confirmChallan(challanId: string, userId: string) {
  const result = await challanRepo.confirmChallan(challanId, userId);
  if (!result) throw notFound('Challan');

  const notifyUserIds = await userRepo.findUsersByRoles(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']);
  for (const uid of notifyUserIds) {
    if (uid !== userId) {
      await notificationService.createNotification({
        userId: uid,
        type: 'CHALLAN_CONFIRMED',
        title: 'Challan Confirmed',
        message: `Challan ${result.challan.challan_number} was confirmed and stock was deducted.`,
        entityType: 'CHALLAN',
        entityId: result.challan.id
      });
    }
  }

  return result;
}

export async function cancelChallan(challanId: string, userId: string) {
  const result = await challanRepo.cancelChallan(challanId, userId);
  if (!result) throw notFound('Challan');

  const notifyUserIds = await userRepo.findUsersByRoles(['ADMIN', 'SALES', 'WAREHOUSE']);
  for (const uid of notifyUserIds) {
    if (uid !== userId) {
      await notificationService.createNotification({
        userId: uid,
        type: 'CHALLAN_CANCELLED',
        title: 'Challan Cancelled',
        message: `Challan ${result.challan.challan_number} was cancelled.`,
        entityType: 'CHALLAN',
        entityId: result.challan.id
      });
    }
  }

  return result;
}

export async function getRecentChallans(limit = 5) {
  return challanRepo.getRecentChallansWithItems(limit);
}
