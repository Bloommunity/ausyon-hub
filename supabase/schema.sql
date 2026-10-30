create extension if not exists pgcrypto;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  fandom text not null check (char_length(fandom) between 1 and 120),
  author text not null check (char_length(author) between 1 and 80),
  platform text not null check (platform in ('AO3', 'Wattpad', 'X', 'Other')),
  url text not null check (url ~ '^https?://'),
  summary text not null check (char_length(summary) between 1 and 600),
  tags text[] not null default '{}',
  review_count integer not null default 0 check (review_count >= 0),
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  created_at timestamptz not null default now()
);

alter table public.stories drop constraint if exists stories_platform_check;
update public.stories set platform = 'Other' where platform = 'Tumblr';
alter table public.stories
  add constraint stories_platform_check check (platform in ('AO3', 'Wattpad', 'X', 'Other'));

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author text not null check (char_length(author) between 1 and 80),
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 8 and 1200),
  created_at timestamptz not null default now(),
  unique (story_id, user_id)
);

create table if not exists public.site_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 2000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  image_url text check (image_url is null or image_url ~ '^https?://'),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists stories_created_at_idx on public.stories (created_at desc);
create index if not exists stories_review_count_idx on public.stories (review_count desc);
create index if not exists reviews_story_id_idx on public.reviews (story_id, created_at desc);

alter table public.stories enable row level security;
alter table public.reviews enable row level security;
alter table public.site_announcements enable row level security;

revoke all on table public.site_announcements from anon, authenticated;
grant select on table public.site_announcements to anon, authenticated;

create policy "Stories are visible to everyone"
  on public.stories for select using (true);
create policy "Authenticated users can share stories"
  on public.stories for insert to authenticated with check (auth.uid() = user_id);

create policy "Reviews are visible to everyone"
  on public.reviews for select using (true);
create policy "Authenticated users can leave one review per story"
  on public.reviews for insert to authenticated with check (auth.uid() = user_id);

create policy "Active announcements are visible to everyone"
  on public.site_announcements for select to anon, authenticated
  using (starts_at <= now() and ends_at > now());

create or replace function public.refresh_story_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_story_id uuid;
begin
  target_story_id := case when tg_op = 'DELETE' then old.story_id else new.story_id end;

  update public.stories
  set review_count = (select count(*) from public.reviews where story_id = target_story_id),
      rating = coalesce(
        (select round(avg(rating)::numeric, 1) from public.reviews where story_id = target_story_id),
        0
      )
  where id = target_story_id;

  if tg_op = 'UPDATE' and old.story_id <> new.story_id then
    update public.stories
    set review_count = (select count(*) from public.reviews where story_id = old.story_id),
        rating = coalesce(
          (select round(avg(rating)::numeric, 1) from public.reviews where story_id = old.story_id),
          0
        )
    where id = old.story_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger reviews_refresh_story_stats
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_story_review_stats();
