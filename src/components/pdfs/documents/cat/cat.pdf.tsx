/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import Html from 'react-pdf-html';

import { Document, Page, Text, View, Image, Font } from '@react-pdf/renderer';
import {
  osList,
  romansNumbers,
} from 'components/organisms/forms/OsForm/hooks/useOSForm';
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
import sortArray from 'sort-array';
import { v4 } from 'uuid';

import { daysArr, daysShortArr } from 'core/hooks/useCalendar';
import {
  getContentByCatListValue,
  iniciatCATList,
  isWithDeath,
  lateralidadeList,
  tpAcidList,
  tpCatList,
  tpInscList,
  tpLocalList,
} from 'core/interfaces/api/ICat';
import { IExam } from 'core/interfaces/api/IExam';
import { IPdfCATData } from 'core/interfaces/api/IPdfCATData';
import { IPdfGuideData } from 'core/interfaces/api/IPdfGuideData';
import { IPdfKitData } from 'core/interfaces/api/IPdfKitData';
import { IPdfOSData } from 'core/interfaces/api/IPdfOSData';
import {
  IPdfProntuarioData,
  IProntuarioQuestion,
} from 'core/interfaces/api/IPdfProntuarioData';
import { DraftTypeEnum, IDraftTypes } from 'core/interfaces/IDraftBlocks';
import { arrayChunks } from 'core/utils/arrays/arrayChunks';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';
import { getCompanyName } from 'core/utils/helpers/companyName';
import {
  getAddressCity,
  getAddressMain,
  getContactPhone,
} from 'core/utils/helpers/getAddress';
import { cnaeMask } from 'core/utils/masks/cnae.mask';
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

const HeaderTableComponent = ({ text }: { text: string }) => {
  return (
    <View
      style={[
        s.tableH,
        sm.darkRow,
        {
          textAlign: 'center',
          flexDirection: 'column',
        },
      ]}
    >
      <Text style={s.bodyB}>{text}</Text>
    </View>
  );
};

const BoxTableComponent = ({
  text,
  br,
  label,
  index,
  flex,
  maxWidth,
}: {
  label: string;
  text: string;
  index?: number;
  maxWidth?: number;
  flex?: number;
  br?: boolean;
}) => {
  return (
    <View
      style={[
        s.table1,
        {
          borderRight: br ? '1px solid black' : 'none',
          flexGrow: flex || 1,
          maxWidth: maxWidth || 1000,
        },
      ]}
    >
      {index && (
        <Text style={s.label}>
          {index}) {label}
        </Text>
      )}
      <Text style={s.tableBody}>{text}</Text>
    </View>
  );
};

const RowStyle = (props?: { bb?: boolean }) => {
  return [
    sm.row,
    {
      borderBottom: props?.bb ? '1px solid black' : 'none',
      display: 'flex',
    },
  ] as any;
};

const SubHeaderTableComponent = ({ text }: { text: string }) => {
  return (
    <View style={[s.tableH, sm.darkLightRow]}>
      <Text style={s.bodyB}>{text}</Text>
    </View>
  );
};

