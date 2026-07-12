import { RecTypeEnum } from 'project/enum/recType.enum';
import { StatusEnum } from 'project/enum/status.enum';

import {
  calculateControlMeasuresWeight,
  calculateSuggestedResidualProbability,
  isResidualProbabilityEmpty,
  resolveResidualProbabilityAfterRecChange,
  shouldAutoApplySuggestedResidual,
} from './calculateSuggestedResidualProbability.util';

const epi = { recType: RecTypeEnum.EPI };
const adm = { recType: RecTypeEnum.ADM };
const eng = { recType: RecTypeEnum.ENG };

describe('calculateSuggestedResidualProbability.util', () => {
  describe('calculateSuggestedResidualProbability', () => {
    it('cenário 1: 1 EPI com P real 3 → redução 0 → sugerida 3', () => {
      expect(calculateSuggestedResidualProbability(3, [epi])).toBe(3);
      expect(calculateControlMeasuresWeight([epi])).toBe(0.25);
    });

    it('cenário 2: 4 EPIs com P real 3 → redução 1 → sugerida 2', () => {
      const recs = [epi, epi, epi, epi];
      expect(calculateControlMeasuresWeight(recs)).toBe(1);
      expect(calculateSuggestedResidualProbability(3, recs)).toBe(2);
    });

    it('cenário 3: 2 administrativas com P real 3 → redução 1 → sugerida 2', () => {
      const recs = [adm, adm];
      expect(calculateControlMeasuresWeight(recs)).toBe(1);
      expect(calculateSuggestedResidualProbability(3, recs)).toBe(2);
    });

    it('cenário 4: 1 engenharia com P real 3 → redução 1 → sugerida 2', () => {
      expect(calculateControlMeasuresWeight([eng])).toBe(1.25);
      expect(calculateSuggestedResidualProbability(3, [eng])).toBe(2);
    });

    it('cenário 5: 1 eng + 1 adm + 1 epi com P real 3 → redução 2 → sugerida 1', () => {
      const recs = [eng, adm, epi];
      expect(calculateControlMeasuresWeight(recs)).toBe(2);
      expect(calculateSuggestedResidualProbability(3, recs)).toBe(1);
    });

    it('cenário 6: 1 eng + 3 epis com P real 5 → redução 2 → sugerida 3', () => {
      const recs = [eng, epi, epi, epi];
      expect(calculateControlMeasuresWeight(recs)).toBe(2);
      expect(calculateSuggestedResidualProbability(5, recs)).toBe(3);
    });

    it('cenário 7: residual nunca menor que 1', () => {
      const many = [eng, eng, eng, eng, eng, eng];
      expect(calculateSuggestedResidualProbability(2, many)).toBe(1);
    });

    it('nunca sugere residual maior que a probabilidade real', () => {
      expect(calculateSuggestedResidualProbability(4, [epi])).toBe(4);
      expect(calculateSuggestedResidualProbability(1, [])).toBeUndefined();
    });

    it('sem recomendações ativas não sugere', () => {
      expect(calculateSuggestedResidualProbability(3, [])).toBeUndefined();
      expect(calculateSuggestedResidualProbability(3, undefined)).toBeUndefined();
      expect(
        calculateSuggestedResidualProbability(3, [
          { recType: RecTypeEnum.EPI, status: StatusEnum.INACTIVE },
        ]),
      ).toBeUndefined();
    });

    it('recomendação sem tipo conta peso 0', () => {
      expect(
        calculateControlMeasuresWeight([{ recType: null }, eng]),
      ).toBe(1.25);
      expect(
        calculateSuggestedResidualProbability(3, [{ recType: undefined }]),
      ).toBe(3);
    });

    it('probabilidade real inválida não sugere', () => {
      expect(calculateSuggestedResidualProbability(0, [eng])).toBeUndefined();
      expect(calculateSuggestedResidualProbability(7, [eng])).toBeUndefined();
      expect(
        calculateSuggestedResidualProbability(undefined, [eng]),
      ).toBeUndefined();
    });
  });

  describe('shouldAutoApplySuggestedResidual / resolveResidualProbabilityAfterRecChange', () => {
    it('cenário 8: remover medida recalcula (auto) e sobe a residual sugerida', () => {
      const previous = [eng, epi];
      const next = [epi];
      // peso 1.5 → floor 1 → residual 2; após remover eng: peso 0.25 → residual 3
      expect(calculateSuggestedResidualProbability(3, previous)).toBe(2);
      expect(
        resolveResidualProbabilityAfterRecChange({
          realProbability: 3,
          currentResidual: 2,
          previousRecommendations: previous,
          nextRecommendations: next,
        }),
      ).toBe(3);
    });

    it('cenário 9: alterar EPI → Engenharia aumenta a redução', () => {
      const previous = [epi];
      const next = [eng];
      expect(calculateSuggestedResidualProbability(3, previous)).toBe(3);
      expect(calculateSuggestedResidualProbability(3, next)).toBe(2);
    });

    it('cenário 10: residual manual não é sobrescrita', () => {
      expect(shouldAutoApplySuggestedResidual(1, 2)).toBe(false);
      expect(
        resolveResidualProbabilityAfterRecChange({
          realProbability: 3,
          currentResidual: 1,
          previousRecommendations: [epi],
          nextRecommendations: [epi, eng],
        }),
      ).toBeUndefined();
    });

    it('sem recs restantes limpa residual para 0', () => {
      expect(
        resolveResidualProbabilityAfterRecChange({
          realProbability: 3,
          currentResidual: 2,
          previousRecommendations: [eng],
          nextRecommendations: [],
        }),
      ).toBe(0);
    });

    it('residual vazia recebe sugestão automaticamente', () => {
      expect(isResidualProbabilityEmpty(0)).toBe(true);
      expect(isResidualProbabilityEmpty(undefined)).toBe(true);
      expect(shouldAutoApplySuggestedResidual(0, undefined)).toBe(true);
      expect(
        resolveResidualProbabilityAfterRecChange({
          realProbability: 3,
          currentResidual: 0,
          previousRecommendations: [],
          nextRecommendations: [eng],
        }),
      ).toBe(2);
    });
  });
});
