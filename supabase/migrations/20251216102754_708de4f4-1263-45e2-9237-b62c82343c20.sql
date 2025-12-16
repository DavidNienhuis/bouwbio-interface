-- Delete all data except profiles
-- Order matters due to foreign key constraints

-- First delete validations (depends on products)
DELETE FROM public.validations;

-- Delete products (depends on projects)
DELETE FROM public.products;

-- Delete projects
DELETE FROM public.projects;

-- Delete knowledge_bank
DELETE FROM public.knowledge_bank;