import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/authService';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
            onClose();
        } catch (err: any) {
            let message = 'An unknown error occurred.';
            if (err.code) {
                switch(err.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        message = 'Invalid email or password.';
                        break;
                    case 'auth/email-already-in-use':
                        message = 'This email address is already in use.';
                        break;
                    case 'auth/weak-password':
                        message = 'Password should be at least 6 characters.';
                        break;
                    default:
                        message = 'Failed to authenticate. Please try again.';
                }
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            onClose();
        } catch (err: any) {
             setError(err.message || 'An error occurred with Google Sign-In.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? 'Login' : 'Sign Up'}>
            <div className="space-y-4">
                <Button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2" variant="secondary">
                     <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                    {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                </Button>
                <div className="flex items-center text-center">
                    <hr className="flex-grow border-gray-300"/>
                    <span className="px-2 text-sm text-gray-500">OR</span>
                    <hr className="flex-grow border-gray-300"/>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                    </Button>
                </form>
                <p className="text-center text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary-600 hover:underline ml-1 font-semibold">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </Modal>
    );
};

export default AuthModal;