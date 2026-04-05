import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Keep details in console for debugging while preventing a blank white screen for users.
    console.error("Application render error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0f172a",
          color: "#f8fafc",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: "560px" }}>
            <h1 style={{ marginBottom: "12px" }}>Something went wrong</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>
              The app failed to load correctly. Please refresh the page. If the issue keeps happening,
              clear your browser cache and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                background: "#D4AF37",
                color: "#111827",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);

// Some users were getting a blank screen after deploys because stale service-worker
// caches can keep serving outdated assets. For now we disable SW usage and clean up
// any previously registered workers/caches at startup.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
      }
    } catch {
      // No-op: app should still render even if cleanup fails.
    }
  });
}
