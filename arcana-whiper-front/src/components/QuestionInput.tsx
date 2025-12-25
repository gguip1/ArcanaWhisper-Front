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
      {/* 별빛 배경 */}
      <div className="starfield" aria-hidden="true" />

      {/* 별똥별 */}
      <div className="shooting-stars" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* 뒤로가기 버튼 - 좌측 상단 고정 */}
      <button
        type="button"
        className="home-button"
        onClick={onCancel}
        title="뒤로"
        aria-label="홈으로 돌아가기"
      >
        <FaArrowLeft className="home-icon" />
      </button>

      {/* 메인 콘텐츠 - 열린 레이아웃 */}
      <main className="question-main">
        {/* 질문 프롬프트 */}
        <p className="question-prompt">무엇이 궁금하신가요?</p>

        {/* 질문 폼 */}
        <form onSubmit={handleSubmit} className="question-form">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="마음속 질문을 자유롭게 적어주세요..."
            className="question-textarea"
            maxLength={200}
            autoFocus
          />

          {/* 글자수 힌트 */}
          <div className="input-hint">
            <span className={question.length > 0 && question.length < 5 ? 'warning' : ''}>
              {question.length > 0 && question.length < 5
                ? '5글자 이상 입력해주세요'
                : `${question.length}/200`}
            </span>
          </div>

          {/* CTA 버튼 */}
          <button
            type="submit"
            className={`cta-button ${isValid ? '' : 'disabled'}`}
            disabled={!isValid}
          >
            <span>카드 선택하기</span>
            <FaArrowRight />
          </button>
        </form>
      </main>
    </div>
  );
};

export default QuestionInput;
