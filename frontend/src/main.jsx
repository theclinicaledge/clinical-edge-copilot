import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Landing from './Landing.jsx'
import Scenario from './Scenario.jsx'

function getPage() {
  const hash = window.location.hash;
  if (hash === '#/app') return 'app';
  if (hash === '#/scenario') return 'scenario';
  return 'landing';
}

function Root() {
  const [page, setPage] = useState(getPage);

  useEffect(() => {
    const onHashChange = () => setPage(getPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const enterApp = () => { window.location.hash = '#/app'; };
  const enterScenario = () => { window.location.hash = '#/scenario'; };
  const goBack = () => { window.location.hash = ''; };

  if (page === 'app') return <App />;
  if (page === 'scenario') return <Scenario onBack={goBack} onEnterApp={enterApp} />;
  return <Landing onEnterApp={enterApp} onEnterScenario={enterScenario} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
