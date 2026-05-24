
-- ===== ENUMS =====
create type public.app_role as enum ('admin','hod','faculty','student');
create type public.exam_status as enum ('draft','submitted','approved','rejected');

-- ===== ROLES TABLE =====
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.current_user_has_any_role()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid())
$$;

-- ===== DEPARTMENTS / BRANCHES =====
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);
alter table public.departments enable row level security;

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  code text not null,
  created_at timestamptz not null default now(),
  unique (department_id, code)
);
alter table public.branches enable row level security;

-- ===== PROFILES =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  roll_no text unique,
  employee_id text unique,
  department_id uuid references public.departments(id),
  branch_id uuid references public.branches(id),
  semester int,
  section text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== ACADEMIC CONFIG (singleton) =====
create table public.academic_config (
  id int primary key default 1,
  mid_marks_max int not null default 25,
  assignment_max int not null default 5,
  total_max int not null default 30,
  best_mid_weight numeric not null default 0.8,
  second_mid_weight numeric not null default 0.2,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
alter table public.academic_config enable row level security;
insert into public.academic_config (id) values (1);

-- ===== SUBJECTS =====
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  branch_id uuid not null references public.branches(id) on delete cascade,
  semester int not null,
  section text not null,
  created_at timestamptz not null default now(),
  unique (code, branch_id, semester, section)
);
alter table public.subjects enable row level security;

-- ===== STUDENTS =====
create table public.students (
  id uuid primary key default gen_random_uuid(),
  roll_no text not null unique,
  name text not null,
  branch_id uuid not null references public.branches(id) on delete cascade,
  semester int not null,
  section text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.students enable row level security;

-- ===== SUBJECT ASSIGNMENTS =====
create table public.subject_assignments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (subject_id, faculty_id)
);
alter table public.subject_assignments enable row level security;

-- ===== MID EXAMS =====
create table public.mid_exams (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  mid_number int not null check (mid_number in (1,2)),
  status exam_status not null default 'draft',
  submitted_by uuid references public.profiles(id),
  submitted_at timestamptz,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  hod_comment text,
  created_at timestamptz not null default now(),
  unique (subject_id, mid_number)
);
alter table public.mid_exams enable row level security;

-- ===== STUDENT MARKS =====
create table public.student_marks (
  id uuid primary key default gen_random_uuid(),
  mid_exam_id uuid not null references public.mid_exams(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  q1 numeric default 0,
  q2 numeric default 0,
  q3 numeric default 0,
  q4 numeric default 0,
  q5 numeric default 0,
  assignment numeric default 0,
  updated_at timestamptz not null default now(),
  unique (mid_exam_id, student_id)
);
alter table public.student_marks enable row level security;

-- ===== AUDIT LOG =====
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;

-- ===== POLICIES =====

-- user_roles
create policy "admins manage roles" on public.user_roles for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "users read own roles" on public.user_roles for select
  using (user_id = auth.uid());

-- departments / branches: read all authenticated, write admin
create policy "auth read departments" on public.departments for select to authenticated using (true);
create policy "admin write departments" on public.departments for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "auth read branches" on public.branches for select to authenticated using (true);
create policy "admin write branches" on public.branches for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- profiles
create policy "users read own profile" on public.profiles for select using (id = auth.uid());
create policy "users update own profile" on public.profiles for update using (id = auth.uid());
create policy "admins read all profiles" on public.profiles for select using (public.has_role(auth.uid(),'admin'));
create policy "hods read dept profiles" on public.profiles for select
  using (public.has_role(auth.uid(),'hod') and department_id in (
    select department_id from public.profiles where id = auth.uid()
  ));
create policy "faculty read profiles same dept" on public.profiles for select
  using (public.has_role(auth.uid(),'faculty'));
create policy "admins write profiles" on public.profiles for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- academic_config
create policy "auth read config" on public.academic_config for select to authenticated using (true);
create policy "admin write config" on public.academic_config for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- subjects
create policy "auth read subjects" on public.subjects for select to authenticated using (true);
create policy "admin write subjects" on public.subjects for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- students
create policy "admin manage students" on public.students for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "staff read students" on public.students for select
  using (public.has_role(auth.uid(),'faculty') or public.has_role(auth.uid(),'hod'));
create policy "student read self" on public.students for select using (profile_id = auth.uid());

-- subject_assignments
create policy "auth read assignments" on public.subject_assignments for select to authenticated using (true);
create policy "admin write assignments" on public.subject_assignments for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- mid_exams
create policy "faculty manage own exams" on public.mid_exams for all
  using (
    public.has_role(auth.uid(),'faculty')
    and exists (select 1 from public.subject_assignments sa where sa.subject_id = mid_exams.subject_id and sa.faculty_id = auth.uid())
  )
  with check (
    public.has_role(auth.uid(),'faculty')
    and exists (select 1 from public.subject_assignments sa where sa.subject_id = mid_exams.subject_id and sa.faculty_id = auth.uid())
  );
create policy "hod read all exams" on public.mid_exams for select using (public.has_role(auth.uid(),'hod'));
create policy "hod update exam status" on public.mid_exams for update using (public.has_role(auth.uid(),'hod'));
create policy "admin all exams" on public.mid_exams for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "student read approved exams" on public.mid_exams for select
  using (status = 'approved' and exists (
    select 1 from public.student_marks sm
      join public.students s on s.id = sm.student_id
      where sm.mid_exam_id = mid_exams.id and s.profile_id = auth.uid()
  ));

-- student_marks
create policy "faculty manage marks own exam" on public.student_marks for all
  using (exists (
    select 1 from public.mid_exams me
      join public.subject_assignments sa on sa.subject_id = me.subject_id
      where me.id = student_marks.mid_exam_id
        and sa.faculty_id = auth.uid()
        and public.has_role(auth.uid(),'faculty')
  ))
  with check (exists (
    select 1 from public.mid_exams me
      join public.subject_assignments sa on sa.subject_id = me.subject_id
      where me.id = student_marks.mid_exam_id
        and sa.faculty_id = auth.uid()
        and public.has_role(auth.uid(),'faculty')
        and me.status in ('draft','rejected')
  ));
create policy "hod read marks" on public.student_marks for select using (public.has_role(auth.uid(),'hod'));
create policy "admin all marks" on public.student_marks for all
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "student read own marks" on public.student_marks for select
  using (exists (
    select 1 from public.students s
      join public.mid_exams me on me.id = student_marks.mid_exam_id
      where s.id = student_marks.student_id
        and s.profile_id = auth.uid()
        and me.status = 'approved'
  ));

-- audit log
create policy "admin hod read audit" on public.audit_log for select
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'hod'));
create policy "auth insert audit" on public.audit_log for insert to authenticated with check (actor_id = auth.uid());

-- ===== SEED DEPARTMENTS / BRANCHES / CONFIG =====
insert into public.departments (name, code) values
  ('Computer Science & Engineering','CSE'),
  ('Electronics & Communication','ECE'),
  ('Mechanical Engineering','MECH'),
  ('Civil Engineering','CIVIL');

insert into public.branches (department_id, name, code)
  select id, name, code from public.departments;
