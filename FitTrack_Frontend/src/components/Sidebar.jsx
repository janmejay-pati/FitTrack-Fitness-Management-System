import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Dumbbell, Utensils, Activity, 
  Droplets, Target, Award, Salad, Flame, 
  PlaySquare, User, ShieldCheck, ChevronLeft, ChevronRight 
} from 'lucide-react';
import '../styles/sidebar.css';

export default function Sidebar({ isOpen, isCollapsed, onToggleCollapse, onCloseMobile }) {
  const { isAdmin } = useAuth();

  const links = [
    { category: 'Main' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workouts', label: 'Workouts', icon: Dumbbell },
    { to: '/meals', label: 'Meals & Nutrition', icon: Utensils },
    { to: '/bmi', label: 'BMI Tracker', icon: Activity },
    { to: '/water', label: 'Water Tracker', icon: Droplets },
    { to: '/goals', label: 'Daily Goals', icon: Target },

    { category: 'Guidance & Progress' },
    { to: '/achievements', label: 'Achievements', icon: Award },
    { to: '/diet-plans', label: 'Diet Plans', icon: Salad },
    { to: '/workout-plans', label: 'Workout Plans', icon: Flame },
    { to: '/tutorials', label: 'Video Tutorials', icon: PlaySquare },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  if (isAdmin) {
    links.push(
      { category: 'System Administration' },
      { to: '/admin', label: 'Admin Portal', icon: ShieldCheck }
    );
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
        <nav className="sidebar-nav">
          {links.map((item, index) => {
            if (item.category) {
              if (isCollapsed) return null;
              return (
                <div key={index} className="sidebar-category-label">
                  {item.category}
                </div>
              );
            }

            const IconComponent = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="nav-link-icon">
                  <IconComponent size={20} />
                </div>
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="sidebar-collapse-btn" 
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> <span>Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
