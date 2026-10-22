import * as React from 'react';
import { Link } from 'react-router-dom';
import { Container, Message } from 'semantic-ui-react';

// Catches an error in the page below it, so one broken page shows a message and the navbar stays,
// instead of the whole app going blank. Changing `resetKey` (the current URL) clears the error,
// so moving to another page works again.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
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
  }
}
