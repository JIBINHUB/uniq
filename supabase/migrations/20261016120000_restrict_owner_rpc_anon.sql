-- Supabase grants anon EXECUTE on new public functions through default privileges.
-- These RPCs are for signed-in staff and owners only.
revoke execute on function public.claim_staff_access() from anon;
revoke execute on function public.owner_content() from anon;
revoke execute on function public.review_retailer(uuid, text, text) from anon;
