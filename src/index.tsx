import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster, toaster } from './hooks/notify';
import './index.css';
import App from './App';

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999 }}>
        <Toaster toaster={toaster}>
          {(toast) => (
            <div
              data-scope="toast"
              data-part="root"
              style={{
                background: toast.type === 'success' ? '#38A169' : toast.type === 'error' ? '#E53E3E' : '#2d3748',
                color: '#fff',
                borderRadius: 8,
                padding: '16px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontSize: '1rem',
                marginTop: 12,
                maxWidth: 350,
                position: 'relative',
              }}
            >
              <div data-part="title" style={{ fontWeight: 'bold', marginBottom: 4 }}>{toast.title}</div>
              {toast.description && (
                <div data-part="description" style={{ fontSize: '0.95em', opacity: 0.85 }}>{toast.description}</div>
              )}
            </div>
          )}
        </Toaster>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
