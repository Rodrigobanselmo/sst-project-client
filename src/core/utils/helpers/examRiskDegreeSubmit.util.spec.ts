import {
  parseDegree,
  resolveExamRiskMinDegreesOnSubmit,
} from './examRiskDegreeSubmit.util';

describe('examRiskDegreeSubmit.util', () => {
  describe('parseDegree', () => {
    it('aceita number finito', () => {
      expect(parseDegree(2)).toBe(2);
    });

    it('aceita string numérica', () => {
      expect(parseDegree('2')).toBe(2);
    });

    it('retorna undefined para string vazia', () => {
      expect(parseDegree('')).toBeUndefined();
    });

    it('retorna undefined para null', () => {
      expect(parseDegree(null)).toBeUndefined();
    });

    it('retorna undefined para undefined', () => {
      expect(parseDegree(undefined)).toBeUndefined();
    });

    it('retorna undefined para string não numérica', () => {
      expect(parseDegree('abc')).toBeUndefined();
    });

    it('retorna undefined para number não finito', () => {
      expect(parseDegree(Number.NaN)).toBeUndefined();
      expect(parseDegree(Number.POSITIVE_INFINITY)).toBeUndefined();
    });
  });

  describe('resolveExamRiskMinDegreesOnSubmit', () => {
    it('usa valor numérico do form no qualitativo', () => {
      const result = resolveExamRiskMinDegreesOnSubmit({
        minRiskDegree: 2,
        storedMinRiskDegree: 1,
        risk: null,
      });

      expect(result.minRiskDegree).toBe(2);
    });

    it('limpa quantitativo quando risco não é quantitativo', () => {
      const result = resolveExamRiskMinDegreesOnSubmit({
        storedMinRiskDegree: 3,
        storedMinRiskDegreeQuantity: 4,
        risk: { type: 'ERG' as never, esocialCode: null } as never,
      });

      expect(result.minRiskDegree).toBe(3);
      expect(result.minRiskDegreeQuantity).toBeNull();
      expect(result.isQuantitativeApplicable).toBe(false);
    });
  });
});
