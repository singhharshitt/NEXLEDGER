import type { Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import type { AuthenticatedRequest } from '../types/common';
import * as customersService from '../services/customers.service';
import { mapCustomer, mapFollowUp } from '../utils/mappers';

export const listCustomers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await customersService.listCustomers(req.query as Record<string, unknown>);
  const total = result.total;
  const totalPages = Math.ceil(total / result.limit);
  res.status(200).json({
    success: true,
    data: {
      items: result.rows.map(mapCustomer),
      pagination: { page: result.page, limit: result.limit, total, totalPages },
    },
  });
});

export const getCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customersService.getCustomerById(req.params.id as string);
  res.status(200).json({ success: true, data: mapCustomer(customer) });
});

export const createCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customersService.createCustomer(req.body as Record<string, unknown>, req.user!.userId);
  res.status(201).json({ success: true, data: mapCustomer(customer) });
});

export const updateCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customersService.updateCustomer(req.params.id as string, req.body as Record<string, unknown>);
  res.status(200).json({ success: true, data: mapCustomer(customer) });
});

export const deleteCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customersService.softDeleteCustomer(req.params.id as string);
  res.status(200).json({ success: true, data: mapCustomer(customer) });
});

export const listFollowUps = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const followUps = await customersService.listFollowUps(req.params.id as string);
  res.status(200).json({ success: true, data: followUps.map(mapFollowUp) });
});

export const createFollowUp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { date, notes } = req.body as { date: string; notes: string };
  const followUp = await customersService.createFollowUp(
    req.params.id as string,
    { date, notes },
    req.user!.userId
  );
  res.status(201).json({ success: true, data: mapFollowUp(followUp) });
});
