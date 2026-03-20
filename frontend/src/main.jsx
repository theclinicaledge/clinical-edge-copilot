import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Landing from './Landing.jsx'

function Root() {
  const [page, setPage] = useState(() =>
    window.location.hash === '#/app' ? 'app' : 'landing'
  );

  useEffect(() => {
    const onHashChange = () => {
      setPage(window.location.hash === '#/app' ? 'app' : 'landing');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const enterApp = () => {
    window.location.hash = '#/app';
  };

  if (page === 'app') return <App />;
  return <Landing onEnterApp={enterApp} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
