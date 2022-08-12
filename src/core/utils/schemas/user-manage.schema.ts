import * as Yup from 'yup';

export const userManageSchema = Yup.object().shape({
  email: Yup.string().trim().email('e-mail mal formatado'),
});
