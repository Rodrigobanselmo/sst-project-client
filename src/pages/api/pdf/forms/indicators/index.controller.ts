import React from 'react';
import { DocumentProps, renderToStream } from '@react-pdf/renderer';
import PdfFormIndicators from 'components/pdfs/documents/formsIndicators/formsIndicators.pdf';
import type { NextApiRequest, NextApiResponse } from 'next';

import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormApplicationReadModel,
  IFormApplicationReadModel,
} from '@v2/models/form/models/form-application/form-application-read.model';
import {
  FormQuestionsAnswersBrowseModel,
  IFormQuestionsAnswersBrowseModel,
} from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { buildIndicatorsPdfDataset } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildIndicatorsPdfDataset';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { setupAPIClient } from 'core/services/api';

import { fetchHierarchyGroupsForPdf } from '../fetchHierarchyGroupsForPdf';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { companyId, applicationId, groupBy, showOnlyGroupIndicators } =
      req.query;

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid companyId' });
    }
    if (!applicationId || typeof applicationId !== 'string') {
      return res
        .status(400)
        .json({ message: 'Missing or invalid applicationId' });
    }

    const groupByQuestionId =
      typeof groupBy === 'string' && groupBy.length > 0 ? groupBy : null;

    const onlyGroupIndicators =
      typeof showOnlyGroupIndicators === 'string'
        ? showOnlyGroupIndicators === 'true'
        : true;

    const apiClient = setupAPIClient({ req } as any);

    const [appRes, qaRes] = await Promise.all([
      apiClient.get<IFormApplicationReadModel>(
        bindUrlParams({
          path: FormRoutes.FORM_APPLICATION.PATH_ID,
          pathParams: { companyId, applicationId },
        }),
      ),
      apiClient.get<IFormQuestionsAnswersBrowseModel>(
        bindUrlParams({
          path: FormRoutes.FORM_QUESTIONS_ANSWERS.PATH,
          pathParams: { companyId },
          queryParams: { formApplicationId: applicationId },
        }),
      ),
    ]);

    const hierarchyGroups = await fetchHierarchyGroupsForPdf(
      apiClient,
      companyId,
      applicationId,
    );

    const formApplication = new FormApplicationReadModel(appRes.data);
    const formQuestionsAnswers = new FormQuestionsAnswersBrowseModel(
      qaRes.data,
    );

    const dataset = buildIndicatorsPdfDataset({
      formQuestionsAnswers,
      selectedGroupingQuestionId: groupByQuestionId,
      showOnlyGroupIndicators: onlyGroupIndicators,
      isShareableLink: formApplication.isShareableLink,
      hierarchyGroups,
    });

    const issuedAt = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());

    const pdfBuffer = await renderToStream(
      PdfFormIndicators({
        data: dataset,
        meta: {
          formName: formApplication.form.name,
          applicationName: formApplication.name,
          issuedAt,
        },
      }) as React.ReactElement<DocumentProps>,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="relatorio-indicadores.pdf"',
    );

    return pdfBuffer.pipe(res);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
