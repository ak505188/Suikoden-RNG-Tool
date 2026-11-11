import * as React from 'react';
import Navbar from './Navbar';
import { PAGES } from './pages';
import { Loader } from 'semantic-ui-react';
import { Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

const App = () => {
  const { pathname, search } = useLocation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh' }}>
      <Navbar />
      <ErrorBoundary resetKey={pathname + search}>
        <React.Suspense fallback={<Loader active inline="centered" />}>
          {PAGES.map(({ path, Page }) => (
            <Route key={path} path={path} exact={true} render={() => <Page />} />
          ))}
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default App;
