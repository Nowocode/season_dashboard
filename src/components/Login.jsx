import React, { useState } from 'react';
import { authService } from '../services/authService.jsx';
import { LogIn, Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.login(email, password);
        } catch (err) {
            setError('Invalid email or password. Please try again.');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="glass-card animate-fade" style={{ maxWidth: '400px', width: '100%' }}>
                <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--primary)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                        boxShadow: '0 8px 20px rgba(147, 58, 53, 0.2)'
                    }}>
                        <Lock size={32} />
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        color: 'var(--primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        fontWeight: 700
                    }}>
                        Season Admin
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Sign in to access the dashboard
                    </p>
                </header>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@season.vision"
                                required
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(147, 58, 53, 0.1)',
                            color: 'var(--primary)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            fontSize: '0.9rem',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(147, 58, 53, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', height: '3.5rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'} <LogIn size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
