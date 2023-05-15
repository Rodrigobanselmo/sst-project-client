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
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontFamily: 'Open Sans',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column',
  },
  tableH: {
    ...standard.table,
    borderBottom: '0.5px solid #000',
  },
  dashedDivider: {
    borderBottom: '0.5px dashed #000',
    marginVertical: 8,
  },
  checkbox: {
    border: '0.5px solid #000',
    height: 12,
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    borderBottom: '0.5px solid #000',
    height: 8,
    width: '100%',
    flexGrow: 1,
  },
  boxCheck: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
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
    fontSize: 7,
    fontWeight: 'semibold',
  },
  label: {
    fontSize: 7,
    fontWeight: 'normal',
    color: '#333',
    marginRight: 4,
  },
  header: {
    fontSize: 8,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: 'extrabold',
    color: 'black',
  },
  body: {
    fontSize: 7,
    fontWeight: 'normal',
  },
  bodyB: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  bodySB: {
    fontSize: 7,
    fontWeight: 'semibold',
  },
  bodyS: {
    fontSize: 6,
    fontWeight: 'normal',
  },
  bodyBS: {
    fontSize: 6,
    fontWeight: 'bold',
  },
  signBox: {
    borderBottom: '0.5px solid #000',
    height: 70,
    marginBottom: 2,
  },
  signatureBox: {
    width: 250,
  },
  doctorRespBox: {
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  signHeader: {
    fontSize: 9,
    fontWeight: 'semibold',
    color: 'black',
  },
  signText: {
    fontSize: 9,
    fontWeight: 'normal',
    color: 'black',
  },
  mrl: { marginRight: 10 },
});
