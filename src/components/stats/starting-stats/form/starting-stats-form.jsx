import React, { useState } from 'react';
import { Characters } from 'suikoden-rng-lib/stats/characters';
import { withRouter } from 'react-router-dom';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG, InputIterations} from 'components/form/inputs';

const StartingStatsForm = ({ areas, history }) => {
  const [characters, setCharacters] = useState([]);
  const [startingLevel, setStartingLevel] = useState(1);
  const [levelsGained, setLevelsGained] = useState(1);
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('characters', characters);
    params.append('rng', rng);
    params.append('iterations', iterations);
    params.append('startingLevel', startingLevel);
    params.append('levelsGained', levelsGained);
    history.push(`/stats/starting-stats/result?${params.toString()}`);
  }

  return (
    <Container textAlign="center">
      <Form onSubmit={handleSubmit} action="result" size="large">
        <Form.Dropdown
          label="Characters"
          placeholder="Character"
          options={Object.keys(Characters).sort().map(name =>
            ({ key: name, value: name, text: name }))}
          value={characters}
          onChange={(_e, data) => setCharacters(data.value)}
          multiple={true}
          search={true}
          selection={true}
        />
        <InputRNG
          value={rng}
          onChange={e => setRNG(e.target.value)}
        />
        <InputIterations
          value={iterations}
          onChange={e => setIterations(e.target.value)}
        />
        <Form.Input
          label="Starting Level"
          type="number"
          value={startingLevel}
          onChange={e => setStartingLevel(e.target.value)}
          min={1}
          max={99}
        />
        <Form.Input
          label="Levels Gained"
          type="number"
          value={levelsGained}
          onChange={e => setLevelsGained(e.target.value)}
          min={1}
          max={98}
        />
        <Form.Button type="submit" content="Generate Starting Stats" primary={true}/>
      </Form>
    </Container>
  );
}

export default withRouter(StartingStatsForm);
