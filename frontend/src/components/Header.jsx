import { useLocation } from 'react-router-dom';
import { titleForPath } from '../config/nav';

export default function Header({ subtitle, actions }) {
  const { pathname } = useLocation();
  const title = titleForPath(pathname);

  return (
    <header className="sticky top-0 z-20 h-16 px-6 flex items-center justify-between
                       bg-white/80 backdrop-blur-xl border-b border-line">
      <div className="flex flex-col justify-center">
        <h1 className="text-lg font-semibold text-ink leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted mt-1 leading-none">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}