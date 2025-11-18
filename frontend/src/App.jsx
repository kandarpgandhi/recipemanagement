import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Feed from "./pages/Feed.jsx";
import Users from "./pages/Users.jsx";
import Collections from "./pages/Collections.jsx";
import CollectionDetails from "./pages/CollectionDetails.jsx";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/recipes/:id" element={<RecipeDetails />} />
            <Route path="/create" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />

            <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:id" element={<CollectionDetails />} />

            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
