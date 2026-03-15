const colours: Record<string, string> = {
  Beginner: 'bg-brand-sage/20 text-brand-sage',
  Intermediate: 'bg-brand-accent/15 text-brand-accent',
  Advanced: 'bg-brand-primary/10 text-brand-primary',
};

export function LevelBadge({ level }: { level: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colours[level] ?? 'bg-brand-bg text-brand-muted'}`}>
      {level}
    </span>
  );
}
