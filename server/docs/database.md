# NexLedger Database Schema

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | TEXT | NOT NULL UNIQUE |
| password_hash | TEXT | NOT NULL |
| full_name | TEXT | NOT NULL |
| role | TEXT | NOT NULL CHECK IN ('ADMIN','SALES','WAREHOUSE','ACCOUNTS') |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### customers
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_name | TEXT | NOT NULL |
| contact_name | TEXT | NOT NULL |
| email | TEXT | |
| mobile | TEXT | NOT NULL |
| address | TEXT | |
| city | TEXT | |
| state | TEXT | |
| gstin | TEXT | |
| type | TEXT | NOT NULL CHECK IN ('RETAIL','WHOLESALE','DISTRIBUTOR') |
| status | TEXT | NOT NULL DEFAULT 'LEAD' CHECK IN ('LEAD','ACTIVE','INACTIVE') |
| credit_limit | NUMERIC(12,2) | DEFAULT 0 |
| notes | TEXT | |
| follow_up_date | DATE | |
| created_by | UUID | REFERENCES users ON DELETE SET NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### customer_followups
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| customer_id | UUID | NOT NULL REFERENCES customers ON DELETE CASCADE |
| notes | TEXT | NOT NULL |
| follow_up_date | DATE | |
| completed | BOOLEAN | NOT NULL DEFAULT false |
| created_by | UUID | REFERENCES users ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### products
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | NOT NULL |
| sku | TEXT | NOT NULL UNIQUE |
| description | TEXT | |
| category | TEXT | NOT NULL |
| unit | TEXT | NOT NULL DEFAULT 'piece' |
| unit_price | NUMERIC(12,2) | NOT NULL |
| current_stock | INTEGER | NOT NULL DEFAULT 0 CHECK (>= 0) |
| minimum_stock | INTEGER | NOT NULL DEFAULT 0 |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| created_by | UUID | REFERENCES users ON DELETE SET NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### stock_movements
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| product_id | UUID | NOT NULL REFERENCES products ON DELETE RESTRICT |
| type | TEXT | NOT NULL CHECK IN ('IN','OUT') |
| quantity | INTEGER | NOT NULL CHECK (> 0) |
| notes | TEXT | |
| reference_id | UUID | (optional: challan_id for challan-driven movements) |
| created_by | UUID | REFERENCES users ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### challans
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| challan_number | TEXT | NOT NULL UNIQUE (format: CH-YYYY-XXXXXX) |
| customer_id | UUID | NOT NULL REFERENCES customers ON DELETE RESTRICT |
| status | TEXT | NOT NULL DEFAULT 'DRAFT' CHECK IN ('DRAFT','CONFIRMED','CANCELLED') |
| notes | TEXT | |
| total_quantity | INTEGER | NOT NULL DEFAULT 0 |
| total_amount | NUMERIC(14,2) | NOT NULL DEFAULT 0 |
| confirmed_at | TIMESTAMPTZ | |
| cancelled_at | TIMESTAMPTZ | |
| created_by | UUID | REFERENCES users ON DELETE SET NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### challan_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| challan_id | UUID | NOT NULL REFERENCES challans ON DELETE CASCADE |
| product_id | UUID | NOT NULL REFERENCES products ON DELETE RESTRICT |
| product_name_snapshot | TEXT | NOT NULL (immutable copy at creation) |
| sku_snapshot | TEXT | NOT NULL (immutable copy at creation) |
| unit_price_snapshot | NUMERIC(12,2) | NOT NULL (immutable copy at creation) |
| quantity | INTEGER | NOT NULL CHECK (> 0) |
| total_price | NUMERIC(14,2) | NOT NULL |
| UNIQUE | (challan_id, product_id) | |

### challan_sequences
| Column | Type | Constraints |
|--------|------|-------------|
| year | INTEGER | NOT NULL PRIMARY KEY |
| last_sequence | INTEGER | NOT NULL DEFAULT 0 |

Used by the challan number generator:
```sql
INSERT INTO challan_sequences (year, last_sequence) VALUES ($year, 1)
ON CONFLICT (year) DO UPDATE SET last_sequence = challan_sequences.last_sequence + 1
RETURNING last_sequence;
```
The returned value is zero-padded to 6 digits: `CH-2026-000001`.

### schema_migrations
| Column | Type | Constraints |
|--------|------|-------------|
| filename | TEXT | PRIMARY KEY |
| applied_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

Tracks which migration files have been applied. The migration runner in `scripts/migrate.ts` reads `.sql` files from `migrations/` in lexicographic order and applies unapplied files inside individual transactions.
