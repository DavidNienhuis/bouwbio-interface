import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FolderOpen, Package } from 'lucide-react';
import { CreateProjectDialog } from './CreateProjectDialog';
import { CreateProductDialog } from './CreateProductDialog';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
}

interface Product {
  id: string;
  project_id: string;
  name: string;
  ean_code: string | null;
}

interface ProductSelectorProps {
  selectedProjectId: string | null;
  selectedProductId: string | null;
  onProjectChange: (projectId: string | null) => void;
  onProductChange: (productId: string | null) => void;
}

export function ProductSelector({ 
  selectedProjectId, 
  selectedProductId, 
  onProjectChange, 
  onProductChange 
}: ProductSelectorProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProducts(selectedProjectId);
    } else {
      setProducts([]);
      onProductChange(null);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('updated_at', { ascending: false });

    if (!error) setProjects(data || []);
    setLoadingProjects(false);
  };

  const fetchProducts = async (projectId: string) => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, project_id, name, ean_code')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (!error) setProducts(data || []);
    setLoadingProducts(false);
  };

  const handleCreateProject = async (name: string, description: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name, description: description || null })
      .select('id, name')
      .single();

    if (error) {
      toast.error('Kon project niet aanmaken');
    } else {
      toast.success('Project aangemaakt');
      setProjects(prev => [data, ...prev]);
      onProjectChange(data.id);
      setProjectDialogOpen(false);
    }
  };

  const handleCreateProduct = async (name: string, eanCode: string, description: string) => {
    if (!selectedProjectId) return;

    const { data, error } = await supabase
      .from('products')
      .insert({ 
        project_id: selectedProjectId, 
        name, 
        ean_code: eanCode || null, 
        description: description || null 
      })
      .select('id, project_id, name, ean_code')
      .single();

    if (error) {
      toast.error('Kon product niet aanmaken');
    } else {
      toast.success('Product aangemaakt');
      setProducts(prev => [data, ...prev]);
      onProductChange(data.id);
      setProductDialogOpen(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <>
      <Card style={{ border: '1px solid hsl(218 14% 85%)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <span 
              className="flex items-center justify-center w-8 h-8 text-sm font-bold"
              style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
            >
              0
            </span>
            Product koppelen (optioneel)
          </CardTitle>
          <CardDescription>
            Koppel deze validatie aan een project en product om resultaten te bewaren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Project Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Project
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={selectedProjectId || ''} 
                  onValueChange={(val) => onProjectChange(val || null)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecteer project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setProjectDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={selectedProductId || ''} 
                  onValueChange={(val) => onProductChange(val || null)}
                  disabled={!selectedProjectId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={selectedProjectId ? "Selecteer product..." : "Selecteer eerst een project"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} {product.ean_code && `(${product.ean_code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setProductDialogOpen(true)}
                  disabled={!selectedProjectId}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {selectedProduct && (
            <div 
              className="p-3 rounded-md text-sm"
              style={{ background: 'hsl(142 64% 62% / 0.1)', border: '1px solid hsl(142 64% 62% / 0.3)' }}
            >
              <span className="font-medium">Gekoppeld aan:</span> {selectedProduct.name}
              {selectedProduct.ean_code && <span className="ml-2" style={{ color: 'hsl(218 19% 27%)' }}>EAN: {selectedProduct.ean_code}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSubmit={handleCreateProject}
      />

      <CreateProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSubmit={handleCreateProduct}
      />
    </>
  );
}
