import React from 'react';

export const QuestionCard = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectOption,
  onPrev,
  onNext,
  onFinish
}) => {
  if (!question) return null;

  const isLastQuestion = questionIndex === totalQuestions - 1;
  const isAnswered = Boolean(selectedAnswer);

  return (
    <div className="test-question-box">
      <div className="question-meta">
        Question {questionIndex + 1} of {totalQuestions}
      </div>
      <div className="question-text">{question.question}</div>
      <div className="options-list">
        {question.options.map(opt => {
          const isSelected = selectedAnswer === opt.letter;
          return (
            <div
              className={`option-item-card ${isSelected ? 'selected' : ''}`}
              key={opt.letter}
              onClick={() => onSelectOption(question.id, opt.letter)}
            >
              <div className="option-letter-box">{opt.letter}</div>
              <div className="option-text-val">{opt.text}</div>
            </div>
          );
        })}
      </div>
      <div className="test-control-actions">
        <button
          className="btn btn-outline btn-navigation"
          onClick={onPrev}
          disabled={questionIndex === 0}
          style={{ opacity: questionIndex === 0 ? 0.5 : 1 }}
        >
          Previous
        </button>
        {isLastQuestion ? (
          <button
            className="btn btn-primary btn-navigation"
            onClick={onFinish}
            disabled={!isAnswered}
            style={{ opacity: !isAnswered ? 0.6 : 1 }}
          >
            Submit Test
          </button>
        ) : (
          <button
            className="btn btn-secondary btn-navigation"
            onClick={onNext}
            disabled={!isAnswered}
            style={{ opacity: !isAnswered ? 0.6 : 1 }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
