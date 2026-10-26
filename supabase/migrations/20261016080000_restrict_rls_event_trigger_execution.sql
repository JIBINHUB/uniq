-- The event-trigger helper is called by PostgreSQL during DDL and has no public API use.
-- Applied to the production project on 2026-10-16 as a separate, low-risk security fix.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
