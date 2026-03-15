import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-brand-border">404</h1>
      <p className="mt-4 text-slate-600 font-medium">Page not found</p>
      <Link to="/" className="mt-6 inline-block px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors">
        Go home
      </Link>
    </div>
  );
}
