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

create table public.example_field_missions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.example_workspaces(id) on delete cascade,
  name text not null,
  incident text not null,
  lifeline text not null check (lifeline in ('food_water_shelter', 'health_medical')),
  coordinator text not null,
  operational_period text not null,
  revision integer not null default 0 check (revision >= 0),
  last_operation_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.example_field_stops (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.example_field_missions(id) on delete cascade,
  position integer not null check (position > 0),
  name text not null,
  address text not null,
  priority text not null check (priority in ('critical', 'high', 'routine')),
  status text not null check (status in ('queued', 'en_route', 'arrived', 'complete', 'blocked')),
  assigned_to text not null,
  eta text not null,
  supply_label text not null,
  planned_units integer not null check (planned_units > 0),
  delivered_units integer not null default 0 check (delivered_units >= 0),
  proof_required boolean not null default true,
  proof_captured boolean not null default false,
  unique (mission_id, position)
);

create index example_releases_workspace_target_idx on public.example_releases(workspace_id, target_date);
create index example_onboardings_workspace_launch_idx on public.example_onboardings(workspace_id, target_launch_date);
create index example_release_gates_release_idx on public.example_release_gates(release_id);
create index example_onboarding_milestones_onboarding_idx on public.example_onboarding_milestones(onboarding_id);
create index example_field_missions_workspace_idx on public.example_field_missions(workspace_id);
create index example_field_stops_mission_idx on public.example_field_stops(mission_id);

alter table public.example_workspaces enable row level security;
alter table public.example_workspace_members enable row level security;
alter table public.example_releases enable row level security;
alter table public.example_release_gates enable row level security;
alter table public.example_onboardings enable row level security;
alter table public.example_onboarding_milestones enable row level security;
alter table public.example_field_missions enable row level security;
alter table public.example_field_stops enable row level security;

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
create policy "members manage field missions" on public.example_field_missions for all using (public.is_example_workspace_member(workspace_id)) with check (public.is_example_workspace_member(workspace_id));
create policy "members manage field stops" on public.example_field_stops for all using (exists (select 1 from public.example_field_missions m where m.id = mission_id and public.is_example_workspace_member(m.workspace_id))) with check (exists (select 1 from public.example_field_missions m where m.id = mission_id and public.is_example_workspace_member(m.workspace_id)));

create function public.save_example_field_stop(
  target_mission_id uuid,
  target_stop_id uuid,
  expected_revision integer,
  next_status text,
  next_delivered_units integer,
  next_proof_captured boolean,
  operation_id text
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
  saved_revision integer;
  saved_operation_id text;
  current_status text;
  current_proof_required boolean;
begin
  select mission.id, mission.revision, mission.last_operation_id
  into saved_id, saved_revision, saved_operation_id
  from public.example_field_missions mission
  where mission.id = target_mission_id
  for update;

  if saved_id is null then return null; end if;
  if saved_operation_id = operation_id then return saved_id; end if;
  if saved_revision <> expected_revision then return null; end if;

  select stop.status, stop.proof_required
  into current_status, current_proof_required
  from public.example_field_stops stop
  where stop.id = target_stop_id and stop.mission_id = target_mission_id
  for update;
  if current_status is null then raise exception 'Field stop not found'; end if;

  if not (
    (current_status = 'queued' and next_status in ('en_route', 'blocked')) or
    (current_status = 'en_route' and next_status in ('arrived', 'blocked')) or
    (current_status = 'arrived' and next_status in ('complete', 'blocked')) or
    (current_status = 'blocked' and next_status in ('queued', 'en_route'))
  ) then raise exception 'Invalid field stop transition'; end if;
  if next_status = 'complete' and current_proof_required and not next_proof_captured then
    raise exception 'Delivery proof is required';
  end if;
  if next_status = 'complete' and next_delivered_units < 1 then
    raise exception 'Delivered quantity is required';
  end if;

  update public.example_field_missions
  set revision = revision + 1, last_operation_id = operation_id, updated_at = now()
  where id = target_mission_id;

  update public.example_field_stops
  set status = next_status, delivered_units = next_delivered_units, proof_captured = next_proof_captured
  where id = target_stop_id and mission_id = target_mission_id;
  return saved_id;
end;
$$;
