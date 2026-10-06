import React from 'react';
import { User } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
}

const Header: React.FC<HeaderProps> = ({ userName, userRole }) => {
  const displayName = userName || localStorage.getItem('user_name') || 'Pengguna';
  const displayRole = userRole || localStorage.getItem('user_role') || 'USER';

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900 leading-none">{displayName}</div>
          <div className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-1">{displayRole}</div>
        </div>
        <User size={20} className="text-slate-600" />
      </div>
    </header>
  );
};

export default Header;
