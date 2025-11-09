import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const showSidebar = location.pathname !== '/' && !['/login', '/register', '/forgot-password'].includes(location.pathname)
  
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        {showSidebar ? (
          <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-6 lg:gap-10">
              <Sidebar />
              <div className="flex-1 min-w-0 overflow-hidden">{children}</div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">{children}</div>
        )}
      </main>
      <Footer />
    </div>
  )
}
