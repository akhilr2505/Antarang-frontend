import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Compass,
  Award,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Calendar,
  LogOut,
  Lock,
  CheckCircle2,
  User,
  LockKeyhole,
  MapPin,
  AlertCircle,
  Printer,
  Briefcase,
  UserCheck,
  Hourglass,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { assessmentsData, careerDatabase, fallbackCareers } from './data/assessments';
import './App.css';

// Mock students database
const MOCK_STUDENTS = [
  {
    username: 'amit.kumar',
    password: 'student123',
    name: 'Amit Kumar',
    branch: 'Antarang Center - Dharavi, Mumbai',
    id: 'ANT-2026-089A',
    completedTests: ['values'], // Work Values is preloaded
    testScores: {
      values: { Independence: 80, Achievement: 90, Relationships: 70 }
    }
  },
  {
    username: 'sneha.sharma',
    password: 'student123',
    name: 'Sneha Sharma',
    branch: 'Antarang Center - Shivaji Nagar, Pune',
    id: 'ANT-2026-112B',
    completedTests: ['values'],
    testScores: {
      values: { Support: 90, Relationships: 85, WorkingConditions: 70 }
    }
  }
];

function App() {
  // Navigation: 'LOGIN' | 'DASHBOARD' | 'TEST_TAKER' | 'RESULTS_VIEW'
  const [currentScreen, setCurrentScreen] = useState('LOGIN');

  // User Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState('amit.kumar');
  const [loginPassword, setLoginPassword] = useState('student123');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active Assessment State
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionLetter }

  // Accumulated student profile state (scores from current sessions)
  const [studentAssessments, setStudentAssessments] = useState(assessmentsData);
  const [riasecScores, setRiasecScores] = useState({
    R: 45,
    I: 50,
    A: 40,
    S: 60,
    E: 55,
    C: 50
  });

  // UI Toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-clear toast helper
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message) => {
    setToastMessage(message);
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = MOCK_STUDENTS.find(
        (student) => student.username === loginUsername.trim().toLowerCase() && student.password === loginPassword
      );

      if (user) {
        setCurrentUser(user);
        setCurrentScreen('DASHBOARD');
        showToast(`Welcome back, ${user.name}!`);

        // Synchronize preloaded completed tests
        const updatedAssessments = assessmentsData.map(test => {
          if (user.completedTests.includes(test.id)) {
            return { ...test, status: 'completed' };
          }
          return test;
        });
        setStudentAssessments(updatedAssessments);
      } else {
        setLoginError('Invalid Username or Password. Try the demo credentials below.');
      }
      setIsLoading(false);
    }, 850);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('LOGIN');
    setActiveAssessment(null);
    setSelectedAnswers({});
    showToast('Logged out successfully.');
  };

  // Assessment flow controllers
  const startAssessment = (assessment) => {
    setActiveAssessment(assessment);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setCurrentScreen('TEST_TAKER');
    showToast(`Started ${assessment.title}`);
  };

  const handleSelectOption = (questionId, optionLetter) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionLetter
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishAssessment = () => {
    // Validate that all questions are answered
    const totalQuestions = activeAssessment.questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < totalQuestions) {
      showToast(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Logic to tally scores
      if (activeAssessment.type === 'personality') {
        // Tally RIASEC category responses
        const newRiasecScores = { R: 25, I: 25, A: 25, S: 25, E: 25, C: 25 };

        activeAssessment.questions.forEach((q) => {
          const selectedLetter = selectedAnswers[q.id];
          const optionObj = q.options.find(opt => opt.letter === selectedLetter);
          if (optionObj && optionObj.category) {
            newRiasecScores[optionObj.category] += 12; // Weight per match
          }
        });

        setRiasecScores(newRiasecScores);
      } else if (activeAssessment.type === 'aptitude') {
        // Evaluate correct answers and add specific score multipliers or logic
        let scoreCount = 0;
        activeAssessment.questions.forEach((q) => {
          if (selectedAnswers[q.id] === q.correctAnswer) {
            scoreCount += 20; // 20% weight per correct answer
          }
        });
        // Boost Investigative & Conventional scores based on aptitude
        setRiasecScores(prev => ({
          ...prev,
          I: Math.min(prev.I + scoreCount / 4, 95),
          C: Math.min(prev.C + scoreCount / 4, 95)
        }));
      }

      // Update test status
      const updatedAssessments = studentAssessments.map(t => {
        if (t.id === activeAssessment.id) {
          return { ...t, status: 'completed' };
        }
        return t;
      });
      setStudentAssessments(updatedAssessments);

      // Update running list of completed tests for this user session
      if (currentUser) {
        currentUser.completedTests.push(activeAssessment.id);
      }

      setIsLoading(false);
      setCurrentScreen('RESULTS_VIEW');
      showToast(`Congratulations! You completed ${activeAssessment.title}`);
      setActiveAssessment(null);
    }, 1000);
  };

  // Determine top score category codes for recommended careers
  const getTopHollandCode = () => {
    // Sort keys based on scores
    const sortedCategories = Object.keys(riasecScores).sort((a, b) => riasecScores[b] - riasecScores[a]);
    return sortedCategories.slice(0, 3).join('');
  };

  // Check how many assessments are complete
  const getCompletedCount = () => {
    return studentAssessments.filter(t => t.status === 'completed').length;
  };

  // Locate best careers corresponding to RIASEC top codes or fallback
  const getMatchingCareers = () => {
    const topThreeCode = getTopHollandCode();
    // Look for exact match or character intersections
    const exactMatch = careerDatabase.find(c => {
      // match keys intersecting at least 2 categories
      const overlap = [...c.code].filter(char => topThreeCode.includes(char)).length;
      return overlap >= 2;
    });

    if (exactMatch) {
      return exactMatch.careers;
    }
    return fallbackCareers;
  };

  return (
    <div className="app-container">
      {/* Decorative Blur Backgrounds */}
      <div className="bg-decor bg-decor-1"></div>
      <div className="bg-decor bg-decor-2"></div>

      {toastMessage && (
        <div className="toast-alert success-toast fade-in">
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LOGIN SCREEN */}
      {currentScreen === 'LOGIN' && (
        <div className="login-screen fade-in">
          <div className="login-card">
            <div className="login-left">
              <div className="brand-wrapper">
                <div className="brand-logo-circle">A</div>
                <div>
                  <h3 className="brand-text">Antarang</h3>
                  <div className="brand-tagline">Aspire, Act, Achieve</div>
                </div>
              </div>

              <div className="login-hero-content">
                <h2>Unlock Your Potential, Guide Your Future.</h2>
                <p>Antarang helps students discover their strengths, interests, and professional avenues through expert psychometric feedback.</p>

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
                      <Award size={20} />
                    </div>
                    <span>1-on-1 counselor guidance pathways</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '20px' }}>
                © 2026 Antarang Foundation. Supporting youth dreams across India.
              </div>
            </div>

            <div className="login-right">
              <h2 className="login-form-title">Student Login</h2>
              <p className="login-form-subtitle">Enter your youth center credentials to start assessments.</p>

              {loginError && (
                <div style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fee2e2', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Student ID / Username</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      id="username"
                      className="form-input"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="e.g. amit.kumar"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">PIN / Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <LockKeyhole size={18} />
                    </span>
                    <input
                      type="password"
                      id="password"
                      className="form-input"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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
                  <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); showToast("Please contact your NGO Center Mentor/Teacher to reset your login pin.") }}>Forgot PIN?</a>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Verifying Student Details...' : 'Start My Journey'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="demo-credentials">
                <div>👋 <strong>NGO Demo Mode Active</strong></div>
                <div style={{ marginTop: '8px' }}>
                  Use: <span className="demo-credentials-pill">amit.kumar</span> status: (Mumbai Center)
                  <br />
                  Or: <span className="demo-credentials-pill">sneha.sharma</span> status: (Pune Center)
                  <br />Password: <span className="demo-credentials-pill">student123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD NAVBAR & CONTENT */}
      {currentUser && currentScreen !== 'LOGIN' && (
        <>
          <nav className="dashboard-nav">
            <div className="nav-container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>A</div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--secondary)', lineHeight: 1.1 }}>Antarang</h3>
                  <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Aspire, Act, Achieve</span>
                </div>
              </div>

              <div className="nav-right">
                <div className="user-profile-summary">
                  <div className="avatar">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="user-details-text">
                    <div className="user-name">{currentUser.name}</div>
                    <div className="user-role">{currentUser.branch}</div>
                  </div>
                </div>

                <button className="btn-logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </nav>

          {/* DASHBOARD HOME */}
          {currentScreen === 'DASHBOARD' && (
            <main className="main-wrapper slide-up">
              <div className="welcome-section">
                <div className="welcome-info" style={{ textAlign: 'left' }}>
                  <h1>Namaste, {currentUser.name}!</h1>
                  <p>Welcome to your career portal. Find your path, build your goals.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 18px', borderRadius: '12px', border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <MapPin size={18} color="var(--primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--secondary)' }}>Center ID: {currentUser.id}</span>
                </div>
              </div>

              {/* Counselor Consultation Reminder */}
              <div className="ngo-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff9f0', border: '1.5px solid rgba(236, 88, 41, 0.2)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Calendar size={22} color="var(--primary)" />
                  </div>
                  <div>
                    <h5 className="ngo-banner-title">Upcoming Counseling Session</h5>
                    <p className="ngo-banner-text">1-on-1 Review with Career Coach at <strong>4:00 PM Friday</strong> at {currentUser.branch.split('-')[0]}</p>
                  </div>
                </div>
                <div className="ngo-counselor-tag">Mentor Assigned</div>
              </div>

              {/* Progress Summary Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-box coral">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{getCompletedCount()} / 3</div>
                    <div className="stat-label">Assessments Finished</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-box blue">
                    <Hourglass size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{3 - getCompletedCount()}</div>
                    <div className="stat-label">Remaining Surveys</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-box emerald">
                    <UserCheck size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">Active</div>
                    <div className="stat-label">Path Guidance Status</div>
                  </div>
                </div>
              </div>

              {/* assessments column */}
              <div className="section-header">
                <h3 className="section-title">Your Career Assessments</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-medium)', fontWeight: 500 }}>Completed tests unlock counseling reports</span>
              </div>

              <div className="assessments-grid">
                {studentAssessments.map((assessment) => {
                  const IconComponent = assessment.iconName === 'BrainCircuit' ? BrainCircuit
                    : assessment.iconName === 'Compass' ? Compass
                      : Award;
                  return (
                    <div className="assessment-item-card" key={assessment.id}>
                      <div className={`card-accent-strip ${assessment.accentClass}`}></div>

                      <div className="card-padding">
                        <div className="card-header-row">
                          <span className="assessment-duration" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <IconComponent size={16} style={{ color: 'var(--primary)' }} />
                            <span>{assessment.duration}</span>
                          </span>

                          {assessment.status === 'completed' ? (
                            <span className="status-badge completed">Completed</span>
                          ) : assessment.status === 'pending' ? (
                            <span className="status-badge pending">Not Started</span>
                          ) : (
                            <span className="status-badge locked">Locked</span>
                          )}
                        </div>

                        <h3 className="assessment-title" style={{ color: 'var(--secondary)' }}>{assessment.title}</h3>
                        <p className="assessment-description">{assessment.description}</p>

                        <div className="card-footer-row">
                          <span className="questions-count">
                            {assessment.questionsCount ? `${assessment.questionsCount} Multiple Choice` : 'Survey Form'}
                          </span>

                          {assessment.status === 'completed' && assessment.id !== 'work_values' ? (
                            <button
                              className="btn btn-outline btn-card-action"
                              onClick={() => {
                                // Just showcase the results
                                setCurrentScreen('RESULTS_VIEW');
                              }}
                            >
                              View Results
                            </button>
                          ) : assessment.status === 'completed' ? (
                            <button
                              className="btn btn-outline btn-card-action"
                              disabled
                              style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            >
                              Preloaded data
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-card-action"
                              onClick={() => startAssessment(assessment)}
                            >
                              Start Test <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RECOMMENDATIONS SECTION */}
              <div className="section-header">
                <h3 className="section-title">Career Pathway Matcher</h3>
              </div>

              {getCompletedCount() >= 2 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '30px', alignItems: 'center', background: 'linear-gradient(135deg, #edf7f2 0%, #fff 100%)', border: '1.5px solid rgba(78, 166, 115, 0.15)', borderRadius: '16px', padding: '30px', textAlign: 'left', marginBottom: '40px' }} className="slide-up">
                  <div>
                    <h3 style={{ fontSize: '20px', color: 'var(--secondary)', marginBottom: '8px' }}>🚀 Personalized Career Recommendations Ready!</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-medium)', lineHeight: 1.6, maxWidth: '800px' }}>
                      Based on your completed Interests and Aptitude profiles, our system has customized a list of career profiles that fit your personality best. You can look at the charts, educational pathways, and download your report.
                    </p>
                  </div>
                  <div>
                    <button className="btn btn-primary" onClick={() => setCurrentScreen('RESULTS_VIEW')} style={{ width: 'auto', padding: '14px 28px' }}>
                      Go to Reports & Careers <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '2px dashed var(--border-light)', borderRadius: '16px', padding: '40px 30px', textAlign: 'center', marginBottom: '40px' }}>
                  <Lock size={32} color="var(--text-light)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', color: 'var(--secondary)', marginBottom: '8px' }}>Recommendations Currently Locked</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-medium)', maxWidth: '500px', margin: '0 auto 16px' }}>
                    Complete the remaining assessments (<strong>Aptitude</strong> or <strong>Interests</strong>) to unlock your custom careers path guidelines.
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ width: 'auto' }}
                    onClick={() => {
                      // find first pending
                      const pending = studentAssessments.find(t => t.status === 'pending');
                      if (pending) startAssessment(pending);
                    }}
                  >
                    Start Remaining Assessment
                  </button>
                </div>
              )}
            </main>
          )}

          {/* TEST TAKING SCREEN */}
          {currentScreen === 'TEST_TAKER' && activeAssessment && (
            <div className="main-wrapper slide-up">
              <div className="test-taking-container">
                <div className="test-navbar">
                  <div className="test-nav-title-group" style={{ textAlign: 'left' }}>
                    <h2>{activeAssessment.title}</h2>
                    <span style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600 }}>Active Assessment Session</span>
                  </div>
                  <button className="quit-test-btn" onClick={() => {
                    if (window.confirm("Are you sure you want to quit this assessment? Your options selection will not be saved.")) {
                      setCurrentScreen('DASHBOARD');
                      setActiveAssessment(null);
                      showToast("Assessment session stopped.");
                    }
                  }}>
                    Quit Test
                  </button>
                </div>

                <div className="test-progress-bar-container">
                  <div
                    className="test-progress-bar-fill"
                    style={{ width: `${((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100}%` }}
                  ></div>
                </div>

                <div className="test-question-box">
                  <div className="question-meta">
                    Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
                  </div>

                  <div className="question-text">
                    {activeAssessment.questions[currentQuestionIndex].question}
                  </div>

                  <div className="options-list">
                    {activeAssessment.questions[currentQuestionIndex].options.map((opt) => {
                      const isSelected = selectedAnswers[activeAssessment.questions[currentQuestionIndex].id] === opt.letter;
                      return (
                        <div
                          className={`option-item-card ${isSelected ? 'selected' : ''}`}
                          key={opt.letter}
                          onClick={() => handleSelectOption(activeAssessment.questions[currentQuestionIndex].id, opt.letter)}
                        >
                          <div className="option-letter-box">
                            {opt.letter}
                          </div>
                          <div className="option-text-val">
                            {opt.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="test-control-actions">
                    <button
                      className="btn btn-outline btn-navigation"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1, cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      <ArrowLeft size={16} /> Previous
                    </button>

                    {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                      <button
                        className="btn btn-secondary btn-navigation"
                        onClick={handleNextQuestion}
                        disabled={!selectedAnswers[activeAssessment.questions[currentQuestionIndex].id]}
                        style={{ opacity: !selectedAnswers[activeAssessment.questions[currentQuestionIndex].id] ? 0.6 : 1 }}
                      >
                        Next <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-navigation"
                        onClick={finishAssessment}
                        disabled={!selectedAnswers[activeAssessment.questions[currentQuestionIndex].id]}
                        style={{ opacity: !selectedAnswers[activeAssessment.questions[currentQuestionIndex].id] ? 0.6 : 1 }}
                      >
                        Submit Test
                      </button>
                    )}
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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--primary)', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Holland codes: {getTopHollandCode()}</span>
                    <span style={{ opacity: 0.8, fontSize: '13px' }}>Assessment Profile</span>
                  </div>
                  <h1>Your Psychometric Assessment Report</h1>
                  <p>Below is the detailed visual index of your vocational interest profiles (RIASEC) and custom career suggestions mapped out by our algorithms.</p>
                </div>

                <div className="results-action-btn-group">
                  <button className="btn btn-outline" onClick={() => window.print()} style={{ color: 'var(--secondary)', display: 'flex', gap: '8px', background: 'white' }}>
                    <Printer size={18} />
                    <span>Print Report</span>
                  </button>
                  <button className="btn btn-primary" onClick={() => {
                    setCurrentScreen('DASHBOARD');
                    showToast("Returned to Dashboard.");
                  }} style={{ width: 'auto' }}>
                    Back to Dashboard
                  </button>
                </div>
              </div>

              <div className="results-body-grid">
                {/* Left Side: Assessment breakdown */}
                <div>
                  <div className="results-card">
                    <h3 className="results-card-title">
                      <TrendingUp size={22} color="var(--primary)" />
                      <span>Interest Profile Analysis (RIASEC Model)</span>
                    </h3>

                    <p style={{ fontSize: '14px', color: 'var(--text-medium)', marginBottom: '24px', lineHeight: 1.6 }}>
                      The RIASEC model breaks careers down into six core groups. Your answers demonstrate which quadrants match your style the closest:
                    </p>

                    <div className="holland-chart-container">
                      <div className="holland-bar-row">
                        <span className="holland-bar-label">Realistic (R)</span>
                        <div className="holland-bar-track">
                          <div className="holland-bar-fill color-realistic" style={{ width: `${riasecScores.R}%` }}>
                            {riasecScores.R}%
                          </div>
                        </div>
                      </div>

                      <div className="holland-bar-row">
                        <span className="holland-bar-label">Investigative (I)</span>
                        <div className="holland-bar-track">
                          <div className="holland-bar-fill color-investigative" style={{ width: `${riasecScores.I}%` }}>
                            {riasecScores.I}%
                          </div>
                        </div>
                      </div>

                      <div className="holland-bar-row">
                        <span className="holland-bar-label">Artistic (A)</span>
                        <div className="holland-bar-track">
                          <div className="holland-bar-fill color-artistic" style={{ width: `${riasecScores.A}%` }}>
                            {riasecScores.A}%
                          </div>
                        </div>
                      </div>

                      <div className="holland-bar-row">
                        <span className="holland-bar-label">Social (S)</span>
                        <div className="holland-bar-track">
                          <div className="holland-bar-fill color-social" style={{ width: `${riasecScores.S}%` }}>
                            {riasecScores.S}%
                          </div>
                        </div>
                      </div>

                      <div className="holland-bar-row">
                        <span className="holland-bar-label">Enterprising (E)</span>
                        <div className="holland-bar-track">
                          <div className="holland-bar-fill color-enterprising" style={{ width: `${riasecScores.E}%` }}>
                            {riasecScores.E}%
                          </div>
                        </div>
                      </div>

                      <div className="holland-bar-row">
                        <span className="holland-bar-label">Conventional (C)</span>
                        <div className="holland-bar-track">
                          <div className="holland-bar-fill color-conventional" style={{ width: `${riasecScores.C}%` }}>
                            {riasecScores.C}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="riasec-description-row">
                      <div className="riasec-desc-card">
                        <h4>🥇 Primary Strength: Social & Supportive</h4>
                        <p className="riasec-desc-text">You enjoy working with people, helping others grow, and building partnerships. Highly effective for counseling, education, and development.</p>
                      </div>
                      <div className="riasec-desc-card">
                        <h4>🥈 Secondary Strength: Investigative</h4>
                        <p className="riasec-desc-text">You enjoy researching, finding answer keys to logical puzzles, and resolving problems through science or data analysis.</p>
                      </div>
                    </div>
                  </div>

                  <div className="results-card">
                    <h3 className="results-card-title">
                      <GraduationCap size={22} color="var(--primary)" />
                      <span>Counselor Action Recommendations & Guidance</span>
                    </h3>

                    <ul className="advice-bullet-list">
                      <li className="advice-bullet-item">
                        <strong>Vocational Focus:</strong> Leverage your outstanding combination of <strong>Social</strong> & <strong>Investigative</strong> capabilities. Look for pathways where technical problem-solving aids social/human development.
                      </li>
                      <li className="advice-bullet-item">
                        <strong>NGO Training Support:</strong> Antarang advises enrolling in our <strong>Career Ready program</strong> to practice visual layout design, communication, or basic software coding.
                      </li>
                      <li className="advice-bullet-item">
                        <strong>Action Steps:</strong> Attend the scheduled Friday coaching with your assigned counselor to practice mock interviews and select relevant college courses.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Side: Recommended Careers list */}
                <div>
                  <div className="results-card">
                    <h3 className="results-card-title">
                      <Briefcase size={22} color="var(--primary)" />
                      <span>Career Path Recommendations</span>
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--text-medium)', marginBottom: '20px' }}>
                      These matches align closely with your {getTopHollandCode()} profile attributes:
                    </p>

                    <div className="career-match-card-list">
                      {getMatchingCareers().map((career, idx) => (
                        <div className="career-match-card" key={idx}>
                          <div className="career-match-info">
                            <h4 className="career-match-title" style={{ color: 'var(--secondary)' }}>{career.name}</h4>
                            <div className="career-match-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <span>Study path:</span>
                              <strong>{career.education}</strong>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-medium)', marginTop: '8px', lineHeight: 1.5 }}>
                              {career.description}
                            </p>
                          </div>
                          <div className="career-match-badge">
                            {career.match}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn btn-outline"
                      style={{ marginTop: '24px', display: 'flex', gap: '8px', borderStyle: 'dashed' }}
                      onClick={() => {
                        showToast("Information request sent to your Center Coordinator!");
                      }}
                    >
                      <Briefcase size={16} />
                      <span>Explore more career options</span>
                    </button>
                  </div>
                </div>
              </div>
            </main>
          )}
        </>
      )}
    </div>
  );
}

export default App;
