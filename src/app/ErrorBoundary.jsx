import * as React from 'react';
import { ErrorBoundary as Boundary } from 'react-error-boundary';
import { Link } from 'react-router-dom';
import { Container, Message } from 'semantic-ui-react';

const PageError = ({ error }) => (
  <Container text={true}>
    <Message negative={true}>
      <Message.Header>Something went wrong on this page</Message.Header>
      <p>{error.message}</p>
      <p>
        <Link to="/">Home</Link>
      </p>
    </Message>
  </Container>
);

const logError = (error, info) => console.error(error, info.componentStack);

// Catches an error in the page below it, so one broken page shows a message and the navbar stays,
// instead of the whole app going blank. Changing `resetKey` (the current URL) clears the error,
// so moving to another page works again.
const ErrorBoundary = ({ resetKey, children }) => (
  <Boundary FallbackComponent={PageError} resetKeys={[resetKey]} onError={logError}>
    {children}
  </Boundary>
);

export default ErrorBoundary;
