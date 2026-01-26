import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './features/admin/AdminDashboard'
import CustomerDashboard from './features/customer/CustomerDashboard'
import DriverDashboard from './features/driver/DriverDashboard'
import BookService from './pages/customer/BookService'
import MyBookings from './pages/customer/MyBookings'
import BookingDetails from './pages/customer/BookingDetails'
import AdminUsers from './pages/admin/Users'
import AdminBookings from './pages/admin/Bookings'
import AdminDrivers from './pages/admin/Drivers'
import DriverJobs from './pages/driver/Jobs'
import DriverJobDetails from './pages/driver/JobDetails'
import DriverVehicle from './pages/driver/Vehicle'
import Settings from './pages/Settings'

const queryClient = new QueryClient()

function App() {
  // Vercel handles routing automatically, no basename needed
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/drivers" element={<AdminDrivers />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/book" element={<BookService />} />
          <Route path="/customer/bookings" element={<MyBookings />} />
          <Route path="/customer/bookings/:id" element={<BookingDetails />} />
          <Route path="/customer/settings" element={<Settings />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/jobs" element={<DriverJobs />} />
          <Route path="/driver/jobs/:id" element={<DriverJobDetails />} />
          <Route path="/driver/vehicle" element={<DriverVehicle />} />
          <Route path="/driver/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

