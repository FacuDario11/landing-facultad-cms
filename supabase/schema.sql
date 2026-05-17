create extension if not exists pgcrypto;

create type public.user_role as enum ('super_admin', 'editor', 'moderator');
create type public.content_status as enum ('draft', 'scheduled', 'published', 'archived');
create type public.event_modality as enum ('presencial', 'virtual', 'hibrida');
create type public.internship_modality as enum ('presencial', 'remota', 'hibrida');
create type public.scholarship_status as enum ('abierta', 'proxima', 'cerrada');
create type public.resource_type as enum ('pdf', 'formulario', 'reglamento', 'guia');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'editor',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content jsonb not null default '{}'::jsonb,
  content_html text not null default '',
  category text not null,
  image_path text,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  content_html text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text not null,
  modality public.event_modality not null default 'presencial',
  category text not null,
  image_path text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  requirements text[] not null default '{}',
  documents text[] not null default '{}',
  deadline timestamptz,
  external_url text,
  status public.scholarship_status not null default 'proxima',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.internships (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  title text not null,
  slug text not null unique,
  modality public.internship_modality not null default 'hibrida',
  career text not null,
  requirements text[] not null default '{}',
  deadline timestamptz,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type public.resource_type not null default 'pdf',
  file_path text not null,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id text primary key default 'main',
  institution_name text not null default 'Consejería Estudiantil UTN FRT',
  email text not null,
  address text not null,
  office_hours text not null,
  logo_path text,
  banner_path text,
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index news_status_published_idx on public.news(status, published_at desc);
create index news_category_idx on public.news(category);
create index news_search_idx on public.news using gin (to_tsvector('spanish', title || ' ' || excerpt || ' ' || content_html));
create index events_starts_at_idx on public.events(starts_at);
create index scholarships_deadline_idx on public.scholarships(deadline);
create index internships_deadline_idx on public.internships(deadline);
create index resources_type_idx on public.resources(type);
create index faq_sort_idx on public.faq(sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger news_updated_at before update on public.news for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger scholarships_updated_at before update on public.scholarships for each row execute function public.set_updated_at();
create trigger internships_updated_at before update on public.internships for each row execute function public.set_updated_at();
create trigger resources_updated_at before update on public.resources for each row execute function public.set_updated_at();
create trigger faq_updated_at before update on public.faq for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('super_admin', 'editor', 'moderator')
  );
$$;

alter table public.profiles enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.scholarships enable row level security;
alter table public.internships enable row level security;
alter table public.resources enable row level security;
alter table public.faq enable row level security;
alter table public.site_settings enable row level security;

create policy "Profiles can read own profile" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "Super admins manage profiles" on public.profiles for all using (public.current_user_role() = 'super_admin') with check (public.current_user_role() = 'super_admin');

create policy "Published news are public" on public.news for select using (status = 'published' and coalesce(published_at, now()) <= now());
create policy "Staff manage news" on public.news for all using (public.is_staff()) with check (public.is_staff());

create policy "Published events are public" on public.events for select using (status = 'published');
create policy "Staff manage events" on public.events for all using (public.is_staff()) with check (public.is_staff());

create policy "Scholarships are public" on public.scholarships for select using (true);
create policy "Staff manage scholarships" on public.scholarships for all using (public.is_staff()) with check (public.is_staff());

create policy "Published internships are public" on public.internships for select using (status = 'published');
create policy "Staff manage internships" on public.internships for all using (public.is_staff()) with check (public.is_staff());

create policy "Published resources are public" on public.resources for select using (status = 'published');
create policy "Staff manage resources" on public.resources for all using (public.is_staff()) with check (public.is_staff());

create policy "Published faq is public" on public.faq for select using (published = true);
create policy "Staff manage faq" on public.faq for all using (public.is_staff()) with check (public.is_staff());

create policy "Settings are public" on public.site_settings for select using (true);
create policy "Super admins manage settings" on public.site_settings for all using (public.current_user_role() = 'super_admin') with check (public.current_user_role() = 'super_admin');

insert into storage.buckets (id, name, public)
values
  ('news', 'news', true),
  ('events', 'events', true),
  ('resources', 'resources', true),
  ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "Public read news files" on storage.objects for select using (bucket_id = 'news');
create policy "Public read event files" on storage.objects for select using (bucket_id = 'events');
create policy "Public read resource files" on storage.objects for select using (bucket_id = 'resources');
create policy "Public read banner files" on storage.objects for select using (bucket_id = 'banners');
create policy "Staff upload files" on storage.objects for insert with check (bucket_id in ('news', 'events', 'resources', 'banners') and public.is_staff());
create policy "Staff update files" on storage.objects for update using (bucket_id in ('news', 'events', 'resources', 'banners') and public.is_staff());
create policy "Staff delete files" on storage.objects for delete using (bucket_id in ('news', 'events', 'resources', 'banners') and public.is_staff());
