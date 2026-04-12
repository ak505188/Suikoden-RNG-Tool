import React from 'react';
import { withRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { calculateLevels } from './lib';

const ExperienceContainer = ({ characters, fights }) => {
  console.log(characters, fights);
  const results = calculateLevels(characters, fights);
  console.log(results);

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      {
        results.map((result, index) =>
          <div key={`${index}`}>
            {JSON.stringify(result.characters)}
          </div>
        )
      }
    </Container>
  );
}

export default withRouter(ExperienceContainer);
