/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { Font, Image, Page, Text, View } from '@react-pdf/renderer';
import {
  osList,
  romansNumbers,
} from 'components/organisms/forms/OsForm/hooks/useOSForm';
import dayjs from 'dayjs';
import { RiskEnum } from 'project/enum/risk.enums';
import sortArray from 'sort-array';

import { IPdfOSData } from 'core/interfaces/api/IPdfOSData';
import { IProntuarioQuestion } from 'core/interfaces/api/IPdfProntuarioData';
import { DraftTypeEnum, IDraftTypes } from 'core/interfaces/IDraftBlocks';
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

export default function PdfOSPage({ data }: { data: IPdfOSData }) {
  const os = data.os;
  const sector = data.sector;
  const employee = data.employee;
  const consultant = data.consultantCompany;
  const actualCompany = data.actualCompany;
  const risks = data.risks;
  const epis = data.epis;
  const epcs = data.epcs;
  const adms = data.adms;
  const font = data.font;
  const allRisks = risks?.filter((r) => r.riskFactor.type != RiskEnum.OUTROS);
  const isNoRisk = !allRisks.length;

  if (!epis.length)
    epis.push({
      epiId: 0,
      epi: { id: 0, ca: '', equipment: 'Nenhum EPI' } as any,
    });

  if (!epcs.length)
    epcs.push({
      recMedId: '0',
      recMed: { id: '0', medName: 'Nenhum EPC' } as any,
    });

  const list = osList.filter((v) => !!(os as any)?.[v.field]);

  let index = 0;

  return (
    <Page style={s.page}>
      <View>
        <View>
          {/* title */}
          <>
            <View fixed style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{ flexGrow: 1 }}>
                <Image
                  style={s.image}
                  src={
                    consultant?.logoUrl + '?noCache=' + Math.random().toString()
                  }
                />
              </View>
              <View style={{ flexGrow: 1 }}>
                <Text style={s.title}>ORDEM DE SERVIÇO</Text>
                <Text style={s.title2}>
                  {actualCompany?.fantasy || actualCompany?.name}{' '}
                </Text>
              </View>
              <View style={{ flexGrow: 1 }}>
                <Image
                  style={s.image}
                  src={
                    actualCompany?.logoUrl +
                    '?noCache=' +
                    Math.random().toString()
                  }
                />
              </View>
            </View>
          </>

          {/* 1 Funcionario */}
          <>
            <View style={[sm.mb2, s.tableBox, sm.mt6]}>
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
              </View>

              {/* - Funcionario - empresa */}
              <View style={sm.row}>
                <View style={[s.table1]}>
                  <Text style={s.label}>Setor:</Text>
                  <Text style={s.tableBody}>{sector?.name}</Text>
                </View>

                <View style={[s.table1]}>
                  <Text style={s.label}>Função:</Text>
                  <Text style={s.tableBody}>
                    {employee?.hierarchy?.name.slice(0, 100)}
                  </Text>
                </View>
              </View>

              {/* - Estabelecimentos - empresa */}
              {actualCompany?.workspace &&
                actualCompany.workspace.length > 1 &&
                data?.workspaces.length && (
                  <View style={sm.row}>
                    <View style={[s.table1]}>
                      <Text style={s.label}>Estabelecimento(s):</Text>
                      <Text style={s.tableBody}>
                        {data?.workspaces.map((w) => w.name).join(', ')}
                      </Text>
                    </View>
                  </View>
                )}
            </View>
          </>

          {/* 1 Desc */}
          <>
            <View style={[sm.mb2, s.tableBox, sm.mt8]}>
              <View style={[s.tableHB, sm.darkRow]}>
                <Text style={s.h2}>DESCRIÇÃO DA ATIVIDADE</Text>
              </View>

              {/* - Funcionario - dados */}
              <View style={sm.row}>
                <View style={[s.table1, s.mrl]}>
                  <Text style={s.body}>
                    {employee?.hierarchy?.description || ''}
                  </Text>
                </View>
              </View>
            </View>
          </>

          {/* Risks */}
          <>
            <View style={[sm.mb2, s.tableBox, sm.mt8]}>
              <View style={[s.tableHB, sm.darkRow]}>
                <Text style={s.h2}>IDENTIFICAÇÃO DOS RISCOS AMBIENTAIS</Text>
              </View>
              <View style={[s.tableHB]}>
                <Text style={s.h2}>RISCOS / FONTES GERADORAS</Text>
              </View>

              {/* - RISK ROWS */}
              {isNoRisk && (
                <Text
                  style={[
                    s.body,
                    { width: 420, padding: 10, paddingHorizontal: 10 },
                  ]}
                >
                  Ausência de risco específico
                </Text>
              )}
              {sortArray(allRisks, {
                by: 'riskName',
                order: 'asc',
                computed: { riskName: (v) => v.riskFactor.name },
              }).map((risk, index) => {
                const last = allRisks.length - 1 == index;
                const riskId = risk.riskFactor?.id || risk.riskData?.riskId;
                return (
                  <View
                    style={[
                      sm.row,
                      { ...(!last && { borderBottom: '1 solid #000' }) },
                    ]}
                  >
                    <View
                      style={[
                        s.table1,
                        { flexDirection: 'column', alignItems: 'flex-start' },
                      ]}
                    >
                      <Text style={s.body}>
                        <Text style={{ fontWeight: 'extrabold' }}>
                          {index + 1}.
                        </Text>{' '}
                        {risk.riskFactor.name}
                      </Text>

                      <View style={[s.textBoxWrap, sm.mt2, sm.mb2]}>
                        {!!font[riskId] &&
                          font[riskId].map((fg) => {
                            return (
                              <Text
                                style={[
                                  sm.body,
                                  sm.tBox,
                                  sm.mt2,
                                  sm.darkLightRow,
                                ]}
                              >
                                {fg.name}
                              </Text>
                            );
                          })}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>

          {/* EPI EPC */}
          <>
            <View style={[sm.mb2, s.tableBox, sm.mt8]}>
              <View style={[s.tableHB, sm.darkRow]}>
                <Text style={s.h2}>MEDIDAS PREVENTIVAS</Text>
              </View>
              <View style={[s.tableEpi]}>
                <View style={[{ borderRight: '1 solid #000', flex: 1 }]}>
                  <Text style={s.h2}>EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL</Text>
                </View>

                <View style={[{ flex: 1 }]}>
                  <Text style={s.h2}>EPC</Text>
                </View>

                {/* <View style={[{ flex: 1 }]}>
                  <Text style={s.h2}>Outras Medidas</Text>
                </View> */}
              </View>

              {/* - RISK ROWS */}
              <View style={[s.tableEpi, { minWidth: 100 }]}>
                <View style={[{ borderRight: '1 solid #000', flex: 1 }]}>
                  {sortArray(epis, {
                    by: 'equipment',
                    order: 'asc',
                    computed: { equipment: (v) => v.epi?.equipment },
                  }).map((epi, index) => {
                    return (
                      <View style={[sm.row]}>
                        <View
                          style={[
                            s.table1,
                            {
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                            },
                          ]}
                        >
                          <Text style={s.body}>
                            {epi.epiId != 0 && (
                              <Text style={{ fontWeight: 'extrabold' }}>
                                {index + 1}.
                              </Text>
                            )}{' '}
                            ({epi.epi?.ca}) - {epi.epi?.equipment}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={[{ flex: 1 }]}>
                  {sortArray(epcs, {
                    by: 'medName',
                    order: 'asc',
                    computed: { medName: (v) => v.recMed?.medName },
                  }).map((epc, index) => {
                    return (
                      <View style={[sm.row]}>
                        <View
                          style={[
                            s.table1,
                            {
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                            },
                          ]}
                        >
                          <Text style={s.body}>
                            {epc.recMedId != '0' && (
                              <Text style={{ fontWeight: 'extrabold' }}>
                                {index + 1}.
                              </Text>
                            )}{' '}
                            {epc.recMed?.medName}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* <View style={[{ flex: 1 }]}>
                  {sortArray(adms, {
                    by: 'medName',
                    order: 'asc',
                    computed: { medName: (v) => v?.medName },
                  }).map((adm, index) => {
                    return (
                      <View style={[sm.row]}>
                        <View
                          style={[
                            s.table1,
                            {
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                            },
                          ]}
                        >
                          <Text style={s.body}>
                            <Text style={{ fontWeight: 'extrabold' }}>
                              {index + 1}.
                            </Text>{' '}
                            {adm?.medName}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View> */}
              </View>
            </View>
          </>

          {/* 1 MED */}
          {list.map((row, i) => {
            return (
              <>
                <View wrap={false} style={[sm.mb2, s.tableBox, sm.mt8]}>
                  <View style={[s.tableHB, sm.darkRow]}>
                    <Text
                      style={s.h1}
                    >{`${romansNumbers[i]} - ${row.label}`}</Text>
                  </View>

                  <View style={sm.row}>
                    <View style={[s.table2, s.mrl]}>
                      {(
                        (os as any)[row.field] as IDraftTypes.RootObject
                      ).blocks.map((block, i) => {
                        const bulletList =
                          block.type == DraftTypeEnum.BULLET_LIST;
                        const numList = block.type == DraftTypeEnum.NUMBER_LIST;

                        if (!numList || i == 0) index = 0;
                        if (numList) index++;
                        return (
                          <Text style={s.body}>
                            {bulletList && (
                              <Text style={{ marginHorizontal: 8 }}>• </Text>
                            )}
                            {numList && (
                              <Text style={{ marginHorizontal: 8 }}>
                                {index}.{' '}
                              </Text>
                            )}
                            {(numList || bulletList) && ' '}
                            {block.text}
                          </Text>
                        );
                      })}
                      {/* <Text style={[{ fontWeight: 'bold' }]}>BOLD</Text>{' '} */}
                    </View>
                  </View>
                </View>
              </>
            );
          })}
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
                  {/* Data: ___/___/____ */}
                  Data: {dayjs().format('DD/MM/YYYY')}
                </Text>
              </View>
              <Text style={[s.signText, sm.ta]}>Assinatura do Funcionário</Text>
              <Text style={[s.signText, sm.ta]}>{employee.name}</Text>
            </View>
          </View>
        </>
      </View>
    </Page>
  );
}
