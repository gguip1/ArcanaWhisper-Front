import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { getUsageInfo, UsageInfo } from '../services/usageService';
import { useAuth } from '../hooks/useAuth';
import '../styles/QuestionInput.css';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  onCancel: () => void;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmit, onCancel }) => {
  const [question, setQuestion] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [animateIn, setAnimateIn] = useState<boolean>(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [usageLoading, setUsageLoading] = useState<boolean>(true);
  const { user, signIn } = useAuth();

  // 사용량 조회 (로그인/로그아웃 시 갱신)
  useEffect(() => {
    // 로그인 상태 변경 시 초기화 후 재조회
    setUsageLoading(true);
    setUsageInfo(null);

    const fetchUsage = async () => {
      try {
        const info = await getUsageInfo();
        setUsageInfo(info);
      } catch (error) {
        console.error('사용량 조회 실패:', error);
      } finally {
        setUsageLoading(false);
      }
    };
    fetchUsage();
  }, [user]);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
    setIsValid(question.trim().length >= 5);
  }, [question]);

  // 사용량 소진 여부
  const isUsageExhausted = usageInfo && usageInfo.remaining <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isUsageExhausted) {
      onSubmit(question.trim());
    }
  };

  // 로그인 버튼 클릭
  const handleLoginClick = async () => {
    try {
      await signIn('google');
    } catch (error) {
      // 로그인 취소 무시
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
            className={`cta-button ${isValid && !isUsageExhausted ? '' : 'disabled'}`}
            disabled={!isValid || !!isUsageExhausted}
          >
            <span>카드 선택하기</span>
            <FaArrowRight />
          </button>

          {/* 사용량 표시 */}
          {!usageLoading && usageInfo && (
            <div className={`usage-info ${isUsageExhausted ? 'exhausted' : ''}`}>
              {isUsageExhausted ? (
                <>
                  <span className="usage-exhausted-text">
                    오늘의 무료 이용 횟수를 모두 사용했습니다
                  </span>
                  {!user && (
                    <button
                      type="button"
                      className="usage-login-button"
                      onClick={handleLoginClick}
                    >
                      로그인하고 더 이용하기
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className="usage-count">
                    남은 횟수: {usageInfo.remaining}/{usageInfo.limit}
                  </span>
                  {!user && (
                    <span className="usage-login-hint">
                      로그인하면 더 많이 이용할 수 있어요
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default QuestionInput;
