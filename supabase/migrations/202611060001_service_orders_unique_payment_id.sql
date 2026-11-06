-- Enforce uniqueness on payment_id in service_orders to guarantee idempotent fulfilment and prevent duplicate orders
-- PostgreSQL UNIQUE constraints permit multiple NULL values (e.g. for free unlock service orders).
alter table public.service_orders
  drop constraint if exists service_orders_payment_id_key;

alter table public.service_orders
  add constraint service_orders_payment_id_key unique (payment_id);
