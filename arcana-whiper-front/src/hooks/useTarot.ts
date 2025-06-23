import { useContext } from 'react';
import { TarotContext } from '../contexts/TarotContext';

export const useTarot = () => {
  const context = useContext(TarotContext);
  if (context === undefined) {
    throw new Error('useTarot must be used within a TarotProvider');
  }
  return context;
};
