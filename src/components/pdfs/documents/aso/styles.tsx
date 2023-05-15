import { StyleSheet } from '@react-pdf/renderer';

import palette from 'configs/theme/palette';

const standard: ReturnType<typeof StyleSheet.create> = {
  table: {
    padding: 6,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
};

export const s = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontFamily: 'Open Sans',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: 100,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  tableH: {
    ...standard.table,
    borderBottom: '0.5px solid #000',
  },
  checkbox: {
    border: '0.5px solid #000',
    height: 12,
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxCheck: {
    paddingVertical: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  checkboxBig: {
    border: '2 solid #222',
    height: 15,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskText: {
    width: 50,
    marginRight: 5,
  },
  bodyB1: {
    fontSize: 8,
    fontWeight: 'semibold',
  },
  protoText: {
    width: 200,
    marginRight: 5,
  },
  tBox: {
    // border: '0.5px solid #b1b1b1',
    marginRight: 3,
    paddingHorizontal: 4,
    // paddingVertical: 1,
    borderRadius: 10,
  },
  tableClinicBox: {
    border: '0.5px solid #555',
    padding: 2,
  },

  tableBox: {
    border: '0.5px solid #000',
  },
  table1: {
    ...standard.table,
    paddingTop: 2,
  },
  table1L: {
    ...standard.table,
    borderLeft: 0,
  },
  table2: {
    ...standard.table,
    borderTop: 0,
    flexDirection: 'row',
  },
  table2L: {
    ...standard.table,
    borderTop: 0,
    flexDirection: 'row',
    borderLeft: 0,
  },
  tableBody: {
    fontSize: 8,
    fontWeight: 'semibold',
  },
  label: {
    fontSize: 7,
    fontWeight: 'normal',
    color: '#333',
    marginRight: 4,
  },
  header: {
    marginTop: 10,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
    flex: 1,
    flexGrow: 1,
    fontWeight: 'extrabold',
    color: 'black',
  },
  signBox: {
    borderBottom: '0.5px solid #000',
    height: 70,
    marginBottom: 2,
  },
  signatureBox: {
    width: 200,
  },
  signText: {
    fontSize: 9,
    fontWeight: 'normal',
    color: 'black',
  },
});
