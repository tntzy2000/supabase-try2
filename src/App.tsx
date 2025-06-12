import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import IndexPage from './pages/index.tsx';
import TodosPage from './pages/todos.tsx';
// import { AuthProvider, useAuth } from './contexts/AuthContext'; // To be created

// Placeholder for ProtectedRoute component
// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//   const { user } = useAuth(); // Assuming useAuth hook from AuthContext
//   if (!user) {
//     return <Navigate to="/" replace />;
//   }
//   return children;
// };

function App() {
  return (
    // <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          {/* <Route path="/todos" element={<ProtectedRoute><TodosPage /></ProtectedRoute>} /> */}
          <Route path="/todos" element={<TodosPage />} /> {/* Temp: no protection */}
        </Routes>
      </div>
    // </AuthProvider>
  );
}

export default App;
