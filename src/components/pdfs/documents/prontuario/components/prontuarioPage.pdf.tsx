/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import Html from 'react-pdf-html';

import { Document, Page, Text, View, Image, Font } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import {
  employeeExamTypeMap,
  employeeToAsoExamTypeTranslate,
} from 'project/enum/employee-exam-history-type.enum';
import {
  RiskEnum,
  riskEnumList,
  RiskMap as riskMap,
} from 'project/enum/risk.enums';
import { sexTypeMap } from 'project/enum/sex.enums';
import { v4 } from 'uuid';

import { daysArr, daysShortArr } from 'core/hooks/useCalendar';
import { IExam } from 'core/interfaces/api/IExam';
import { IPdfGuideData } from 'core/interfaces/api/IPdfGuideData';
import { IPdfKitData } from 'core/interfaces/api/IPdfKitData';
import {
  IPdfProntuarioData,
  IProntuarioQuestion,
} from 'core/interfaces/api/IPdfProntuarioData';
import { arrayChunks } from 'core/utils/arrays/arrayChunks';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';
import { getCompanyName } from 'core/utils/helpers/companyName';
import {
  getAddressCity,
  getAddressMain,
  getContactPhone,
} from 'core/utils/helpers/getAddress';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { sortString } from 'core/utils/sorts/string.sort';

import { sm } from '../../../styles/main.pdf.styles';
import { s } from '../styles';
import { PdfEmployeeComponent } from './employeeComponent.pdf';
import { PdfQuestionsComponent } from './questionsComponent.pdf';

Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-500.ttf',
      fontWeight: 500, //medium
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 600, //semibold
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf',
      fontWeight: 700, //bold
    },
  ],
});

