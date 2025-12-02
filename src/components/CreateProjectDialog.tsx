import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description: string) => void;
}

export function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), description.trim());
      setName('');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Nieuw Project</DialogTitle>
          <DialogDescription>
            Maak een nieuw project aan om je producten te organiseren
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Projectnaam *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv. Kantoorgebouw Amsterdam"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optionele beschrijving van het project"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Aanmaken
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
