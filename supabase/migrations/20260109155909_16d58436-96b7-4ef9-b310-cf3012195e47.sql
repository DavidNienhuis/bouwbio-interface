INSERT INTO public.user_roles (user_id, role)
VALUES ('bf09952e-d251-4c60-8e1c-414cd2e2b83b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;