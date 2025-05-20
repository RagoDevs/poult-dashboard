
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import ActivateAccount from '@/pages/ActivateAccount'
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/activate-account" element={<ActivateAccount />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
