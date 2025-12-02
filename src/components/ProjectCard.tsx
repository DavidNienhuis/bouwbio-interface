import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Package, Trash2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
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
            <FolderOpen className="w-5 h-5" />
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
          <span className="truncate">{project.name}</span>
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'hsl(142 64% 62%)' }} />
        </CardTitle>
        {project.description && (
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm" style={{ color: 'hsl(218 19% 27%)' }}>
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {project.product_count || 0} product(en)
          </span>
          <span>
            {format(new Date(project.updated_at), 'dd MMM yyyy', { locale: nl })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
