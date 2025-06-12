import { Routes, Route, Navigate } from 'react-router-dom';
import IndexPage from './pages/index'; // Updated import path
import TodosPage from './pages/todos'; // Updated import path
import { AuthProvider, useAuth } from './contexts/AuthContext'; 

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth(); // Get user and loading state

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    // If not loading and no user, redirect to login page
    return <Navigate to="/" replace />;
  }
  return children; // User is authenticated, render the children
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route 
            path="/todos" 
            element={
              <ProtectedRoute>
                <TodosPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
