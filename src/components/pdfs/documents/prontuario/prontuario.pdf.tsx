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

import { sm } from '../../styles/main.pdf.styles';
import { s } from './styles';

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

const PdfQuestionsComponent = (questions: IProntuarioQuestion[]) => {
  return (
    <View>
      {questions.map((q) => {
        const hasTextAnswer = typeof q?.textAnswer === 'string';
        return (
          <View style={[sm.row, { flexGrow: 1 }]}>
            <View style={[sm.row, { width: 170 }]}>
              <Text style={[sm.body, { marginRight: 5 }]}>{q.name}</Text>
            </View>

            <View style={[sm.row, { minWidth: 102 }]}>
              {q.objectiveAnswer?.map((oA) => {
                return (
                  <View style={[sm.row, { paddingRight: 17 }]}>
                    <View style={[s.checkbox, { marginRight: 3 }]}></View>
                    <Text style={[s.body]}>{oA}</Text>
                  </View>
                );
              })}
            </View>

            {hasTextAnswer && (
              <View style={[sm.row, { flexGrow: 1 }]}>
                <View style={[sm.row]}>
                  {q.textAnswer && (
                    <Text style={[s.body, { marginRight: 3 }]}>
                      {q.textAnswer}
                    </Text>
                  )}
                  <View style={[s.line]}>e</View>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default function PdfProntuarioPage({
  data,
}: {
  data: IPdfProntuarioData;
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

  return (
    <Page style={s.page}>
      <View>
        <View>
          {/* title */}
          <>
            <View style={{ flexDirection: 'row', marginBottom: 3 }}>
              <View style={{ flexGrow: 1 }}>
                <Text style={sm.title}>
                  {consultant?.name}{' '}
                  <Text style={sm.subTitle}>
                    {consultant?.contacts?.[0]?.phone};{' '}
                    {consultant?.contacts?.[0]?.email}
                  </Text>
                </Text>
              </View>
              <View style={{ flexGrow: 1 }}>
                <Image
                  style={sm.image}
                  src={
                    consultant?.logoUrl + '?noCache=' + Math.random().toString()
                  }
                />
              </View>
            </View>
            <Text style={[s.header]}>
              PRONTUÁRIO CLÍNICO INDIVIDUAL - PCMSO - NR7
            </Text>
          </>

          {/* 1 Funcionario */}
          <>
            <View style={[sm.mb2, s.tableBox]}>
              <View style={[s.tableH, sm.darkRow]}>
                <Text style={s.bodyB}>Funcionário</Text>
              </View>

              {/* - Funcionario - dados */}
              <View style={sm.row}>
                <View style={[s.table1, s.mrl]}>
                  <Text style={s.label}>Nome Completo:</Text>
                  <Text style={s.tableBody}>{employee.name}</Text>
                </View>

                <View style={[s.table1, s.mrl]}>
                  <Text style={s.label}>CPF:</Text>
                  <Text style={s.tableBody}>{cpfMask.mask(employee.cpf)}</Text>
                </View>

                <View style={[s.table1, s.mrl]}>
                  <Text style={s.label}>Sexo:</Text>
                  <Text style={s.tableBody}>
                    {sexTypeMap[employee?.sex]?.name || ''}
                  </Text>
                </View>
                <View style={[s.table1, { flexGrow: 1 }]}>
                  <Text style={s.label}>Data de nascimento:</Text>
                  <Text style={s.tableBody}>
                    {employee.birthday &&
                      dayjs(employee.birthday).format('DD/MM/YYYY')}
                  </Text>
                </View>
              </View>

              {/* - Funcionario - empresa */}
              <View style={sm.row}>
                <View style={[s.table1]}>
                  <Text style={s.label}>Empresa:</Text>
                  <Text style={s.tableBody}>
                    {getCompanyName(actualCompany).slice(0, 40)} -{' '}
                    {cnpjMask.mask(actualCompany.cnpj)}
                  </Text>
                </View>

                <View style={[s.table1]}>
                  <Text style={s.label}>Função:</Text>
                  <Text style={s.tableBody}>
                    {employee?.hierarchy?.name.slice(0, 30)}
                  </Text>
                </View>
              </View>

              <View style={sm.row}>
                <View style={[s.table1, s.mrl]}>
                  <Text style={s.label}>Tipo de Exame:</Text>
                  <Text style={s.tableBody}>
                    {employeeExamTypeMap[
                      employeeToAsoExamTypeTranslate[clinicExam.examType]
                    ]?.content || ''}
                  </Text>
                </View>

                <View style={[s.table1, { flexGrow: 1 }]}>
                  <Text style={s.label}>Data Exame:</Text>
                  <Text style={s.tableBody}>
                    {prontuario.admissionDate &&
                      dayjs(prontuario.admissionDate).format('DD/MM/YYYY')}
                  </Text>
                </View>
              </View>

              <View style={sm.row}>
                <View style={[s.table1, s.mrl, { alignItems: 'flex-start' }]}>
                  <Text style={[s.label, s.mrl, sm.mt1]}>
                    RISCOS OCUPACIONAIS:
                  </Text>
                  {!isNoRisk && (
                    <Text style={[s.body, sm.mb1, { width: 450 }]}>
                      {allRisks
                        .map((risk) => {
                          return risk.riskFactor.name;
                        })
                        .join(', ')}
                    </Text>
                  )}
                  {isNoRisk && (
                    <Text style={[s.body, { width: 420 }]}>
                      Ausência de risco específico
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </>

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
                {/* <Text style={s.body}>Data: {dayjs().format('DD/MM/YYYY')}</Text> */}
                <Text style={s.body}>Data: ___/___/____</Text>
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

          {/* 1 Conclusion */}
          <>
            <View style={[sm.mb4, sm.mt12, s.tableBox]}>
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
              <Text style={[sm.bodyB1, { marginBottom: 5 }]}>Observações:</Text>
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
                <Text style={s.signText}>
                  Data: ___/___/____
                  {/* Data: {dayjs().format('DD/MM/YYYY')} */}
                </Text>
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
