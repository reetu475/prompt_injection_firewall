create table if not exists attack_logs (
  id text primary key,
  kind text not null,
  created_at timestamptz not null,
  risk_score integer not null,
  severity text not null,
  blocked boolean not null,
  categories text[] not null,
  reasons text[] not null,
  sample text not null
);
