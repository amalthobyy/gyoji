import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import GoalsPage from './pages/Goals'
import WorkoutsPage from './pages/Workouts'
import NutritionPage from './pages/Nutrition'
import TrainersPage from './pages/Trainers'
import ChatPage from './pages/Chat'
import { CallHistory } from './pages/CallHistory'
import StorePage from './pages/Store'
import ProductDetailPage from './pages/ProductDetail'
import CartPage from './pages/Cart'
import CheckoutPage from './pages/Checkout'
import OrderConfirmationPage from './pages/OrderConfirmation'
import OrdersPage from './pages/Orders'
import CalculatorPage from './pages/Calculator'
import NotFoundPage from './pages/NotFound'
import DashboardPage from './pages/Dashboard'
import ProfilePage from './pages/Profile'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsersPage from './pages/admin/Users'
import AdminWorkoutsPage from './pages/admin/Workouts'
import AdminNutritionPage from './pages/admin/Nutrition'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.is_superuser) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
      <Route path="/workouts" element={<ProtectedRoute><WorkoutsPage /></ProtectedRoute>} />
      <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
      <Route path="/trainers" element={<ProtectedRoute><TrainersPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/store/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/calculator" element={<CalculatorPage />} />
      <Route path="/calls" element={<ProtectedRoute><CallHistory /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="workouts" element={<AdminWorkoutsPage />} />
          <Route path="nutrition" element={<AdminNutritionPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
