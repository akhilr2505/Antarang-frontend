import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, ArrowLeft, Save, ListOrdered, PlusCircle, HelpCircle, Pencil, Trash2, X, Info } from 'lucide-react';
import { useAdmin } from '../../../hooks/useAdmin';
import { useToast } from '../../../hooks/useToast';
import { ROUTES } from '../../../config/routes';

export const TestEditorPage = () => {
  const {
    editingTestDraft,
    showQuestionModal,
    setShowQuestionModal,
    editingQuestion,
    editingQuestionIdx,
    adminSaveTest,
    updateDraftField,
    adminOpenQuestionEditor,
    adminSaveQuestion,
    adminDeleteQuestion,
    updateQField,
    updateOptField,
    addOption,
    removeOption
  } = useAdmin();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!editingTestDraft) {
    navigate(ROUTES.ADMIN_TESTS);
    return null;
  }

  const handleSaveTest = () => {
    const updated = adminSaveTest();
    if (updated) {
      showToast(`"${updated.title}" saved successfully.`);
    }
  };

  const handleSaveQuestion = () => {
    try {
      adminSaveQuestion();
      showToast('Question saved. Click "Save Test" to persist.');
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDeleteQuestion = (idx) => {
    if (window.confirm('Delete this question?')) {
      adminDeleteQuestion(idx);
      showToast('Question deleted.');
    }
  };

  const handleAddOpt = () => {
    try {
      addOption();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleRemoveOpt = (oi) => {
    try {
      removeOption(oi);
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <main className="main-wrapper slide-up">
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary-green)', fontWeight: 600, padding: 0 }}
          onClick={() => navigate(ROUTES.ADMIN_TESTS)}
        >
          Tests
        </button>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-dark-text)', fontWeight: 600 }}>
          {editingTestDraft.title || 'New Test'}
        </span>
      </div>

      <div className="admin-editor-grid">
        {/* Test Meta Editor Card */}
        <div>
          <div className="admin-editor-card">
            <div className="admin-editor-card-header">
              <FileText size={18} color="var(--color-primary-green)" />
              <h3>Test Details</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Test Title</label>
              <input
                className="form-input"
                style={{ paddingLeft: '16px' }}
                type="text"
                value={editingTestDraft.title}
                onChange={e => updateDraftField('title', e.target.value)}
                placeholder="e.g. Interests"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={editingTestDraft.description}
                onChange={e => updateDraftField('description', e.target.value)}
                placeholder="Describe what this test measures..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  type="text"
                  value={editingTestDraft.duration}
                  onChange={e => updateDraftField('duration', e.target.value)}
                  placeholder="e.g. 15 mins"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select"
                  value={editingTestDraft.difficulty}
                  onChange={e => updateDraftField('difficulty', e.target.value)}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Assessment Type</label>
                <select
                  className="form-select"
                  value={editingTestDraft.type}
                  onChange={e => updateDraftField('type', e.target.value)}
                >
                  <option value="aptitude">Aptitude</option>
                  <option value="personality">Personality / RIASEC</option>
                  <option value="values">Values</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Status</label>
                <select
                  className="form-select"
                  value={editingTestDraft.status}
                  onChange={e => updateDraftField('status', e.target.value)}
                >
                  <option value="pending">Active (Pending)</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Card Accent</label>
                <select
                  className="form-select"
                  value={editingTestDraft.accentClass}
                  onChange={e => updateDraftField('accentClass', e.target.value)}
                >
                  <option value="primary-accent">Green (Primary)</option>
                  <option value="secondary-accent">Purple (Secondary)</option>
                  <option value="accent-purple">Purple Dark</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Card Icon</label>
                <select
                  className="form-select"
                  value={editingTestDraft.iconName}
                  onChange={e => updateDraftField('iconName', e.target.value)}
                >
                  <option value="BrainCircuit">Brain Circuit</option>
                  <option value="Compass">Compass</option>
                  <option value="Award">Award</option>
                </select>
              </div>
            </div>

            <div className="admin-save-bar">
              <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate(ROUTES.ADMIN_TESTS)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={handleSaveTest}>
                <Save size={16} /> Save Test
              </button>
            </div>
          </div>
        </div>

        {/* Questions List Card */}
        <div>
          <div className="admin-editor-card">
            <div className="admin-editor-card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ListOrdered size={18} color="var(--color-primary-green)" />
                <h3>
                  Questions <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)', fontSize: '14px' }}>({editingTestDraft.questions.length})</span>
                </h3>
              </div>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }} onClick={() => adminOpenQuestionEditor(null, null)}>
                <PlusCircle size={14} /> Add Question
              </button>
            </div>

            {editingTestDraft.questions.length === 0 ? (
              <div className="empty-questions-state">
                <HelpCircle size={40} color="var(--color-border-light)" />
                <p>No questions yet. Click "Add Question" to get started.</p>
              </div>
            ) : (
              <div className="questions-editor-list">
                {editingTestDraft.questions.map((q, idx) => (
                  <div className="question-editor-card" key={q.id || idx}>
                    <div className="question-editor-num">Q{idx + 1}</div>
                    <div className="question-editor-body">
                      <p className="question-editor-text">
                        {q.question || <em style={{ color: 'var(--color-text-subtle)' }}>No question text</em>}
                      </p>
                      <div className="question-editor-meta">
                        <span>{q.options.length} options</span>
                        {q.correctAnswer && <span>· Correct: <strong>{q.correctAnswer}</strong></span>}
                      </div>
                      <div className="question-editor-options-preview">
                        {q.options.map(o => (
                          <span key={o.letter} className="option-preview-chip">
                            <strong>{o.letter}.</strong> {o.text.length > 28 ? o.text.slice(0, 28) + '…' : o.text || '—'}
                            {o.weight > 0 && <em> (w:{o.weight})</em>}
                            {o.category && <em> [{o.category}]</em>}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="question-editor-actions">
                      <button className="admin-action-btn edit" onClick={() => adminOpenQuestionEditor(q, idx)}>
                        <Pencil size={13} />
                      </button>
                      <button className="admin-action-btn delete" onClick={() => handleDeleteQuestion(idx)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUESTION EDITOR MODAL OVERLAY */}
      {showQuestionModal && editingQuestion && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowQuestionModal(false); }}>
          <div className="modal-card slide-up">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HelpCircle size={20} color="var(--color-primary-green)" />
                <h3>{editingQuestionIdx !== null && editingQuestionIdx !== undefined ? `Edit Question ${editingQuestionIdx + 1}` : 'Add New Question'}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowQuestionModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Question Text <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={editingQuestion.question}
                  onChange={e => updateQField('question', e.target.value)}
                  placeholder="Enter the question that students will see..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Explanation (shown after answer)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={e => updateQField('explanation', e.target.value)}
                  placeholder="Explain why the correct answer is right..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Correct Answer</label>
                  <select
                    className="form-select"
                    value={editingQuestion.correctAnswer}
                    onChange={e => updateQField('correctAnswer', e.target.value)}
                  >
                    {editingQuestion.options.map(o => <option key={o.letter} value={o.letter}>Option {o.letter}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={13} color="var(--color-text-subtle)" /> Field Guide
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '10px', background: '#f8fafc', borderRadius: '8px', lineHeight: 1.6 }}>
                    <strong>Weight:</strong> score added when chosen<br />
                    <strong>Category:</strong> RIASEC code (R/I/A/S/E/C)
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Answer Options</label>
                  <button className="btn btn-outline" style={{ width: 'auto', padding: '6px 14px', fontSize: '12px' }} onClick={handleAddOpt}>
                    <PlusCircle size={13} /> Add Option
                  </button>
                </div>
                <div className="options-editor-list">
                  {editingQuestion.options.map((opt, oi) => (
                    <div className="option-editor-row" key={oi}>
                      <div className="option-editor-letter">{opt.letter}</div>
                      <input
                        className="form-input option-editor-text"
                        style={{ paddingLeft: '12px' }}
                        type="text"
                        value={opt.text}
                        onChange={e => updateOptField(oi, 'text', e.target.value)}
                        placeholder={`Option ${opt.letter} text...`}
                      />
                      <div className="option-editor-extras">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>Weight</label>
                          <input
                            className="form-input"
                            style={{ paddingLeft: '10px', width: '70px', textAlign: 'center' }}
                            type="number"
                            min={0}
                            max={10}
                            value={opt.weight ?? 0}
                            onChange={e => updateOptField(oi, 'weight', e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>Category</label>
                          <input
                            className="form-input"
                            style={{ paddingLeft: '10px', width: '70px', textAlign: 'center' }}
                            type="text"
                            value={opt.category || ''}
                            onChange={e => updateOptField(oi, 'category', e.target.value)}
                            placeholder="R/I/A…"
                            maxLength={2}
                          />
                        </div>
                      </div>
                      <button className="admin-action-btn delete" style={{ flexShrink: 0 }} onClick={() => handleRemoveOpt(oi)} title="Remove option">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setShowQuestionModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={handleSaveQuestion}>
                <Save size={16} /> Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
