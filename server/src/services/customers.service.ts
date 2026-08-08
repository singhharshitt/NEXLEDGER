import * as customerRepo from '../repositories/customer.repository';
import { notFound } from '../utils/errors';

export async function listCustomers(query: Record<string, unknown>) {
  return customerRepo.listCustomers(query);
}

export async function getCustomerById(id: string) {
  const customer = await customerRepo.findCustomerById(id);
  if (!customer) throw notFound('Customer');
  return customer;
}

export async function createCustomer(data: Record<string, unknown>, createdBy: string) {
  return customerRepo.createCustomer({ ...data, createdBy });
}

export async function updateCustomer(id: string, data: Record<string, unknown>) {
  const customer = await customerRepo.updateCustomer(id, data);
  if (!customer) throw notFound('Customer');
  return customer;
}

export async function softDeleteCustomer(id: string) {
  const customer = await customerRepo.softDeleteCustomer(id);
  if (!customer) throw notFound('Customer');
  return customer;
}

export async function listFollowUps(customerId: string) {
  const customer = await customerRepo.findCustomerById(customerId);
  if (!customer) throw notFound('Customer');
  return customerRepo.listFollowUps(customerId);
}

export async function createFollowUp(
  customerId: string,
  data: { date: string; notes: string },
  createdBy: string
) {
  return customerRepo.createFollowUp(customerId, data, createdBy);
}
