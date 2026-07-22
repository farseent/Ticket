import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import DashboardA from '../pages/DashboardA';
import DashboardB from '../pages/DashboardB';
import DashboardC from '../pages/DashboardC';
import DashboardD from '../pages/DashboardD';
import NotFound from '../pages/NotFound';

function RoleDashboard() {
  const { user } = useAuth();
  if (user.role === 'A') return <DashboardA />;
  if (user.role === 'B') return <DashboardB />;
  if (user.role === 'C') return <DashboardC />;
  if (user.role === 'D') return <DashboardD />;
  return <NotFound message={`No dashboard built yet for role ${user.role}.`} />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <RoleDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}