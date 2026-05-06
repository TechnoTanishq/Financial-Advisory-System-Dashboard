
import React, { useState } from 'react';
import {
  Lock,
  ArrowRight,
  Shield,
  TrendingUp,
  DollarSign,
  Smartphone,
  Eye,
  EyeOff,
  User
} from 'lucide-react';

export default function FinancialLoginPage() {
  const [isSignup, setIsSignup] = useState(false);

  const [upiId, setUpiId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [mobile, setMobile] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8083/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId, password }),
      });

      if (!response.ok) throw new Error('Invalid credentials');

      const data = await response.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8083/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upiId,
          name,
          password,
          pin,
          mobile,
          deviceId: "windows"   // ✅ default device
        }),
      });

      if (!response.ok) throw new Error('Signup failed');

      alert("Account created successfully! Please login.");
      setIsSignup(false);
    } catch (error) {
      alert(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background Glow Elements (UNCHANGED) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* LEFT SIDE BRANDING (UNCHANGED) */}
        <div className="text-white space-y-8 hidden lg:block">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <DollarSign size={28} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                FinAdvisor.io
              </h1>
            </div>

            <h2 className="text-5xl font-bold leading-tight">
              Smart Financial
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Advisory System
              </span>
            </h2>

            <p className="text-xl text-blue-200">
              Track, analyze, and optimize your finances with AI-powered insights
            </p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-xl">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-slate-800 mb-2">
              {isSignup ? "Create Account" : "Welcome Back!"}
            </h3>
            <p className="text-slate-500">
              {isSignup
                ? "Sign up to access smart financial insights"
                : "Sign in to access your financial dashboard"}
            </p>
          </div>

          <form
            onSubmit={isSignup ? handleSignup : handleLogin}
            className="space-y-6"
          >

            {/* Name (Signup Only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-4 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* UPI */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                UPI ID
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <Smartphone size={20} />
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Mobile (Signup Only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mobile
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full py-4 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* PIN (Signup Only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  4-digit PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full py-4 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-8 text-center">
            {isSignup ? (
              <p className="text-slate-600">
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignup(false)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-slate-600">
                Don't have an account?{" "}
                <button
                  onClick={() => setIsSignup(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign up for free
                </button>
              </p>
            )}
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Shield size={16} className="text-green-600" />
            Secured with 256-bit SSL encryption
          </div>
        </div>
      </div>
    </div>
  );
}
