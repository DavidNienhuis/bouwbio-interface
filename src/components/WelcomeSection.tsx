function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

export const WelcomeSection = () => {
  const userName = "Lana";
  const greeting = getGreeting();
  
  return (
    <div className="text-center space-y-4 mb-8">
      {/* Welkomstboodschap */}
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold text-foreground tracking-tight">
          Good {greeting}, {userName}!
        </h1>
        <p className="text-xl text-muted-foreground">
          I am ready to help you
        </p>
      </div>
    </div>
  );
};
