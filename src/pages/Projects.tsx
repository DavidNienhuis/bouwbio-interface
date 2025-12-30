import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Plus, FolderOpen, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    const { data: projectsData, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      toast.error('Kon projecten niet laden');
    } else {
      // Get product counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);
          return { ...project, product_count: count || 0 };
        })
      );
      setProjects(projectsWithCounts);
    }
    setLoading(false);
  };

  const handleCreateProject = async (name: string, description: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name, description: description || null })
      .select()
      .single();

    if (error) {
      toast.error('Kon project niet aanmaken');
    } else {
      toast.success('Project aangemaakt');
      setProjects(prev => [{ ...data, product_count: 0 }, ...prev]);
      setDialogOpen(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    
    if (error) {
      toast.error('Kon project niet verwijderen');
    } else {
      toast.success('Project verwijderd');
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <Layout>
      <div className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading font-normal text-4xl text-foreground">
                  Projecten
                </h1>
                <p className="text-lg mt-2 text-muted-foreground">
                  Beheer je projecten en producten
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nieuw Project
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border">
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="text-center py-12 border-border">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-primary/10">
                  <FolderOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl">Nog geen projecten</h3>
                <p className="text-muted-foreground">
                  Maak je eerste project aan om producten te organiseren
                </p>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Eerste project aanmaken
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/projecten/${project.id}`)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateProject}
      />
    </Layout>
  );
}
