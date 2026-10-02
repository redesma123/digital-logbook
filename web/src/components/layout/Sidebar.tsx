import { NavLink } from 'react-router-dom';
import logoImage from '@/assets/logo.png';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="p-4 flex items-center gap-3 border-b border-slate-200">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
          <img src={logoImage} alt="HYDRO-MON Logo" className="w-full h-full object-contain mix-blend-multiply" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[15px] tracking-tight text-[#0F4C81] leading-none mb-1">HYDRO-MON</h1>
          <p className="text-[0.6rem] text-slate-600 font-bold tracking-wider leading-[1.1] uppercase">
            Digital Monitoring &<br/>Performance System
          </p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-[#1E293B] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/kondisi-unit" 
              className={({ isActive }) => 
                `flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-[#1E293B] text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
              }
            >
              Kondisi Unit
            </NavLink>
          </li>
          <li><a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900">Histori Operasi</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900">Trend Parameter</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900">Gangguan</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900">Maintenance</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900">Produksi Energi</a></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
