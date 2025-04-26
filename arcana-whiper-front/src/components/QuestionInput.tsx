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
    // 입장 애니메이션 효과
    setTimeout(() => setAnimateIn(true), 100);
    
    // 질문 유효성 검사 (최소 5자)
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
        <h1 className="question-title">운명에 질문하세요</h1>
        <p className="question-subtitle">타로 카드가 당신의 질문에 답할 준비가 되어있습니다</p>
        
        <form onSubmit={handleSubmit} className="question-form">
          <div className="textarea-wrapper">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="타로에게 묻고 싶은 질문을 입력하세요..."
              className="question-textarea"
              maxLength={200}
              autoFocus
            />
            <div className="character-count">
              <span className={question.length < 5 ? "warning" : ""}>
                {question.length}/200
                {question.length < 5 && question.length > 0 && " (최소 5자)"}
              </span>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              type="button" 
              className="back-button" 
              onClick={onCancel}
            >
              <FaArrowLeft /> 돌아가기
            </button>
            <button 
              type="submit" 
              className={`continue-button ${isValid ? '' : 'disabled'}`} 
              disabled={!isValid}
            >
              카드 선택하기 <FaArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionInput;
