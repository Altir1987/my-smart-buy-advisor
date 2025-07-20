export function validateRegistration(name, email, password, confirmPassword) {
    if (!name.trim()) return 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
}