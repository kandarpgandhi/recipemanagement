import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import ManageUsers from './ManageUsers';
import ManageRecipes from './ManageRecipes';
import AdminAnalytics from './AdminAnalytics';

export default function AdminDashboard() {
    return (
        <div className="content">
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <Link to="users">Users</Link>
                <Link to="recipes">Recipes</Link>
                <Link to="analytics">Analytics</Link>
            </div>

            <Routes>
                <Route path="/" element={<ManageUsers />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="recipes" element={<ManageRecipes />} />
                <Route path="analytics" element={<AdminAnalytics />} />
            </Routes>
        </div>
    );
}
