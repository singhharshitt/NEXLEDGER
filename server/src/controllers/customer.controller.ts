import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as customerRepo from "../repositories/customer.repository";
import { notFound } from "../utils/errors";
import { mapCustomer, mapFollowUp } from "../utils/mappers";
import { paginatedResponse } from "../utils/pagination";

export const listCustomers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await customerRepo.listCustomers(req.query as Record<string, unknown>);
  res.json(
    paginatedResponse(
      result.rows.map(mapCustomer),
      result.total,
      result.page,
      result.limit
    )
  );
});

export const getCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customerRepo.findCustomerById(req.params.id);
  if (!customer) throw notFound("Customer");
  res.json(mapCustomer(customer));
});

export const createCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customerRepo.createCustomer(req.body);
  res.status(201).json(mapCustomer(customer));
});

export const updateCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customerRepo.updateCustomer(req.params.id, req.body);
  if (!customer) throw notFound("Customer");
  res.json(mapCustomer(customer));
});

export const deleteCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customerRepo.softDeleteCustomer(req.params.id);
  if (!customer) throw notFound("Customer");
  res.json(mapCustomer(customer));
});

export const listFollowUps = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customerRepo.findCustomerById(req.params.id);
  if (!customer) throw notFound("Customer");
  const followUps = await customerRepo.listFollowUps(req.params.id);
  res.json(followUps.map(mapFollowUp));
});

export const createFollowUp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const customer = await customerRepo.findCustomerById(req.params.id);
  if (!customer) throw notFound("Customer");
  const followUp = await customerRepo.createFollowUp(
    req.params.id,
    req.body,
    req.user!.id
  );
  res.status(201).json(mapFollowUp(followUp));
});
