import React, { FC, useEffect } from 'react';

import { Global } from '@emotion/react';
import { ModalEditCompany } from 'components/organisms/modals/company/ModalEditCompany';
import { ModalAddContact } from 'components/organisms/modals/ModalAddContact/ModalAddContact';
import { ModalAddPcmsoAttendanceService } from 'components/organisms/modals/ModalAddPcmsoAttendanceService/ModalAddPcmsoAttendanceService';
import { ModalAddPcmsoExaminingPhysician } from 'components/organisms/modals/ModalAddPcmsoExaminingPhysician/ModalAddPcmsoExaminingPhysician';
import { ModalAddProfessional } from 'components/organisms/modals/ModalAddProfessional/ModalAddProfessional';
import { ModalAddProfessionalResponsible } from 'components/organisms/modals/ModalAddProfessionalResponsible/ModalAddProfessionalResponsible';
import { ModalBlank } from 'components/organisms/modals/ModalBlank/ModalBlank';
import { ModalReport } from 'components/organisms/modals/ModalReport/ModalReport';
import { ModalReportSelect } from 'components/organisms/modals/ModalReportSelect/ModalReportSelect';
import { ModalSelectClinic } from 'components/organisms/modals/ModalSelectClinics';
import { ModalCopyRiskImportEntry } from 'components/organisms/modals/ModalCopyRiskImportEntry';
import { ModalImportGseConfirm } from 'components/organisms/modals/ModalImportGseConfirm';
import { ModalCopyRiskSelect } from 'components/organisms/modals/ModalCopyRiskSelect';
import { ModalSelectCompany } from 'components/organisms/modals/ModalSelectCompany';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { ModalUploadNewFile } from 'components/organisms/modals/ModalUploadNewFile/ModalUploadNewFile';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { useRouter } from 'next/router';
import { selectUser } from 'store/reducers/user/userSlice';

import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useRedirectDetect } from 'core/hooks/useRedirectDetect';
import { useQueryDashboard } from 'core/services/hooks/queries/useQueryDashboard';

import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import globalStyles from '../../../core/styles/globalStyles';
import { setIsRouteLoading } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { DashboardLayout } from '../../dashboard';
import DefaultModal from '../modal';
import { SModal } from '@v2/components/organisms/SModal/SModal';
import { AIChatToggleButton } from '@v2/features/ai-chat';
import { isPublicMarketingPath } from '@v2/pages/site/presentation/constants/presentation.constant';

const DefaultLayout: FC<React.PropsWithChildren<any>> = ({ children }) => {
  useRedirectDetect();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isMarketingSite = isPublicMarketingPath(router.pathname);

  useEffect(() => {
    const handleStart = (nextPath: string) => {
      const actualPath = window.location.pathname;
      const isRouteLoading = nextPath.split('?')[0] !== actualPath;

      if (isRouteLoading) dispatch(setIsRouteLoading(true));
    };

    const handleStop = () => {
      dispatch(setIsRouteLoading(false));
    };

    if (
      !isMarketingSite &&
      router.pathname != RoutesEnum.ONBOARD_USER &&
      user &&
      // (!user.name || !user.cpf)
      !user.name
    ) {
      router.replace(RoutesEnum.ONBOARD_USER);
    }

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
      dispatch(setIsRouteLoading(false));
    };
  }, [router, dispatch, user, isMarketingSite]);

  return (
    <main>
      <Global styles={globalStyles} />
      <DashboardLayout>{children}</DashboardLayout>
      <SModal />
      <DefaultModal />
      <ModalSelectCompany />
      <ModalCopyRiskImportEntry />
      <ModalImportGseConfirm />
      <ModalCopyRiskSelect />
      <ModalSelectClinic />
      <ModalEditCompany />
      <ModalAddProfessionalResponsible />
      <ModalAddContact />
      <ModalAddPcmsoAttendanceService />
      <ModalAddPcmsoExaminingPhysician />
      <ModalUploadPhoto />
      <ModalUploadNewFile />
      <ModalAddProfessional />
      {/* Required by ModalAddProfessional (formations/certifications via SDisplaySimpleArray). */}
      <ModalSingleInput />
      <ModalReportSelect />
      <ModalReport />
      <ModalBlank />
      {!isMarketingSite && <AIChatToggleButton />}
    </main>
  );
};

export default DefaultLayout;
