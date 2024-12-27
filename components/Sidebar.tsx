import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, BarChart2, Settings, LogOut } from 'lucide-react'
import { Button } from "./ui/button"

const Sidebar = () => {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg h-screen">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl font-bold text-blue-600">Trequer</h1>
      </div>
      <ul className="flex flex-col py-4 flex-1">
        <li>
          <Link href="/dashboard" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
            <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><Home /></span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/data" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
            <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><BarChart2 /></span>
            <span className="text-sm font-medium">Export Data</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/settings" className="flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 text-gray-500 hover:text-gray-800">
            <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400"><Settings /></span>
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </li>
      </ul>
      <div className="p-4">
        <Button onClick={handleLogout} variant="outline" className="w-full flex items-center justify-center">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  )
}

export default Sidebar

