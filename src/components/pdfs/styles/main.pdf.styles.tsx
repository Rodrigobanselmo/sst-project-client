import { StyleSheet } from '@react-pdf/renderer';

import palette from 'configs/theme/palette';

const table = {
  padding: 6,
  paddingVertical: 3,
  border: '1 solid #000',
};

export const sm = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 35,
    paddingHorizontal: 35,
    fontFamily: 'Open Sans',
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  mb: {
    marginBottom: 10,
  },
  bgr: {
    backgroundColor: 'red',
  },
  mb1: {
    marginBottom: 1,
  },
  mb2: {
    marginBottom: 2,
  },
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  mt1: {
    marginTop: 1,
  },
  mt2: {
    marginTop: 2,
  },
  mt4: {
    marginTop: 4,
  },
  mt5: {
    marginTop: 5,
  },
  mt6: {
    marginTop: 6,
  },
  mt8: {
    marginTop: 8,
  },
  mt12: {
    marginTop: 12,
  },
  mr2: {
    marginRight: 2,
  },
  pb4: {
    paddingBottom: 4,
  },
  attentionRow: {
    backgroundColor: '#3cbe7d55',
  },
  darkRow: {
    backgroundColor: '#ddd',
  },
  darkLightRow: {
    backgroundColor: '#eee',
  },
  row: {
    flexDirection: 'row',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  tBox: {
    backgroundColor: '#e3eeee',
    marginRight: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 10,
  },
  bullet: { marginHorizontal: 7 },
  bulletDown: { marginLeft: 14 },
  header: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'extrabold',
    color: 'black',
  },
  title: {
    width: 400,
    fontSize: 9,
    fontWeight: 'bold',
    color: 'black',
  },
  subTitle: {
    fontSize: 9,
    fontWeight: 'normal',
    color: 'black',
  },
  h1: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  body: {
    fontSize: 8,
    fontWeight: 'normal',
  },
  bodyB1: {
    fontSize: 8,
    fontWeight: 'semibold',
  },
  bodyB2: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 7,
    fontWeight: 'normal',
    color: '#3c3c3c',
  },
  bodyS: {
    fontSize: 7,
    fontWeight: 'normal',
  },
  bodyBS: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  authText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dashedDivider: {
    borderBottom: '1 dashed #000',
    marginHorizontal: -35,
  },
  ta: {
    textAlign: 'center',
  },
  cb: {
    color: palette.info.main,
  },
  crf: {
    color: palette.risk.fis,
  },
  crq: {
    color: palette.risk.qui,
  },
  crb: {
    color: palette.risk.bio,
  },
  cra: {
    color: palette.risk.aci,
  },
  cre: {
    color: palette.risk.erg,
  },
});
