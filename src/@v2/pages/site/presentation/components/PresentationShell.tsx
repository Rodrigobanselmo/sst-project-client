import { useEffect } from 'react';
import { PresentationChrome } from './PresentationChrome';
import { PresentationDeck } from './PresentationDeck';
import { usePresentationDeck } from '../hooks/usePresentationDeck';

export function PresentationShell() {
  const deck = usePresentationDeck();

  useEffect(() => {
    document.documentElement.classList.add('lp-pres-lock');
    return () => document.documentElement.classList.remove('lp-pres-lock');
  }, []);

  return (
    <div className="lp lp-pres">
      <PresentationDeck card={deck.card} />
      <PresentationChrome
        card={deck.card}
        cards={deck.cards}
        canGoPrevious={deck.canGoPrevious}
        canGoNext={deck.canGoNext}
        onPrevious={deck.goPrevious}
        onNext={deck.goNext}
        onGoTo={deck.goTo}
      />
    </div>
  );
}
