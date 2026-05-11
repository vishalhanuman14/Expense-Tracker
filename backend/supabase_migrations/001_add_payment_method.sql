ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'debit'
CHECK (payment_method IN ('debit', 'credit'));

ALTER TABLE recurring_expenses
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'debit'
CHECK (payment_method IN ('debit', 'credit'));
