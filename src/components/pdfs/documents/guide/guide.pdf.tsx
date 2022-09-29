/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import Html from 'react-pdf-html';

import { Document, Page, Text, View, Image, Font } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';
import { v4 } from 'uuid';

import { daysArr } from 'core/hooks/useCalendar';
import { IExam } from 'core/interfaces/api/IExam';
import { IGuideData } from 'core/interfaces/api/IGuideData';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';
import { getCompanyName } from 'core/utils/helpers/companyName';
import {
  getAddressCity,
  getAddressMain,
  getContactPhone,
} from 'core/utils/helpers/getAddress';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { s } from './styles';

const DraftToPdf = ({ data }: { data?: string }) => {
  // console.log('swq', data);
  // const draftToPdf = (data: string) => {
  //   third;
  // };

  if (!data) return null;
  return (
    <View>
      <Text>Section #1</Text>
    </View>
  );
};

const html = (data: string) => `
<html>
  <style>
    p {
      padding: 0px;
      font-size: 7px;
      margin:0px;
    }

    .break {
      margin:0px;
      color:white;
    }
  </style>
  <div>
  ${data
    .replaceAll('font-size: medium;font-family: Poppins, sans-serif;', '')
    .replaceAll(': ', ':')
    .replaceAll('<p></p>', '<p class="break"> - </p>')}  
  </div>
</html>
`;

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

