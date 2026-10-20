import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import { 
  Activity, Bell, User, Shield, LogOut, Menu, 
  Sun, Moon, Check, ChevronDown 
} from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem('fittrack_theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fittrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (currentUser) {
      notificationService.get()
        .then(data => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [currentUser]);

  // Click outside to close menus
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          className="btn-icon menu-toggle-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="brand-container">
          <div className="brand-icon-wrapper">
            <Activity size={22} />
          </div>
          <span>FITTRACK</span>
        </Link>
      </div>

      <div className="navbar-right">
        {/* Theme Switcher */}
        <button 
          className="btn-icon" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="notif-wrapper" ref={notifRef}>
          <button 
            className="btn-icon" 
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <strong>Notifications</strong>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead} 
                    className="text-muted" 
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications yet
                  </p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{n.title}</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</p>
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        {currentUser && (
          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button 
              className="user-profile-btn" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                  currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'FT'
                )}
              </div>
              <div className="user-info-text">
                <div className="user-name">{currentUser.name}</div>
                <div className="user-role">{currentUser.role}</div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown-menu">
                <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <User size={16} /> My Profile
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <Shield size={16} /> Admin Panel
                  </Link>
                )}

                <div className="dropdown-divider"></div>

                <button 
                  className="dropdown-item" 
                  onClick={handleLogout}
                  style={{ color: 'var(--accent-rose)', width: '100%', textAlign: 'left' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
