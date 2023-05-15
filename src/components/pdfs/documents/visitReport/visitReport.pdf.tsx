/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { formatCPF } from '@brazilian-utils/brazilian-utils';
import { Font, Image, Page, Text, View } from '@react-pdf/renderer';
import { PdfTableComponent } from 'components/pdfs/shared/components/table.pdf';
import { PdfTextLinesComponent } from 'components/pdfs/shared/components/textLines.pdf';
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

import palette from 'configs/theme/palette';

import { IPdfAsoData } from 'core/interfaces/api/IPdfAsoData';
import { IPdfVisitReportData } from 'core/interfaces/api/IPdfVisitReportData';
import { arrayChunks } from 'core/utils/arrays/arrayChunks';
import { dateToString } from 'core/utils/date/date-format';
import {
  getAddressCityState,
  getAddressMain,
} from 'core/utils/helpers/getAddress';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';

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

export default function PdfVisitReportPage({
  data,
  withDate,
}: {
  data: IPdfVisitReportData;
  withDate?: boolean;
}) {
  const consultant = data.consultantCompany;
  const actualCompany = data.actualCompany;

  return (
    <>
      <Page style={s.page}>
        <View>
          {/* title */}
          <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={s.image}
                src={
                  consultant?.logoUrl + '?noCache=' + Math.random().toString()
                }
              />

              <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                <View style={{ flexGrow: 1, justifyContent: 'center' }}>
                  <Text style={[s.title, { width: 440 }]}>
                    {consultant?.name}
                  </Text>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
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
            </View>

            <View
              style={{
                marginTop: 10,
                borderBottom: '0.5px solid #555',
              }}
            />

            <Text style={[s.header, { marginBottom: 20 }]}>
              Relatório de Visita Médica
            </Text>
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
                  <Text style={s.tableBody}>
                    {actualCompany.name.slice(0, 90)}
                  </Text>
                </View>
                <View style={[s.table2, { width: 150 }]}>
                  <Text style={s.label}>CNPJ:</Text>
                  <Text style={s.tableBody}>
                    {cnpjMask.mask(actualCompany.cnpj)}
                  </Text>
                </View>
              </View>

              <View style={sm.row}>
                <View style={[s.table2]}>
                  <Text style={s.label}>Endereço:</Text>
                  <Text style={s.tableBody}>
                    {getAddressMain(actualCompany?.address)}{' '}
                    {getAddressCityState(actualCompany?.address)}{' '}
                  </Text>
                </View>
              </View>

              <View style={sm.row}>
                {actualCompany?.contacts?.[0]?.phone && (
                  <View style={[s.table2]}>
                    <Text style={s.label}>Contato:</Text>
                    <Text style={s.tableBody}>
                      {actualCompany.contacts[0].phone}
                    </Text>
                  </View>
                )}

                {actualCompany?.contacts?.[0]?.email && (
                  <View style={[s.table2]}>
                    <Text style={s.label}>Email:</Text>
                    <Text style={s.tableBody}>
                      {actualCompany.contacts[0].email}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>

          {/* 1 EXAMES */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[s.header, { marginBottom: 30 }]}>
              Relação de exames solicitados
            </Text>

            <PdfTableComponent
              table={{
                rows: [
                  {
                    hideIfEmpty: true,
                    color: 'gray.100',
                    cells: [
                      { text: '' },
                      { text: 'Solicitados' },
                      { text: 'Realizados' },
                      { text: 'Não realizados' },
                    ],
                  },
                  {
                    cells: [
                      { text: 'Admissionais', color: 'gray.100' },
                      { text: String(data.sumExamsTypes['ADMI'] || 0) },
                      { text: '' },
                      { text: '' },
                    ],
                  },
                  {
                    cells: [
                      { text: 'Periódicos', color: 'gray.100' },
                      { text: String(data.sumExamsTypes['PERI'] || 0) },
                      { text: '' },
                      { text: '' },
                    ],
                  },
                  {
                    cells: [
                      { text: 'Demissionais', color: 'gray.100' },
                      { text: String(data.sumExamsTypes['DEMI'] || 0) },
                      { text: '' },
                      { text: '' },
                    ],
                  },
                  {
                    cells: [
                      { text: 'Retorno ao trabalho', color: 'gray.100' },
                      { text: String(data.sumExamsTypes['RETU'] || 0) },
                      { text: '' },
                      { text: '' },
                    ],
                  },
                  {
                    cells: [
                      { text: 'Mudança de Riscos', color: 'gray.100' },
                      {
                        text: String(
                          (data.sumExamsTypes['OFFI'] || 0) +
                            (data.sumExamsTypes['CHAN'] || 0),
                        ),
                      },
                      { text: '' },
                      { text: '' },
                    ],
                  },
                  {
                    cells: [
                      { text: 'TOTAL', color: 'gray.100' },
                      { text: String(data.totalSumExamsTypes || 0) },
                      { text: '' },
                      { text: '' },
                    ],
                  },
                ],
              }}
            />
          </View>

          {/* 1 Justificativa */}
          <>
            <View style={[s.table1]}>
              <Text style={[s.bodyB1]}>
                Justificativa dos exames não realizados:
              </Text>
            </View>
            <PdfTextLinesComponent numberOfLines={5} />
          </>

          {/* 1 TIME */}
          <>
            <View style={{ marginTop: 30, flexDirection: 'row' }}>
              <Text style={[s.bodyB1, { marginRight: 20 }]}>
                Horário da visita médica:
              </Text>
              <Text style={[s.bodyB1, { marginRight: 20 }]}>
                Início: ______:______
              </Text>
              <Text style={[s.bodyB1]}>Término: ______:______ horas</Text>
            </View>
          </>
        </View>

        {/* Signatures */}
        <View>
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
                {withDate && data.doneDate ? (
                  <Text style={s.signText}>
                    Data: {dayjs(data.doneDate).format('DD/MM/YYYY')}
                  </Text>
                ) : (
                  <Text style={s.signText}>Data: ___/___/____</Text>
                )}
              </View>
              <Text style={[s.signText, sm.ta]}>
                Nome e carimbo do responsável da empresa
              </Text>
            </View>
            <View style={[s.signatureBox]}>
              <View style={[s.signBox]}>
                {withDate && data.doneDate ? (
                  <Text style={s.signText}>
                    Data: {dayjs(data.doneDate).format('DD/MM/YYYY')}
                  </Text>
                ) : (
                  <Text style={s.signText}>Data: ___/___/____</Text>
                )}
              </View>
              <Text style={[s.signText, sm.ta]}>Carimbo do médico</Text>
            </View>
          </View>
        </View>
      </Page>

      <Page style={s.page}>
        <View>
          {/* title */}
          <View fixed style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={s.image}
                src={
                  consultant?.logoUrl + '?noCache=' + Math.random().toString()
                }
              />

              <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                <View style={{ flexGrow: 1, justifyContent: 'center' }}>
                  <Text style={[s.title, { width: 440 }]}>
                    {consultant?.name}
                  </Text>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
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
            </View>

            <View
              style={{
                marginTop: 10,
                borderBottom: '0.5px solid #555',
              }}
            />

            <Text style={[s.header, { marginBottom: 20 }]}>
              Relatório de Visita Médica
            </Text>
          </View>

          {/* 1 Empresa */}
          <>
            <View fixed style={[sm.mb, s.tableBox]}>
              <View style={[s.tableH, sm.darkRow]}>
                <Text style={sm.bodyBS}>Empresa</Text>
              </View>

              <View style={sm.row}>
                <View style={[s.table1, { flexGrow: 1 }]}>
                  <Text style={s.label}>Razão social:</Text>
                  <Text style={s.tableBody}>
                    {actualCompany.name.slice(0, 90)}
                  </Text>
                </View>
                <View style={[s.table2, { width: 150 }]}>
                  <Text style={s.label}>CNPJ:</Text>
                  <Text style={s.tableBody}>
                    {cnpjMask.mask(actualCompany.cnpj)}
                  </Text>
                </View>
              </View>

              <View style={sm.row}>
                <View style={[s.table2]}>
                  <Text style={s.label}>Endereço:</Text>
                  <Text style={s.tableBody}>
                    {getAddressMain(actualCompany?.address)}{' '}
                    {getAddressCityState(actualCompany?.address)}{' '}
                  </Text>
                </View>
              </View>

              <View style={sm.row}>
                {actualCompany?.contacts?.[0]?.phone && (
                  <View style={[s.table2]}>
                    <Text style={s.label}>Contato:</Text>
                    <Text style={s.tableBody}>
                      {actualCompany.contacts[0].phone}
                    </Text>
                  </View>
                )}

                {actualCompany?.contacts?.[0]?.email && (
                  <View style={[s.table2]}>
                    <Text style={s.label}>Email:</Text>
                    <Text style={s.tableBody}>
                      {actualCompany.contacts[0].email}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>

          {/* 1 EXAMES */}
          <View style={{ marginBottom: 20 }}>
            <Text fixed style={[s.header, { marginBottom: 20 }]}>
              Relação de exames solicitados
            </Text>

            <PdfTableComponent
              table={{
                rowsStyle: {
                  style: { minHeight: '15px' },
                  left: true,
                  cells: [
                    { width: 39, style: { fontSize: 7 } },
                    { style: { fontSize: 7 } },
                    { width: 10, style: { fontSize: 7 } },
                    { width: 30 },
                  ],
                },
                rows: [
                  {
                    hideIfEmpty: true,
                    color: 'gray.100',
                    cells: [
                      { text: 'Nome' },
                      { text: 'CPF / RG' },
                      { text: 'Data Nasc.' },
                      { text: 'Assinatura' },
                    ],
                  },
                  ...data.empoyees.map((employee) => ({
                    cells: [
                      { text: employee.name },
                      {
                        text: [formatCPF(employee.cpf), employee.rg]
                          .filter((i) => i)
                          .join(' / '),
                      },
                      { text: dateToString(employee.birthday) || '' },
                      { text: '' },
                    ],
                  })),
                ],
              }}
            />
          </View>
        </View>
      </Page>
    </>
  );
}
