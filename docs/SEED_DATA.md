# NexLedger Demo Seed Data

## Purpose

The demo seed makes NexLedger look like an active wholesale and distribution business after login. It covers authentication, CRM customers, follow-ups, products, low/out-of-stock inventory, stock movements, challans, dashboard activity, search, filters, and pagination.

## Command

Run from the backend folder after migrations:

```bash
cd server
npm run db:migrate
npm run db:seed
```

The seed refuses to run when `NODE_ENV=production`.

By default it deletes and recreates only records that belong to the NexLedger demo dataset:

- users with `@nexledger.example.com`
- customers with `@customers.nexledger.example.com`
- products whose SKU starts with `NX-`
- demo challans in the `CH-<year>-9xxxxx` range
- related demo follow-ups, stock movements, and challan items

For a full local development reset, explicitly opt in:

```powershell
$env:ALLOW_DB_RESET = "true"
npm run db:seed
```

## Demo Credentials

All demo users use this password:

```text
NexLedger@2026!
```

| Role | Email |
| --- | --- |
| Admin | `admin@nexledger.example.com` |
| Sales | `sales@nexledger.example.com` |
| Warehouse | `warehouse@nexledger.example.com` |
| Accounts | `accounts@nexledger.example.com` |

Additional seeded users are included for the Settings users table:

- `sales.north@nexledger.example.com`
- `sales.keyaccounts@nexledger.example.com`
- `warehouse.dispatch@nexledger.example.com`
- `accounts.receivables@nexledger.example.com`

## Seed Counts

The seed creates:

| Area | Count |
| --- | ---: |
| Users | 8 |
| Customers | 36 |
| Follow-ups | 18 |
| Products | 26 |
| Challans | 20 |
| Challan items | 49 |

Stock movement count is generated from product opening stock, restocks, manual adjustments, confirmed challans, and cancelled challan restore movements.

## Feature Coverage

The dataset includes all customer types: `RETAIL`, `WHOLESALE`, `DISTRIBUTOR`.

The dataset includes all customer statuses: `LEAD`, `ACTIVE`, `INACTIVE`.

Follow-up dates include overdue, today, upcoming, and missing optional follow-up examples.

Product stock states include healthy, low stock, and out of stock records.

Challans include:

- 6 draft challans
- 11 confirmed challans
- 3 cancelled challans
- one-item and multi-item challans
- historical product snapshot prices

## Main Demo Scenario

`Metro Traders` has a confirmed challan for `Wireless Keyboard`.

The current product price is seeded as INR 1,199, while the historical challan snapshot price is INR 999. The confirmed challan deducts 20 units from stock and creates a matching `OUT` stock movement with the challan reference.

## Validation

At the end of the seed run, the script verifies:

- user, customer, product, challan, follow-up, stock movement, and item counts
- duplicate user emails
- duplicate product SKUs
- duplicate challan numbers
- negative stock
- inventory reconciliation using stock movements
- challan total reconciliation
- demo logins through the existing auth service
