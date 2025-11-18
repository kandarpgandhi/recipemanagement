import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
export default function Signup() {
  const { register } = useContext(AuthContext); const nav = useNavigate();
  const [username, setUsername] = useState(''); const [email, setEmail] = useState(''); const [displayName, setDisplayName] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); try { await register({ username, email, password, displayName }); nav('/home'); } catch (error) { setErr(error?.response?.data?.message || 'Signup failed'); } };
  return (<div className="content"><div className="card form"><h2>Sign up</h2>{err && <div style={{ color: 'red' }}>{err}</div>}<form onSubmit={submit}><label>Username</label><input className="input" value={username} onChange={(e) => setUsername(e.target.value)} /><label>Display name</label><input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /><label>Email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /><label>Password</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /><button className="btn" type="submit">Create account</button></form></div></div>);
}
