import { Routes, Route } from 'react-router-dom'
import FinancialAdvisoryDashboard from './pages/FinancialAdvisoryDashboard'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import FinancialLoginPage from './pages/FinancialLoginPage'
import FinancialAnalyticsLanding from './pages/FinancialAnalyticsLanding'
import NeonAgentFlow from './pages/NeonAgentFlow'
import FinancialChatbot from './pages/FinancialChatbot'

function App() {
  return (
    <Routes>

      {/* Landing Page */}
      <Route path="/" element={<FinancialAnalyticsLanding />} />

      {/* Home / Dashboard */}
      <Route path="/dashboard" element={<FinancialAdvisoryDashboard />}  />

      {/* Home / Login */}
      <Route path="/login" element={<FinancialLoginPage />} />

       {/* Home / Chatbot */}
      <Route path="/chatbot" element={<FinancialChatbot />} />


      {/* <FinancialAdvisoryDashboard onChatOpen={() => navigate('/chatbot')} /> */}

      {/* Dummy secondary pages */}
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/profile" element={<Profile />} />

       {/* Dummy secondary pages */}
      
      <Route path="/agent-flow" element={<NeonAgentFlow />} />

      {/* Optional: 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  )
}

export default App
