
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                router.push('/chat');
            } else {
                alert(data.message);
            }
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                alert('Registration successful!');
                setIsLogin(true);
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                router.push('/login');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        }
    };
    return (
        <main className={styles.wrapper}>
            <section className={styles.card}>
                <div className={styles.left}>
                    <h2 className={styles.logo}>Shopping Consultant</h2>

                    <h3 className={styles.subtitle}>
                        {isLogin ? 'Login to Shopping Consultant' : 'Create your account'}
                    </h3>

                    <p className={styles.smallText}>
                        {isLogin ? (
                            <>
                                Don’t have an account?{' '}
                                <button
                                    type="button"
                                    className={styles.link}
                                    onClick={() => setIsLogin(false)}
                                >
                                    Create account
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    className={styles.link}
                                    onClick={() => setIsLogin(true)}
                                >
                                    Sign&nbsp;in
                                </button>
                            </>
                        )}
                    </p>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        {!isLogin && (
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        )}

                        <input
                            className={styles.input}
                            type="email"
                            placeholder="youremail@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.input}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className={styles.toggleIcon}
                                onClick={() => setShowPassword(!showPassword)}
                            >
		                    {showPassword ? <FaEyeSlash /> : <FaEye />}
	                        </span>
                        </div>

                        {!isLogin && (
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        )}

                        <button type="submit" className={styles.primaryBtn}>
                            {isLogin ? 'Login' : 'Register'}
                        </button>
                    </form>
                    <footer className={styles.footer}>
                        <span>Shopping Consultant 2025</span>
                    </footer>
                </div>

                <div className={styles.right}>
                    <h2>Welcome to the<br />Shopping Consultant</h2>
                    <p>
                        Your personalized guide to finding the perfect laptop based on your
                        needs, preferences, and budget. Please log in or sign up to
                        continue.
                    </p>
                </div>
            </section>
        </main>
    );
}