export default function PdfGuide({ data }: { data: IGuideData }) {
  // console.log('lnw', guideData);
  const consultant = data.consultantCompany;
  const clinic = data?.clinicExam?.clinic;
  const complementary = data?.clinicComplementaryExams;

  const hasComplementary = complementary && complementary.length > 0;
  const hasClinic = clinic && clinic?.fantasy;

  return (
    <Document>
      <Page style={s.page}>
        {/* title */}
        <>
          <Text style={s.header}>GUIA DE ENCAMINHAMENTO PARA EXAMES</Text>
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            <View style={{ flexGrow: 1 }}>
              <Text style={s.title}>{consultant?.name}</Text>
            </View>
            <View style={{ flexGrow: 1 }}>
              <Image
                style={s.image}
                src={
                  consultant?.logoUrl + '?noCache=' + Math.random().toString()
                }
              />
            </View>
          </View>
        </>

        {/* 1 Table */}
        <View style={s.mb}>
          <View style={s.row}>
            <View style={[s.table1, { width: 100 }]}>
              <Text style={s.label}>CPF:</Text>
              <Text style={s.bodyB1}>{cpfMask.mask(data.cpf)}</Text>
            </View>
            <View style={[s.table1L, { flexGrow: 1 }]}>
              <Text style={s.label}>Nome Completo:</Text>
              <Text style={s.bodyB1}>{data.name}</Text>
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.table2, { width: 250 }]}>
              <Text style={s.label}>Empresa:</Text>
              <Text style={s.bodyB1}>{getCompanyName(data.company)}</Text>
            </View>
            <View style={[s.table2L, { flexGrow: 1 }]}>
              <Text style={s.label}>Função:</Text>
              <Text style={s.bodyB1}>{data?.hierarchy?.name}</Text>
            </View>
          </View>
        </View>

        {/* Complementary Exams */}
        {hasComplementary && (
          <>
            {/* Complementary */}
            <>
              {data.clinicComplementaryExams.map((examBlock) => (
                <View style={s.mb}>
                  {/* Header & Date*/}
                  <>
                    <View style={[s.table1, s.darkRow]}>
                      <Text style={s.h1}>Exames Complementares</Text>
                    </View>
                    <View style={[s.table2]}>
                      <Text style={s.bodyB1}>
                        Data: {dateToString(examBlock.doneDate)}
                        &nbsp;&nbsp;&nbsp;&nbsp;Hora: {examBlock.time}
                        {/* &nbsp;&nbsp;&nbsp;&nbsp;Dia: ( */}
                        {/* {daysArr[dayjs(examBlock.doneDate).day()]}) */}
                      </Text>
                    </View>
                  </>

                  {/* CLINIC & Exams */}
                  <View style={[s.row]}>
                    {/* Clinic */}
                    <View style={[s.table2, { flexGrow: 1, width: 400 }]}>
                      <Text style={s.bodyB1}>{examBlock.clinic.fantasy}</Text>
                      <Text style={s.body}>
                        {getAddressMain(examBlock.clinic.address)}
                      </Text>
                      <Text style={s.body}>
                        {getAddressCity(examBlock.clinic.address)}
                      </Text>
                      {examBlock.clinic.contacts[0]?.phone && (
                        <Text style={s.body}>
                          {getContactPhone(examBlock.clinic.contacts[0])}
                        </Text>
                      )}
                      {examBlock.clinic.contacts[0]?.email && (
                        <Text style={s.body}>
                          Email: {examBlock.clinic.contacts[0].email}
                        </Text>
                      )}
                      {/* <Html>{html(exam.clinic.obs)}</Html> */}
                    </View>

                    {/* EXAMS */}
                    <View
                      style={[s.table2L, s.pb4, { flexGrow: 1, width: 330 }]}
                    >
                      <Text style={[s.bodyB1, s.mb1]}>Exames:</Text>
                      <View style={[s.row, s.wrap]}>
                        {examBlock.exams.map((exam) => {
                          return (
                            <Text
                              style={[s.body, s.tBox, s.mt2, s.darkLightRow]}
                            >
                              {exam.name.slice(0, 10)}
                            </Text>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </>

            {/* Instructions */}
            <View style={[s.table1, s.mb]}>
              <Text style={[s.bodyB1, { marginBottom: 5 }]}>
                Orientações para a realização dos exames complementares:
              </Text>
              {data.exams.map((exam) => {
                if (exam.isAttendance) return null;
                return (
                  <View style={{ marginBottom: 4 }}>
                    <View style={[s.row]}>
                      <Text style={[s.bodyBS, s.bullet]}>•</Text>
                      <Text style={s.bodyBS}>{exam.name}</Text>
                    </View>

                    <View>
                      {exam.instruction
                        .split('(//)')
                        .filter((i) => i)
                        .map((instruction) => {
                          return (
                            <View style={[s.row]}>
                              <Text
                                style={[s.bodyB1, s.tBox, s.mt2, s.bulletDown]}
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
          <View style={[s.dashedDivider, { marginTop: 5, marginBottom: 15 }]} />
        )}

        {/* Clinic Exams */}
        {hasClinic && (
          <>
            {/* Exams */}
            <View style={s.mb}>
              {/* Header */}
              <View style={[s.table1, s.darkRow]}>
                <Text style={s.h1}>Exame Clínico</Text>
              </View>

              {/*  Clinic */}
              <View style={[s.table2, { flexGrow: 1 }]}>
                <Text style={[s.title, { fontSize: 10, marginBottom: 5 }]}>
                  Clínica Credenciada
                </Text>
                <Text style={s.bodyB1}>{clinic?.fantasy}</Text>
                <Text style={s.body}>{getAddressMain(clinic?.address)}</Text>
                <Text style={s.body}>{getAddressCity(clinic?.address)}</Text>
                {clinic?.contacts[0]?.phone && (
                  <Text style={s.body}>
                    {getContactPhone(clinic?.contacts[0])}
                  </Text>
                )}
                {clinic?.contacts[0]?.email && (
                  <Text style={s.body}>Email: {clinic?.contacts[0].email}</Text>
                )}
                {/* <Html>{html(exam.clinic.obs)}</Html> */}
              </View>

              {/*  Date */}
              <View style={[s.row]}>
                <View style={[s.table2, { flexGrow: 1 }]}>
                  <Text style={s.label}>Data:</Text>
                  <Text style={s.bodyB1}>
                    {dateToString(data.clinicExam.doneDate)}
                  </Text>
                  {/* {daysArr[dayjs(data.clinicExam.doneDate).day()]}) */}
                </View>
                <View style={[s.table2L, { flexGrow: 1 }]}>
                  <Text style={s.label}>Hora:</Text>
                  <Text style={s.bodyB1}>{data.clinicExam.time}</Text>
                </View>
                {data.clinicExam?.type && (
                  <View style={[s.table2L, { flexGrow: 1 }]}>
                    <Text style={s.label}>Exame:</Text>
                    <Text style={s.bodyB1}>
                      {employeeExamTypeMap[data.clinicExam.type].content}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Complementary Instructions */}
            <View style={[s.table1, s.mb]}>
              <Text style={[s.bodyB1, { marginBottom: 5 }]}>
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
                    <View style={[s.row, { marginBottom: 3 }]}>
                      <Text style={[s.bodyB1, s.bullet]}>•</Text>
                      <Text style={s.bodyB1}>{exam.name}</Text>
                    </View>

                    <View>
                      {exam.instruction
                        .split('(//)')
                        .filter((i) => i)
                        .map((instruction) => {
                          return (
                            <View style={[s.row, s.bulletDown]}>
                              <Text style={[s.bodyB1, s.tBox, s.mt2]}>
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
              <Text style={[s.authText, { marginBottom: 1 }]}>
                Autorização eletrônica via SimpleSST por: {data.user.email}{' '}
                {dateToString(dayjs().toDate())}{' '}
                {dateToTimeString(dayjs().toDate())}
              </Text>
              <Text style={[s.authText, { marginBottom: 2 }]}>
                Autenticação: {data.user.id}
              </Text>
            </View>
          </>
        )}
      </Page>
    </Document>
  );
}
