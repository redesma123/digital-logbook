interface HeaderProps {
  userName?: string;
  userRole?: string;
}

const Header = ({ userName = 'Agus Setiawan', userRole = 'SUPERVISOR' }: HeaderProps) => {
  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900 leading-none">{userName}</div>
          <div className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-1">{userRole}</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
      </div>
    </header>
  );
};

export default Header;
