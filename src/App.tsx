import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AppPage } from './pages/AppPage';
import { SessionPage } from './pages/SessionPage';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('auth_token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/app" element={
          <PrivateRoute>
            <AppPage />
          </PrivateRoute>
        } />
        
        <Route path="/app/session/:id" element={
          <PrivateRoute>
            <SessionPage />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/app" />} />
      </Routes>
    </BrowserRouter>
  );
}
