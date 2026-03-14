import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-slate-200">404</h1>
      <p className="mt-4 text-slate-600 font-medium">Page not found</p>
      <Link to="/" className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
        Go home
      </Link>
    </div>
  );
}
