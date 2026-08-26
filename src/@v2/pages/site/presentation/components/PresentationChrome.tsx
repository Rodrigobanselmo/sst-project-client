import Link from 'next/link';
import type { PresentationCardDefinition } from '../constants/presentation.constant';
import { PresentationShareMenu } from './PresentationShareMenu';

type PresentationChromeProps = {
  card: PresentationCardDefinition;
  cards: readonly PresentationCardDefinition[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoTo: (card: PresentationCardDefinition) => void;
};

export function PresentationChrome({
  card,
  cards,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onGoTo,
}: PresentationChromeProps) {
  return (
    <nav className="lp-pres-chrome" aria-label="Navegação da apresentação">
      <div className="lp-pres-chrome__cluster">
        <Link href="/site" className="lp-btn lp-btn--ghost-light lp-btn--compact">
          Voltar ao site
        </Link>
        <PresentationShareMenu card={card} />
      </div>

      <div className="lp-pres-chrome__cluster">
        <button
          type="button"
          className="lp-btn lp-btn--outline-light lp-btn--compact"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          Anterior
        </button>
        <div className="lp-pres-dots" role="tablist" aria-label="Cards da apresentação">
          {cards.map((item) => {
            const isCurrent = item.id === card.id;
            const isReady = item.status === 'ready';
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                className={`lp-pres-dot${isCurrent ? ' is-current' : ''}${isReady ? ' is-ready' : ''}`}
                aria-label={`${item.id} ${item.title}`}
                aria-selected={isCurrent}
                disabled={!isReady}
                onClick={() => onGoTo(item)}
              />
            );
          })}
        </div>
        <button
          type="button"
          className="lp-btn lp-btn--outline-light lp-btn--compact"
          onClick={onNext}
          disabled={!canGoNext}
        >
          Próximo
        </button>
      </div>

      <p className="lp-pres-chrome__status">
        {card.id} · {card.title}
        <span aria-hidden> / {cards.length}</span>
      </p>
    </nav>
  );
}
