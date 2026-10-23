import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { recommendationInformationTooltip } from './exam-risk-overview.util';
import { ExamBlock } from './ExamRiskCoverageDetailDrawer';
jest.mock('@v2/services/medicine/company-exam-risk-coverage/hooks/useFetchCompanyExamRiskCoverageDetail', () => ({ useFetchCompanyExamRiskCoverageDetail: jest.fn() }));
it('filters technical notes and identifiers only in presentation, preserving useful notes and the original payload', () => {
 const notes = ['Regra ACTIVE escopo AGENT por CAS (cmvk5dxzr0000hpp4n0b3twh5)', 'Utilize a curadoria administrativa', 'Indicador biológico confirmado com exame confirmado (sem regra ACTIVE na Biblioteca)', 'Origem 0987413e-62a5-4950-a3fd-131e2e60b3dd', 'Periodicidade: 12 meses', 'Coleta ao final da jornada.', 'Coleta ao final da jornada.'];
 const original = [...notes]; const text = recommendationInformationTooltip(notes);
 expect(text).toBe('Recomendação da Biblioteca SimpleSST para este fator de risco. Coleta ao final da jornada.');
 expect(notes).toEqual(original);
});
it('has a short contextual fallback when no useful notes are available', () => {
 expect(recommendationInformationTooltip()).toBe('Recomendação da Biblioteca SimpleSST para este fator de risco.');
});
it('uses the filtered tooltip in card expansions while preserving the existing drawer presentation by default', () => {
 const exam = { examId: 197, examName: 'Proteína C', notes: ['Regra ACTIVE (rule)', 'Coleta ao final da jornada.'] } as any;
 const expanded = renderToStaticMarkup(React.createElement(ExamBlock, { exam, badge: 'Pendente', notesInTooltip: true }));
 expect(expanded).toContain('Coleta ao final da jornada.');
 expect(expanded).not.toContain('Regra ACTIVE');
 expect(expanded).not.toContain('Observações:');
 const drawer = renderToStaticMarkup(React.createElement(ExamBlock, { exam, badge: 'Pendente' }));
 expect(drawer).toContain('Observações:'); expect(drawer).toContain('Regra ACTIVE');
});
