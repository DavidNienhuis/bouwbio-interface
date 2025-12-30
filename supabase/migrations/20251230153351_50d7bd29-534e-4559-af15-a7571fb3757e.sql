-- Add credits column to profiles table with default of 1 for new users
ALTER TABLE public.profiles 
ADD COLUMN credits integer NOT NULL DEFAULT 1;

-- Update existing users to have 1 credit
UPDATE public.profiles SET credits = 1 WHERE credits IS NULL;