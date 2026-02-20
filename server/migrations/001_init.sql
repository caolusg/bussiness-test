create table if not exists users(
  id uuid primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists sessions(
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  title text,
  scenario text not null,
  created_at timestamptz not null default now()
);

create table if not exists messages(
  id uuid primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_id_created_at on sessions(user_id, created_at desc);
create index if not exists idx_messages_session_id_created_at on messages(session_id, created_at asc);
