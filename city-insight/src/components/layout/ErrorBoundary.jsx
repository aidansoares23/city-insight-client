import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, () =>
          this.setState({ error: null }),
        );
      }

      return (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-800">
          <p className="font-semibold">Something went wrong.</p>
          <p className="mt-1 text-rose-600">{this.state.error.message}</p>
          <button
            className="mt-4 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
