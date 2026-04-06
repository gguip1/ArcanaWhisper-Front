import { useNavigate } from 'react-router-dom';
import QuestionInput from '../components/QuestionInput';
import { useTarot } from '../contexts/TarotContext';

const QuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setQuestion } = useTarot();

  const handleSubmit = (question: string) => {
    setQuestion(question);
    navigate('/cards');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <QuestionInput
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default QuestionPage;
