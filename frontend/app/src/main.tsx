import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Mock API removed - all requests now go directly to backend

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  //  <React.StrictMode>
  <App />
  //  </React.StrictMode>
);
