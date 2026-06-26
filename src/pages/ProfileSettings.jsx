import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Shield, Check, Loader2, AlertCircle, Save } from 'lucide-react';

const ProfileSettings = () => {
  const { user, setUser, token } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validations if password change is attempted
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setError('Please enter your current password to authorize password change.');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }
    }

    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile settings');
      }

      // Update local React auth context
      setUser(data.user);
      setSuccess('Profile credentials updated successfully!');
      
      // Reset password input fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving profile changes');
    } finally {
      setSaving(false);
    }
  };

  // Determine back path based on role
  const backPath = user.role === 'shop' ? '/shop' : '/dropshipper';

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Instructions & Help */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-1.5 flex inline-flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 mb-2">
            <User className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Account Settings
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Update your account identity details here. Changing your email address updates your login username immediately.
          </p>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 text-xs text-slate-500 dark:text-slate-400">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Tips</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Use a unique, high-entropy password</li>
              <li>Keep your email address updated to ensure secure password recoveries</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Account Credentials Edit Card */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0c0d10]/95 p-6 sm:p-8 shadow-xl">
            
            {/* Form Title */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Security & Credentials
            </h3>

            {/* Error/Success Alerts */}
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-2.5 mb-6">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-2.5 mb-6">
                <Check className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="border-t border-slate-200 dark:border-slate-800/80 pt-5 space-y-5">
                <h4 className="text-sm font-semibold text-slate-850 dark:text-slate-200 mb-1">Change Password</h4>
                
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Account Role Badge (Locked) */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Account Role
                </span>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  <span>Registered as:</span>
                  <span className="font-bold text-slate-800 dark:text-white capitalize">{user.role}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-600 font-medium ml-auto">(Locked)</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-3 text-sm font-semibold transition-all shadow-md shadow-indigo-950/20 cursor-pointer mt-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving credentials...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Credentials
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfileSettings;
