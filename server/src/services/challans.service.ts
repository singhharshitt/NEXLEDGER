import * as challanRepo from '../repositories/challan.repository';
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
  return result;
}

export async function cancelChallan(challanId: string, userId: string) {
  const result = await challanRepo.cancelChallan(challanId, userId);
  if (!result) throw notFound('Challan');
  return result;
}

export async function getRecentChallans(limit = 5) {
  return challanRepo.getRecentChallansWithItems(limit);
}
