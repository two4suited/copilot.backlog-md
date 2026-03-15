const colours: Record<string, string> = {
  Beginner: 'bg-brand-sage/20 text-brand-sage dark:bg-brand-sage/10 dark:text-[#8aab76]',
  Intermediate: 'bg-brand-accent/15 text-brand-accent dark:bg-brand-accent/20',
  Advanced: 'bg-brand-primary/10 text-brand-primary dark:bg-[#4a2e20] dark:text-[#f5f0eb]',
};

export function LevelBadge({ level }: { level: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colours[level] ?? 'bg-brand-bg dark:bg-[#2c1810] text-brand-muted dark:text-[#c4a882]'}`}>
      {level}
    </span>
  );
}
