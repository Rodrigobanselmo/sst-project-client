/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

import { Font, Image, Page, Text, View } from '@react-pdf/renderer';

import {
  IPdfProntuarioData,
  IProntuarioQuestion,
} from 'core/interfaces/api/IPdfProntuarioData';

import { sm } from '../../styles/main.pdf.styles';
import { PdfEmployeeComponent } from '../prontuario/prontuario.pdf';
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

const PdfObsComponent = () => {
  return (
    <View>
      <View style={[{ flexGrow: 1, marginTop: 5 }]}>
        <View style={[sm.row, { flexGrow: 1, marginBottom: 2 }]}>
          <View style={[sm.row]}>
            <Text style={[sm.bodyB2, { marginRight: 5 }]}>Observações: </Text>
          </View>
          <View style={[sm.row, { flexGrow: 1 }]}>
            <View style={[sm.row]}>
              <View style={[s.line]}>e</View>
            </View>
          </View>
        </View>
        {[1, 2, 3, 4, 5].map(() => {
          return (
            <View style={[sm.row, { flexGrow: 1, marginBottom: 5 }]}>
              <View style={[sm.row]}>
                <View style={[s.line]}>e</View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function PdfAtestadoPage({
  data,
}: {
  data: IPdfProntuarioData;
}) {
  const employee = data.employee;
  const consultantCompany = data.consultantCompany;

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
                    consultantCompany?.logoUrl +
                    '?noCache=' +
                    Math.random().toString()
                  }
                />
              </View>
              <View style={{ flexGrow: 1 }}>
                <Text style={s.title}>ATESTADO MÉDICO</Text>
              </View>
              <View style={{ flexGrow: 1, width: 80 }}></View>
            </View>
          </>

          <Text style={[sm.bodyB2, { marginTop: 10 }]}>
            Atesto para os devidos fins que{' '}
            {employee.socialName || employee.name}
            compareceu nesta data para realização de avaliação médica
            ocupacional e não foi identificado qualquer alteração de saúde que
            impeça o retorno às suas atividade habituais.
          </Text>

          {/* 1 OBS */}
          <View style={[{ marginTop: 40 }]}>{PdfObsComponent()}</View>
          <Text style={[sm.bodyB2, { marginTop: 40 }]}>Sem mais, </Text>
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
            <View style={[s.doctorRespBox]}></View>
          </View>
        </>
      </View>
    </Page>
  );
}
