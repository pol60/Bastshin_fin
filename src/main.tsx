import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorBoundary from './ErrorBoundary';


createRoot(document.getElementById('root')!)
  .render(
    <StrictMode>
      <Suspense fallback={<div className="loading-overlay" />}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Suspense>
    </StrictMode>
  );
