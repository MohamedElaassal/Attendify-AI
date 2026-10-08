import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/AdminLayout';
import ProfessorLayout from './components/ProfessorLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterStudent from './pages/RegisterStudent';
import StudentsList from './pages/StudentsList';
import Absences from './pages/Absences';
import ProfessorsList from './pages/ProfessorsList';
import ProfessorDashboard from './pages/ProfessorDashboard';

// Protected Route Components
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

function ProfessorRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (role !== 'professor') {
    return <Navigate to="/login" replace />;
  }
  return <ProfessorLayout>{children}</ProfessorLayout>;
}

function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={
        role === 'admin' ? <Navigate to="/admin" replace /> :
        role === 'professor' ? <Navigate to="/professor" replace /> :
        <Login />
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/admin/students" element={<AdminRoute><StudentsList /></AdminRoute>} />
      <Route path="/admin/absences" element={<AdminRoute><Absences /></AdminRoute>} />
      <Route path="/admin/professors" element={<AdminRoute><ProfessorsList /></AdminRoute>} />

      {/* Professor Routes */}
      <Route path="/professor" element={<ProfessorRoute><ProfessorDashboard /></ProfessorRoute>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
