create table public.example_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.example_workspace_members (
  workspace_id uuid not null references public.example_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  primary key (workspace_id, user_id)
);

create table public.example_releases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.example_workspaces(id) on delete cascade,
  name text not null,
  owner text not null,
  target_date date not null,
  stage text not null check (stage in ('building', 'validating', 'blocked', 'ready')),
  revision integer not null default 0 check (revision >= 0),
  approvals integer not null default 0 check (approvals >= 0),
  required_approvals integer not null default 1 check (required_approvals > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.example_release_gates (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.example_releases(id) on delete cascade,
  label text not null,
  status text not null check (status in ('passing', 'failing', 'pending')),
  required boolean not null default true,
  unique (release_id, label)
);

create table public.example_onboardings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.example_workspaces(id) on delete cascade,
  customer text not null,
  plan text not null check (plan in ('growth', 'enterprise')),
  owner text not null,
  stage text not null check (stage in ('discovery', 'configuring', 'training', 'live', 'at_risk')),
  revision integer not null default 0 check (revision >= 0),
  seats integer not null check (seats > 0),
  weekly_active_users integer not null default 0 check (weekly_active_users >= 0 and weekly_active_users <= seats),
  last_contact_at timestamptz not null,
  target_launch_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.example_onboarding_milestones (
  id uuid primary key default gen_random_uuid(),
  onboarding_id uuid not null references public.example_onboardings(id) on delete cascade,
  label text not null,
  completed boolean not null default false,
  due_date date not null,
  unique (onboarding_id, label)
);

create index example_releases_workspace_target_idx on public.example_releases(workspace_id, target_date);
create index example_onboardings_workspace_launch_idx on public.example_onboardings(workspace_id, target_launch_date);
create index example_release_gates_release_idx on public.example_release_gates(release_id);
create index example_onboarding_milestones_onboarding_idx on public.example_onboarding_milestones(onboarding_id);

alter table public.example_workspaces enable row level security;
alter table public.example_workspace_members enable row level security;
alter table public.example_releases enable row level security;
alter table public.example_release_gates enable row level security;
alter table public.example_onboardings enable row level security;
alter table public.example_onboarding_milestones enable row level security;

create function public.is_example_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.example_workspace_members
    where workspace_id = target_workspace and user_id = auth.uid()
  );
$$;

create policy "members read workspaces" on public.example_workspaces for select using (public.is_example_workspace_member(id));
create policy "members read memberships" on public.example_workspace_members for select using (user_id = auth.uid());
create policy "members manage releases" on public.example_releases for all using (public.is_example_workspace_member(workspace_id)) with check (public.is_example_workspace_member(workspace_id));
create policy "members manage release gates" on public.example_release_gates for all using (exists (select 1 from public.example_releases r where r.id = release_id and public.is_example_workspace_member(r.workspace_id))) with check (exists (select 1 from public.example_releases r where r.id = release_id and public.is_example_workspace_member(r.workspace_id)));
create policy "members manage onboardings" on public.example_onboardings for all using (public.is_example_workspace_member(workspace_id)) with check (public.is_example_workspace_member(workspace_id));
create policy "members manage onboarding milestones" on public.example_onboarding_milestones for all using (exists (select 1 from public.example_onboardings o where o.id = onboarding_id and public.is_example_workspace_member(o.workspace_id))) with check (exists (select 1 from public.example_onboardings o where o.id = onboarding_id and public.is_example_workspace_member(o.workspace_id)));
