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
    it('does not infer eligibility from chemical type or eSocial code', () => {
      const result = resolveExamRiskMinDegreesOnSubmit({
        minRiskDegreeQuantity: '2',
        storedMinRiskDegreeQuantity: 4,
        risk: { type: 'QUI', esocialCode: '02.01.001' } as never,
      });
      expect(result.isQuantitativeApplicable).toBe(false);
      expect(result.minRiskDegreeQuantity).toBe(4);
    });
    it('keeps null when an eligible value has not been supplied', () => {
      const result = resolveExamRiskMinDegreesOnSubmit({
        storedMinRiskDegreeQuantity: null,
        risk: { quantitativeLimitApplicable: true } as never,
      });
      expect(result.isQuantitativeApplicable).toBe(true);
      expect(result.minRiskDegreeQuantity).toBeNull();
    });
    it('edits an eligible threshold using the resolved API flag', () => {
      const result = resolveExamRiskMinDegreesOnSubmit({
        minRiskDegreeQuantity: '3',
        storedMinRiskDegreeQuantity: 4,
        risk: { quantitativeLimitApplicable: true } as never,
      });
      expect(result.minRiskDegreeQuantity).toBe(3);
    });

    it('usa valor numérico do form no qualitativo', () => {
      const result = resolveExamRiskMinDegreesOnSubmit({
        minRiskDegree: 2,
        storedMinRiskDegree: 1,
        risk: null,
      });

      expect(result.minRiskDegree).toBe(2);
    });

    it('preserva quantitativo quando risco não é elegível', () => {
      const result = resolveExamRiskMinDegreesOnSubmit({
        storedMinRiskDegree: 3,
        storedMinRiskDegreeQuantity: 4,
        risk: { type: 'ERG' as never, esocialCode: null } as never,
      });

      expect(result.minRiskDegree).toBe(3);
      expect(result.minRiskDegreeQuantity).toBe(4);
      expect(result.isQuantitativeApplicable).toBe(false);
    });
  });
});
