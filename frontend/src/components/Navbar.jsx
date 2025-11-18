import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
export default function Navbar() {
  const { user, logout } = useContext(AuthContext); const nav = useNavigate();
  const onLogout = () => { logout(); nav('/login'); };
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/home" className="brand">RecipeHub</Link>
      </div>
      <div className="nav-right">
        <Link to="/home">Home</Link>
        {user ? <> <Link to="/create">Create</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/feed">Feed</Link>
          <Link to="/users">Users</Link>

          {user.isAdmin && <Link to="/admin">Admin</Link>}
          <button className="btn-link" onClick={onLogout}>Logout</button></> : <> <Link to="/login">Login</Link><Link to="/signup">Sign up</Link></>}
      </div>
    </nav>);
}
