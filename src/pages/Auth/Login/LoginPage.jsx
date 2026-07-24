import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Compass, Shield, User, LockKeyhole, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { ROUTES } from '../../../config/routes';
import logoPrimaryWhite from '../../../assets/images/logos/Signature _ Primary Logo _ White .png';
import logoPurple from '../../../assets/images/logos/Secondary Logo _ Logotype _ Purple.png';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, loginError } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(username, password);
      if (user.role === 'admin') {
        showToast(`Welcome, ${user.name}! Admin panel loaded.`);
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        showToast(`Welcome back, ${user.name}!`);
        navigate(ROUTES.STUDENT_DASHBOARD);
      }
    } catch (err) {
      // loginError set by context
    }
  };

  const handleForgotPin = (e) => {
    e.preventDefault();
    showToast('Please contact your NGO Center Mentor/Teacher to reset your login pin.');
  };

  return (
    <div className="login-screen fade-in">
      <div className="login-card">
        {/* Left Hero Panel */}
        <div className="login-left" style={{ backgroundColor: 'var(--color-primary-purple)' }}>
          <div className="brand-wrapper">
            <img
              src={logoPrimaryWhite}
              alt="Antarang Foundation Logo"
              style={{ height: '54px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div className="login-hero-content">
            <h2>Unlock Your Potential, Guide Your Future.</h2>
            <p>
              Antarang helps students discover their strengths, interests, and professional avenues through expert psychometric feedback.
            </p>
            <div className="login-features">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <BrainCircuit size={20} />
                </div>
                <span>Psychometric Aptitude Profiler</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Compass size={20} />
                </div>
                <span>RIASEC Interest Code Mapping</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Shield size={20} />
                </div>
                <span>Admin Test Configuration Panel</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '24px' }}>
            © 2026 Antarang Foundation. Supporting youth dreams across India.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-right">
          <div style={{ marginBottom: '24px' }}>
            <img
              src={logoPurple}
              alt="Antarang Foundation"
              style={{ height: '32px', width: 'auto', marginBottom: '16px' }}
            />
            <h2 className="login-form-title" style={{ color: 'var(--color-dark-text)' }}>Sign In</h2>
            <p className="login-form-subtitle" style={{ color: 'var(--color-text-muted)' }}>
              Enter your credentials to access the platform.
            </p>
          </div>

          {loginError && (
            <div style={{
              display: 'flex',
              gap: '8px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: 'var(--color-error)',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '13px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={18} /></span>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. amit.kumar or admin"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password / PIN</label>
              <div className="input-wrapper">
                <span className="input-icon"><LockKeyhole size={18} /></span>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Keep me logged in</span>
              </label>
              <a href="#forgot" className="forgot-link" onClick={handleForgotPin} style={{ color: 'var(--color-primary-purple)' }}>
                Forgot PIN?
              </a>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '8px' }}>
              {isLoading ? 'Verifying...' : 'Sign In'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="demo-credentials" style={{ marginTop: '24px', background: 'var(--color-bg-light)', padding: '16px', borderRadius: '12px', fontSize: '13px' }}>
            <div>👋 <strong>Demo Accounts</strong></div>
            <div style={{ marginTop: '8px' }}>
              <strong style={{ color: 'var(--color-primary-green)' }}>Students:</strong><br />
              <span className="demo-credentials-pill">amit.kumar</span> · <span className="demo-credentials-pill">sneha.sharma</span><br />
              Password: <span className="demo-credentials-pill">student123</span>
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--color-border-light)' }}>
                <strong style={{ color: 'var(--color-primary-purple)' }}>Administrator:</strong><br />
                <span className="demo-credentials-pill">admin</span> · Password: <span className="demo-credentials-pill">admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
