import * as Yup from 'yup';

export const pcmsoAttendanceServiceSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  serviceType: Yup.string().required('Tipo é obrigatório'),
  address: Yup.string().nullable(),
  phone: Yup.string().nullable(),
  distanceLabel: Yup.string().nullable(),
  travelTimeLabel: Yup.string().nullable(),
  notes: Yup.string().nullable(),
  sortOrder: Yup.number().typeError('Ordem inválida').nullable(),
  status: Yup.string().nullable(),
});
