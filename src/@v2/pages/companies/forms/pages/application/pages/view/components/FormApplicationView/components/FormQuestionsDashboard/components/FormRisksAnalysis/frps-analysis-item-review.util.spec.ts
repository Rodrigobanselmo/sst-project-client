import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  findAnalysisItemReview,
  resolveAnalysisItemAnchor,
} from './frps-analysis-item-review.util';

test('fonte e recomendação com o mesmo catalogId não colidem', () => {
  const item = { catalogId: 'cat-1' };
  const source = resolveAnalysisItemAnchor(item, 'fontesGeradoras');
  const recommendation = resolveAnalysisItemAnchor(
    item,
    'medidasEngenhariaRecomendadas',
  );

  assert.equal(source, 'catalog:SOURCE:cat-1');
  assert.equal(recommendation, 'catalog:ENGINEERING_RECOMMENDATION:cat-1');
  assert.notEqual(source, recommendation);
});

test('reviewItemId tem precedência e o comentário continua no item depois da troca do nome', () => {
  const reviews = [
    {
      itemKind: 'SOURCE',
      itemAnchor: 'review:stable-source',
      acceptedBy: 4,
      acceptedByName: 'Ana',
      acceptedAt: '2026-10-06T12:00:00.000Z',
      comments: [
        {
          id: 'c1',
          body: 'Validar com o gestor',
          authorId: 4,
          authorName: 'Ana',
          createdAt: '2026-10-06T13:00:00.000Z',
        },
      ],
    },
  ];
  const renamed = {
    nome: 'Jornada alterada',
    catalogId: 'cat-1',
    reviewItemId: 'stable-source',
  };

  const review = findAnalysisItemReview(reviews, renamed, 'fontesGeradoras');
  assert.equal(review?.comments[0]?.body, 'Validar com o gestor');
  assert.equal(renamed.nome, 'Jornada alterada');
});

test('aceite localizado pela âncora não carrega estado de inventário', () => {
  const review = findAnalysisItemReview(
    [
      {
        itemKind: 'SOURCE',
        itemAnchor: 'catalog:SOURCE:cat-1',
        acceptedBy: 4,
        acceptedByName: 'Ana',
        acceptedAt: '2026-10-06T12:00:00.000Z',
        comments: [],
      },
    ],
    { catalogId: 'cat-1' },
    'fontesGeradoras',
  );

  assert.equal(review?.acceptedByName, 'Ana');
  assert.equal('existsInInventory' in (review ?? {}), false);
  assert.equal('existsInCatalog' in (review ?? {}), false);
});
