import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
export default function Login() {
  const { login } = useContext(AuthContext); const nav = useNavigate(); const location = useLocation(); const from = location.state?.from?.pathname || '/home';
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); try { await login(email, password); nav(from, { replace: true }); } catch (error) { setErr(error?.response?.data?.message || 'Login failed'); } };
  return (<div className="content"><div className="card form"><h2>Login</h2>{err && <div style={{ color: 'red' }}>{err}</div>}<form onSubmit={submit}><label>Email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /><label>Password</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /><button className="btn" type="submit">Login</button></form></div></div>);
}
