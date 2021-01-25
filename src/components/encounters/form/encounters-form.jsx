import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Helpers } from 'suikoden-rng-lib';
import { Container, Form } from 'semantic-ui-react';
import { InputRNG, InputIterations, InputPartyLevel } from 'components/form/inputs';

const EncountersForm = ({ areas, history }) => {
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [partylevel, setPartylevel] = useState(0);
  const [realistic, setRealistic] = useState(true)
  const [selectedAreas, setSelectedAreas] = useState([]);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('rng', rng);
    params.append('iterations', iterations);
    params.append('partylevel', partylevel);
    params.append('realistic', realistic);
    params.append('areas', selectedAreas);
    history.push(`/encounters/result?${params.toString()}`);
  }

  return (
    <Container textAlign="center">
      <Form onSubmit={handleSubmit} action='result' size="large">
        <InputRNG
          value={rng}
          onChange={e => setRNG(e.target.value)}
        />
        <InputIterations
          value={iterations}
          onChange={e => setIterations(e.target.value)}
        />
        <InputPartyLevel
          value={partylevel}
          onChange={e => setPartylevel(e.target.value)}
        />
        <Form.Dropdown
          label="Areas"
          placeholder="Area"
          options={Helpers.areaNamesWithRandomEncounters.map(name =>
            ({ key: name, value: name, text: areas[name].name })
          )}
          value={selectedAreas}
          onChange={(_e, data) => setSelectedAreas(data.value)}
          multiple={true}
          search={true}
          selection={true}
        />
        <Form.Checkbox
          label="Realistic Mode"
          name="realistic"
          checked={realistic}
          onChange={e => setRealistic(e.target.checked)}
        />
        <Form.Button type="submit" content="Generate Starting Stats" primary={true}/>
      </Form>
    </Container>
  );
}

export default withRouter(EncountersForm);
