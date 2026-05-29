import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  label: string;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Intentionally silent in production: UI recovers without leaking internals.
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className="boundary" role="alert" aria-live="polite">
          <p>Algo saiu do lugar nesta area de {this.props.label}. Recarregue a pagina para tentar novamente.</p>
        </section>
      );
    }

    return this.props.children;
  }
}
