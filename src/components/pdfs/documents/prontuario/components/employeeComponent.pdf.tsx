/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */

import { Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import {
  employeeExamTypeMap,
  employeeToAsoExamTypeTranslate,
} from 'project/enum/employee-exam-history-type.enum';
import { RiskEnum } from 'project/enum/risk.enums';
import { sexTypeMap } from 'project/enum/sex.enums';

import { IPdfProntuarioData } from 'core/interfaces/api/IPdfProntuarioData';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { sm } from '../../../styles/main.pdf.styles';
import { s } from '../styles';

export const PdfEmployeeComponent = ({
  employee,
  ...prontuario
}: IPdfProntuarioData) => {
  const actualCompany = prontuario.actualCompany;
  const clinicExam = prontuario.clinicExam;
  const risks = prontuario.risks;
  const allRisks = risks?.filter((r) => r.riskFactor.type != RiskEnum.OUTROS);
  const isNoRisk = !allRisks.length;

  return (
    <>
      <View style={[sm.mb4, s.tableBox]}>
        <View style={[s.tableH, sm.darkRow]}>
          <Text style={s.bodyB}>FUNCIONÁRIO</Text>
        </View>

        {/* - Funcionario - dados */}
        <View style={[sm.row, sm.wrap]}>
          <View style={[s.table1, s.mrl]}>
            <Text style={s.label}>Nome Completo:</Text>
            <Text style={s.tableBody}>{employee.name}</Text>
          </View>

          <View style={[s.table1, s.mrl]}>
            <Text style={s.label}>CPF:</Text>
            <Text style={s.tableBody}>{cpfMask.mask(employee.cpf)}</Text>
          </View>

          {employee.rg && (
            <View style={[s.table1, s.mrl]}>
              <Text style={s.label}>RG:</Text>
              <Text style={s.tableBody}>{employee.rg}</Text>
            </View>
          )}

          <View style={[s.table1, s.mrl]}>
            <Text style={s.label}>Sexo:</Text>
            <Text style={s.tableBody}>
              {sexTypeMap[employee?.sex]?.name || ''}
            </Text>
          </View>
          <View style={[s.table1, { flexGrow: 1 }]}>
            <Text style={s.label}>Data de nasc.:</Text>
            <Text style={s.tableBody}>
              {employee.birthday &&
                dayjs(employee.birthday).format('DD/MM/YYYY')}{' '}
              {employee.birthday &&
                `(${dayjs().diff(employee.birthday, 'y')} anos)`}
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
        </View>
      </View>

      {/* RISCOS */}
      <View style={[sm.mb2, s.tableBox]}>
        <View style={[s.tableH, sm.darkRow]}>
          <Text style={s.bodyB}>RISCOS OCUPACIONAIS</Text>
        </View>

        <View style={sm.row}>
          <View style={[s.table1, s.mrl, { alignItems: 'flex-start' }]}>
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
  );
};
