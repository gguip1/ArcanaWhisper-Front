import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import '../styles/QuestionInput.css';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  onCancel: () => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmit, onCancel }) => {
  const [question, setQuestion] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [animateIn, setAnimateIn] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
    setIsValid(question.trim().length >= 5);
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(question.trim());
    }
  };

  return (
    <div className={`question-container ${animateIn ? 'active' : ''}`}>
      <div className="mystical-background">
        <div className="stars"></div>
        <div className="moon"></div>
      </div>

      <div className="question-card">
        <h1 className="question-title">타로에게 질문하기</h1>
        <p className="question-subtitle">마음속에 품고 있던 질문을 입력해주세요</p>

        <form onSubmit={handleSubmit} className="question-form">
          <div className="textarea-wrapper">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 나의 연애운은 어떨까요?"
              className="question-textarea"
              maxLength={200}
              autoFocus
            />
            <div className="character-count">
              <span className={question.length < 5 ? "warning" : ""}>
                {question.length}/200
                {question.length < 5 && question.length > 0 && ' (질문은 최소 5글자 이상 입력해주세요.)'}
              </span>
            </div>
          </div>

          <div className="action-buttons">
            <button
              type="button"
              className="back-button"
              onClick={onCancel}
            >
              <FaArrowLeft /> 취소
            </button>
            <button
              type="submit"
              className={`continue-button ${isValid ? '' : 'disabled'}`}
              disabled={!isValid}
            >
              질문 완료 <FaArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionInput;
