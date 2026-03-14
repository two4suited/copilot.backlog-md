import { Link } from 'react-router-dom';
import { CalendarDays, Users, ArrowRight } from 'lucide-react';

export function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
        Welcome to <span className="text-indigo-600">ConferenceApp</span>
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Discover conferences, explore sessions, and connect with speakers all in one place.
      </p>
      <div className="mt-10 flex gap-4 justify-center">
        <Link
          to="/conferences"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          <CalendarDays className="w-5 h-5" />
          Browse Conferences
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/speakers"
          className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-indigo-300 hover:text-indigo-700 transition-colors"
        >
          <Users className="w-5 h-5" />
          View Speakers
        </Link>
      </div>
    </div>
  );
}
