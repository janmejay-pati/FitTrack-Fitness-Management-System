import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, Ruler, Weight, Shield, 
  Camera, Lock, Save, KeyRound, CheckCircle2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import authService from '../services/authService';

export default function ProfilePage() {
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    avatar: ''
  });

  // Password Form State
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
      const d = res?.data || res;
      if (d) {
        setProfile({
          name: d.name || '',
          email: d.email || '',
          age: d.age || '',
          gender: d.gender || 'Male',
          height: d.height || '',
          weight: d.weight || '',
          avatar: d.avatar || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await userService.updateProfile({
        name: profile.name,
        age: profile.age ? parseInt(profile.age, 10) : null,
        gender: profile.gender,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null
      });

      toast.success('Profile updated successfully');
      if (setAuthUser && authUser) {
        setAuthUser(prev => ({ ...prev, name: profile.name }));
      }
    } catch (err) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const toastId = toast.loading('Uploading avatar...');
    try {
      const res = await userService.uploadImage(formData);
      const imgUrl = res?.imageUrl || res?.data?.imageUrl || (typeof res === 'string' ? res : '');
      if (imgUrl) {
        setProfile(prev => ({ ...prev, avatar: imgUrl }));
        if (setAuthUser && authUser) {
          setAuthUser(prev => ({ ...prev, avatar: imgUrl }));
        }
        toast.success('Avatar updated successfully', { id: toastId });
      } else {
        toast.success('Avatar uploaded successfully', { id: toastId });
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo', { id: toastId });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword) {
      toast.error('Please enter all password fields');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword(passwords.oldPassword, passwords.newPassword);
      toast.success('Password updated successfully');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Quick biometrics calculations
  const heightM = profile.height ? parseFloat(profile.height) / 100 : 0;
  const weightKg = profile.weight ? parseFloat(profile.weight) : 0;
  const quickBmi = (heightM > 0 && weightKg > 0) ? (weightKg / (heightM * heightM)).toFixed(1) : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1><User style={{ color: 'var(--accent)' }} /> Account & Biometrics</h1>
          <p className="page-subtitle">Manage personal information, physiological vitals, and security credentials</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your profile data...</p>
        </div>
      ) : (
        <div className="content-grid-2" style={{ alignItems: 'start' }}>
          {/* Left Column: Avatar & Vitals Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Avatar Card */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}
            >
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.25rem' }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: profile.avatar ? `url(${profile.avatar}) center / cover no-repeat` : 'var(--accent-glow)',
                  border: '3px solid var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '0 0 25px var(--accent-glow)',
                  overflow: 'hidden'
                }}>
                  {!profile.avatar && (profile.name ? profile.name.charAt(0).toUpperCase() : 'U')}
                </div>

                {/* Upload Button overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload avatar"
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--surface-elevated)',
                    border: '2px solid var(--accent)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                />
              </div>

              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{profile.name || 'FitTrack Athlete'}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{profile.email}</p>
              <span className="badge badge-success">Active Member</span>
            </motion.div>

            {/* Quick Metabolic Vitals Card */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} style={{ color: 'var(--accent)' }} /> Metabolic Index
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Computed BMI</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {quickBmi || '--'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {quickBmi ? (quickBmi < 18.5 ? 'Underweight' : quickBmi < 25 ? 'Normal' : quickBmi < 30 ? 'Overweight' : 'Obese') : 'Add metrics'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Estimated BMR</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                    {weightKg && heightM && profile.age ? Math.round(10 * weightKg + 6.25 * (heightM * 100) - 5 * parseInt(profile.age, 10) + 5) : '--'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>kcal / baseline day</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Edit Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Personal Details Form */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Personal & Biometric Profile</h3>

              <form onSubmit={handleProfileSubmit}>
                <div className="content-grid-2" style={{ gap: '1rem', marginBottom: '0' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Read-only)</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      disabled
                      style={{ opacity: 0.65, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div className="content-grid-2" style={{ gap: '1rem', marginBottom: '0' }}>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 26"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      min="10"
                      max="120"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="content-grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 178"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 74.5"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingProfile}
                  style={{ width: '100%' }}
                >
                  <Save size={18} /> {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </form>
            </motion.div>

            {/* Change Password Card */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={18} style={{ color: 'var(--accent)' }} /> Security & Password
              </h3>

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter existing password"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="content-grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="At least 6 characters"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Confirm new password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={changingPassword}
                  style={{ width: '100%', borderColor: 'var(--border-focus)' }}
                >
                  <Lock size={16} /> {changingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
