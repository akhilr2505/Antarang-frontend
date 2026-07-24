import React, { createContext, useState } from 'react';
import { assessmentsData } from '../data/assessments';
import { deepClone, genId } from '../utils/formatters';
import { LETTERS } from '../utils/constants';

export const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [adminTests, setAdminTests] = useState(() => deepClone(assessmentsData));
  const [adminActiveTab, setAdminActiveTab] = useState('overview');
  const [editingTestDraft, setEditingTestDraft] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);

  const adminCreateNewTest = () => {
    const newTest = {
      id: genId(),
      title: 'New Assessment',
      duration: '10 mins',
      questionsCount: 0,
      type: 'aptitude',
      difficulty: 'Medium',
      status: 'pending',
      description: 'Enter a description for this assessment.',
      accentClass: 'primary-accent',
      iconName: 'BrainCircuit',
      questions: []
    };
    setAdminTests(prev => [...prev, newTest]);
    setEditingTestDraft(deepClone(newTest));
    return newTest;
  };

  const adminOpenTestEditor = (test) => {
    setEditingTestDraft(deepClone(test));
  };

  const adminSaveTest = () => {
    if (!editingTestDraft) return;
    const updated = { ...editingTestDraft, questionsCount: editingTestDraft.questions.length };
    setAdminTests(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    setEditingTestDraft(updated);
    return updated;
  };

  const adminDeleteTest = (id) => {
    setAdminTests(prev => prev.filter(t => t.id !== id));
  };

  const adminToggleStatus = (id) => {
    setAdminTests(prev =>
      prev.map(t => (t.id === id ? { ...t, status: t.status === 'pending' ? 'locked' : 'pending' } : t))
    );
  };

  const updateDraftField = (field, value) => {
    setEditingTestDraft(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const adminOpenQuestionEditor = (question, idx) => {
    setEditingQuestion(
      question
        ? deepClone(question)
        : {
            id: genId(),
            question: '',
            explanation: '',
            correctAnswer: 'A',
            options: [
              { letter: 'A', text: '', weight: 0, category: '' },
              { letter: 'B', text: '', weight: 0, category: '' },
              { letter: 'C', text: '', weight: 0, category: '' },
              { letter: 'D', text: '', weight: 0, category: '' }
            ]
          }
    );
    setEditingQuestionIdx(idx);
    setShowQuestionModal(true);
  };

  const adminSaveQuestion = () => {
    if (!editingQuestion || !editingQuestion.question.trim()) {
      throw new Error('Question text cannot be empty.');
    }
    setEditingTestDraft(prev => {
      if (!prev) return prev;
      const questions = [...prev.questions];
      if (editingQuestionIdx === null || editingQuestionIdx === undefined) {
        questions.push(editingQuestion);
      } else {
        questions[editingQuestionIdx] = editingQuestion;
      }
      return { ...prev, questions };
    });
    setShowQuestionModal(false);
  };

  const adminDeleteQuestion = (idx) => {
    setEditingTestDraft(prev => (prev ? { ...prev, questions: prev.questions.filter((_, i) => i !== idx) } : prev));
  };

  const updateQField = (field, value) => {
    setEditingQuestion(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const updateOptField = (index, field, value) => {
    setEditingQuestion(prev => {
      if (!prev) return prev;
      const options = [...prev.options];
      options[index] = {
        ...options[index],
        [field]: field === 'weight' ? Number(value) : value
      };
      return { ...prev, options };
    });
  };

  const addOption = () => {
    if (!editingQuestion) return;
    if (editingQuestion.options.length >= 6) {
      throw new Error('Maximum 6 options.');
    }
    const letter = LETTERS[editingQuestion.options.length];
    setEditingQuestion(prev => ({
      ...prev,
      options: [...prev.options, { letter, text: '', weight: 0, category: '' }]
    }));
  };

  const removeOption = (index) => {
    if (!editingQuestion) return;
    if (editingQuestion.options.length <= 2) {
      throw new Error('Minimum 2 options required.');
    }
    setEditingQuestion(prev => {
      const options = prev.options
        .filter((_, idx) => idx !== index)
        .map((opt, idx) => ({ ...opt, letter: LETTERS[idx] }));
      return { ...prev, options };
    });
  };

  return (
    <AdminContext.Provider
      value={{
        adminTests,
        setAdminTests,
        adminActiveTab,
        setAdminActiveTab,
        editingTestDraft,
        setEditingTestDraft,
        showQuestionModal,
        setShowQuestionModal,
        editingQuestion,
        editingQuestionIdx,
        adminCreateNewTest,
        adminOpenTestEditor,
        adminSaveTest,
        adminDeleteTest,
        adminToggleStatus,
        updateDraftField,
        adminOpenQuestionEditor,
        adminSaveQuestion,
        adminDeleteQuestion,
        updateQField,
        updateOptField,
        addOption,
        removeOption
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
