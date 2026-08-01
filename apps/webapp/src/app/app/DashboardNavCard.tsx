import Link from 'next/link';

interface NavCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  external?: boolean;
}

export function NavCard({ href, icon, title, description, external }: NavCardProps) {
  const content = (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  const className =
    'group p-6 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-colors block';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
