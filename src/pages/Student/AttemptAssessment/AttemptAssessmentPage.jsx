import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useAssessment } from '../../../hooks/useAssessment';
import { useToast } from '../../../hooks/useToast';
import { ROUTES } from '../../../config/routes';
import { ProgressBar } from '../../../components/assessment/ProgressBar/ProgressBar';
import { QuestionCard } from '../../../components/assessment/QuestionCard/QuestionCard';

export const AttemptAssessmentPage = () => {
  const { currentUser } = useAuth();
  const {
    activeAssessment,
    currentQuestionIndex,
    selectedAnswers,
    handleSelectOption,
    handleNextQuestion,
    handlePrevQuestion,
    finishAssessment,
    resetSession
  } = useAssessment();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!activeAssessment) {
    navigate(ROUTES.STUDENT_DASHBOARD);
    return null;
  }

  const currentQuestion = activeAssessment.questions[currentQuestionIndex];

  const handleQuit = () => {
    if (window.confirm('Quit this assessment? Your selections will not be saved.')) {
      resetSession();
      showToast('Assessment session stopped.');
      navigate(ROUTES.STUDENT_DASHBOARD);
    }
  };

  const handleFinish = () => {
    if (Object.keys(selectedAnswers).length < activeAssessment.questions.length) {
      showToast('Please answer all questions before submitting.');
      return;
    }
    const finishedTitle = finishAssessment(currentUser);
    showToast(`Congratulations! You completed ${finishedTitle}`);
    navigate(ROUTES.RESULTS);
  };

  return (
    <div className="main-wrapper slide-up">
      <div className="test-taking-container">
        <div className="test-navbar">
          <div className="test-nav-title-group" style={{ textAlign: 'left' }}>
            <h2>{activeAssessment.title}</h2>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Active Assessment Session
            </span>
          </div>
          <button className="quit-test-btn" onClick={handleQuit}>
            Quit Test
          </button>
        </div>

        <ProgressBar current={currentQuestionIndex} total={activeAssessment.questions.length} />

        <QuestionCard
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={activeAssessment.questions.length}
          selectedAnswer={selectedAnswers[currentQuestion?.id]}
          onSelectOption={handleSelectOption}
          onPrev={handlePrevQuestion}
          onNext={handleNextQuestion}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
};
