import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Preloader } from "./components/Preloader";
import { CustomCursor } from "./components/CustomCursor";
import { Home } from "./pages/Home";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { getToken } from "./utils/auth";

function ProtectedRoute(): JSX.Element {
  return getToken() ? <AdminDashboard /> : <Navigate to="/admin/login" replace />;
}

export default function App(): JSX.Element {
  return (
    <ErrorBoundary label="aplicacao">
      <Preloader />
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ className: "toast" }} />
    </ErrorBoundary>
  );
}
