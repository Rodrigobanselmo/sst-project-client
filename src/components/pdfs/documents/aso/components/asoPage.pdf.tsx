/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { Font, Image, Page, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import {
  asoExamTypeList,
  employeeToAsoExamTypeTranslate,
} from 'project/enum/employee-exam-history-type.enum';
import {
  RiskEnum,
  riskEnumList,
  RiskMap as riskMap,
} from 'project/enum/risk.enums';
import { sexTypeMap } from 'project/enum/sex.enums';

import { IPdfAsoData } from 'core/interfaces/api/IPdfAsoData';
import { arrayChunks } from 'core/utils/arrays/arrayChunks';
import {
  getAddressCityState,
  getAddressMain,
} from 'core/utils/helpers/getAddress';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { sm } from '../../../styles/main.pdf.styles';
import { s } from '../styles';

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

export default function PdfAsoPage({
  data,
  withDate,
}: {
  data: IPdfAsoData;
  withDate?: boolean;
}) {
  const aso = data;
  const employee = aso?.employee;
  const sector = aso?.sector;
  const consultant = aso.consultantCompany;
  const actualCompany = aso.actualCompany;
  const clinicExam = aso?.clinicExam;
  const clinic = clinicExam.clinic;
  const clinicDoc = clinic?.doctorResponsible;
  // const prontuario = data.prontuario;
  // const clinic = clinicExam?.clinic;
  const complementary = aso.doneExams.filter((e) => !e.exam.isAttendance);
  const doctorResponsible = aso.doctorResponsible;
  const risks = aso?.risks;
  const isNoExams = !complementary?.length;
  const protocols = aso?.protocols;
  const isNoProtocols = !protocols?.length;
  const isNoRisk = !risks?.filter((r) => r.riskFactor.type != RiskEnum.OUTROS)
    .length;

  return (
    <Page style={s.page}>
      <View>
        {/* title */}
        <View style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              style={s.image}
              src={consultant?.logoUrl + '?noCache=' + Math.random().toString()}
            />
            <Text style={[s.header]}>
              A.S.O - ATESTADO DE SAÚDE OCUPACIONAL
            </Text>
            <View
              style={[
                s.image,
                { justifyContent: 'center', alignItems: 'flex-end' },
              ]}
            >
              <Text style={[s.title]}>{clinicExam.id}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexGrow: 1, textAlign: 'center' }}>
              <Text style={s.title}>{consultant?.name} </Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Text style={sm.subTitle}>
                  {getAddressMain(consultant?.address)}{' '}
                </Text>
                <Text style={sm.subTitle}>
                  {getAddressCityState(consultant?.address)}{' '}
                </Text>
                <Text style={sm.subTitle}>
                  -{' '}
                  {consultant?.contacts?.[0]?.phone ||
                    consultant?.contacts?.[0]?.email}
                </Text>
              </View>
            </View>
          </View>
          <View style={[{ flexGrow: 1, marginTop: 5 }]}>
            <Text style={[sm.subTitle, { fontSize: 8 }]}>
              Clínica credenciada: {clinic?.fantasy} -{' '}
              {getAddressCityState(clinic?.address)} -{' '}
              {consultant?.contacts?.[0]?.phone ||
                consultant?.contacts?.[0]?.email}
            </Text>
            {clinicDoc && (
              <Text style={sm.subTitle2}>
                Responsável técnico: {clinicDoc.name} - {clinicDoc.councilId}{' '}
                {clinicDoc.councilUF}
              </Text>
            )}
          </View>
        </View>

        {/* 1 Empresa */}
        <>
          <View style={[sm.mb, s.tableBox]}>
            <View style={[s.tableH, sm.darkRow]}>
              <Text style={sm.bodyBS}>Empresa</Text>
            </View>

            <View style={sm.row}>
              <View style={[s.table1, { flexGrow: 1 }]}>
                <Text style={s.label}>Razão social:</Text>
                <Text style={s.tableBody}>{actualCompany.name}</Text>
              </View>
            </View>

            <View style={sm.row}>
              <View style={[s.table2, { width: 150 }]}>
                <Text style={s.label}>CNPJ:</Text>
                <Text style={s.tableBody}>
                  {cnpjMask.mask(actualCompany.cnpj)}
                </Text>
              </View>
              {/* <View style={[s.table1, { flexGrow: 1 }]}>
                <Text style={s.label}>Fantasia:</Text>
                <Text style={s.tableBody}>
                  {getCompanyName(actualCompany, { onlyFantasy: true })}
                </Text>
              </View> */}
            </View>
          </View>
        </>

        {/* 1 Funcionario */}
        <View style={[sm.mb, s.tableBox]}>
          <View style={[s.tableH, sm.darkRow]}>
            <Text style={sm.bodyBS}>Funcionário</Text>
          </View>

          <View style={sm.row}>
            <View style={[s.table1, { marginRight: 10 }]}>
              <Text style={s.label}>Nome Completo:</Text>
              <Text style={s.tableBody}>{employee.name}</Text>
            </View>
            <View style={[s.table1, { marginRight: 10 }]}>
              <Text style={s.label}>CPF:</Text>
              <Text style={s.tableBody}>{cpfMask.mask(employee.cpf)}</Text>
            </View>
            {employee.rg && (
              <View style={[s.table1]}>
                <Text style={s.label}>RG:</Text>
                <Text style={s.tableBody}>{employee.rg}</Text>
              </View>
            )}
          </View>

          <View style={sm.row}>
            <View style={[s.table1, { marginRight: 10 }]}>
              <Text style={s.label}>Sexo:</Text>
              <Text style={s.tableBody}>
                {sexTypeMap[employee?.sex]?.name || '-'}
              </Text>
            </View>
            <View style={[s.table1]}>
              <Text style={s.label}>Data de nascimento:</Text>
              <Text style={s.tableBody}>
                {employee.birthday &&
                  dayjs(employee.birthday).format('DD/MM/YYYY')}{' '}
                {employee.birthday &&
                  `(${dayjs().diff(employee.birthday, 'y')} anos)`}
              </Text>
            </View>
          </View>

          <View style={sm.row}>
            <View style={[s.table1, { marginRight: 10 }]}>
              <Text style={s.label}>Setor:</Text>
              <Text style={s.tableBody}>{sector?.name}</Text>
            </View>
            <View style={[s.table1]}>
              <Text style={s.label}>Função:</Text>
              <Text style={s.tableBody}>{employee?.hierarchy?.name}</Text>
            </View>
          </View>
        </View>

        {/* 1 data exam */}
        <>
          <View style={[s.tableBox, sm.mb]}>
            <View style={[s.tableH, sm.darkRow]}>
              <Text style={sm.bodyBS}>Exame clínico</Text>
            </View>
            <View style={sm.row}>
              <View style={[s.table1, { flexGrow: 1 }]}>
                <Text style={s.bodyB1}>
                  PORTARIA Nº 24 DE 29/12/94 E Nº 8 DE 08/05/96 - NR7
                </Text>
              </View>
            </View>
            <View style={[sm.row, sm.mb2, sm.mt4]}>
              <View
                style={[
                  s.table1,
                  {
                    flexGrow: 1,
                    paddingTop: 0,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
              >
                {asoExamTypeList.map((examType) => {
                  return (
                    <View style={[sm.row]}>
                      <Text style={[sm.body, { paddingRight: 5 }]}>
                        {examType.content}
                      </Text>
                      <View style={[s.checkbox]}>
                        <Text style={[sm.bodyBS]}>
                          {examType.value ==
                            employeeToAsoExamTypeTranslate[
                              clinicExam.examType
                            ] && 'X'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
          {/* <View style={[sm.row, sm.mb]}>
            <View style={[s.table1, { flexGrow: 1 }]}>
              <Text style={sm.label}>
                Data exame clínico:{' '}
                <Text style={s.bodyB1}>
                  {dayjs(clinicExam.doneDate).format('DD/MM/YYYY')}
                </Text>
              </Text>
            </View>
          </View> */}
        </>

        {/* 1 Doctor */}
        <>
          <View style={[sm.mb, s.tableBox]}>
            <View style={[s.tableH, sm.darkRow]}>
              <Text style={sm.bodyBS}>Médico responsável do PCMSO</Text>
            </View>

            <View style={sm.row}>
              <View style={[s.table1, { flexGrow: 1 }]}>
                <Text style={s.label}>Nome</Text>
                <Text style={s.tableBody}>{doctorResponsible.name}</Text>
              </View>
            </View>

            <View style={sm.row}>
              <View style={[s.table2, { width: 150 }]}>
                <Text style={s.label}>CRM:</Text>
                <Text style={s.tableBody}>
                  {doctorResponsible.councilId} {doctorResponsible.councilUF}
                </Text>
              </View>
            </View>
          </View>
        </>

        {/* 1 Riscos */}
        <>
          <View style={[sm.mb, s.tableBox]}>
            <View style={[s.tableH, sm.darkRow]}>
              <Text style={sm.bodyBS}>Riscos ocupacionais</Text>
            </View>

            {!isNoRisk &&
              riskEnumList.map((type) => {
                const risksAll = risks.filter((r) => r.riskFactor.type == type);
                if (!risksAll.length) return null;
                return (
                  <View style={[sm.row, s.table1, sm.wrap, { paddingTop: 0 }]}>
                    <Text style={[s.riskText, sm.body]}>
                      {riskMap[type].name}
                    </Text>
                    <Text style={[s.tBox, sm.body, { width: 450 }]}>
                      {risksAll
                        .map((risk) => {
                          return risk.riskFactor.name;
                        })
                        .join(', ')}
                    </Text>
                  </View>
                );
              })}

            {isNoRisk && (
              <View style={[sm.row, s.table1]}>
                <Text style={[s.bodyB1]}>Ausência de risco específico</Text>
              </View>
            )}
          </View>
        </>

        {/* 1 Exams */}
        {!isNoExams && (
          <>
            <View style={[sm.mb, s.tableBox]}>
              <View style={[s.tableH, sm.darkRow]}>
                <Text style={sm.bodyBS}>Exames Realizados</Text>
              </View>

              <View style={{ padding: 6, paddingVertical: 2 }}>
                {arrayChunks(complementary, 2).map(([e1, e2]) => {
                  return (
                    <View style={[sm.row, { justifyContent: 'space-between' }]}>
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

        {/* 1 Protocols */}
        {!isNoProtocols && (
          <>
            <View style={[sm.mb, s.tableBox]}>
              <View style={[s.tableH, sm.attentionRow]}>
                <Text style={sm.bodyBS}>Atividades Específicas</Text>
              </View>
              {protocols?.map((protocol) => {
                return (
                  <View
                    style={[
                      sm.row,
                      s.table1,
                      sm.wrap,
                      { paddingTop: 0, justifyContent: 'space-between' },
                    ]}
                  >
                    <Text style={[s.protoText, sm.body]}>
                      {protocol.protocol.name}
                    </Text>
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
                );
              })}
            </View>
          </>
        )}

        {/* 1 Conclusion */}
        {
          <>
            <View style={[sm.mb, s.tableBox]}>
              <View style={[s.tableH, sm.attentionRow]}>
                <Text style={sm.bodyBS}>Conclusão Médica</Text>
              </View>

              <View
                style={[
                  sm.row,
                  s.table1,
                  sm.wrap,
                  { paddingTop: 0, justifyContent: 'space-between' },
                ]}
              >
                <Text style={[s.protoText, sm.body]}>
                  Foi submetido aos exames acima, encontrando-se:
                </Text>
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
          </>
        }

        {/* 1 obs */}
        <View
          style={[
            s.table1,
            sm.mb,
            // s.tableBox,
            // { height: 70, flexDirection: 'row', alignItems: 'flex-start' },
          ]}
        >
          <Text style={[s.bodyB1, { marginBottom: 5 }]}>Observações:</Text>
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
                    Data Exame Clínico:{' '}
                    {dayjs(clinicExam.doneDate).format('DD/MM/YYYY')}
                  </Text>
                ) : (
                  <Text style={s.signText}>
                    Data Exame Clínico: ___/___/____
                  </Text>
                )}
              </View>
              <Text style={[s.signText, sm.ta]}>
                Carimbo e Assinatura do Médico
              </Text>
              <Text style={[s.signText, sm.ta]}>Examinador com CRM</Text>
            </View>
            <View style={[s.signatureBox]}>
              <View style={[s.signBox]}>
                {withDate && clinicExam.doneDate ? (
                  <Text style={s.signText}>
                    Data: {dayjs(clinicExam.doneDate).format('DD/MM/YYYY')}
                  </Text>
                ) : (
                  <Text style={s.signText}>Data: ___/___/____</Text>
                )}
                <Text style={s.signText}>
                  Declaro ter recebido a 2ª via deste ASO
                </Text>
              </View>
              <Text style={[s.signText, sm.ta]}>Assinatura do funcionário</Text>
              <Text style={[s.signText, sm.ta]}>{employee.name}</Text>
            </View>
          </View>
        </>
      </View>
    </Page>
  );
}
