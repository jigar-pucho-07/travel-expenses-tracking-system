import { LayoutDashboard, Plane, PlusCircle, FileText, LogOut } from 'lucide-react';

export const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/trips/new', label: 'Create Trip', icon: PlusCircle },
  { path: '/trips', label: 'Trip Details', icon: Plane },
  { path: '/reports', label: 'Reports', icon: FileText },
];

export function titleForPath(pathname) {
  const hit = [...NAV].sort((a, b) => b.path.length - a.path.length)
    .find(n => pathname === n.path || pathname.startsWith(n.path + '/'));
  return hit ? hit.label : 'Dashboard';
}