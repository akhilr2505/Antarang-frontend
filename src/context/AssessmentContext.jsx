import React, { createContext, useState } from 'react';
import { assessmentsData } from '../data/assessments';
import { DEFAULT_RIASEC_SCORES } from '../utils/constants';
import { calculateAssessmentResults } from '../utils/helpers';

export const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  const [studentAssessments, setStudentAssessments] = useState(assessmentsData);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [riasecScores, setRiasecScores] = useState(DEFAULT_RIASEC_SCORES);

  const startAssessment = (assessment) => {
    setActiveAssessment(assessment);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };

  const handleSelectOption = (questionId, optionLetter) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleNextQuestion = () => {
    if (activeAssessment && currentQuestionIndex < activeAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishAssessment = (currentUser) => {
    if (!activeAssessment) return;
    
    const updatedScores = calculateAssessmentResults(activeAssessment, selectedAnswers, riasecScores);
    setRiasecScores(updatedScores);

    setStudentAssessments(prev =>
      prev.map(t => (t.id === activeAssessment.id ? { ...t, status: 'completed' } : t))
    );

    if (currentUser && currentUser.completedTests && !currentUser.completedTests.includes(activeAssessment.id)) {
      currentUser.completedTests.push(activeAssessment.id);
    }

    const finishedAssessmentTitle = activeAssessment.title;
    setActiveAssessment(null);
    setSelectedAnswers({});
    return finishedAssessmentTitle;
  };

  const resetSession = () => {
    setActiveAssessment(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };

  return (
    <AssessmentContext.Provider
      value={{
        studentAssessments,
        setStudentAssessments,
        activeAssessment,
        currentQuestionIndex,
        selectedAnswers,
        riasecScores,
        setRiasecScores,
        startAssessment,
        handleSelectOption,
        handleNextQuestion,
        handlePrevQuestion,
        finishAssessment,
        resetSession
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};
