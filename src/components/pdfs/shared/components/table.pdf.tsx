/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */

import { onlyNumbers } from '@brazilian-utils/brazilian-utils';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

import palette from 'configs/theme/palette';

import { sm } from '../../styles/main.pdf.styles';

export interface ICellStylePdfTable {
  color?: string;
  width?: number;
  style?: any;
}

export interface ICellPdfTable extends ICellStylePdfTable {
  text: string;
}

export type IRowPdfTable = {
  cells: ICellPdfTable[];
  hideIfEmpty?: boolean;
  color?: string;
};

const styles = StyleSheet.create({
  table: {
    width: '100%',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    maxHeight: '18px',
  },
  header: {
    borderTop: 'none',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export type IRowsPdfTable = {
  rows: IRowPdfTable[];
  rowsStyle?: {
    cells: ICellStylePdfTable[];
    left?: boolean;
    style?: any;
  };
};

export const PdfTableComponent = ({ table }: { table: IRowsPdfTable }) => {
  const { rows, rowsStyle } = table;

  return (
    <View style={[styles.table, { flexGrow: 1 }]}>
      {rows.map((row, indexRow) => {
        let totalWidth = 100;
        let totalSetWidth = 0;

        {
          rowsStyle?.cells?.forEach((curr) => {
            if (curr?.width) {
              totalWidth = totalWidth - (curr.width || 0);
              totalSetWidth++;
            }
          });
        }

        return (
          <View
            fixed={indexRow == 0}
            style={[
              styles.row,
              {
                ...rowsStyle?.style,
              },
            ]}
          >
            {row.cells.map((cell, indexCell) => {
              const stylesCell = rowsStyle?.cells?.[indexCell]?.style;
              let color =
                cell.color || row.color || rowsStyle?.cells?.[indexCell]?.color;
              const width = cell.width || rowsStyle?.cells?.[indexCell]?.width;

              const slices = color?.split('.');
              if (slices?.length == 2) {
                color = (palette as any)[slices?.[0] || '']?.[
                  slices?.[1] || ''
                ];
              }

              const hideBorders = row.hideIfEmpty && !cell.text;
              const widthPercent =
                width ||
                Math.floor(totalWidth / (row.cells.length - totalSetWidth));

              return (
                <View
                  style={{
                    flexGrow: 1,

                    //align
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: '5px',
                    ...(rowsStyle?.left && {
                      alignItems: 'flex-start',
                    }),

                    borderBottom: '0.5px solid #000',
                    borderRight: '0.5px solid #000',
                    ...(!hideBorders &&
                      indexCell == 0 && { borderLeft: '0.5px solid #000' }),
                    ...(!hideBorders &&
                      indexRow == 0 && { borderTop: '0.5px solid #000' }),
                    ...(!hideBorders && { backgroundColor: color || '#fff' }),

                    width: `${widthPercent}%`,
                    ...stylesCell,
                    // backgroundColor: color,
                  }}
                >
                  <Text style={{ fontSize: stylesCell?.fontSize || '8px' }}>
                    {cell.text}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

// export const ReportTable = () => {
//   return (
//     <View style={styles.table}>
//       <View style={[styles.row, styles.bold, styles.header]}>
//         <Text style={styles.row1}>Name</Text>
//         <Text style={styles.row2}>Start Date</Text>
//         <Text style={styles.row3}>End Date</Text>
//         <Text style={styles.row4}>Days</Text>
//         <Text style={styles.row5}>Info</Text>
//       </View>
//       <View style={styles.row} wrap={false}>
//         <Text style={styles.row1}>
//           <Text style={styles.bold}>{'pok'}</Text>, {'pok'}
//         </Text>
//         <Text style={styles.row2}>{'pok'}</Text>
//         <Text style={styles.row3}>{'pok'}</Text>
//         <Text style={styles.row4}>
//           <Text style={styles.bold}>{'pok'}</Text>
//         </Text>
//         <Text style={styles.row5}>{'pok'}</Text>
//       </View>
//       <View style={styles.row} wrap={false}>
//         <Text style={styles.row1}>
//           <Text style={styles.bold}>{'pok'}</Text>, {'pok'}
//         </Text>
//         <Text style={styles.row2}>{'pok'}</Text>
//         <Text style={styles.row3}>{'pok'}</Text>
//         <Text style={styles.row4}>
//           <Text style={styles.bold}>{'pok'}</Text>
//         </Text>
//         <Text style={styles.row5}>{'pok'}</Text>
//       </View>
//       <View style={styles.row} wrap={false}>
//         <Text style={styles.row1}>
//           <Text style={styles.bold}>{'pok'}</Text>, {'pok'}
//         </Text>
//         <Text style={styles.row2}>{'pok'}</Text>
//         <Text style={styles.row3}>{'pok'}</Text>
//         <Text style={styles.row4}>
//           <Text style={styles.bold}>{'pok'}</Text>
//         </Text>
//         <Text style={styles.row5}>{'pok'}</Text>
//       </View>
//       <View style={styles.row} wrap={false}>
//         <Text style={styles.row1}>
//           <Text style={styles.bold}>{'pok'}</Text>, {'pok'}
//         </Text>
//         <Text style={styles.row2}>{'pok'}</Text>
//         <Text style={styles.row3}>{'pok'}</Text>
//         <Text style={styles.row4}>
//           <Text style={styles.bold}>{'pok'}</Text>
//         </Text>
//         <Text style={styles.row5}>{'pok'}</Text>
//       </View>
//     </View>
//   );
// };
