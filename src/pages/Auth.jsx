import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building2, Store, Loader2, AlertCircle } from 'lucide-react';

const Auth = () => {
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'shop' // default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      if (user.role === 'shop') {
        navigate('/shop');
      } else {
        navigate('/dropshipper');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleVal) => {
    setFormData(prev => ({ ...prev, role: roleVal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const loggedUser = await login(formData.email, formData.password);
        if (loggedUser.role === 'shop') {
          navigate('/shop');
        } else {
          navigate('/dropshipper');
        }
      } else {
        const registeredUser = await signup(
          formData.name,
          formData.email,
          formData.password,
          formData.role
        );
        if (registeredUser.role === 'shop') {
          navigate('/shop');
        } else {
          navigate('/dropshipper');
        }
      }
    } catch (err) {
      console.error('Auth action error:', err);
      setError(err.message || 'Authentication failed. Please verify details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs for premium depth */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 mb-3 pulse-glow">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans text-center">
            DropMatch
          </h1>
          <p className="text-slate-400 text-sm text-center mt-1">
            Purely discovery + AI-powered taxonomy. No fees, no carts.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 rounded-lg bg-slate-900/60 p-1 border border-slate-800/80 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`rounded-md py-2 text-sm font-semibold tracking-wide transition-all cursor-pointer ${
              isLogin 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`rounded-md py-2 text-sm font-semibold tracking-wide transition-all cursor-pointer ${
              !isLogin 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-2xl p-8 border border-slate-800/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-600 px-4 py-3 text-sm transition-all outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-600 px-4 py-3 text-sm transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-600 px-4 py-3 text-sm transition-all outline-none"
              />
            </div>

            {/* Custom Role Selector Cards on Signup */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Choose Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => handleRoleSelect('shop')}
                    className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col items-center text-center ${
                      formData.role === 'shop'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white shadow'
                        : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <Store className={`h-6 w-6 mb-2 ${formData.role === 'shop' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold block mb-1">Shop</span>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      I have products to offload or source.
                    </span>
                  </div>

                  <div
                    onClick={() => handleRoleSelect('dropshipper')}
                    className={`rounded-xl border p-4 cursor-pointer transition-all flex flex-col items-center text-center ${
                      formData.role === 'dropshipper'
                        ? 'border-sky-500 bg-sky-500/10 text-white shadow'
                        : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <Building2 className={`h-6 w-6 mb-2 ${formData.role === 'dropshipper' ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold block mb-1">Dropshipper</span>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      I want to find products to sell.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-3.5 text-sm font-semibold transition-all shadow-md shadow-indigo-950/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Authenticating...' : 'Registering Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
