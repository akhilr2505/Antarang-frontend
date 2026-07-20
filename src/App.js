import React, { useState, useEffect } from 'react';
import {
  BrainCircuit, Compass, Award, ArrowRight, ArrowLeft, BookOpen, Calendar, LogOut, Lock,
  CheckCircle2, User, LockKeyhole, MapPin, AlertCircle, Printer, Briefcase, UserCheck,
  Hourglass, TrendingUp, GraduationCap, Shield, Settings, PlusCircle, Pencil, Trash2,
  Users, FileText, X, Save, ChevronRight, LayoutDashboard, ClipboardList, ToggleLeft,
  ToggleRight, HelpCircle, ListOrdered, Info
} from 'lucide-react';
import { assessmentsData, careerDatabase, fallbackCareers } from './data/assessments';
import './App.css';

const MOCK_STUDENTS = [
  { username: 'amit.kumar', password: 'student123', name: 'Amit Kumar', branch: 'Antarang Center - Dharavi, Mumbai', id: 'ANT-2026-089A', role: 'student', completedTests: ['values'], testScores: { values: { Independence: 80, Achievement: 90, Relationships: 70 } } },
  { username: 'sneha.sharma', password: 'student123', name: 'Sneha Sharma', branch: 'Antarang Center - Shivaji Nagar, Pune', id: 'ANT-2026-112B', role: 'student', completedTests: ['values'], testScores: { values: { Support: 90, Relationships: 85, WorkingConditions: 70 } } }
];

const MOCK_ADMINS = [
  { username: 'admin', password: 'admin123', name: 'Admin User', branch: 'Antarang HQ - Mumbai', id: 'ADM-2026-001', role: 'admin' }
];

const deepClone = (d) => JSON.parse(JSON.stringify(d));
const genId = () => 'q_' + Math.random().toString(36).substr(2, 9);
const LETTERS = ['A','B','C','D','E','F'];

