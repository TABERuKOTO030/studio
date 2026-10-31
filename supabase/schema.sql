-- 秘幕手帐 VEIL：所有表 ops_ 前缀，严格 RLS（仅本人）
create table if not exists ops_settings(owner uuid primary key default auth.uid() references auth.users on delete cascade, data jsonb not null default '{}', updated_at timestamptz default now());
create table if not exists ops_posts(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade,
 title text not null default '', url text, sale_date date, theme text, selling text, budget numeric default 0, price numeric default 0, platform text default 'myfans', status text default '策划',
 tags text[] default '{}', cover text, notes text, ext_id text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists ops_stats(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade,
 post_id uuid not null references ops_posts on delete cascade, day date not null default current_date, views int, likes int, comments int, sales int, revenue numeric, note text, created_at timestamptz default now());
create table if not exists ops_items(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade,
 title text not null default '', type text default 'other', day date not null, t text, dur int default 60, all_day boolean default true, rrule text default '', until date, exdates date[] default '{}',
 notes text, checklist jsonb default '[]', remind int[] default '{}', remind_on boolean default true, done boolean default false, post_id uuid references ops_posts on delete set null,
 created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists ops_ideas(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade, title text, theme text, notes text, score int default 3, status text default '待定', created_at timestamptz default now());
create table if not exists ops_contacts(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade, name text, role text, contact text, rate numeric, notes text, created_at timestamptz default now());
create table if not exists ops_expenses(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade, day date default current_date, amount numeric not null default 0, category text, note text, post_id uuid references ops_posts on delete set null, created_at timestamptz default now());
create table if not exists ops_mf_snap(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade, day date not null, followers int, likes int, posts int, videos int, subscribers int, revenue numeric, unique(owner,day));
create table if not exists ops_x_snap(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade, handle text not null, day date not null, followers int, following int, posts int, listed int, unique(owner,handle,day));
create table if not exists ops_x_posts(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade, handle text not null, x_id text not null, text text, posted_at timestamptz,
 likes int default 0, reposts int default 0, replies int default 0, quotes int default 0, views int default 0, bookmarks int default 0, is_promo boolean default false, post_ref uuid references ops_posts on delete set null, updated_at timestamptz default now(), unique(owner,x_id));
create table if not exists ops_push(id uuid primary key default gen_random_uuid(), owner uuid not null default auth.uid() references auth.users on delete cascade, endpoint text not null unique, p256dh text not null, auth text not null, tz text default 'Asia/Tokyo', preview boolean default false, enabled boolean default true, created_at timestamptz default now());
create table if not exists ops_sent(k text primary key, owner uuid references auth.users on delete cascade, at timestamptz default now());
do $$declare t text; begin foreach t in array array['ops_settings','ops_posts','ops_stats','ops_items','ops_ideas','ops_contacts','ops_expenses','ops_mf_snap','ops_x_snap','ops_x_posts','ops_push'] loop
 execute format('alter table %I enable row level security',t); execute format('drop policy if exists own on %I',t);
 execute format('create policy own on %I for all to authenticated using (owner=(select auth.uid())) with check (owner=(select auth.uid()))',t);
 execute format('revoke all on %I from anon',t); execute format('grant select,insert,update,delete on %I to authenticated',t); end loop; end$$;
alter table ops_sent enable row level security; revoke all on ops_sent from anon,authenticated;
create index if not exists ops_items_o on ops_items(owner,day); create index if not exists ops_stats_p on ops_stats(post_id,day); create index if not exists ops_xp_o on ops_x_posts(owner,posted_at);
