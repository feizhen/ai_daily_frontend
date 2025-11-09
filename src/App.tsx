import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { Toaster } from "./components/ui/toaster";
import Home from "./pages/Home";
import AdminLayout from "./pages/Admin/Layout";
import VideosPage from "./pages/Admin/Videos";
import NewsPage from "./pages/Admin/News";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/videos" replace />} />
              <Route path="videos" element={<VideosPage />} />
              <Route path="news" element={<NewsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
