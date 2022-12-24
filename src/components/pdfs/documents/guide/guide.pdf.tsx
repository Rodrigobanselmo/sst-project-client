/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { Font, Image, Page, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';

import { daysShortArr } from 'core/hooks/useCalendar';
import { IExam } from 'core/interfaces/api/IExam';
import { IPdfGuideData } from 'core/interfaces/api/IPdfGuideData';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';
import { getCompanyName } from 'core/utils/helpers/companyName';
import {
  getAddressCity,
  getAddressMain,
  getContactPhone,
} from 'core/utils/helpers/getAddress';
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

export default function PdfGuidePage({ data }: { data: IPdfGuideData }) {
  const consultant = data.consultantCompany;
  const clinic = data?.clinicExam?.clinic;
  const complementary = data?.clinicComplementaryExams;

  const hasComplementary = complementary && complementary.length > 0;
  const hasClinic = clinic && clinic?.fantasy;

  const getScheduledText = (isScheduled?: boolean) =>
    isScheduled ? 'ordem agendada' : 'ordem de chegada';

  const getRangeText = (range: Record<string, string>, date: Date) => {
    const dayOfWeek = new Date(date).getDay() + 1;
    let timeOfWeekText = '';

    if (range)
      Object.entries(range)
        .sort(([a], [b]) => sortString(a, b))
        .forEach(([key, value], index) => {
          if (value && key.includes(`${dayOfWeek}-`)) {
            let beforeText = index % 2 == 0 ? ' e ' : ' às ';
            if (key.includes('-0')) beforeText = '';

            timeOfWeekText = timeOfWeekText + beforeText + value;
          }
        });
    // const rangeWeekDay = range[`${dayOfWeek}-`]

    return `${(
      daysShortArr[dayOfWeek] || ''
    ).toUpperCase()}: ${timeOfWeekText}`;
  };

  const getExamRangeTime = (
    isScheduled: boolean,
    range: Record<string, string>,
    date: Date,
  ) => {
    return `${getScheduledText(isScheduled)} > ${getRangeText(range, date)}`;
  };

  return (
    <Page style={sm.page}>
      {/* title */}
      <>
        <Text style={sm.header}>GUIA DE ENCAMINHAMENTO PARA EXAMES</Text>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
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
              src={consultant?.logoUrl + '?noCache=' + Math.random().toString()}
            />
          </View>
        </View>
      </>

      {/* 1 Table */}
      <View style={sm.mb}>
        <View style={sm.row}>
          <View style={[s.table1, { width: 100 }]}>
            <Text style={sm.label}>CPF:</Text>
            <Text style={sm.bodyB1}>{cpfMask.mask(data.cpf)}</Text>
          </View>
          <View style={[s.table1L, { flexGrow: 1 }]}>
            <Text style={sm.label}>Nome Completo:</Text>
            <Text style={sm.bodyB1}>{data.name}</Text>
          </View>
        </View>

        <View style={sm.row}>
          <View style={[s.table2, { width: 250 }]}>
            <Text style={sm.label}>Empresa:</Text>
            <Text style={sm.bodyB1}>{getCompanyName(data.company)}</Text>
          </View>
          <View style={[s.table2L, { flexGrow: 1 }]}>
            <Text style={sm.label}>Função:</Text>
            <Text style={sm.bodyB1}>{data?.hierarchy?.name}</Text>
          </View>
        </View>
      </View>

      {/* Complementary Exams */}
      {hasComplementary && (
        <>
          {/* Complementary */}
          <>
            {data.clinicComplementaryExams.map((examBlock) => {
              const examRecord: Record<
                string,
                (IExam & { dayRange: string })[]
              > = {};
              examBlock.exams.forEach((exam) => {
                const examData = {
                  ...exam,
                  dayRange: getExamRangeTime(
                    examBlock.isScheduled,
                    examBlock.scheduleRange,
                    examBlock.doneDate,
                  ),
                };

                if (!(examRecord as any)[examData.dayRange])
                  examRecord[examData.dayRange] = [];

                examRecord[examData.dayRange].push(examData);
              });

              return (
                <View style={sm.mb}>
                  {/* Header & Date*/}
                  <>
                    <View style={[s.table1, sm.darkRow]}>
                      <Text style={sm.h1}>Exames Complementares</Text>
                    </View>
                    <View style={[s.table2]}>
                      <Text style={sm.bodyB1}>
                        Data: {dateToString(examBlock.doneDate)}
                        &nbsp;&nbsp;&nbsp;&nbsp;Hora: {examBlock.time}
                        {/* &nbsp;&nbsp;&nbsp;&nbsp;Dia: ( */}
                        {/* {daysArr[dayjs(examBlock.doneDate).day()]}) */}
                      </Text>
                    </View>
                  </>

                  {/* CLINIC & Exams */}
                  <View style={[sm.row]}>
                    {/* Clinic */}
                    <View style={[s.table2, { flexGrow: 1, width: 330 }]}>
                      <Text style={sm.bodyB1}>{examBlock.clinic.fantasy}</Text>
                      <Text style={sm.body}>
                        {getAddressMain(examBlock.clinic.address)}
                      </Text>
                      <Text style={sm.body}>
                        {getAddressCity(examBlock.clinic.address)}
                      </Text>
                      {examBlock.clinic.contacts[0]?.phone && (
                        <Text style={sm.body}>
                          {getContactPhone(examBlock.clinic.contacts[0])}
                        </Text>
                      )}
                      {examBlock.clinic.contacts[0]?.email && (
                        <Text style={sm.body}>
                          Email: {examBlock.clinic.contacts[0].email}
                        </Text>
                      )}
                      {/* <Html>{html(exam.clinic.obs)}</Html> */}
                    </View>

                    {/* EXAMS */}
                    <View
                      style={[s.table2L, sm.pb4, { flexGrow: 1, width: 400 }]}
                    >
                      <Text style={[sm.bodyB1, sm.mb1]}>Exames:</Text>
                      {Object.entries(examRecord).map(([key, exams]) => {
                        return (
                          <View style={[sm.mb4]}>
                            <View style={[sm.row, sm.mb1]}>
                              <Text
                                style={{
                                  fontSize: 8,
                                  fontWeight: 'bold',
                                  marginRight: 1,
                                }}
                              >
                                ATENDIMENTO:{' '}
                              </Text>
                              <Text style={sm.body}>{key}</Text>
                            </View>
                            <View style={[sm.row, sm.wrap]}>
                              {exams.map((exam) => {
                                return (
                                  <Text
                                    style={[
                                      sm.body,
                                      sm.tBox,
                                      sm.mt2,
                                      sm.darkLightRow,
                                    ]}
                                  >
                                    {exam.name}
                                  </Text>
                                );
                              })}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}
          </>

          {/* Instructions */}
          <View style={[s.table1, sm.mb]}>
            <Text style={[sm.bodyB1, { marginBottom: 5 }]}>
              Orientações para a realização dos exames complementares:
            </Text>
            {data.exams.map((exam) => {
              if (exam.isAttendance) return null;
              return (
                <View style={{ marginBottom: 4 }}>
                  <View style={[sm.row]}>
                    <Text style={[sm.bodyBS, sm.bullet]}>•</Text>
                    <Text style={sm.bodyBS}>{exam.name}</Text>
                  </View>

                  <View>
                    {exam.instruction
                      .split('(//)')
                      .filter((i) => i)
                      .map((instruction) => {
                        return (
                          <View style={[sm.row]}>
                            <Text
                              style={[
                                sm.bodyB1,
                                sm.tBox,
                                sm.mt2,
                                sm.bulletDown,
                              ]}
                            >
                              {instruction}
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {hasComplementary && hasClinic && (
        <View style={[sm.dashedDivider, { marginTop: 5, marginBottom: 15 }]} />
      )}

      {/* Clinic Exams */}
      {hasClinic && (
        <>
          {/* Exams */}
          <View style={sm.mb}>
            {/* Header */}
            <View style={[s.table1, sm.darkRow]}>
              <Text style={sm.h1}>Exame Clínico</Text>
            </View>

            {/*  Clinic */}
            <View style={[s.table2, { flexGrow: 1 }]}>
              <Text style={[sm.title, { fontSize: 10, marginBottom: 5 }]}>
                Clínica Credenciada
              </Text>
              <Text style={sm.bodyB1}>{clinic?.fantasy}</Text>
              <Text style={sm.body}>{getAddressMain(clinic?.address)}</Text>
              <Text style={sm.body}>{getAddressCity(clinic?.address)}</Text>
              {clinic?.contacts[0]?.phone && (
                <Text style={sm.body}>
                  {getContactPhone(clinic?.contacts[0])}
                </Text>
              )}
              {clinic?.contacts[0]?.email && (
                <Text style={sm.body}>Email: {clinic?.contacts[0].email}</Text>
              )}
              {/* <Html>{html(exam.clinic.obs)}</Html> */}
              <View style={[sm.row, sm.mt5]}>
                <Text
                  style={{ fontSize: 8, fontWeight: 'bold', marginRight: 1 }}
                >
                  ATENDIMENTO:{' '}
                </Text>
                <Text style={sm.body}>
                  {getExamRangeTime(
                    data.clinicExam.isScheduled,
                    data.clinicExam.scheduleRange,
                    data.clinicExam.doneDate,
                  )}
                </Text>
              </View>
            </View>

            {/*  Date */}
            <View style={[sm.row]}>
              <View style={[s.table2, { flexGrow: 1 }]}>
                <Text style={sm.label}>Data:</Text>
                <Text style={sm.bodyB1}>
                  {dateToString(data.clinicExam.doneDate)}
                </Text>
                {/* {daysArr[dayjs(data.clinicExam.doneDate).day()]}) */}
              </View>
              <View style={[s.table2L, { flexGrow: 1 }]}>
                <Text style={sm.label}>Hora:</Text>
                <Text style={sm.bodyB1}>{data.clinicExam.time}</Text>
              </View>
              {data.clinicExam?.type && (
                <View style={[s.table2L, { flexGrow: 1 }]}>
                  <Text style={sm.label}>Exame:</Text>
                  <Text style={sm.bodyB1}>
                    {employeeExamTypeMap[data.clinicExam.type].content}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Complementary Instructions */}
          <View style={[s.table1, sm.mb]}>
            <Text style={[sm.bodyB1, { marginBottom: 5 }]}>
              Orientações para a realização dos exames médicos na Clínica
              Credenciada:
            </Text>
            {[
              {
                isAttendance: true,
                name: 'Para a realização dos exames médicos, deverão ser apresentados, obrigatoriamente, os seguintes documentos:',
                instruction:
                  'Guia de encaminhamento devidamente preenchida, com o carimbo do laboratório e data da coleta;(//)Documento oficial ou cópia autenticada que contenha o número do RG, CPF e foto que permita a identificação;(//)No caso de afastamento, por período igual ou superior a 30 dias, alta médica do INSS;',
              },
              ...(data.exams || []),
            ].map((exam) => {
              if (!exam.isAttendance || !exam.instruction) return null;
              return (
                <View style={{ marginBottom: 4 }}>
                  <View style={[sm.row, { marginBottom: 3 }]}>
                    <Text style={[sm.bodyB1, sm.bullet]}>•</Text>
                    <Text style={sm.bodyB1}>{exam.name}</Text>
                  </View>

                  <View>
                    {exam.instruction
                      .split('(//)')
                      .filter((i) => i)
                      .map((instruction) => {
                        return (
                          <View style={[sm.row, sm.bulletDown]}>
                            <Text style={[sm.bodyB1, sm.tBox, sm.mt2]}>
                              {instruction}
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[{ marginTop: 15 }]}>
            <Text style={[sm.authText, { marginBottom: 1 }]}>
              Autorização eletrônica via SimpleSST por: {data.user.email}{' '}
              {dateToString(dayjs().toDate())}{' '}
              {dateToTimeString(dayjs().toDate())}
            </Text>
            <Text style={[sm.authText, { marginBottom: 2 }]}>
              Autenticação: {data.user.id}
            </Text>
          </View>
        </>
      )}
    </Page>
  );
}
