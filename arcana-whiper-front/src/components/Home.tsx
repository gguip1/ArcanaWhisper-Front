import { useSEO } from '../hooks';

interface HomeProps {
  onStartReading: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartReading }) => {
  // SEO 설정
  useSEO({
    title: 'ArcanaWhisper - AI 타로 리딩으로 보는 운명의 메시지',
    description: 'AI 타로 리딩으로 당신의 운명을 알아보세요. 타로 카드와 인공지능이 속삭이는 운명의 메시지를 지금 확인하세요.',
    canonical: 'https://aitarot.site'
  });

  return (
    <div className="home">
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
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="home-main">
        <h1 className="home-title">ArcanaWhisper</h1>
        <p className="home-tagline">당신의 운명을 들어보세요</p>

        {/* 타로 카드 형태의 CTA */}
        <button className="cta-card" onClick={onStartReading}>
          <span className="cta-text">타로 리딩</span>
          <span className="cta-subtext">시작하기</span>
        </button>
      </main>

      {/* 하단 footer */}
      <footer className="home-footer">
        <p className="disclaimer">
          오락 및 자기 성찰 용도로만 제공됩니다
        </p>
      </footer>
    </div>
  );
};

export default Home;
