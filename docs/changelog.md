---
title: "Changelog"
description: "Notable changes and releases for NexLedger"
---

# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-08-09

### Added
- **Complete CRM Module**: Lead tracking, customer management, and interaction follow-ups.
- **Inventory Module**: Real-time product catalog with strict database-level constraints on stock tracking.
- **Sales Challans**: Workflow to draft, confirm, and manage dispatch notes that directly impact inventory.
- **Real-Time Notifications**: Fully integrated WebSocket architecture for instant cross-client updates.
- **Role-Based Access Control**: Strict multi-tiered permissions (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **Comprehensive API Documentation**: Mintlify-based developer documentation.

### Fixed
- **CORS Reliability**: Implemented robust environment parsing and fallback behavior in Express `cors` middleware to support Vercel preview environments automatically.
- **Database Connection Pool Exhaustion**: Refactored Challan line-item fetching to use batched PostgreSQL array `ANY($1)` queries instead of looping sequential fetch requests.
- **UI Contrast**: Corrected login screen contrast issues and strictly enforced the finalized NexLedger logo integration rules.
