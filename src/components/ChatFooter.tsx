export const ChatFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-4 text-center bg-background/50 backdrop-blur-sm border-t border-border/30">
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">
          24/7 Help Chat
        </a>
        <span className="text-border">•</span>
        <a href="#" className="hover:text-foreground transition-colors underline">
          Terms of Service
        </a>
        <span className="text-border">•</span>
        <a href="#" className="hover:text-foreground transition-colors underline">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};
