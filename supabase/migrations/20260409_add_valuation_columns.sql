-- Adds missing valuation/storage columns required by the UI.
-- Run this in Supabase SQL Editor for project: flnjqeeefdngazwuqtrl

alter table public.shipments add column if not exists lot_number text;
alter table public.shipments add column if not exists market_value numeric(10,2);
alter table public.shipments add column if not exists valuation_source text;
alter table public.shipments add column if not exists acquisition_method text;

alter table public.inventory add column if not exists shelf_life text;
alter table public.inventory add column if not exists notes text;
