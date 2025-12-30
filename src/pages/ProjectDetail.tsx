import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProductCard } from '@/components/ProductCard';
import { CreateProductDialog } from '@/components/CreateProductDialog';
import { Plus, ArrowLeft, Pencil, Save, X, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export interface Product {
  id: string;
  project_id: string;
  name: string;
  ean_code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  validation_count?: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchProject();
      fetchProducts();
    }
  }, [user, id]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast.error('Project niet gevonden');
      navigate('/projecten');
    } else {
      setProject(data);
      setEditName(data.name);
      setEditDescription(data.description || '');
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('project_id', id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      // Get validation counts
      const productsWithCounts = await Promise.all(
        (data || []).map(async (product) => {
          const { count } = await supabase
            .from('validations')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', product.id);
          return { ...product, validation_count: count || 0 };
        })
      );
      setProducts(productsWithCounts);
    }
  };

  const handleSaveProject = async () => {
    const { error } = await supabase
      .from('projects')
      .update({ name: editName, description: editDescription || null })
      .eq('id', id);

    if (error) {
      toast.error('Kon project niet updaten');
    } else {
      toast.success('Project bijgewerkt');
      setProject(prev => prev ? { ...prev, name: editName, description: editDescription || null } : null);
      setEditing(false);
    }
  };

  const handleCreateProduct = async (name: string, eanCode: string, description: string) => {
    const { data, error } = await supabase
      .from('products')
      .insert({ project_id: id, name, ean_code: eanCode || null, description: description || null })
      .select()
      .single();

    if (error) {
      toast.error('Kon product niet aanmaken');
    } else {
      toast.success('Product aangemaakt');
      setProducts(prev => [{ ...data, validation_count: 0 }, ...prev]);
      setDialogOpen(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    
    if (error) {
      toast.error('Kon product niet verwijderen');
    } else {
      toast.success('Product verwijderd');
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-24" /></CardContent></Card>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/projecten')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Projecten
            </Button>

            {editing ? (
              <Card className="mb-8 border-border">
                <CardHeader>
                  <CardTitle className="font-heading">Project bewerken</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Naam</label>
                    <Input 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      placeholder="Project naam"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Beschrijving</label>
                    <Textarea 
                      value={editDescription} 
                      onChange={(e) => setEditDescription(e.target.value)} 
                      placeholder="Beschrijving (optioneel)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProject} className="gap-2">
                      <Save className="w-4 h-4" />
                      Opslaan
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="gap-2">
                      <X className="w-4 h-4" />
                      Annuleren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="font-heading font-normal text-4xl text-foreground">
                    {project?.name}
                  </h1>
                  {project?.description && (
                    <p className="text-lg mt-2 text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                </div>
                <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
                  <Pencil className="w-4 h-4" />
                  Bewerken
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-foreground">
                Producten ({products.length})
              </h2>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Product Toevoegen
              </Button>
            </div>
          </div>

          {products.length === 0 ? (
            <Card className="text-center py-12 border-border">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-primary/10">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl">Nog geen producten</h3>
                <p className="text-muted-foreground">
                  Voeg je eerste product toe aan dit project
                </p>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Eerste product toevoegen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/projecten/${id}/producten/${product.id}`)}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateProduct}
      />
    </Layout>
  );
}
