import React, { useState } from 'react';
import { API_URL } from '../utils/api';

const Auth = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP + New Pass
  const [showOTP, setShowOTP] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        if (!isLogin) {
          setShowOTP(true);
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data));
          setToken(data.token);
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setResetStep(2);
        setSuccess('OTP sent to your email!');
      } else {
        setError(data.message || 'Error sending OTP');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Password reset successful! You can login now.');
        setIsForgot(false);
        setResetStep(1);
        setIsLogin(true);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setToken(data.token);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0b]">
      <div className="card w-full max-w-md p-8 animate-in slide-in-from-bottom-10 duration-500 shadow-2xl border-white/5">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic">
            Tracker
          </h2>
          <h3 className="text-xl font-bold text-gray-100 mt-4">
            {isForgot ? (resetStep === 1 ? 'Reset Password' : 'Verify & Reset') : (showOTP ? 'Verify Email' : (isLogin ? 'Welcome Back' : 'Create Account'))}
          </h3>
          <p className="text-gray-400 mt-2 text-sm">
            {isForgot ? (resetStep === 1 ? 'Enter your email to receive OTP' : `Enter OTP sent to ${email}`) : (showOTP ? `We sent a code to ${email}` : (isLogin ? 'Login to continue tracking your progress.' : 'Start your productivity journey today.'))}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center mb-6 animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-sm text-center mb-6">
            {success}
          </div>
        )}

        {isForgot ? (
          <form onSubmit={resetStep === 1 ? handleForgotPassword : handleResetPassword} className="space-y-4">
            {resetStep === 1 ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email (Resetting for)</label>
                  <input 
                    type="email" 
                    readOnly
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed mb-4"
                    value={email}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">6-Digit OTP</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-black tracking-widest focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 mt-6 text-sm font-bold tracking-widest uppercase shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Processing...' : (resetStep === 1 ? 'Send OTP' : 'Reset Password')}
            </button>
            <button 
              type="button"
              onClick={() => { setIsForgot(false); setResetStep(1); setError(''); setSuccess(''); }}
              className="w-full text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-gray-300 transition-colors mt-4"
            >
              Back to Login
            </button>
          </form>
        ) : !showOTP ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => { setIsForgot(true); setError(''); setSuccess(''); }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 mt-6 text-sm font-bold tracking-widest uppercase shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-center">Enter 6-Digit Code</label>
              <input 
                type="text" 
                maxLength="6"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Verifying...' : 'Verify & Finish'}
            </button>
            <button 
              type="button"
              onClick={() => setShowOTP(false)}
              className="w-full text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-gray-300 transition-colors"
            >
              Back to Sign Up
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); setShowOTP(false); setIsForgot(false); }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
            >
              {isLogin ? 'Create One' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
