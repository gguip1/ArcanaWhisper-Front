import { useState, useMemo, useEffect } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaLink,
  FaComment,
  FaShareAlt
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { HistoryItem } from '../services/historyService';
import { shuffleCards } from '../data/tarotData';
import TarotResultCard from './TarotResultCard';
import { createShareLink, getShareUrl } from '../services/shareService';
import { shareToKakao, canShareToKakao, initKakao } from '../services/kakaoService';

interface TarotHistoryItemProps {
  item: HistoryItem;
}

const TarotHistoryItem: React.FC<TarotHistoryItemProps> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(item.is_shared); // 로컬 공유 상태

  // 카카오 SDK 미리 초기화
  useEffect(() => {
    if (canShareToKakao()) {
      initKakao();
    }
  }, []);

  // 날짜 포맷팅 (한국어, KST 타임존)
  const formattedDate = useMemo(() => {
    try {
      // 서버가 UTC 시간을 타임존 정보 없이 보내는 경우 'Z' 추가
      let dateStr = item.created_at;
      if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
        dateStr += 'Z';
      }
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Seoul'
      }).format(date);
    } catch {
      return item.created_at; // 포맷팅 실패 시 원본 문자열 반환
    }
  }, [item.created_at]);
  
  // 선택한 카드 정보 가져오기 - useMemo로 최적화
  const selectedCards = useMemo(() => {
    const allCards = shuffleCards();
    return item.cards.cards.map((cardNumber, idx) => {
      const card = allCards.find(c => c.number === cardNumber);
      return card ? {
        ...card,
        reversed: item.cards.reversed ? item.cards.reversed[idx] : false
      } : undefined;
    }).filter(card => card !== undefined);
  }, [item.cards]);
  
  // 확장 토글
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // 공유 ID 가져오기 또는 생성
  const getOrCreateShareId = async (): Promise<string> => {
    if (shareId) return shareId;

    // 백엔드 API에서 history_id를 아직 반환하지 않는 경우 처리
    if (!item.history_id) {
      throw new Error('이 리딩은 아직 공유할 수 없습니다. 새로운 리딩부터 공유 가능합니다.');
    }

    const newShareId = await createShareLink(item.history_id);
    setShareId(newShareId);
    return newShareId;
  };

  // 링크 복사 처리
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    setShareError(null);

    try {
      const id = await getOrCreateShareId();
      const shareUrl = getShareUrl(id);
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setIsShared(true); // 공유 상태 즉시 반영
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('링크 복사 실패:', error);
      setShareError(error instanceof Error ? error.message : '링크 복사에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 카카오톡 공유 처리
  const handleKakaoShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    setShareError(null);

    try {
      const id = await getOrCreateShareId();
      const shareUrl = getShareUrl(id);
      shareToKakao(shareUrl, item.question);
      setIsShared(true); // 공유 상태 즉시 반영
    } catch (error) {
      console.error('카카오톡 공유 실패:', error);
      setShareError(error instanceof Error ? error.message : '카카오톡 공유에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`history-item ${expanded ? 'expanded' : ''}`}>
      <div className="history-item-header" onClick={toggleExpand}>
        <div className="history-item-main">
          <div className="history-item-question">{item.question}</div>
          <div className="history-item-meta">
            <span className="history-item-date">
              <FaClock className="date-icon" />
              {formattedDate}
            </span>
            {isShared && (
              <span className="history-item-shared">
                <FaShareAlt className="shared-icon" />
                공유됨
              </span>
            )}
          </div>
        </div>
        <span className="expand-indicator">
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>
      
      {expanded && (
        <div className="history-item-details">
          <div className="history-cards">
            {selectedCards.map((card, idx) => card && (
              <div key={card.number} className="history-card-wrapper">
                <TarotResultCard
                  name={card.name}
                  number={card.number}
                  position={['첫 번째 카드', '두 번째 카드', '세 번째 카드'][idx]}
                  reversed={card.reversed}
                />
              </div>
            ))}
          </div>

          <div className="history-result">
            <ReactMarkdown>{item.result}</ReactMarkdown>
          </div>

          {/* 공유 버튼 - history_id가 있을 때만 표시 */}
          {item.history_id && (
            <div className="history-share-section">
              <div className="history-share-buttons">
                <button
                  className="history-share-btn link-btn"
                  onClick={handleCopyLink}
                  disabled={isLoading}
                  aria-label="링크 복사"
                >
                  <FaLink />
                  <span>{copied ? '복사됨' : '링크 복사'}</span>
                </button>
                {canShareToKakao() && (
                  <button
                    className="history-share-btn kakao-btn"
                    onClick={handleKakaoShare}
                    disabled={isLoading}
                    aria-label="카카오톡 공유"
                  >
                    <FaComment />
                    <span>카카오톡</span>
                  </button>
                )}
              </div>
              {shareError && (
                <div className="history-share-error">{shareError}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TarotHistoryItem;
