import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { Avatar } from '../../common/Avatar/Avatar';
import logoPurple from '../../../assets/images/logos/Secondary Logo _ Logotype _ Purple.png';
import logoWhite from '../../../assets/images/logos/Secondary Logo _ Logotype _ White .png';

export const Header = ({ activeTab, onSelectTab }) => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.');
  };

  return (
    <nav className={`dashboard-nav${isAdmin ? ' admin-nav' : ''}`}>
      <div className="nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={isAdmin ? logoWhite : logoPurple}
            alt="Antarang Foundation Logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
          {isAdmin && (
            <span
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: 'rgba(255,255,255,0.15)',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              Admin Panel
            </span>
          )}
        </div>

        <div className="nav-right">
          {isAdmin && onSelectTab && (
            <div className="admin-tab-nav">
              <button
                className={`admin-tab-btn${activeTab === 'overview' ? ' active' : ''}`}
                onClick={() => onSelectTab('overview')}
              >
                Overview
              </button>
              <button
                className={`admin-tab-btn${activeTab === 'tests' ? ' active' : ''}`}
                onClick={() => onSelectTab('tests')}
              >
                Tests
              </button>
              <button
                className={`admin-tab-btn${activeTab === 'students' ? ' active' : ''}`}
                onClick={() => onSelectTab('students')}
              >
                Students
              </button>
            </div>
          )}

          <div className="user-profile-summary">
            <Avatar name={currentUser.name} isAdmin={isAdmin} size="sm" />
            <div className="user-details-text">
              <div className="user-name" style={{ color: isAdmin ? 'white' : 'var(--color-dark-text)' }}>
                {currentUser.name}
              </div>
              <div className="user-role" style={{ color: isAdmin ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                {isAdmin ? '🛡 Administrator' : currentUser.branch}
              </div>
            </div>
          </div>

          <button
            className="btn-logout"
            style={isAdmin ? { borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' } : {}}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
