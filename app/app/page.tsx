'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Spline from '@splinetool/react-spline';
import GoogleIcon from '@/svgs/GoogleIcon';
import { syncUserProfile } from '@/lib/firestore';
import { useRouter } from 'next/navigation';

export default function AuthPage() {

  const router = useRouter()

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation: Password Match Check
    if (!isSignIn && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    
    try {
      if (isSignIn) {
        const authResponse = await signInWithEmailAndPassword(auth, email, password);
        console.log('Signed in successfully:', authResponse);
      } else {
        const authResponse = await createUserWithEmailAndPassword(auth, email, password);
        await syncUserProfile(authResponse.user);
        console.log('Registered successfully:', authResponse);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error(`${isSignIn ? 'Sign in' : 'Sign up'} error:`, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const authResponse = await signInWithPopup(auth, provider);
      if (authResponse) {
        await syncUserProfile(authResponse.user);
        router.replace("/chat")
      }
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
      console.error("Google sign in error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch flow wrapper to clear fields and states smoothly
  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(null);
  };

  if (user) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <p className="text-base font-normal text-zinc-400 mb-6">
            Welcome back, <span className="text-white font-medium block text-lg mt-1 break-all">{user.email || user.displayName}</span>
          </p>
          <button
            onClick={() => signOut(auth)}
            className="w-full bg-white text-black hover:bg-zinc-200 active:scale-[0.98] transition-all py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-white/5"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-x-hidden select-none">
      {/* Header / Navbar */}
      <header className="w-full h-20 flex items-center justify-between px-6 md:px-12 border-b border-zinc-900/50 z-20">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="logo" className="w-10 h-10 rounded-full bg-white object-cover" />
          <span className="text-white font-bold text-xl tracking-tight">Chatter!</span>
        </div>
        <button className="text-zinc-300 hover:text-white font-medium px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-xs tracking-wide transition-all active:scale-95">
          Join the Waitlist
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex relative">
        {/* Left Side: Interactive Spline Scene */}
        <div className="hidden lg:block lg:w-1/2 h-[calc(100vh-80px)] relative bg-zinc-950/20">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent to-black pointer-events-none w-full " />
          <Spline scene="https://prod.spline.design/y1lupsuFq8kPd6vh/scene.splinecode" />
        </div>

        {/* Right Side: Authentication Form Wrapper */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 z-10">
          <div className="w-full max-w-md bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 relative">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent pointer-events-none" />

            {/* Context Heading */}
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                {isSignIn ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-sm text-zinc-400">
                {isSignIn ? 'Enter your details to connect with friends' : 'Connect with friends via a new account today'}
              </p>
            </div>

            {/* Error Message Alert Banner */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl transition-all">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 tracking-wider uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  className="w-full bg-zinc-950/50 text-white placeholder-zinc-600 border border-zinc-800/80 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 rounded-xl px-4 py-3 text-sm transition-all outline-none disabled:opacity-50"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 tracking-wider uppercase">Password</label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-600 border border-zinc-800/80 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 rounded-xl pl-4 pr-11 py-3 text-sm transition-all outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Only shows on Sign Up) */}
              {!isSignIn && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-[11px] font-medium text-zinc-500 tracking-wider uppercase">Confirm Password</label>
                  <div className="relative w-full">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className="w-full bg-zinc-950/50 text-white placeholder-zinc-600 border border-zinc-800/80 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 rounded-xl pl-4 pr-11 py-3 text-sm transition-all outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-white hover:bg-zinc-200 text-black rounded-xl py-3 font-semibold text-sm transition-all active:scale-[0.99] shadow-sm disabled:opacity-50 flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  isSignIn ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>

            {/* Elegant Text Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-zinc-800/60"></div>
              <span className="flex-shrink mx-4 text-zinc-500 text-[11px] tracking-widest uppercase">Or continue with</span>
              <div className="flex-grow border-t border-zinc-800/60"></div>
            </div>

            {/* OAuth Provider Action Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-200 border border-zinc-800/80 rounded-xl py-3 px-4 font-medium text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 border"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Google</span>
            </button>

            <p className="text-center text-xs text-zinc-500 mt-2">
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-zinc-300 underline underline-offset-4 font-medium hover:text-white transition-colors"
              >
                {isSignIn ? 'Sign up' : 'Sign in'}
              </button>
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}