export default function PdfCatPage({ data }: { data: IPdfCATData }) {
  const employee = data.employee;
  const company = data.company;
  const cat = data.cat;
  const doc = cat?.doc;
  const event = data.cat?.events?.[0];
  const recipt = event?.receipt;
  const originRecipt = data.cat?.catOrigin?.events?.[0]?.receipt;

  let index = 0;

  const getIndex = () => {
    index++;
    return index;
  };

  return (
    <Page style={s.page}>
      <View>
        <View>
          {/* title */}
          <>
            <View fixed style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View>
                <Image style={s.image} src={'/images/consultar-cat.jpg'} />
              </View>
              <View style={{ flexGrow: 1 }}>
                <Text style={s.title}>PREVIDÊNCIA SOCIAL</Text>
                <Text style={s.title2}>
                  COMUNICAÇÃO DE ACIDENTE DO TRABALHO - CAT
                </Text>
              </View>
            </View>
          </>

          {/* 1 IDENTIFIER */}
          <>
            <View style={[s.tableBox]}>
              <HeaderTableComponent text="I- DADOS DE IDENTIFICAÇÃO" />

              <View style={RowStyle({ bb: true })}>
                <BoxTableComponent
                  br
                  index={getIndex()}
                  label="Emitente"
                  text={'Empregador'}
                />
                <BoxTableComponent
                  index={getIndex()}
                  label="Tipo de Cat"
                  text={getContentByCatListValue(cat.tpCat, tpCatList)}
                  br
                />
                <BoxTableComponent
                  index={getIndex()}
                  label="Iniciativa da Cat"
                  text={getContentByCatListValue(
                    cat.iniciatCAT,
                    iniciatCATList,
                  )}
                />
              </View>

              <View style={RowStyle()}>
                <BoxTableComponent
                  br
                  index={getIndex()}
                  label="Fonte de cadastramento"
                  text={'eSocial'}
                />
                <BoxTableComponent
                  br
                  index={getIndex()}
                  label="Número da CAT:"
                  text={recipt || ''}
                />
                <BoxTableComponent
                  index={getIndex()}
                  label="Número do recibo do evento no eSocial da CAT de origem"
                  text={originRecipt || ''}
                />
              </View>
            </View>
          </>

          {/* II- EMITENTE */}
          <>
            <View style={[s.tableBox, sm.mt2]}>
              <HeaderTableComponent text="II- EMITENTE" />
              {/* II- EMITENTE */}
              <>
                <SubHeaderTableComponent text="EMPREGADOR" />

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    index={getIndex()}
                    label="Razão Social/Nome"
                    text={'Avanti Comercio de Alimentos LTDA'}
                  />
                </View>

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Tipo"
                    text={'CNPJ'}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Nr de inscrição"
                    text={cnpjMask.mask(company.cnpj)}
                  />
                  <BoxTableComponent
                    index={getIndex()}
                    label="Cnae"
                    text={
                      cnaeMask.mask(company?.primary_activity?.[0].code) || ''
                    }
                  />
                </View>
              </>

              {/* II- ACIDENTADO */}
              <>
                <SubHeaderTableComponent text="ACIDENTADO" />

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Nome"
                    text={employee.name}
                    flex={3}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="CPF"
                    flex={2}
                    text={cpfMask.mask(employee.cpf)}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Data Nasc."
                    text={dateToString(employee.birthday)}
                  />
                  <BoxTableComponent
                    index={getIndex()}
                    label="Sexo"
                    text={sexTypeMap[employee.sex]?.name || employee.sex || ''}
                  />
                </View>

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Estado civil"
                    text={'-'}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Cargo"
                    text={employee.hierarchy?.name}
                  />
                  <BoxTableComponent
                    index={getIndex()}
                    label="Filiação a Previdência Social"
                    text={'Empregado'}
                  />
                </View>
              </>

              {/* II- ACIDENTE OU DOENÇA */}
              <>
                <SubHeaderTableComponent text="ACIDENTE OU DOENÇA" />

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Data do acidente"
                    text={dateToString(cat.dtAcid)}
                    flex={1}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Hora do acidente"
                    flex={1}
                    text={cat.hrAcid}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Após quantas horas de trabalho"
                    text={cat.hrsTrabAntesAcid}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Tipo"
                    text={getContentByCatListValue(cat.tpAcid, tpAcidList)}
                  />
                  <BoxTableComponent
                    index={getIndex()}
                    label="Houve afastamento?"
                    text={cat.houveAfast ? 'SIM' : 'NÃO'}
                  />
                </View>

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Último dia trabalhado"
                    text={dateToString(cat.ultDiaTrab)}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Local do acidente"
                    text={getContentByCatListValue(cat.tpLocal, tpLocalList)}
                    flex={5}
                  />
                  <BoxTableComponent
                    flex={2}
                    index={getIndex()}
                    label="Espec. do local do acidente"
                    text={cat.dscLocal.slice(0, 45)}
                  />
                </View>

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="CNPJ/CAEPF/CNO local acidente"
                    flex={2}
                    text={
                      (getContentByCatListValue(
                        cat.ideLocalAcidTpInsc,
                        tpInscList,
                      ) || 'CNPJ') +
                      ': ' +
                      (cat.ideLocalAcidTpInsc == 1
                        ? cnpjMask.mask(cat.ideLocalAcidCnpj)
                        : cat.ideLocalAcidCnpj)
                    }
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="UF"
                    text={cat.uf}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Município do local do acidente"
                    text={cat.city?.name || ''}
                    flex={3}
                  />
                  <BoxTableComponent
                    flex={2}
                    index={getIndex()}
                    label="País"
                    text={cat?.countryCodeEsocial6?.name || 'Brasil'}
                  />
                </View>

                {/* II- BODY PART */}
                <>
                  <View style={RowStyle({ bb: true })}>
                    <BoxTableComponent
                      br
                      index={getIndex()}
                      label="Parte(s) do corpo atingida(s)"
                      text={`${cat.codParteAtingEsocial13?.code || ''} - ${
                        cat.codParteAtingEsocial13?.desc || ''
                      }`.slice(0, 110)}
                      flex={6}
                    />
                    <BoxTableComponent
                      flex={1}
                      index={getIndex()}
                      label="Lateralidade"
                      text={`${getContentByCatListValue(
                        cat.lateralidade || '0',
                        lateralidadeList,
                      )}`}
                    />
                  </View>
                  <View style={RowStyle({ bb: true })}>
                    <BoxTableComponent
                      index={getIndex()}
                      label="Agente causador"
                      text={`${cat.esocialAgntCausador?.code || ''} - ${
                        cat.esocialAgntCausador?.desc || ''
                      }`.slice(0, 120)}
                    />
                  </View>
                  <View style={RowStyle({ bb: true })}>
                    <BoxTableComponent
                      index={getIndex()}
                      label="Descrição da situação geradora do acidente ou doença"
                      text={`${cat.esocialSitGeradora?.code || ''} - ${
                        cat.esocialSitGeradora?.desc || ''
                      }`.slice(0, 120)}
                    />
                  </View>
                  <View style={RowStyle({ bb: true })}>
                    <BoxTableComponent
                      br
                      index={getIndex()}
                      label="Houve registro policial?"
                      text={cat.isIndComunPoliciaa ? 'SIM' : 'NÃO'}
                    />
                    <BoxTableComponent
                      br
                      index={getIndex()}
                      label="Houve morte?"
                      text={isWithDeath(cat.tpCat) ? 'SIM' : 'NÃO'}
                    />
                    <BoxTableComponent
                      index={getIndex()}
                      label="Data do óbito?"
                      text={cat?.dtObito ? dateToString(cat?.dtObito) : ''}
                    />
                  </View>
                  <View style={RowStyle({ bb: true })}>
                    <BoxTableComponent
                      index={getIndex()}
                      maxWidth={550}
                      label="Observações"
                      text={cat?.obsCAT?.slice(0, 255)}
                    />
                  </View>
                  <View style={RowStyle({ bb: true })}>
                    <BoxTableComponent
                      index={getIndex()}
                      label="Data do Recebimento"
                      text={dateToString(new Date())}
                    />
                  </View>
                </>
              </>
            </View>
          </>

          {/* III- INFORMAÇÕES DO ATESTADO MÉDICO */}
          <>
            <View style={[s.tableBox, sm.mt2]}>
              <HeaderTableComponent text="III- INFORMAÇÕES DO ATESTADO MÉDICO" />

              {/* II- ATENDIMENTO */}
              <>
                <SubHeaderTableComponent text="ATENDIMENTO" />

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Data"
                    text={dateToString(cat.dtAtendimento)}
                  />
                  <BoxTableComponent
                    index={getIndex()}
                    label="Hora"
                    text={cat.hrAtendimento}
                  />
                </View>
                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Houve internação"
                    text={cat.isIndInternacao ? 'SIM' : 'NÃO'}
                  />
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    label="Duração provável do tratamento"
                    text={`${cat.durTrat} dia(s)`}
                  />
                  <BoxTableComponent
                    index={getIndex()}
                    label="Deverá o acidentado afastar-se do trabalho durante o tratamento? ( 1- Sim / 2 - Não)"
                    text={cat.isIndAfast ? 'SIM' : 'NÃO'}
                  />
                </View>
              </>

              {/* II- LESÃO */}
              <>
                <SubHeaderTableComponent text="LESÃO" />

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    index={getIndex()}
                    maxWidth={550}
                    label="Data"
                    text={`${cat.esocialLesao?.code || ''} - ${
                      cat.esocialLesao?.desc || ''
                    }`.slice(0, 500)}
                  />
                </View>
              </>

              {/* II- DIAGNÓSTICO */}
              <>
                <SubHeaderTableComponent text="DIAGNÓSTICO" />

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    br
                    index={getIndex()}
                    flex={7}
                    maxWidth={450}
                    label="Diagnóstico provável"
                    text={`${cat.diagProvavel || ''}`.slice(0, 300)}
                  />
                  <BoxTableComponent
                    index={getIndex()}
                    label="CID"
                    text={`${cat.codCID || ''}`}
                  />
                </View>

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    index={getIndex()}
                    label="Nome do médico, Orgão expedidor e UF"
                    text={`${doc?.name}, ${doc?.councilType || ''}: ${
                      doc?.councilId || ''
                    }, ${doc?.councilUF || ''}`}
                  />
                </View>

                <View style={RowStyle({ bb: true })}>
                  <BoxTableComponent
                    index={getIndex()}
                    maxWidth={550}
                    label="Observações"
                    text={cat?.observacao?.slice(0, 255)}
                  />
                </View>
                <View
                  style={[...RowStyle({ bb: true }), { paddingBottom: 10 }]}
                >
                  <BoxTableComponent
                    maxWidth={550}
                    label=""
                    text={
                      'A COMUNICAÇÃO DO ACIDENTE É OBRIGATÓRIA, MESMO NO CASO EM QUE NÃO HAJA AFASTAMENTO DO TRABALHO. FORMULÁRIO ASSINADO ELETRONICAMENTE - DISPENSA ASSINATURA E CARIMBO'
                    }
                  />
                </View>
              </>
            </View>
          </>
        </View>
      </View>

      {event && (
        <View>
          {/* END PAGE */}
          <>
            <View style={[{ flexDirection: 'row' }]}>
              <Text style={{ fontSize: 6 }}>
                <Text style={{ fontWeight: 'bold' }}>ESOCIAL</Text>
                <Text style={[]}>
                  : XML gerado em{' '}
                  {dayjs(event?.created_at || new Date()).format(
                    'DD-MM-YYYY HH:mm:ss',
                  )}
                </Text>
                <Text style={{ fontWeight: 'bold' }}> - ID_ESOCIAL:</Text>
                <Text style={[]}>{event?.eventId} </Text>
                <Text style={{ fontWeight: 'bold' }}> RECIBO ESOCIAL:</Text>
                <Text style={[]}>{event?.receipt}</Text>
              </Text>
            </View>
          </>
        </View>
      )}
    </Page>
  );
}
