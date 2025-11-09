import TrainerDashboard from './TrainerDashboard'
import UserDashboard from './UserDashboard'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'trainer') {
    return <TrainerDashboard />
  }
  return <UserDashboard />
}

