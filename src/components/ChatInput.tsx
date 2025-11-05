import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, ArrowRight } from "lucide-react";

export const ChatInput = ({ onSubmit }: { onSubmit: (message: string) => void }) => {
  const [message, setMessage] = useState("");
  const [attachEnabled, setAttachEnabled] = useState(false);

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg overflow-hidden">
        {/* Textarea */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question or make a request..."
          className="min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 text-base p-4 pr-14"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        
        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          size="icon"
          className="absolute top-4 right-4 rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
          disabled={!message.trim()}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        
        {/* Bottom Options Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            {/* Attach Button */}
            <Button
              variant={attachEnabled ? "default" : "ghost"}
              size="sm"
              onClick={() => setAttachEnabled(!attachEnabled)}
              className="rounded-full"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Attach
            </Button>
          </div>
          
          {/* Character Count */}
          <span className="text-xs text-muted-foreground">
            {message.length} / 2000
          </span>
        </div>
      </div>
    </div>
  );
};
