import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Characters } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { DEFAULT_RNG, InputRNG } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';

const LevelUpsForm = () => {
  const history = useHistory();
  const [characters, setCharacters] = useState([]);
  const [startingLevel, setStartingLevel] = useState(1);
  const [rng, setRNG] = useState(DEFAULT_RNG);
  const [iterations, setIterations] = useState(10);

  const handleSubmit = submitTo(history, '/stats/level-ups/result', {
    characters,
    rng,
    iterations,
    startingLevel,
  });

  return (
    <Container textAlign="center">
      <Form onSubmit={handleSubmit} action="result" size="large">
        <Form.Dropdown
          label="Characters"
          placeholder="Character"
          options={Object.keys(Characters)
            .sort()
            .map((name) => ({ key: name, value: name, text: name }))}
          value={characters}
          onChange={(_e, data) => setCharacters(data.value)}
          multiple={true}
          search={true}
          selection={true}
        />
        <InputRNG value={rng} onChange={(e) => setRNG(e.target.value)} />
        <Form.Input
          label="Iterations"
          name="iterations"
          step="1"
          type="number"
          value={iterations}
          onChange={(e) => setIterations(e.target.value)}
        />
        <Form.Input
          label="Starting Level"
          type="number"
          value={startingLevel}
          onChange={(e) => setStartingLevel(e.target.value)}
          min={1}
          max={99}
        />
        <Form.Button
          type="submit"
          content="Generate Level Ups"
          primary={true}
          disabled={characters.length === 0}
        />
      </Form>
    </Container>
  );
};

export default LevelUpsForm;
