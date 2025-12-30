import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail } from "lucide-react";

interface NoCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NoCreditsModal({ isOpen, onClose }: NoCreditsModalProps) {
  const handleContact = () => {
    window.open("mailto:info@bouwbiologiezwolle.nl?subject=Credits%20aanvragen", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-heading text-destructive">
            <AlertCircle className="w-5 h-5" />
            Geen credits meer
          </DialogTitle>
          <DialogDescription>
            Je hebt al je credits gebruikt. Neem contact op met Bouwbiologie Zwolle om meer credits aan te schaffen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="p-4 rounded-lg bg-muted border border-border">
            <h4 className="font-medium mb-2">Wil je meer validaties uitvoeren?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Neem contact op met Bouwbiologie Zwolle voor een creditpakket op maat.
            </p>
            <Button onClick={handleContact} className="w-full gap-2">
              <Mail className="w-4 h-4" />
              Contact opnemen
            </Button>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
