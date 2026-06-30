-- ════════════════════════════════════════════════════════════════════════════
--  Ops Dashboard demo — schema additions applied to the meridian-coffee-ops
--  Supabase project. Kept here for reference / reproducibility. The base
--  e-commerce tables (accounts, products, orders, order_items) already existed;
--  this adds support tickets, refunds, the public read-only demo policies, and
--  the one privileged reseed function the seed script calls.
--
--  Already applied to the live project via migrations. Re-run-safe.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Refunds + support tickets ────────────────────────────────────────────────
alter table public.orders add column if not exists refunded_at timestamptz;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id),
  subject text not null,
  channel text not null default 'email',
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists support_tickets_status_created_idx
  on public.support_tickets (status, created_at);
alter table public.support_tickets enable row level security;

-- ── Public, read-only demo access (role: anon = the publishable key) ──────────
-- orders + products are already world-readable; open the rest the dashboard
-- reads. Scoped to anon, so the gated staff dashboard (authenticated, is_role
-- JWT policies) is unaffected.
drop policy if exists demo_read_items    on public.order_items;
drop policy if exists demo_read_accounts on public.accounts;
drop policy if exists demo_read_tickets  on public.support_tickets;
create policy demo_read_items    on public.order_items    for select to anon using (true);
create policy demo_read_accounts on public.accounts       for select to anon using (true);
create policy demo_read_tickets  on public.support_tickets for select to anon using (true);

-- ── Keyless live ticker: anon may INSERT only demo-shaped rows ────────────────
drop policy if exists demo_insert_orders  on public.orders;
drop policy if exists demo_insert_items   on public.order_items;
drop policy if exists demo_insert_tickets on public.support_tickets;
create policy demo_insert_orders  on public.orders         for insert to anon with check (status = 'new' and total >= 0);
create policy demo_insert_items   on public.order_items    for insert to anon with check (true);
create policy demo_insert_tickets on public.support_tickets for insert to anon with check (status = 'open');

-- ── Rolling-window prune: anon may DELETE only rows past the retention window ──
drop policy if exists demo_prune_orders  on public.orders;
drop policy if exists demo_prune_items   on public.order_items;
drop policy if exists demo_prune_tickets on public.support_tickets;
create policy demo_prune_orders  on public.orders          for delete to anon using (created_at < now() - interval '21 days');
create policy demo_prune_items   on public.order_items     for delete to anon using (
  order_id in (select id from public.orders where created_at < now() - interval '21 days'));
create policy demo_prune_tickets on public.support_tickets for delete to anon using (created_at < now() - interval '21 days');

-- ── Curated reseed (SECURITY DEFINER) so `npm run seed:ops` works with the
--    publishable key alone — no service-role secret. anon can ONLY invoke this
--    one function, not write the tables directly. See scripts/seed-ops-dashboard.mjs.
create or replace function public.seed_ops_dashboard()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  delete from order_items where true;
  delete from orders where true;
  delete from support_tickets where true;

  with days as (
    select gd::date as day
    from generate_series(current_date - 13, current_date, interval '1 day') gd
  ),
  counts as (
    select day,
      case
        when day = current_date then 16
        when extract(dow from day) in (0,6) then 14 + floor(random()*6)::int
        else 24 + floor(random()*9)::int
      end as n
    from days
  ),
  gen as (select c.day, generate_series(1, c.n) as seq from counts c)
  insert into orders (account_id, status, total, due_date, created_at)
  select
    (array(select id from accounts order by id))[1 + floor(random()*(select count(*) from accounts))::int],
    'delivered', 0, g.day,
    case when g.day = current_date
      then current_date + time '07:00' + random() * greatest(now() - (current_date + time '07:00'), interval '30 minutes')
      else g.day + time '07:00' + random() * interval '11 hours'
    end
  from gen g;

  -- 1–4 line items per order; item index hashed with the order id so the count
  -- varies per row and can't be constant-folded (a bare random() in a lateral
  -- gets evaluated once inside a SECURITY DEFINER function).
  insert into order_items (order_id, product_id, qty_bags)
  select o.id,
    (array(select id from products order by id))[1 + floor(random()*(select count(*) from products))::int],
    (4 + floor(random()*27))::int
  from orders o
  join generate_series(1,4) gs
    on gs = 1 or (abs(hashtext(o.id::text || ':' || gs::text)) % 100) < 55;

  update orders o set total = sub.t
  from (select oi.order_id, sum(oi.qty_bags * p.price_per_bag) t
        from order_items oi join products p on p.id = oi.product_id
        group by oi.order_id) sub
  where sub.order_id = o.id;

  update products set current_stock_bags = par_level_bags + 8 + floor(random()*55)::int where true;
  update products set current_stock_bags = 2 + floor(random()*14)::int
  where id in (select id from products order by random() limit 3);

  update orders set refunded_at = created_at + interval '70 minutes'
  where id in (
    select id from orders
    where created_at < now() - interval '2 hours' and created_at >= current_date - 1
    order by random() limit 5
  );

  insert into support_tickets (account_id, subject, channel, priority, status, created_at)
  select (array(select id from accounts order by id))[1 + floor(random()*(select count(*) from accounts))::int],
         t.subject, t.channel, t.priority, 'open', now() - (t.age_hours || ' hours')::interval
  from (values
    ('Bags arrived stale — whole shipment','email','urgent',73),
    ('Wrong roast delivered (got dark, ordered med)','email','high',52),
    ('Invoice #4471 doesn''t match delivery','phone','high',41),
    ('Missing 6 bags from Tuesday drop','email','normal',33),
    ('Auto-reorder didn''t trigger this week','email','normal',28),
    ('Grinder setting question for new espresso','chat','low',26),
    ('Need rush order for weekend pop-up','phone','high',9),
    ('Damaged packaging on two bags','email','normal',5),
    ('Requesting decaf swap on standing order','email','low',3),
    ('Delivery window change request','chat','normal',1)
  ) as t(subject, channel, priority, age_hours);

  select json_build_object(
    'orders', (select count(*) from orders),
    'order_items', (select count(*) from order_items),
    'tickets', (select count(*) from support_tickets),
    'low_stock', (select count(*) from products where current_stock_bags < par_level_bags),
    'orders_today', (select count(*) from orders where created_at::date = current_date)
  ) into result;
  return result;
end;
$$;

revoke all on function public.seed_ops_dashboard() from public;
grant execute on function public.seed_ops_dashboard() to anon, authenticated;
