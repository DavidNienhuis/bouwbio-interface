-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Users can view own projects" 
ON public.projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = user_id);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  ean_code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS policies for products (via project ownership)
CREATE POLICY "Users can view products in own projects" 
ON public.products FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = products.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create products in own projects" 
ON public.products FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = products.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update products in own projects" 
ON public.products FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = products.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete products in own projects" 
ON public.products FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = products.project_id 
  AND projects.user_id = auth.uid()
));

-- Add product_id to validations table
ALTER TABLE public.validations 
ADD COLUMN product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- Create updated_at triggers
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();