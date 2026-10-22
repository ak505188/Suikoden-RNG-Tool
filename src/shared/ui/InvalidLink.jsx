import * as React from 'react';
import { Link } from 'react-router-dom';
import { Container, Message } from 'semantic-ui-react';

// What a result page shows when its link is missing something or has a bad value, instead of
// breaking. `formPath` is where the form for that result lives.
const InvalidLink = ({ problems, formPath }) => (
  <Container text={true}>
    <Message negative={true}>
      <Message.Header>This link doesn't work</Message.Header>
      <Message.List items={problems} />
      {formPath && (
        <p>
          <Link to={formPath}>Back to the form</Link>
        </p>
      )}
    </Message>
  </Container>
);

export default InvalidLink;
