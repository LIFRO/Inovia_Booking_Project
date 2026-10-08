import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './views/MainLayout'
import DashboardPage from './views/DashboardPage';
import AdminPage from './views/AdminPage';
import CalendarPage from './views/CalendarPage';
import LoginPage from './views/LoginPage';
import RegisteringPage from './views/Registering';
import './App.css'
import { AuthProvider } from './ts/types/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { apiRegister } from './ts/apiCalls/User';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisteringPage registerApiCall={apiRegister}/>} />
          
          <Route path="/" element={ 
            <ProtectedRoute>
            <MainLayout /> 
            </ProtectedRoute>}>

            <Route path="admin" element={ <ProtectedRoute requiredRole='Admin'>
              <AdminPage/> 
              </ProtectedRoute>} 
              />
              
            <Route index element={<DashboardPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}


export default App
