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
  title: {
    width: 300,
    fontSize: 15,
    color: '#123e96',
    textAlign: 'center',
    fontWeight: 'extrabold',
  },
  title2: {
    width: 300,
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'extrabold',
  },
  image: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  tableH: {
    ...standard.table,
    borderBottom: '1 solid #000',
  },
  tableHB: {
    ...standard.table,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 2,
    borderBottom: '1 solid #000',
  },
  tableEpi: {
    padding: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    borderBottom: '1 solid #000',
  },
  dashedDivider: {
    borderBottom: '1 dashed #000',
    marginVertical: 8,
  },
  checkbox: {
    border: '1 solid #000',
    height: 12,
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    borderBottom: '1 solid #000',
    height: 8,
    width: '100%',
    flexGrow: 1,
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
  protoText: {
    width: 200,
    marginRight: 5,
  },
  tBox: {
    // border: '1 solid #b1b1b1',
    marginRight: 3,
    paddingHorizontal: 4,
    // paddingVertical: 1,
    borderRadius: 10,
  },
  tableBox: {
    border: '1 solid #000',
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 5,
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
    fontSize: 8,
    fontWeight: 'normal',
    color: '#333',
    marginRight: 4,
  },
  h1: {
    fontSize: 8,
    fontWeight: 'extrabold',
    textAlign: 'center',
  },
  h2: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body: {
    fontSize: 8,
    fontWeight: 'normal',
  },
  bodyB: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  bodySB: {
    fontSize: 8,
    fontWeight: 'semibold',
  },
  bodyS: {
    fontSize: 7,
    fontWeight: 'normal',
  },
  bodyBS: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  signBox: {
    borderBottom: '1 solid #000',
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
  textBoxWrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
