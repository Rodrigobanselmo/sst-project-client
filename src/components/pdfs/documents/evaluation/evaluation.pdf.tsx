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
import { PdfEmployeeComponent } from '../prontuario/components/employeeComponent.pdf';
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
        return (
          <View style={[{ flexGrow: 1, marginTop: 5 }]}>
            <View style={[sm.row, { flexGrow: 1 }]}>
              <View style={[sm.row]}>
                <Text style={[sm.body, { marginRight: 5 }]}>{q.name}:</Text>
              </View>
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
            </View>
            {[1, 2, 3, 4, 5].map(() => {
              return (
                <View style={[sm.row, { flexGrow: 1, marginBottom: 2 }]}>
                  <View style={[sm.row]}>
                    <View style={[s.line]}>e</View>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

export default function PdfEvaluationPage({
  data,
}: {
  data: IPdfProntuarioData;
}) {
  const prontuario = data;
  const questions = prontuario.questions || [];
  const employee = prontuario.employee;
  const consultant = prontuario.consultantCompany;
  const doctorResponsible = prontuario.doctorResponsible;

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
              <View style={{ flexGrow: 1, maxHeight: 30 }}>
                <Image
                  style={sm.image}
                  src={
                    consultant?.logoUrl + '?noCache=' + Math.random().toString()
                  }
                />
              </View>
            </View>
            <Text style={[s.header]}>PRONTUÁRIO CLÍNICO INDIVIDUAL</Text>
          </>

          {/* 1 Funcionario */}
          <PdfEmployeeComponent {...prontuario} />

          {/* 1 QUESTIONS */}
          <>
            <Text style={[s.header, { marginTop: 3, marginBottom: -3 }]}>
              Quesitos sob responsabilidade do médico Examinador
            </Text>
            <View>{PdfQuestionsComponent(questions)}</View>
          </>

          {/* 1 Conclusion */}
          <>
            <View style={[sm.mb4, sm.mt12, s.tableBox]}>
              <View style={[s.tableH, sm.attentionRow]}></View>
              <Text style={[s.header, { marginTop: 3, marginBottom: -3 }]}>
                CONCLUSÃO MÉDICA
              </Text>

              <View style={[s.boxCheck]}>
                <View style={[s.checkboxBig]}>
                  <Text style={[sm.body]}></Text>
                </View>
                <Text style={[sm.body, { marginLeft: 5 }]}>APTO</Text>
              </View>

              <>
                <View style={[s.boxCheck, { marginBottom: -3 }]}>
                  <View style={[s.checkboxBig]}>
                    <Text style={[sm.body]}></Text>
                  </View>
                  <View style={[sm.row]}>
                    <Text style={[sm.body, { marginLeft: 5 }]}>
                      APTO c/ RESTRIÇÕES:{' '}
                    </Text>
                  </View>
                  <View style={[sm.row, { flexGrow: 1 }]}>
                    <View style={[sm.row]}>
                      <View style={[s.line]}>e</View>
                    </View>
                  </View>
                </View>
                {[1, 2].map(() => {
                  return (
                    <View
                      style={[
                        sm.row,
                        {
                          flexGrow: 1,
                          marginBottom: 4,
                          marginLeft: 10,
                          marginRight: 10,
                        },
                      ]}
                    >
                      <View style={[sm.row]}>
                        <View style={[s.line]}>e</View>
                      </View>
                    </View>
                  );
                })}
              </>

              <View style={[s.boxCheck, { marginBottom: 10 }]}>
                <View style={[s.checkboxBig]}>
                  <Text style={[sm.body]}></Text>
                </View>
                <Text style={[sm.body, { marginLeft: 5 }]}>
                  INAPTO. Encaminhar ao INSS
                </Text>
              </View>
            </View>
          </>

          {/* 1 FIRST SIGN */}
          <View style={[sm.mt4]}>
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
