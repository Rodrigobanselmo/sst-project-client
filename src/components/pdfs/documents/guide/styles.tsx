import { StyleSheet } from '@react-pdf/renderer';

const table = {
  padding: 6,
  paddingVertical: 3,
  border: '1 solid #000',
};

export const s = StyleSheet.create({
  table1: {
    ...table,
  },
  table1L: {
    ...table,
    borderLeft: 0,
  },
  table2: {
    ...table,
    borderTop: 0,
  },
  table2L: {
    ...table,
    borderTop: 0,
    borderLeft: 0,
  },
});
