import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check if we're in development mode
if (import.meta.env.DEV) {
  import('./mocks/mockApi');
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  //  <React.StrictMode>
  <App />
  //  </React.StrictMode>
);
