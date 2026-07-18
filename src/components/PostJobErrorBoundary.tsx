import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PostJobErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[PostJobPage] Uncaught error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearDraft = () => {
    try {
      localStorage.removeItem("nexora:postJobWizard:v1");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const message = this.state.error?.message ?? "Something went wrong.";

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full rounded-2xl border border-border bg-card shadow-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong on this page
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            Don't worry — your progress is saved as a draft. You can try again, reload the page, or clear the draft if the issue persists.
          </p>
          <p className="text-xs text-muted-foreground/80 font-mono mb-6 break-words">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={this.handleReset} variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try again
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reload page
            </Button>
            <Button onClick={this.handleClearDraft} variant="ghost" className="gap-2">
              <Home className="h-4 w-4" /> Clear draft & restart
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
