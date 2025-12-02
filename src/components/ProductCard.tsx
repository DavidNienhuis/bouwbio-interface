import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Trash2, ArrowRight, FileCheck, Barcode } from 'lucide-react';
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
  validation_count?: number;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, onClick, onDelete }: ProductCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg group"
      style={{ border: '1px solid hsl(218 14% 85%)' }}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div 
            className="w-10 h-10 flex items-center justify-center mb-2"
            style={{ background: 'hsl(142 64% 62%)', color: 'hsl(186 100% 10%)' }}
          >
            <Package className="w-5 h-5" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <CardTitle className="font-heading flex items-center justify-between">
          <span className="truncate">{product.name}</span>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'hsl(142 64% 62%)' }} />
        </CardTitle>
        {product.ean_code && (
          <CardDescription className="flex items-center gap-1">
            <Barcode className="w-3 h-3" />
            {product.ean_code}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
          <span className="flex items-center gap-1">
            <FileCheck className="w-3 h-3" />
            {product.validation_count || 0} validatie(s)
          </span>
          <span>
            {format(new Date(product.updated_at), 'dd MMM yyyy', { locale: nl })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
