import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  getAdjacentPresentationCards,
  getPresentationHref,
  PRESENTATION_CARDS,
  resolvePresentationCard,
  type PresentationCardDefinition,
} from '../constants/presentation.constant';

export function usePresentationDeck() {
  const router = useRouter();
  const card = useMemo(
    () => resolvePresentationCard(router.query.slug),
    [router.query.slug],
  );
  const adjacent = useMemo(() => getAdjacentPresentationCards(card), [card]);

  const goTo = useCallback(
    (nextCard: PresentationCardDefinition) => {
      if (nextCard.status !== 'ready') {
        return;
      }
      void router.push(getPresentationHref(nextCard), undefined, { shallow: true });
    },
    [router],
  );

  const goPrevious = useCallback(() => {
    if (adjacent.previous && adjacent.canGoPrevious) {
      goTo(adjacent.previous);
    }
  }, [adjacent.canGoPrevious, adjacent.previous, goTo]);

  const goNext = useCallback(() => {
    if (adjacent.next && adjacent.canGoNext) {
      goTo(adjacent.next);
    }
  }, [adjacent.canGoNext, adjacent.next, goTo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        goNext();
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goPrevious();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrevious]);

  return {
    card,
    cards: PRESENTATION_CARDS,
    ...adjacent,
    goTo,
    goPrevious,
    goNext,
  };
}
