/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */

import { View } from '@react-pdf/renderer';

import { sm } from '../../styles/main.pdf.styles';

export const PdfTextLinesComponent = ({
  numberOfLines,
}: {
  numberOfLines: number;
}) => {
  return (
    <View>
      {Array.from({ length: numberOfLines }).map(() => {
        return (
          <View style={[sm.row, { flexGrow: 1 }]}>
            <View style={[sm.line]}>e</View>
          </View>
        );
      })}
    </View>
  );
};
