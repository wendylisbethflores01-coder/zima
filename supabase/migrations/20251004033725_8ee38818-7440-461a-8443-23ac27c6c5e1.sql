-- Create currency enum
CREATE TYPE public.currency AS ENUM ('PEN', 'USD');

-- Modify properties table
ALTER TABLE public.properties 
ADD COLUMN price NUMERIC(12, 2),
ADD COLUMN currency public.currency;

-- Migrate existing data from properties (prioritize USD, then PEN)
UPDATE public.properties 
SET 
  price = COALESCE(price_usd, price_pen, 0),
  currency = CASE 
    WHEN price_usd IS NOT NULL AND price_usd > 0 THEN 'USD'::public.currency
    ELSE 'PEN'::public.currency
  END;

-- Make new columns NOT NULL after migration
ALTER TABLE public.properties 
ALTER COLUMN price SET NOT NULL,
ALTER COLUMN currency SET NOT NULL;

-- Drop old columns from properties
ALTER TABLE public.properties 
DROP COLUMN price_pen,
DROP COLUMN price_usd;

-- Modify sales table
ALTER TABLE public.sales 
ADD COLUMN sale_price NUMERIC(12, 2),
ADD COLUMN currency public.currency;

-- Migrate existing sales data
UPDATE public.sales 
SET 
  sale_price = COALESCE(sale_price_usd, sale_price_pen, 0),
  currency = CASE 
    WHEN sale_price_usd IS NOT NULL AND sale_price_usd > 0 THEN 'USD'::public.currency
    ELSE 'PEN'::public.currency
  END;

-- Make new columns NOT NULL after migration
ALTER TABLE public.sales 
ALTER COLUMN sale_price SET NOT NULL,
ALTER COLUMN currency SET NOT NULL;

-- Drop old columns from sales
ALTER TABLE public.sales 
DROP COLUMN sale_price_pen,
DROP COLUMN sale_price_usd;

-- Modify rental_contracts table
ALTER TABLE public.rental_contracts 
ADD COLUMN monthly_rent NUMERIC(12, 2),
ADD COLUMN rent_currency public.currency,
ADD COLUMN deposit_amount NUMERIC(12, 2),
ADD COLUMN deposit_currency public.currency;

-- Migrate existing rental_contracts data
UPDATE public.rental_contracts 
SET 
  monthly_rent = COALESCE(monthly_rent_usd, monthly_rent_pen, 0),
  rent_currency = CASE 
    WHEN monthly_rent_usd IS NOT NULL AND monthly_rent_usd > 0 THEN 'USD'::public.currency
    ELSE 'PEN'::public.currency
  END,
  deposit_amount = COALESCE(deposit_amount_usd, deposit_amount_pen, 0),
  deposit_currency = CASE 
    WHEN deposit_amount_usd IS NOT NULL AND deposit_amount_usd > 0 THEN 'USD'::public.currency
    ELSE 'PEN'::public.currency
  END;

-- Make new columns NOT NULL after migration
ALTER TABLE public.rental_contracts 
ALTER COLUMN monthly_rent SET NOT NULL,
ALTER COLUMN rent_currency SET NOT NULL;

-- Drop old columns from rental_contracts
ALTER TABLE public.rental_contracts 
DROP COLUMN monthly_rent_pen,
DROP COLUMN monthly_rent_usd,
DROP COLUMN deposit_amount_pen,
DROP COLUMN deposit_amount_usd;