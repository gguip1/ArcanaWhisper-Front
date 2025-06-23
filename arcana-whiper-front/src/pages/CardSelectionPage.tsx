import React from 'react';
import CardSelection from '../components/CardSelection';
import { MAX_CARDS } from '../constants';

const CardSelectionPage: React.FC = () => {
  return (
    <CardSelection
      selectedCards={[]}
      onCardSelect={() => {}}
      maxCards={MAX_CARDS}
      onResetCards={() => {}}
      onRequestReading={() => {}}
      onGoHome={() => {}}
      onReQuestion={() => {}}
      question=""
    />
  );
};

export default CardSelectionPage;
