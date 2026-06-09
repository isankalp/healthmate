import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OTPVerifyPage } from './pages/OTPVerifyPage'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { HealthLogPage } from './pages/HealthLogPage'
import { GoalsPage } from './pages/GoalsPage'
import { ChatPage } from './pages/ChatPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/otp-verify" element={<OTPVerifyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/health-log" element={<HealthLogPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
