import React, { Component, ErrorInfo, ReactNode } from 'react';

import { Alert, Box, Button } from '@mui/material';
import SText from 'components/atoms/SText';
import SFlex from 'components/atoms/SFlex';

type Props = {
  children: ReactNode;
  title?: string;
  onRetry?: () => void;
  onBack?: () => void;
};

type State = {
  hasError: boolean;
  message: string;
};

/**
 * Isola falhas de renderização do editor/etapa (ex.: Análise IA) para não
 * apagar o shell inteiro da aplicação.
 */
export class CharacterizationEditStepErrorBoundary extends Component<
  Props,
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'Erro inesperado ao abrir esta etapa.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[CharEditBoundary]', error, info?.componentStack);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: '' });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Box sx={{ p: 3, width: '100%', minHeight: 240 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {this.props.title || 'Não foi possível exibir esta etapa.'}
        </Alert>
        <SText color="text.secondary" fontSize={13} mb={2}>
          {this.state.message}
        </SText>
        <SFlex gap={2} flexWrap="wrap">
          {this.props.onRetry && (
            <Button variant="contained" onClick={this.handleRetry}>
              Tentar novamente
            </Button>
          )}
          {this.props.onBack && (
            <Button variant="outlined" onClick={this.props.onBack}>
              Voltar
            </Button>
          )}
        </SFlex>
      </Box>
    );
  }
}
