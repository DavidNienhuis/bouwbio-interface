import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { ValidationFooter } from '@/components/ValidationFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Pencil, Save, X, FileCheck, Calendar, Trash2, Barcode } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Product {
  id: string;
  project_id: string;
  name: string;
  ean_code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Validation {
  id: string;
  session_id: string;
  certification: string;
  product_type: { id: string; name: string; description: string };
  file_names: string[];
  status: string;
  created_at: string;
}

export default function ProductDetail() {
  const { id: projectId, productId } = useParams<{ id: string; productId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEan, setEditEan] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (user && productId) {
      fetchProduct();
      fetchValidations();
    }
  }, [user, productId]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error || !data) {
      toast.error('Product niet gevonden');
      navigate(`/projecten/${projectId}`);
    } else {
      setProduct(data);
      setEditName(data.name);
      setEditEan(data.ean_code || '');
      setEditDescription(data.description || '');
    }
    setLoading(false);
  };

  const fetchValidations = async () => {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error) {
      setValidations((data as unknown as Validation[]) || []);
    }
  };

  const handleSaveProduct = async () => {
    const { error } = await supabase
      .from('products')
      .update({ 
        name: editName, 
        ean_code: editEan || null, 
        description: editDescription || null 
      })
      .eq('id', productId);

    if (error) {
      toast.error('Kon product niet updaten');
    } else {
      toast.success('Product bijgewerkt');
      setProduct(prev => prev ? { 
        ...prev, 
        name: editName, 
        ean_code: editEan || null, 
        description: editDescription || null 
      } : null);
      setEditing(false);
    }
  };

  const deleteValidation = async (validationId: string) => {
    const { error } = await supabase
      .from('validations')
      .delete()
      .eq('id', validationId);

    if (error) {
      toast.error('Verwijderen mislukt');
    } else {
      toast.success('Validatie verwijderd');
      setValidations(prev => prev.filter(v => v.id !== validationId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'hsl(142 64% 62%)';
      case 'pending': return 'hsl(45 93% 47%)';
      default: return 'hsl(218 14% 85%)';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 14% 97%)' }}>
        <Navbar />
        <div className="flex-1 py-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-8" />
          </div>
        </div>
        <ValidationFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(180 14% 97%)' }}>
      <Navbar />

      <div className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/projecten/${projectId}`)}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Project
            </Button>

            {editing ? (
              <Card className="mb-8" style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardHeader>
                  <CardTitle className="font-heading">Product bewerken</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Productnaam</label>
                    <Input 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      placeholder="Product naam"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">EAN Code</label>
                    <Input 
                      value={editEan} 
                      onChange={(e) => setEditEan(e.target.value)} 
                      placeholder="EAN code (optioneel)"
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
                    <Button onClick={handleSaveProduct} className="gap-2">
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
              <Card className="mb-8" style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading text-2xl">{product?.name}</CardTitle>
                      {product?.ean_code && (
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Barcode className="w-4 h-4" />
                          EAN: {product.ean_code}
                        </CardDescription>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
                      <Pencil className="w-4 h-4" />
                      Bewerken
                    </Button>
                  </div>
                </CardHeader>
                {product?.description && (
                  <CardContent>
                    <p style={{ color: 'hsl(218 19% 27%)' }}>{product.description}</p>
                  </CardContent>
                )}
              </Card>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl" style={{ color: 'hsl(190 16% 12%)' }}>
                Validaties ({validations.length})
              </h2>
              <Button 
                onClick={() => navigate(`/validatie?projectId=${projectId}&productId=${productId}`)}
                className="gap-2"
              >
                <FileCheck className="w-4 h-4" />
                Nieuwe Validatie
              </Button>
            </div>

            {validations.length === 0 ? (
              <Card className="text-center py-12" style={{ border: '1px solid hsl(218 14% 85%)' }}>
                <CardContent className="space-y-4">
                  <div 
                    className="w-16 h-16 mx-auto flex items-center justify-center"
                    style={{ background: 'hsl(142 64% 62% / 0.1)' }}
                  >
                    <FileCheck className="w-8 h-8" style={{ color: 'hsl(142 64% 62%)' }} />
                  </div>
                  <h3 className="font-heading text-xl">Nog geen validaties</h3>
                  <p style={{ color: 'hsl(218 19% 27%)' }}>
                    Start je eerste validatie voor dit product
                  </p>
                  <Button 
                    onClick={() => navigate(`/validatie?projectId=${projectId}&productId=${productId}`)}
                    className="gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    Start Validatie
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {validations.map((validation) => (
                  <Card key={validation.id} style={{ border: '1px solid hsl(218 14% 85%)' }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="w-2 h-2 rounded-full"
                              style={{ background: getStatusColor(validation.status) }}
                            />
                            <span className="font-medium font-heading">
                              {validation.product_type?.name || 'Onbekend'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(validation.created_at), 'dd MMM yyyy, HH:mm', { locale: nl })}
                            </span>
                            <span>{validation.file_names?.length || 0} bestand(en)</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteValidation(validation.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ValidationFooter />
    </div>
  );
}
