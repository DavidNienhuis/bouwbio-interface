-- Deny anonymous users from accessing profiles table
CREATE POLICY "Deny anonymous access" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (false);