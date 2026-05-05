import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { login as loginApi } from "../api/auth.api";

import { useAuth } from "../context/AuthContext";

import '../styles/login.css';





export default function Login() {



    const [form, setForm] = useState({ email: '', password: '' });

    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const navigate = useNavigate();





    function onChange(e) {

        // dynamically update the exact field user is typing --> by looking at input's name

        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    }





    async function onSubmit(e) {

        e.preventDefault(); // stops browser from refreshing the page

        setError('');

        setLoading(true);



        try {



            const res = await loginApi(form);

            login(res.data.token, res.data.user);

            navigate(res.data.user.role === 'admin' ? '/admin' : '/staff');



        }



        catch (err) {

            setError(err.response?.data?.message || 'Login failed. Please check your credentials.')

        }



        finally {

            setLoading(false);

        }



    }





    return (



        <div className="login-page">

            <div className="login-left">

                <div className="login-brand">

                    <div className="login-brand-logo">🏨</div>

                    <div className="login-brand-text">

                        <h2>HotelOps</h2>

                        <span>Operations Management</span>

                    </div>

                </div>



                <div className="login-hero">

                    <h1>Smart cleaning. <br /> <em>Flawless</em> operations.</h1>

                    <p>A complete workforce management platform built for modern hotels. Automate task assignment, track attendance, and manage your team with precision.</p>



                    <div className="login-features">

                        {[

                            { icon: '⚡', text: 'Priority-based auto task assignment engine' },

                            { icon: '📍', text: 'Real-time attendance and shift tracking' },

                            { icon: '🏨', text: 'Multi-hotel support with role-based access' },

                            { icon: '🔔', text: 'Automated shortfall alerts and notifications' },

                        ].map(f => (

                            <div className="login-feature" key={f.text}>

                                <div className="feature-icon">{f.icon}</div>

                                {f.text}

                            </div>

                        ))}

                    </div>

                </div>



                <div className="login-footer">

                    © {new Date().getFullYear()} HotelOps. All rights reserved.

                </div>

            </div>





            <div className="login-right">

                <div className="login-form-wrap">

                    <div className="login-form-head">

                        <h3>Welcome back</h3>

                        <p>Sign in to your hotel account to continue</p>

                    </div>



                    {error && (

                        <div style={{ marginBottom: '18px' }}>

                            <div className="alert alert-error">⚠ {error}</div>

                        </div>

                    )}





                    <form onSubmit={onSubmit}>

                        <div className="form-group">

                            <label className="form-label">Email Address</label>

                            <input

                                className="form-input"

                                type="email"

                                name="email"

                                placeholder="you@hotel.com"

                                value={form.email}

                                onChange={onChange}

                                required

                                autoComplete="email"

                            />

                        </div>



                        <div className="form-group">

                            <label className="form-hotel">Password</label>

                            <input

                                className="form-input"

                                type="password"

                                name="password"

                                placeholder="••••••••"

                                value={form.password}

                                onChange={onChange}

                                required

                            />

                        </div>


                        <button className="login-submit" type="submit" disabled={loading}>

                            {loading ? 'Signing in...' : 'Sign In →'}

                        </button>

                    </form>

                </div>

            </div>

        </div>

    )

}