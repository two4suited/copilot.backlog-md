import { Link } from 'react-router-dom';
import { CalendarDays, Users, ArrowRight, Mic2, LayoutGrid } from 'lucide-react';

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-12 overflow-hidden">
        <div className="bg-gradient-to-br from-brand-primary via-slate-800 to-slate-900 px-6 py-20 sm:py-28 text-center">
          {/* Radial glow accents */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 60% 40% at 20% 60%, rgba(14,165,233,0.15) 0%, transparent 70%), radial-gradient(ellipse 50% 35% at 80% 40%, rgba(14,165,233,0.10) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-block text-brand-accent text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10">
              The Premier Tech Event Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mt-4">
              Where Developers<br />
              <span className="text-brand-accent">Connect</span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Discover world-class tech conferences, explore cutting-edge sessions, and connect with the speakers shaping our industry.
            </p>
            <div className="mt-10 flex gap-4 justify-center flex-wrap">
              <Link
                to="/conferences"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-accent text-white font-semibold hover:bg-sky-400 transition-colors shadow-lg shadow-sky-900/40"
              >
                <CalendarDays className="w-5 h-5" />
                Browse Conferences
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/speakers"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/20 text-white font-semibold hover:border-brand-accent hover:text-brand-accent transition-colors"
              >
                <Users className="w-5 h-5" />
                View Speakers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        {[
          {
            icon: CalendarDays,
            title: 'Conferences',
            desc: 'Browse upcoming events and find the ones that match your interests.',
            to: '/conferences',
          },
          {
            icon: Mic2,
            title: 'Speakers',
            desc: 'Discover the experts presenting at this year\'s biggest tech events.',
            to: '/speakers',
          },
          {
            icon: LayoutGrid,
            title: 'Schedule',
            desc: 'Plan your agenda across tracks and never miss a must-see session.',
            to: '/schedule',
          },
        ].map(({ icon: Icon, title, desc, to }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-brand-accent/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-brand-accent" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base group-hover:text-brand-accent transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
