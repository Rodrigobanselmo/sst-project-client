import { FC } from 'react';
import { useForm } from 'react-hook-form';

import { InputForm } from '../../../../components/molecules/form/input';

export type IUseForm = ReturnType<typeof useForm<any>>;

export const PasswordInputs: FC<
  IUseForm & { resetPass?: boolean; oldPassword?: boolean }
> = ({
  control,
  setValue,
  watch,
  setError,
  resetPass,
  trigger,
  oldPassword,
  clearErrors,
}) => {
  const password = watch('password');
  const passwordConfirmation = watch('passwordConfirmation');

  const successPass = password && password.length > 7;
  // eslint-disable-next-line prettier/prettier
  const successConfirmationPass =
    successPass && passwordConfirmation === password;

  const getPassError = () => {
    return null;
  };

  const getPassConfirmationError = () => {
    return null;
  };

  const onBlurPassConfirm = () => {
    // if (!successConfirmationPass)
    //   return setError('passwordConfirmation', {
    //     message: 'As senhas não coincidem',
    //   });

    return null;
  };

  const erroPassMsg = getPassError();
  const erroPassConfitmMsg = getPassConfirmationError();

  return (
    <>
      {oldPassword && (
        <InputForm
          sx={{ mb: [8, 8] }}
          label="Senha Atual"
          setValue={setValue}
          placeholder="********"
          type="password"
          autoComplete="off"
          control={control}
          onChange={() => clearErrors('oldPassword')}
          name="oldPassword"
          {...(resetPass && {
            size: 'small',
          })}
          // error={!!erroPassMsg}
          // helperText={erroPassMsg}
        />
      )}
      <InputForm
        sx={{ mb: [8, 8] }}
        label="Senha"
        setValue={setValue}
        placeholder="********"
        type="password"
        onChange={() => clearErrors('password')}
        autoComplete="off"
        control={control}
        name="password"
        success={successPass}
        {...(resetPass && {
          label: 'Nova senha',
          size: 'small',
        })}
        // error={!!erroPassMsg}
        // helperText={erroPassMsg}
      />
      <InputForm
        onBlur={onBlurPassConfirm}
        label="Confirmar senha"
        placeholder="********"
        autoComplete="off"
        type="password"
        onChange={() => clearErrors('passwordConfirmation')}
        setValue={setValue}
        control={control}
        name="passwordConfirmation"
        success={successConfirmationPass}
        {...(resetPass && {
          size: 'small',
        })}
        // error={!!erroPassConfitmMsg}
        // helperText={erroPassConfitmMsg}
      />
    </>
  );
};