export default function PdfProntuarioPage({
  data,
  withDate,
}: {
  data: IPdfProntuarioData;
  withDate?: boolean;
}) {
  const prontuario = data;
  const examination = prontuario.examination || [];
  const questions = prontuario.questions || [];
  const employee = prontuario.employee;
  const sector = prontuario.sector;
  const consultant = prontuario.consultantCompany;
  const actualCompany = prontuario.actualCompany;
  const clinicExam = prontuario.clinicExam;
  const doctorResponsible = prontuario.doctorResponsible;
  const risks = prontuario.risks;
  const allRisks = risks?.filter((r) => r.riskFactor.type != RiskEnum.OUTROS);
  const isNoRisk = !allRisks.length;

  const complementary = prontuario?.doneExams?.filter(
    (e) => !e.exam.isAttendance,
  );

  const isNoExams = !complementary?.length || complementary.length > 12;

  return (
    <Page style={s.page}>
      <View>
        <View>
          {/* title */}
          <>
            <View style={{ flexDirection: 'row', marginBottom: 7 }}>
              <View style={{ flexGrow: 1, marginTop: 10 }}>
                <Text style={s.title}>{consultant?.name} </Text>
                <Text style={sm.subTitle}>
                  {consultant?.contacts?.[0]?.phone};{' '}
                  {consultant?.contacts?.[0]?.email}
                </Text>
              </View>
              <View style={{ flexGrow: 1, maxHeight: 30 }}>
                <Image
                  style={[s.image]}
                  src={
                    consultant?.logoUrl + '?noCache=' + Math.random().toString()
                  }
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexGrow: 1 }}></View>
              <Text style={[s.header]}>
                PRONTUÁRIO CLÍNICO INDIVIDUAL - PCMSO - NR7
              </Text>
              <View
                style={{
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}
              >
                <Text style={[s.header]}>{clinicExam.id}</Text>
              </View>
            </View>
          </>

          {/* 1 Funcionario */}
          <PdfEmployeeComponent {...prontuario} />

          {/* 1 QUESTIONS */}
          <>
            <Text style={[s.header, { marginBottom: 2 }]}>
              RESPONDA CORRETAMENTE AS QUESTÕES ABAIXO
            </Text>
            <View>{PdfQuestionsComponent(questions)}</View>
          </>

          {/* 1 FIRST SIGN */}
          <View style={[sm.mt4]}>
            <Text style={s.body}>
              Afirmo que as informações prestadas por mim são verdadeiras e
              assumo a responsabilidade pelas mesmas.
            </Text>
            <View style={[sm.row, sm.mt6, { flexGrow: 1 }]}>
              <View style={[sm.row, { width: 200 }]}></View>

              <View style={[sm.row, { minWidth: 70 }]}>
                {withDate && clinicExam.doneDate ? (
                  <Text style={s.body}>
                    Data: {dayjs(clinicExam.doneDate).format('DD/MM/YYYY')}
                  </Text>
                ) : (
                  <Text style={s.body}>Data: ___/___/____</Text>
                )}
              </View>

              <View style={[{ flexGrow: 1, alignItems: 'center' }]}>
                <View style={[s.line]}></View>
                <Text style={[s.body, { marginRight: 3 }]}>
                  {employee.name}
                </Text>
              </View>
            </View>
          </View>

          {/* 1 DIVIDER */}
          <View style={[s.dashedDivider]} />

          {/* 1 HEALTH */}
          <>
            <View style={[sm.mb2, s.tableBox]}>
              <View style={[s.tableH, sm.darkRow]}>
                <Text style={s.bodyB}>Dados físicos e sinais vitais</Text>
              </View>
            </View>
            <View style={[sm.row, { flexGrow: 1 }]}>
              {['Peso (Kg)', 'Altura (m)', 'IMC'].map((v) => (
                <View style={[sm.row, sm.mr2, { flexGrow: 1 }]}>
                  <View style={[sm.row]}>
                    <Text style={[s.body, { marginRight: 3 }]}>{v}</Text>
                    <View style={[s.line]}></View>
                  </View>
                </View>
              ))}
            </View>
            <View style={[sm.row, { flexGrow: 1 }]}>
              {[
                'P.A. Sistólica (mmHg)',
                'P.A. Diastólica (mmHg)',
                'Freq. Cardíaca (bpm)',
              ].map((v) => (
                <View style={[sm.row, sm.mr2, { flexGrow: 1 }]}>
                  <View style={[sm.row]}>
                    <Text style={[s.body, { marginRight: 3 }]}>{v}</Text>
                    <View style={[s.line]}></View>
                  </View>
                </View>
              ))}
            </View>
          </>

          {/* 1 Questions DOC */}
          <>
            <View style={[sm.mb2, s.tableBox, sm.mt8]}>
              <View style={[s.tableH, sm.darkRow]}>
                <Text style={s.bodyB}>
                  Quesitos sob responsabilidade do médico Examinador
                </Text>
              </View>
            </View>

            <View style={[sm.mt4]}>{PdfQuestionsComponent(examination)}</View>
          </>

          {/* 1 Exams */}
          {!isNoExams && (
            <>
              <View style={[sm.mt6, s.tableBox]}>
                <View style={[s.tableH, sm.darkRow]}>
                  <Text style={sm.bodyBS}>Exames Realizados</Text>
                </View>

                <View style={{ padding: 6, paddingVertical: 2 }}>
                  {arrayChunks(complementary, 2).map(([e1, e2]) => {
                    return (
                      <View
                        style={[sm.row, { justifyContent: 'space-between' }]}
                      >
                        <View style={[sm.row, { flexGrow: 1, maxWidth: 240 }]}>
                          <View style={[sm.row, { flexGrow: 1 }]}>
                            <View style={[s.checkbox, { marginRight: 5 }]}>
                              <Text style={[sm.bodyBS]}>
                                {e1.doneDate && 'X'}
                              </Text>
                            </View>
                            <Text style={[s.label, { overflow: 'hidden' }]}>
                              {e1.exam.name.slice(0, 48)}
                            </Text>
                          </View>
                          <View style={[sm.row, { width: 80 }]}>
                            <Text style={[sm.body, { marginRight: 5 }]}>
                              Data:
                            </Text>
                            <Text style={[sm.body]}>
                              {e1.doneDate
                                ? dayjs(e1.doneDate).format('DD/MM/YYYY')
                                : '___/___/____'}
                            </Text>
                          </View>
                        </View>
                        <View style={[sm.row, { flexGrow: 1 }]}>
                          {e2 && (
                            <>
                              <View style={[sm.row, { flexGrow: 1 }]}>
                                <View style={[s.checkbox, { marginRight: 5 }]}>
                                  <Text style={[sm.bodyBS]}>
                                    {e2.doneDate && 'X'}
                                  </Text>
                                </View>
                                <Text style={s.label}>
                                  {e2.exam.name.slice(0, 48)}
                                </Text>
                              </View>
                              <View style={[sm.row, { width: 80 }]}>
                                <Text style={[sm.body, { marginRight: 5 }]}>
                                  Data:
                                </Text>
                                <Text style={[sm.body]}>
                                  {e2.doneDate
                                    ? dayjs(e2.doneDate).format('DD/MM/YYYY')
                                    : '___/___/____'}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* 1 Conclusion */}
          <>
            <View style={[sm.mb4, sm.mt6, s.tableBox]}>
              <View style={[s.tableH, sm.attentionRow]}></View>

              <View
                style={[
                  sm.row,
                  s.table1,
                  sm.wrap,
                  { paddingTop: 0, justifyContent: 'space-between' },
                ]}
              >
                <Text style={[s.protoText, sm.body]}>Conclusão Médica:</Text>
                <View style={[sm.row, { width: 130 }]}>
                  <View style={[s.boxCheck]}>
                    <View style={[s.checkboxBig]}>
                      <Text style={[sm.body]}></Text>
                    </View>
                    <Text style={[sm.body, { marginLeft: 5 }]}>Apto</Text>
                  </View>

                  <View style={[s.boxCheck]}>
                    <View style={[s.checkboxBig]}>
                      <Text style={[sm.body]}></Text>
                    </View>
                    <Text style={[sm.body, { marginLeft: 5 }]}>Inapto</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 1 obs */}
            <View
              style={[
                s.table1,
                // s.tableBox,
                // { height: 70, flexDirection: 'row', alignItems: 'flex-start' },
              ]}
            >
              <Text style={[s.bodyB1, { marginBottom: 5 }]}>Observações:</Text>
            </View>
          </>
        </View>
      </View>

      <View>
        {/* Signatures */}
        <>
          <View
            style={[
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
              },
            ]}
          >
            <View style={[s.signatureBox]}>
              <View style={[s.signBox]}>
                {withDate && clinicExam.doneDate ? (
                  <Text style={s.signText}>
                    Data: {dayjs(clinicExam.doneDate).format('DD/MM/YYYY')}
                  </Text>
                ) : (
                  <Text style={s.signText}>Data: ___/___/____</Text>
                )}
              </View>
              <Text style={[s.signText, sm.ta]}>
                Carimbo e Assinatura do Médico
              </Text>
              <Text style={[s.signText, sm.ta]}>Examinador com CRM</Text>
            </View>
            <View style={[s.doctorRespBox]}>
              <Text style={[s.signHeader]}>Médico do Trabalho Responsável</Text>
              <Text style={[s.signText, sm.ta]}>{doctorResponsible.name}</Text>
              <Text style={[s.signText, sm.ta]}>
                CRM: {doctorResponsible.councilId} {doctorResponsible.councilUF}
              </Text>
            </View>
          </View>
        </>
      </View>
    </Page>
  );
}
