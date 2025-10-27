import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-6">
            <Sidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
