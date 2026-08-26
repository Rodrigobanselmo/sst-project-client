import { saveAs } from 'file-saver';
import type { PresentationCardDefinition } from '../constants/presentation.constant';

export function getPresentationCardPngName(card: PresentationCardDefinition) {
  return `simplesst-apresentacao-card-${card.id}.png`;
}

export function getPresentationCardPngHref(card: PresentationCardDefinition) {
  return `/site/presentation/exports/${getPresentationCardPngName(card)}`;
}

export async function downloadPresentationCardPng(card: PresentationCardDefinition) {
  const fileName = getPresentationCardPngName(card);
  const response = await fetch(getPresentationCardPngHref(card));

  if (!response.ok) {
    throw new Error('Não foi possível baixar o card.');
  }

  saveAs(await response.blob(), fileName);
}
