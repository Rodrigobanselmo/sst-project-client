import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SText } from '@v2/components/atoms/SText/SText';

type Props = {
  children: ReactNode;
  onReset?: () => void;
  /** Rótulo curto da seção (sem conteúdo sensível). */
  section?: string;
};

type State = {
  hasError: boolean;
};

function isNonProduction(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Boundary local do drawer de explicabilidade.
 * Em desenvolvimento registra name/message/componentStack (sem payload).
 */
export class FrpsExplainabilityDrawerErrorBoundary extends Component<
  Props,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (!isNonProduction()) return;
    console.error('[FRPS explainability render error]', {
      name: error?.name,
      message: error?.message,
      section: this.props.section || null,
      componentStack: info?.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ px: this.props.section ? 0 : { xs: 2.5, md: 4 }, py: this.props.section ? 1 : 3 }}>
          <SText
            variant="body2"
            color="error.main"
            fontSize={14}
            sx={{ mb: 2, lineHeight: 1.5 }}
          >
            Não foi possível exibir esta explicação. Feche e tente novamente.
          </SText>
          {!this.props.section && (
            <SButton
              variant="outlined"
              size="s"
              text="Tentar novamente"
              onClick={this.handleReset}
              buttonProps={{ type: 'button' }}
            />
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}
