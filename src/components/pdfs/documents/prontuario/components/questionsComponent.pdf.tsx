/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */

import { Text, View } from '@react-pdf/renderer';

import { IProntuarioQuestion } from 'core/interfaces/api/IPdfProntuarioData';

import { sm } from '../../../styles/main.pdf.styles';
import { s } from '../styles';

export const PdfQuestionsComponent = (questions: IProntuarioQuestion[]) => {
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
