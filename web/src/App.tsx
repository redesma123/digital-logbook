import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import Dashboard from './pages/Dashboard';
import UnitCondition from './pages/UnitCondition';
import HistoryOperasi from './pages/HistoryOperasi';
import TrendParameter from './pages/TrendParameter';
import Gangguan from './pages/Gangguan';
import Maintenance from './pages/Maintenance';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kondisi-unit" element={<UnitCondition />} />
        <Route path="/history-operasi" element={<HistoryOperasi />} />
        <Route path="/trend-parameter" element={<TrendParameter />} />
        <Route path="/gangguan" element={<Gangguan />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
