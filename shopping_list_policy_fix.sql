-- Fix for RLS Error 42501 (Insufficient Privilege) on shopping_lists table
-- The original schema only added a SELECT policy. We need to allow INSERTs.

create policy "Users can insert their own shopping lists." 
on public.shopping_lists 
for insert 
with check ( auth.uid() = user_id );
