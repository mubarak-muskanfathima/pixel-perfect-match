# VEMU Mid Marks System — v1 Plan

A Navy Trust styled, institutional portal for VEMU Institute of Technology with 4 roles, auth, mid-marks entry, HOD approval workflow, and reports.

## Stack & setup
- Enable **Lovable Cloud** (Postgres + Auth + Storage).
- Email/password auth (institute logins; no Google for staff/students by default).
- `profiles` table + separate `user_roles` table with `app_role` enum (`admin`, `hod`, `faculty`, `student`) and `has_role()` security-definer function.

## Database schema
- `profiles` — id (FK auth.users), full_name, roll_no (nullable), employee_id (nullable), email, branch_id, department_id.
- `user_roles` — user_id, role.
- `departments` — id, name, code.
- `branches` — id, department_id, name, code.
- `academic_config` — singleton row: mid_marks_max (25), assignment_max (5), total_max (30), best_mid_weight (0.8), second_mid_weight (0.2).
- `subjects` — id, code, name, branch_id, semester, section.
- `students` — id, roll_no, name, branch_id, semester, section (linked to profile when student logs in).
- `subject_assignments` — id, subject_id, faculty_id (assigns a faculty to teach a subject).
- `mid_exams` — id, subject_id, mid_number (1 or 2), status (`draft`|`submitted`|`approved`|`rejected`), submitted_by, approved_by, locked.
- `student_marks` — id, mid_exam_id, student_id, q1..q5 (10-mark question split), assignment_marks, total (computed).
- `audit_log` — id, actor_id, action, entity, entity_id, payload jsonb, created_at.

RLS on every table; policies use `has_role()` helper.

## Pages / routes
- `/login`
- `/` → redirects to role dashboard
- `/_authenticated/admin` — admin home (users, departments, subjects, mark limits, system activity)
  - `/admin/users`, `/admin/academics`, `/admin/config`, `/admin/reports`
- `/_authenticated/hod` — HOD home (pending approvals, dept reports)
  - `/hod/approvals/$examId`, `/hod/reports`
- `/_authenticated/faculty` — faculty home (assigned subjects)
  - `/faculty/marks/$subjectId/$midNumber` — question-wise + assignment entry grid
  - `/faculty/reports`
- `/_authenticated/student` — student home (subjects + final internal marks)
  - `/student/marks` — full breakdown

## Business logic
- Question-wise entry (5 × 5 = 25, validated max per question).
- Assignment max 5.
- On both Mid 1 and Mid 2 approved → compute internal = `round(0.8 × max(m1,m2) + 0.2 × min(m1,m2)) + assignment_avg`.
- All max values pulled from `academic_config` (admin-editable).
- Submission locks edit; HOD approve → fully locks; HOD reject → returns to faculty.

## Reports
- Excel export (using `xlsx` lib) and PDF export (using `jspdf` + autotable).
- Scoped per role: faculty=class, HOD=department, admin=institution.

## Design system (Navy Trust)
- Tokens in `src/styles.css` (oklch): deep navy `#0f1b3d` background-strong, navy `#1e3a5f` primary, steel blue `#3b6fa0` accent, mist `#e8edf3` muted/surface.
- Typography: Inter for UI, serif display (e.g., Fraunces) for headings to give institutional gravitas.
- Subtle gradient on top bar, crest emblem, card-based dashboards, dense data tables.

## Validation & UX
- Zod schemas for marks entry (per-question max, non-negative, no empty rows).
- Toast feedback (sonner) for submit/approve/reject.
- Clear error messages per spec section 8.

## Out of scope for v1 (will iterate later)
- Audit log UI (data still captured).
- Bulk CSV student import (manual entry by admin or seed only).
- Password reset email flow (can add after).
- Institution logo upload (placeholder crest first).

Build order: Cloud → schema/RLS → auth + role routing → admin (config, users, subjects) → faculty entry → HOD approval → student view → reports/export → polish.
