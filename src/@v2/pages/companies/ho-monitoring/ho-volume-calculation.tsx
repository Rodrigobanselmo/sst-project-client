import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
const fmt=(n:number)=>n.toLocaleString('pt-BR',{maximumFractionDigits:4});
export function HoVolumeCalculation({flow,minutes,totalMinutes,samplers,volume,result}:{flow:number|null;minutes:number|null;totalMinutes?:number|null;samplers?:number|null;volume:number|null;result?:ReactNode}) {
 const valid=flow!=null && minutes!=null && volume!=null;
 const split=valid && samplers!=null && samplers>1 && totalMinutes!=null;
 return <Box sx={{minWidth:180}}>
  <Typography variant="caption" component="div">Vazão × tempo por tubo = volume</Typography>
  <Typography variant="body2" component="div" sx={{mt:2}}>
   {valid?<>{fmt(flow)} L/min × {split?<>({fmt(totalMinutes!)} min ÷ {samplers})</>:<>{fmt(minutes)} min</>} ≈ {result??`${fmt(volume)} L`}</>:<>Volume pendente: faltam parâmetros para calcular.</>}
  </Typography>
 </Box>;
}
