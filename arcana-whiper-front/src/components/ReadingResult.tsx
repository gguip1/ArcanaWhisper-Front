import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaHome, FaSyncAlt } from 'react-icons/fa';
// import { FaHome, FaSyncAlt, FaFilePdf } from 'react-icons/fa';
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';

interface ReadingResultProps {
  markdown: string;
  onNewReading: () => void;
  onGoHome: () => void;
}

const ReadingResult: React.FC<ReadingResultProps> = ({ 
  markdown, 
  onNewReading,
  onGoHome 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // const handleExportPDF = async () => {
  //   if (contentRef.current) {
  //     const canvas = await html2canvas(contentRef.current);
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF();
  //     const imgWidth = 190;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  //     pdf.save('reading-result.pdf');
  //   }
  // };

  // 홈 버튼 클릭 효과 처리
  const handleHomeButtonClick = () => {
    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
      homeButton.classList.add('clicked');
      
      // 클릭 효과 후 홈으로 이동
      onGoHome();
    }
  };

  return (
    <div className="reading-result-container">
      {/* 홈으로 돌아가는 버튼 추가 */}
      <button 
        className="home-button"
        onClick={handleHomeButtonClick}
        title="홈으로 돌아가기"
        aria-label="홈으로 돌아가기"
      >
        <FaHome className="home-icon" />
        <span className="home-text">홈</span>
      </button>

      <div className="reading-header">
        <h1 className="reading-title">타로 카드 해석</h1>
      </div>
      
      <div className="reading-content" ref={contentRef}>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
      
      <div className="reading-actions">
        <button 
          className="reading-action-btn primary-action" 
          onClick={onNewReading}
        >
          <FaSyncAlt /> <span className="btn-text">다른 카드 뽑기</span>
        </button>
        {/* <button 
          className="reading-action-btn secondary-action pdf-button" 
          onClick={handleExportPDF}
        >
          <FaFilePdf /> <span className="btn-text">PDF로 저장</span>
        </button> */}
        <button 
          className="reading-action-btn tertiary-action" 
          onClick={onGoHome}
        >
          <FaHome /> <span className="btn-text">홈으로</span>
        </button>
      </div>
    </div>
  );
};

export default ReadingResult;