function App() {
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  const [currentUser, setCurrentUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [studentAssessments, setStudentAssessments] = useState(assessmentsData);
  const [riasecScores, setRiasecScores] = useState({ R: 45, I: 50, A: 40, S: 60, E: 55, C: 50 });
  const [adminTests, setAdminTests] = useState(() => deepClone(assessmentsData));
  const [adminActiveTab, setAdminActiveTab] = useState('overview');
  const [editingTestDraft, setEditingTestDraft] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) { const t = setTimeout(() => setToastMessage(null), 4000); return () => clearTimeout(t); }
  }, [toastMessage]);
  const showToast = (m) => setToastMessage(m);

  const handleLogin = (e) => {
    e.preventDefault(); setLoginError(''); setIsLoading(true);
    setTimeout(() => {
      const uname = loginUsername.trim().toLowerCase();
      const admin = MOCK_ADMINS.find(a => a.username === uname && a.password === loginPassword);
      if (admin) { setCurrentUser(admin); setCurrentScreen('ADMIN_DASHBOARD'); setAdminActiveTab('overview'); showToast('Welcome, ' + admin.name + '! Admin panel loaded.'); setIsLoading(false); return; }
      const user = MOCK_STUDENTS.find(s => s.username === uname && s.password === loginPassword);
      if (user) {
        setCurrentUser(user); setCurrentScreen('DASHBOARD'); showToast('Welcome back, ' + user.name + '!');
        setStudentAssessments(assessmentsData.map(t => user.completedTests.includes(t.id) ? { ...t, status: 'completed' } : t));
      } else { setLoginError('Invalid Username or Password. Try the demo credentials below.'); }
      setIsLoading(false);
    }, 850);
  };

  const handleLogout = () => {
    setCurrentUser(null); setCurrentScreen('LOGIN'); setActiveAssessment(null); setSelectedAnswers({});
    setEditingTestDraft(null); setShowQuestionModal(false); showToast('Logged out successfully.');
  };

  const startAssessment = (assessment) => { setActiveAssessment(assessment); setCurrentQuestionIndex(0); setSelectedAnswers({}); setCurrentScreen('TEST_TAKER'); showToast('Started ' + assessment.title); };
  const handleSelectOption = (qId, letter) => setSelectedAnswers({ ...selectedAnswers, [qId]: letter });
  const handleNextQuestion = () => { if (currentQuestionIndex < activeAssessment.questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1); };
  const handlePrevQuestion = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1); };

  const finishAssessment = () => {
    if (Object.keys(selectedAnswers).length < activeAssessment.questions.length) { showToast('Please answer all questions before submitting.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      if (activeAssessment.type === 'personality') {
        const s = { R: 25, I: 25, A: 25, S: 25, E: 25, C: 25 };
        activeAssessment.questions.forEach(q => { const o = q.options.find(op => op.letter === selectedAnswers[q.id]); if (o && o.category) s[o.category] += 12; });
        setRiasecScores(s);
      } else if (activeAssessment.type === 'aptitude') {
        let sc = 0; activeAssessment.questions.forEach(q => { if (selectedAnswers[q.id] === q.correctAnswer) sc += 20; });
        setRiasecScores(p => ({ ...p, I: Math.min(p.I + sc / 4, 95), C: Math.min(p.C + sc / 4, 95) }));
      }
      setStudentAssessments(studentAssessments.map(t => t.id === activeAssessment.id ? { ...t, status: 'completed' } : t));
      if (currentUser) currentUser.completedTests.push(activeAssessment.id);
      setIsLoading(false); setCurrentScreen('RESULTS_VIEW'); showToast('Congratulations! You completed ' + activeAssessment.title); setActiveAssessment(null);
    }, 1000);
  };

  const getTopHollandCode = () => Object.keys(riasecScores).sort((a, b) => riasecScores[b] - riasecScores[a]).slice(0, 3).join('');
  const getCompletedCount = () => studentAssessments.filter(t => t.status === 'completed').length;
  const getMatchingCareers = () => { const code = getTopHollandCode(); const m = careerDatabase.find(c => [...c.code].filter(ch => code.includes(ch)).length >= 2); return m ? m.careers : fallbackCareers; };

  // --- ADMIN HANDLERS ---
  const adminCreateNewTest = () => {
    const t = { id: genId(), title: 'New Assessment', duration: '10 mins', questionsCount: 0, type: 'aptitude', difficulty: 'Medium', status: 'pending', description: 'Enter a description for this assessment.', accentClass: 'primary-accent', iconName: 'BrainCircuit', questions: [] };
    setAdminTests(prev => [...prev, t]); setEditingTestDraft(deepClone(t)); setCurrentScreen('ADMIN_TEST_EDITOR'); showToast('New test created.');
  };
  const adminOpenTestEditor = (test) => { setEditingTestDraft(deepClone(test)); setCurrentScreen('ADMIN_TEST_EDITOR'); };
  const adminSaveTest = () => {
    const updated = { ...editingTestDraft, questionsCount: editingTestDraft.questions.length };
    setAdminTests(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditingTestDraft(updated); showToast('"' + updated.title + '" saved successfully.');
  };
  const adminDeleteTest = (id) => { if (window.confirm('Delete this test permanently?')) { setAdminTests(prev => prev.filter(t => t.id !== id)); showToast('Test deleted.'); } };
  const adminToggleStatus = (id) => setAdminTests(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'locked' : 'pending' } : t));
  const updateDraftField = (f, v) => setEditingTestDraft(p => ({ ...p, [f]: v }));

  const adminOpenQuestionEditor = (q, idx) => {
    setEditingQuestion(q ? deepClone(q) : { id: genId(), question: '', explanation: '', correctAnswer: 'A', options: [{ letter: 'A', text: '', weight: 0, category: '' }, { letter: 'B', text: '', weight: 0, category: '' }, { letter: 'C', text: '', weight: 0, category: '' }, { letter: 'D', text: '', weight: 0, category: '' }] });
    setEditingQuestionIdx(idx); setShowQuestionModal(true);
  };
  const adminSaveQuestion = () => {
    if (!editingQuestion.question.trim()) { showToast('Question text cannot be empty.'); return; }
    setEditingTestDraft(p => { const qs = [...p.questions]; if (editingQuestionIdx === null || editingQuestionIdx === undefined) qs.push(editingQuestion); else qs[editingQuestionIdx] = editingQuestion; return { ...p, questions: qs }; });
    setShowQuestionModal(false); showToast('Question saved. Click "Save Test" to persist.');
  };
  const adminDeleteQuestion = (idx) => { if (window.confirm('Delete this question?')) { setEditingTestDraft(p => ({ ...p, questions: p.questions.filter((_, i) => i !== idx) })); showToast('Question deleted.'); } };
  const updateQField = (f, v) => setEditingQuestion(p => ({ ...p, [f]: v }));
  const updateOptField = (i, f, v) => setEditingQuestion(p => { const opts = [...p.options]; opts[i] = { ...opts[i], [f]: f === 'weight' ? Number(v) : v }; return { ...p, options: opts }; });
  const addOption = () => { if (editingQuestion.options.length >= 6) { showToast('Maximum 6 options.'); return; } const l = LETTERS[editingQuestion.options.length]; setEditingQuestion(p => ({ ...p, options: [...p.options, { letter: l, text: '', weight: 0, category: '' }] })); };
  const removeOption = (i) => { if (editingQuestion.options.length <= 2) { showToast('Minimum 2 options required.'); return; } setEditingQuestion(p => { const opts = p.options.filter((_, idx) => idx !== i).map((o, idx) => ({ ...o, letter: LETTERS[idx] })); return { ...p, options: opts }; }); };

  const totalAdminQ = adminTests.reduce((s, t) => s + t.questions.length, 0);

  return (
    <div className="app-container">
      <div className="bg-decor bg-decor-1"></div>
      <div className="bg-decor bg-decor-2"></div>

      {toastMessage && (<div className="toast-alert success-toast fade-in"><CheckCircle2 size={18} color="var(--success)" /><span>{toastMessage}</span></div>)}

      {/* LOGIN */}
      {currentScreen === 'LOGIN' && (
        <div className="login-screen fade-in">
          <div className="login-card">
            <div className="login-left">
              <div className="brand-wrapper">
                <div className="brand-logo-circle">A</div>
                <div><h3 className="brand-text">Antarang</h3><div className="brand-tagline">Aspire, Act, Achieve</div></div>
              </div>
              <div className="login-hero-content">
                <h2>Unlock Your Potential, Guide Your Future.</h2>
                <p>Antarang helps students discover their strengths, interests, and professional avenues through expert psychometric feedback.</p>
                <div className="login-features">
                  <div className="feature-item"><div className="feature-icon-wrapper"><BrainCircuit size={20} /></div><span>Psychometric Aptitude Profiler</span></div>
                  <div className="feature-item"><div className="feature-icon-wrapper"><Compass size={20} /></div><span>RIASEC Interest Code Mapping</span></div>
                  <div className="feature-item"><div className="feature-icon-wrapper"><Shield size={20} /></div><span>Admin Test Configuration Panel</span></div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '20px' }}>© 2026 Antarang Foundation. Supporting youth dreams across India.</div>
            </div>
            <div className="login-right">
              <h2 className="login-form-title">Sign In</h2>
              <p className="login-form-subtitle">Enter your credentials to access the platform.</p>
              {loginError && (<div style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fee2e2', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px' }}><AlertCircle size={18} style={{ flexShrink: 0 }} /><span>{loginError}</span></div>)}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username</label>
                  <div className="input-wrapper"><span className="input-icon"><User size={18} /></span><input type="text" id="username" className="form-input" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="e.g. amit.kumar or admin" required /></div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password / PIN</label>
                  <div className="input-wrapper"><span className="input-icon"><LockKeyhole size={18} /></span><input type="password" id="password" className="form-input" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required /></div>
                </div>
                <div className="form-options">
                  <label className="checkbox-label"><input type="checkbox" defaultChecked /><span>Keep me logged in</span></label>
                  <a href="#forgot" className="forgot-link" onClick={e => { e.preventDefault(); showToast('Please contact your NGO Center Mentor/Teacher to reset your login pin.'); }}>Forgot PIN?</a>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Sign In'}{!isLoading && <ArrowRight size={18} />}</button>
              </form>
              <div className="demo-credentials">
                <div>👋 <strong>Demo Accounts</strong></div>
                <div style={{ marginTop: '8px' }}>
                  <strong style={{ color: 'var(--primary)' }}>Students:</strong><br />
                  <span className="demo-credentials-pill">amit.kumar</span> · <span className="demo-credentials-pill">sneha.sharma</span><br />
                  Password: <span className="demo-credentials-pill">student123</span>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
                    <strong style={{ color: 'var(--accent)' }}>Administrator:</strong><br />
                    <span className="demo-credentials-pill">admin</span> · Password: <span className="demo-credentials-pill">admin123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARED NAV */}
      {currentUser && currentScreen !== 'LOGIN' && (
        <>
          <nav className={`dashboard-nav${currentUser.role === 'admin' ? ' admin-nav' : ''}`}>
            <div className="nav-container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: currentUser.role === 'admin' ? 'linear-gradient(135deg,#49445C 0%,#6b6480 100%)' : 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                  {currentUser.role === 'admin' ? <Shield size={18} /> : 'A'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '18px', color: currentUser.role === 'admin' ? 'white' : 'var(--secondary)', lineHeight: 1.1 }}>Antarang</h3>
                  <span style={{ fontSize: '10px', color: currentUser.role === 'admin' ? 'rgba(255,255,255,0.6)' : 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{currentUser.role === 'admin' ? 'Admin Panel' : 'Aspire, Act, Achieve'}</span>
                </div>
              </div>
              <div className="nav-right">
                {currentUser.role === 'admin' && (
                  <div className="admin-tab-nav">
                    <button className={`admin-tab-btn${adminActiveTab === 'overview' ? ' active' : ''}`} onClick={() => { setAdminActiveTab('overview'); setCurrentScreen('ADMIN_DASHBOARD'); }}><LayoutDashboard size={14} /> Overview</button>
                    <button className={`admin-tab-btn${adminActiveTab === 'tests' ? ' active' : ''}`} onClick={() => { setAdminActiveTab('tests'); setCurrentScreen('ADMIN_TEST_LIST'); }}><ClipboardList size={14} /> Tests</button>
                    <button className={`admin-tab-btn${adminActiveTab === 'students' ? ' active' : ''}`} onClick={() => { setAdminActiveTab('students'); setCurrentScreen('ADMIN_DASHBOARD'); showToast('Scrolling to Students section...'); }}><Users size={14} /> Students</button>
                  </div>
                )}
                <div className="user-profile-summary">
                  <div className={`avatar${currentUser.role === 'admin' ? ' admin-avatar' : ''}`}>{currentUser.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className="user-details-text">
                    <div className="user-name" style={{ color: currentUser.role === 'admin' ? 'white' : '' }}>{currentUser.name}</div>
                    <div className="user-role" style={{ color: currentUser.role === 'admin' ? 'rgba(255,255,255,0.6)' : '' }}>{currentUser.role === 'admin' ? '🛡 Administrator' : currentUser.branch}</div>
                  </div>
                </div>
                <button className="btn-logout" style={currentUser.role === 'admin' ? { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' } : {}} onClick={handleLogout}><LogOut size={16} /><span>Logout</span></button>
              </div>
            </div>
          </nav>

          {/* ADMIN DASHBOARD */}
          {currentScreen === 'ADMIN_DASHBOARD' && currentUser.role === 'admin' && (
            <main className="main-wrapper slide-up">
              <div className="welcome-section">
                <div className="welcome-info" style={{ textAlign: 'left' }}>
                  <h1>👋 Welcome, {currentUser.name.split(' ')[0]}!</h1>
                  <p>Manage assessments, questions, and student progress from this panel.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => { setAdminActiveTab('tests'); setCurrentScreen('ADMIN_TEST_LIST'); }}><Settings size={16} /> Manage Tests</button>
                  <button className="btn btn-outline" style={{ width: 'auto', padding: '12px 20px' }} onClick={adminCreateNewTest}><PlusCircle size={16} /> New Test</button>
                </div>
              </div>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card"><div className="stat-icon-box coral"><FileText size={24} /></div><div className="stat-content"><div className="stat-number">{adminTests.length}</div><div className="stat-label">Total Tests</div></div></div>
                <div className="stat-card"><div className="stat-icon-box blue"><HelpCircle size={24} /></div><div className="stat-content"><div className="stat-number">{totalAdminQ}</div><div className="stat-label">Total Questions</div></div></div>
                <div className="stat-card"><div className="stat-icon-box emerald"><Users size={24} /></div><div className="stat-content"><div className="stat-number">{MOCK_STUDENTS.length}</div><div className="stat-label">Registered Students</div></div></div>
                <div className="stat-card"><div className="stat-icon-box" style={{ background: 'rgba(220,169,32,0.1)', color: 'var(--accent)' }}><CheckCircle2 size={24} /></div><div className="stat-content"><div className="stat-number">{adminTests.filter(t => t.status === 'pending').length}</div><div className="stat-label">Active Tests</div></div></div>
              </div>
              <div className="section-header">
                <h3 className="section-title">Tests Overview</h3>
                <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }} onClick={() => { setAdminActiveTab('tests'); setCurrentScreen('ADMIN_TEST_LIST'); }}>View All <ChevronRight size={14} /></button>
              </div>
              <div className="admin-table-card">
                <table className="admin-table"><thead><tr><th>Test Name</th><th>Type</th><th>Questions</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{adminTests.map(test => (<tr key={test.id} className="admin-tr">
                    <td className="admin-td"><strong>{test.title}</strong></td>
                    <td className="admin-td"><span className={`type-badge type-${test.type}`}>{test.type}</span></td>
                    <td className="admin-td">{test.questions.length}</td>
                    <td className="admin-td">{test.duration}</td>
                    <td className="admin-td"><span className={`status-badge ${test.status === 'pending' ? 'completed' : 'locked'}`}>{test.status === 'pending' ? 'Active' : 'Locked'}</span></td>
                    <td className="admin-td"><button className="admin-action-btn edit" onClick={() => adminOpenTestEditor(test)} title="Edit"><Pencil size={14} /></button></td>
                  </tr>))}</tbody>
                </table>
              </div>
              <div className="section-header" style={{ marginTop: '40px' }}><h3 className="section-title">Registered Students</h3></div>
              <div className="admin-table-card">
                <table className="admin-table"><thead><tr><th>Name</th><th>Username</th><th>Center</th><th>Student ID</th><th>Tests Completed</th></tr></thead>
                  <tbody>{MOCK_STUDENTS.map(s => (<tr key={s.id} className="admin-tr">
                    <td className="admin-td"><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>{s.name.split(' ').map(n => n[0]).join('')}</div><strong>{s.name}</strong></div></td>
                    <td className="admin-td"><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{s.username}</code></td>
                    <td className="admin-td" style={{ fontSize: '13px', color: 'var(--text-medium)' }}>{s.branch}</td>
                    <td className="admin-td"><code style={{ fontSize: '12px' }}>{s.id}</code></td>
                    <td className="admin-td">{s.completedTests.length} / {adminTests.length}</td>
                  </tr>))}</tbody>
                </table>
              </div>
            </main>
          )}

          {/* ADMIN TEST LIST */}
          {currentScreen === 'ADMIN_TEST_LIST' && currentUser.role === 'admin' && (
            <main className="main-wrapper slide-up">
              <div className="welcome-section">
                <div className="welcome-info" style={{ textAlign: 'left' }}><h1>Test Management</h1><p>Configure, add, or remove assessments. Toggle status to hide/show tests from students.</p></div>
                <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={adminCreateNewTest}><PlusCircle size={16} /> Add New Test</button>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>#</th><th>Test Name</th><th>Type</th><th>Difficulty</th><th>Questions</th><th>Duration</th><th>Status</th><th style={{ textAlign: 'center' }}>Actions</th></tr></thead>
                  <tbody>{adminTests.map((test, idx) => (<tr key={test.id} className="admin-tr">
                    <td className="admin-td" style={{ color: 'var(--text-light)', fontSize: '13px' }}>{idx + 1}</td>
                    <td className="admin-td"><div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{test.title}</div><div style={{ fontSize: '12px', color: 'var(--text-medium)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{test.description}</div></td>
                    <td className="admin-td"><span className={`type-badge type-${test.type}`}>{test.type}</span></td>
                    <td className="admin-td"><span className="difficulty-badge">{test.difficulty}</span></td>
                    <td className="admin-td" style={{ fontWeight: 600 }}>{test.questions.length}</td>
                    <td className="admin-td" style={{ fontSize: '13px', color: 'var(--text-medium)' }}>{test.duration}</td>
                    <td className="admin-td">
                      <button className="toggle-status-btn" onClick={() => adminToggleStatus(test.id)}>
                        {test.status === 'pending' ? <><ToggleRight size={20} color="var(--primary)" /><span style={{ color: 'var(--primary)' }}>Active</span></> : <><ToggleLeft size={20} color="var(--text-light)" /><span style={{ color: 'var(--text-light)' }}>Locked</span></>}
                      </button>
                    </td>
                    <td className="admin-td" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="admin-action-btn edit" onClick={() => adminOpenTestEditor(test)} title="Edit test"><Pencil size={14} /></button>
                        <button className="admin-action-btn delete" onClick={() => adminDeleteTest(test.id)} title="Delete test"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>))}</tbody>
                </table>
              </div>
            </main>
          )}

          {/* ADMIN TEST EDITOR */}
          {currentScreen === 'ADMIN_TEST_EDITOR' && editingTestDraft && currentUser.role === 'admin' && (
            <main className="main-wrapper slide-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-medium)' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }} onClick={() => { setAdminActiveTab('tests'); setCurrentScreen('ADMIN_TEST_LIST'); }}>Tests</button>
                <ChevronRight size={14} /><span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{editingTestDraft.title || 'New Test'}</span>
              </div>
              <div className="admin-editor-grid">
                <div>
                  <div className="admin-editor-card">
                    <div className="admin-editor-card-header"><FileText size={18} color="var(--primary)" /><h3>Test Details</h3></div>
                    <div className="form-group"><label className="form-label">Test Title</label><input className="form-input" style={{ paddingLeft: '16px' }} type="text" value={editingTestDraft.title} onChange={e => updateDraftField('title', e.target.value)} placeholder="e.g. Interests" /></div>
                    <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={editingTestDraft.description} onChange={e => updateDraftField('description', e.target.value)} placeholder="Describe what this test measures..." /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group"><label className="form-label">Duration</label><input className="form-input" style={{ paddingLeft: '16px' }} type="text" value={editingTestDraft.duration} onChange={e => updateDraftField('duration', e.target.value)} placeholder="e.g. 15 mins" /></div>
                      <div className="form-group"><label className="form-label">Difficulty</label><select className="form-select" value={editingTestDraft.difficulty} onChange={e => updateDraftField('difficulty', e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group"><label className="form-label">Assessment Type</label><select className="form-select" value={editingTestDraft.type} onChange={e => updateDraftField('type', e.target.value)}><option value="aptitude">Aptitude</option><option value="personality">Personality / RIASEC</option><option value="values">Values</option></select></div>
                      <div className="form-group"><label className="form-label">Default Status</label><select className="form-select" value={editingTestDraft.status} onChange={e => updateDraftField('status', e.target.value)}><option value="pending">Active (Pending)</option><option value="locked">Locked</option></select></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group"><label className="form-label">Card Accent</label><select className="form-select" value={editingTestDraft.accentClass} onChange={e => updateDraftField('accentClass', e.target.value)}><option value="primary-accent">Green (Primary)</option><option value="secondary-accent">Orange (Secondary)</option><option value="accent-purple">Purple</option></select></div>
                      <div className="form-group"><label className="form-label">Card Icon</label><select className="form-select" value={editingTestDraft.iconName} onChange={e => updateDraftField('iconName', e.target.value)}><option value="BrainCircuit">Brain Circuit</option><option value="Compass">Compass</option><option value="Award">Award</option></select></div>
                    </div>
                    <div className="admin-save-bar">
                      <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => { setAdminActiveTab('tests'); setCurrentScreen('ADMIN_TEST_LIST'); }}><ArrowLeft size={16} /> Back</button>
                      <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={adminSaveTest}><Save size={16} /> Save Test</button>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="admin-editor-card">
                    <div className="admin-editor-card-header" style={{ justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ListOrdered size={18} color="var(--primary)" /><h3>Questions <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: '14px' }}>({editingTestDraft.questions.length})</span></h3></div>
                      <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }} onClick={() => adminOpenQuestionEditor(null, null)}><PlusCircle size={14} /> Add Question</button>
                    </div>
                    {editingTestDraft.questions.length === 0 ? (
                      <div className="empty-questions-state"><HelpCircle size={40} color="var(--border-light)" /><p>No questions yet. Click "Add Question" to get started.</p></div>
                    ) : (
                      <div className="questions-editor-list">
                        {editingTestDraft.questions.map((q, idx) => (
                          <div className="question-editor-card" key={q.id || idx}>
                            <div className="question-editor-num">Q{idx + 1}</div>
                            <div className="question-editor-body">
                              <p className="question-editor-text">{q.question || <em style={{ color: 'var(--text-light)' }}>No question text</em>}</p>
                              <div className="question-editor-meta"><span>{q.options.length} options</span>{q.correctAnswer && <span>· Correct: <strong>{q.correctAnswer}</strong></span>}</div>
                              <div className="question-editor-options-preview">
                                {q.options.map(o => (<span key={o.letter} className="option-preview-chip"><strong>{o.letter}.</strong> {o.text.length > 28 ? o.text.slice(0, 28) + '…' : o.text || '—'}{o.weight > 0 && <em> (w:{o.weight})</em>}{o.category && <em> [{o.category}]</em>}</span>))}
                              </div>
                            </div>
                            <div className="question-editor-actions">
                              <button className="admin-action-btn edit" onClick={() => adminOpenQuestionEditor(q, idx)}><Pencil size={13} /></button>
                              <button className="admin-action-btn delete" onClick={() => adminDeleteQuestion(idx)}><Trash2 size={13} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* STUDENT DASHBOARD */}
          {currentScreen === 'DASHBOARD' && currentUser.role !== 'admin' && (
            <main className="main-wrapper slide-up">
              <div className="welcome-section">
                <div className="welcome-info" style={{ textAlign: 'left' }}><h1>Namaste, {currentUser.name}!</h1><p>Welcome to your career portal. Find your path, build your goals.</p></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 18px', borderRadius: '12px', border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}><MapPin size={18} color="var(--primary)" /><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--secondary)' }}>Center ID: {currentUser.id}</span></div>
              </div>
              <div className="ngo-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff9f0', border: '1.5px solid rgba(78,166,115,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={22} color="var(--primary)" /></div>
                  <div><h5 className="ngo-banner-title">Upcoming Counseling Session</h5><p className="ngo-banner-text">1-on-1 Review with Career Coach at <strong>4:00 PM Friday</strong> at {currentUser.branch.split('-')[0]}</p></div>
                </div>
                <div className="ngo-counselor-tag">Mentor Assigned</div>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon-box coral"><BookOpen size={24} /></div><div className="stat-content"><div className="stat-number">{getCompletedCount()} / 3</div><div className="stat-label">Assessments Finished</div></div></div>
                <div className="stat-card"><div className="stat-icon-box blue"><Hourglass size={24} /></div><div className="stat-content"><div className="stat-number">{3 - getCompletedCount()}</div><div className="stat-label">Remaining Surveys</div></div></div>
                <div className="stat-card"><div className="stat-icon-box emerald"><UserCheck size={24} /></div><div className="stat-content"><div className="stat-number">Active</div><div className="stat-label">Path Guidance Status</div></div></div>
              </div>
              <div className="section-header"><h3 className="section-title">Your Career Assessments</h3><span style={{ fontSize: '13px', color: 'var(--text-medium)', fontWeight: 500 }}>Completed tests unlock counseling reports</span></div>
              <div className="assessments-grid">
                {studentAssessments.map(assessment => {
                  const Icon = assessment.iconName === 'BrainCircuit' ? BrainCircuit : assessment.iconName === 'Compass' ? Compass : Award;
                  return (
                    <div className="assessment-item-card" key={assessment.id}>
                      <div className={`card-accent-strip ${assessment.accentClass}`}></div>
                      <div className="card-padding">
                        <div className="card-header-row">
                          <span className="assessment-duration" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon size={16} style={{ color: 'var(--primary)' }} /><span>{assessment.duration}</span></span>
                          {assessment.status === 'completed' ? <span className="status-badge completed">Completed</span> : assessment.status === 'pending' ? <span className="status-badge pending">Not Started</span> : <span className="status-badge locked">Locked</span>}
                        </div>
                        <h3 className="assessment-title" style={{ color: 'var(--secondary)' }}>{assessment.title}</h3>
                        <p className="assessment-description">{assessment.description}</p>
                        <div className="card-footer-row">
                          <span className="questions-count">{assessment.questionsCount ? `${assessment.questionsCount} Multiple Choice` : 'Survey Form'}</span>
                          {assessment.status === 'completed' && assessment.id !== 'work_values' ? <button className="btn btn-outline btn-card-action" onClick={() => setCurrentScreen('RESULTS_VIEW')}>View Results</button>
                            : assessment.status === 'completed' ? <button className="btn btn-outline btn-card-action" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>Preloaded data</button>
                            : <button className="btn btn-primary btn-card-action" onClick={() => startAssessment(assessment)}>Start Test <ArrowRight size={14} /></button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="section-header"><h3 className="section-title">Career Pathway Matcher</h3></div>
              {getCompletedCount() >= 2 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '30px', alignItems: 'center', background: 'linear-gradient(135deg, #edf7f2 0%, #fff 100%)', border: '1.5px solid rgba(78,166,115,0.15)', borderRadius: '16px', padding: '30px', textAlign: 'left', marginBottom: '40px' }} className="slide-up">
                  <div><h3 style={{ fontSize: '20px', color: 'var(--secondary)', marginBottom: '8px' }}>🚀 Personalized Career Recommendations Ready!</h3><p style={{ fontSize: '14px', color: 'var(--text-medium)', lineHeight: 1.6, maxWidth: '800px' }}>Based on your completed Interests and Aptitude profiles, our system has customized a list of career profiles that fit your personality best.</p></div>
                  <div><button className="btn btn-primary" onClick={() => setCurrentScreen('RESULTS_VIEW')} style={{ width: 'auto', padding: '14px 28px' }}>Go to Reports &amp; Careers <ArrowRight size={16} /></button></div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '2px dashed var(--border-light)', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', marginBottom: '40px' }}>
                  <Lock size={32} color="var(--text-light)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', color: 'var(--secondary)', marginBottom: '8px' }}>Recommendations Currently Locked</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-medium)', maxWidth: '500px', margin: '0 auto 16px' }}>Complete the remaining assessments (<strong>Aptitude</strong> or <strong>Interests</strong>) to unlock your custom careers path guidelines.</p>
                  <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { const p = studentAssessments.find(t => t.status === 'pending'); if (p) startAssessment(p); }}>Start Remaining Assessment</button>
                </div>
              )}
            </main>
          )}

          {/* TEST TAKER */}
          {currentScreen === 'TEST_TAKER' && activeAssessment && (
            <div className="main-wrapper slide-up">
              <div className="test-taking-container">
                <div className="test-navbar">
                  <div className="test-nav-title-group" style={{ textAlign: 'left' }}><h2>{activeAssessment.title}</h2><span style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Active Assessment Session</span></div>
                  <button className="quit-test-btn" onClick={() => { if (window.confirm('Quit this assessment? Your selections will not be saved.')) { setCurrentScreen('DASHBOARD'); setActiveAssessment(null); showToast('Assessment session stopped.'); } }}>Quit Test</button>
                </div>
                <div className="test-progress-bar-container"><div className="test-progress-bar-fill" style={{ width: `${((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100}%` }}></div></div>
                <div className="test-question-box">
                  <div className="question-meta">Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}</div>
                  <div className="question-text">{activeAssessment.questions[currentQuestionIndex].question}</div>
                  <div className="options-list">
                    {activeAssessment.questions[currentQuestionIndex].options.map(opt => {
                      const isSel = selectedAnswers[activeAssessment.questions[currentQuestionIndex].id] === opt.letter;
                      return (<div className={`option-item-card ${isSel ? 'selected' : ''}`} key={opt.letter} onClick={() => handleSelectOption(activeAssessment.questions[currentQuestionIndex].id, opt.letter)}><div className="option-letter-box">{opt.letter}</div><div className="option-text-val">{opt.text}</div></div>);
                    })}
                  </div>
                  <div className="test-control-actions">
                    <button className="btn btn-outline btn-navigation" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}><ArrowLeft size={16} /> Previous</button>
                    {currentQuestionIndex < activeAssessment.questions.length - 1
                      ? <button className="btn btn-secondary btn-navigation" onClick={handleNextQuestion} disabled={!selectedAnswers[activeAssessment.questions[currentQuestionIndex].id]} style={{ opacity: !selectedAnswers[activeAssessment.questions[currentQuestionIndex].id] ? 0.6 : 1 }}>Next <ArrowRight size={16} /></button>
                      : <button className="btn btn-primary btn-navigation" onClick={finishAssessment} disabled={!selectedAnswers[activeAssessment.questions[currentQuestionIndex].id]} style={{ opacity: !selectedAnswers[activeAssessment.questions[currentQuestionIndex].id] ? 0.6 : 1 }}>Submit Test</button>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS VIEW */}
          {currentScreen === 'RESULTS_VIEW' && (
            <main className="main-wrapper slide-up">
              <div className="results-header-card">
                <div className="results-header-info">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}><span style={{ background: 'var(--primary)', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Holland codes: {getTopHollandCode()}</span><span style={{ opacity: 0.8, fontSize: '13px' }}>Assessment Profile</span></div>
                  <h1>Your Psychometric Assessment Report</h1><p>Below is the detailed visual index of your vocational interest profiles (RIASEC) and custom career suggestions mapped out by our algorithms.</p>
                </div>
                <div className="results-action-btn-group">
                  <button className="btn btn-outline" onClick={() => window.print()} style={{ color: 'var(--secondary)', display: 'flex', gap: '8px', background: 'white' }}><Printer size={18} /><span>Print Report</span></button>
                  <button className="btn btn-primary" onClick={() => { setCurrentScreen('DASHBOARD'); showToast('Returned to Dashboard.'); }} style={{ width: 'auto' }}>Back to Dashboard</button>
                </div>
              </div>
              <div className="results-body-grid">
                <div>
                  <div className="results-card">
                    <h3 className="results-card-title"><TrendingUp size={22} color="var(--primary)" /><span>Interest Profile Analysis (RIASEC Model)</span></h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-medium)', marginBottom: '24px', lineHeight: 1.6 }}>The RIASEC model breaks careers down into six core groups. Your answers demonstrate which quadrants match your style the closest:</p>
                    <div className="holland-chart-container">
                      {[['R','Realistic'],['I','Investigative'],['A','Artistic'],['S','Social'],['E','Enterprising'],['C','Conventional']].map(([code, label]) => (
                        <div className="holland-bar-row" key={code}><span className="holland-bar-label">{label} ({code})</span><div className="holland-bar-track"><div className={`holland-bar-fill color-${label.toLowerCase()}`} style={{ width: `${riasecScores[code]}%` }}>{riasecScores[code]}%</div></div></div>
                      ))}
                    </div>
                    <div className="riasec-description-row">
                      <div className="riasec-desc-card"><h4>🥇 Primary Strength: Social &amp; Supportive</h4><p className="riasec-desc-text">You enjoy working with people, helping others grow, and building partnerships. Highly effective for counseling, education, and development.</p></div>
                      <div className="riasec-desc-card"><h4>🥈 Secondary Strength: Investigative</h4><p className="riasec-desc-text">You enjoy researching, finding answer keys to logical puzzles, and resolving problems through science or data analysis.</p></div>
                    </div>
                  </div>
                  <div className="results-card">
                    <h3 className="results-card-title"><GraduationCap size={22} color="var(--primary)" /><span>Counselor Action Recommendations &amp; Guidance</span></h3>
                    <ul className="advice-bullet-list">
                      <li className="advice-bullet-item"><strong>Vocational Focus:</strong> Leverage your outstanding combination of <strong>Social</strong> &amp; <strong>Investigative</strong> capabilities.</li>
                      <li className="advice-bullet-item"><strong>NGO Training Support:</strong> Antarang advises enrolling in our <strong>Career Ready program</strong> to practice visual layout design, communication, or basic software coding.</li>
                      <li className="advice-bullet-item"><strong>Action Steps:</strong> Attend the scheduled Friday coaching with your assigned counselor to practice mock interviews and select relevant college courses.</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="results-card">
                    <h3 className="results-card-title"><Briefcase size={22} color="var(--primary)" /><span>Career Path Recommendations</span></h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-medium)', marginBottom: '20px' }}>These matches align closely with your {getTopHollandCode()} profile attributes:</p>
                    <div className="career-match-card-list">
                      {getMatchingCareers().map((career, idx) => (
                        <div className="career-match-card" key={idx}>
                          <div className="career-match-info"><h4 className="career-match-title" style={{ color: 'var(--secondary)' }}>{career.name}</h4><div className="career-match-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}><span>Study path:</span><strong>{career.education}</strong></div><p style={{ fontSize: '12px', color: 'var(--text-medium)', marginTop: '8px', lineHeight: 1.5 }}>{career.description}</p></div>
                          <div className="career-match-badge">{career.match}</div>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-outline" style={{ marginTop: '24px', display: 'flex', gap: '8px', borderStyle: 'dashed' }} onClick={() => showToast('Information request sent to your Center Coordinator!')}><Briefcase size={16} /><span>Explore more career options</span></button>
                  </div>
                </div>
              </div>
            </main>
          )}
        </>
      )}

      {/* QUESTION EDITOR MODAL */}
      {showQuestionModal && editingQuestion && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowQuestionModal(false); }}>
          <div className="modal-card slide-up">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><HelpCircle size={20} color="var(--primary)" /><h3>{editingQuestionIdx !== null && editingQuestionIdx !== undefined ? `Edit Question ${editingQuestionIdx + 1}` : 'Add New Question'}</h3></div>
              <button className="modal-close-btn" onClick={() => setShowQuestionModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Question Text <span style={{ color: 'var(--error)' }}>*</span></label><textarea className="form-textarea" rows={3} value={editingQuestion.question} onChange={e => updateQField('question', e.target.value)} placeholder="Enter the question that students will see..." /></div>
              <div className="form-group"><label className="form-label">Explanation (shown after answer)</label><textarea className="form-textarea" rows={2} value={editingQuestion.explanation || ''} onChange={e => updateQField('explanation', e.target.value)} placeholder="Explain why the correct answer is right..." /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label className="form-label">Correct Answer</label><select className="form-select" value={editingQuestion.correctAnswer} onChange={e => updateQField('correctAnswer', e.target.value)}>{editingQuestion.options.map(o => <option key={o.letter} value={o.letter}>Option {o.letter}</option>)}</select></div>
                <div className="form-group"><label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={13} color="var(--text-light)" /> Field Guide</label><div style={{ fontSize: '12px', color: 'var(--text-medium)', padding: '10px', background: '#f8fafc', borderRadius: '8px', lineHeight: 1.6 }}><strong>Weight:</strong> score added when chosen<br /><strong>Category:</strong> RIASEC code (R/I/A/S/E/C)</div></div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Answer Options</label>
                  <button className="btn btn-outline" style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }} onClick={addOption}><PlusCircle size={13} /> Add Option</button>
                </div>
                <div className="options-editor-list">
                  {editingQuestion.options.map((opt, oi) => (
                    <div className="option-editor-row" key={oi}>
                      <div className="option-editor-letter">{opt.letter}</div>
                      <input className="form-input option-editor-text" style={{ paddingLeft: '12px' }} type="text" value={opt.text} onChange={e => updateOptField(oi, 'text', e.target.value)} placeholder={`Option ${opt.letter} text...`} />
                      <div className="option-editor-extras">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><label style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Weight</label><input className="form-input" style={{ paddingLeft: '10px', width: '70px', textAlign: 'center' }} type="number" min={0} max={10} value={opt.weight ?? 0} onChange={e => updateOptField(oi, 'weight', e.target.value)} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><label style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Category</label><input className="form-input" style={{ paddingLeft: '10px', width: '70px', textAlign: 'center' }} type="text" value={opt.category || ''} onChange={e => updateOptField(oi, 'category', e.target.value)} placeholder="R/I/A…" maxLength={2} /></div>
                      </div>
                      <button className="admin-action-btn delete" style={{ flexShrink: 0 }} onClick={() => removeOption(oi)} title="Remove option"><X size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setShowQuestionModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={adminSaveQuestion}><Save size={16} /> Save Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
