import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { DEFAULT_RNG, InputIterations, InputPartyLevel, InputRNG } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';
import { ENCOUNTER_AREAS, areaId } from 'shared/lib/encounters';

const RunAssistantForm = () => {
  const history = useHistory();
  const [rng, setRNG] = useState(DEFAULT_RNG);
  const [iterations, setIterations] = useState(1000);
  const [partyLevel, setPartyLevel] = useState(0);
  const [realistic, setRealistic] = useState(true);
  const [areas, setAreas] = useState([]);

  const handleSubmit = submitTo(history, '/runassist/result', {
    rng,
    iterations,
    partyLevel,
    realistic,
    areas,
  });

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG value={rng} onChange={(e) => setRNG(e.target.value)} />
        <InputIterations value={iterations} onChange={(e) => setIterations(e.target.value)} />
        <InputPartyLevel value={partyLevel} onChange={(e) => setPartyLevel(e.target.value)} />
        <Form.Dropdown
          label="Areas"
          placeholder="Area"
          options={ENCOUNTER_AREAS.map((area) => ({
            key: areaId(area),
            value: areaId(area),
            text: area.name,
          }))}
          value={areas}
          onChange={(_e, data) => setAreas(data.value)}
          multiple={true}
          search={true}
          selection={true}
        />
        <Form.Checkbox
          label="Realistic Mode"
          name="realistic"
          checked={realistic}
          onChange={(_e, data) => setRealistic(data.checked)}
        />
        <Form.Button
          type="submit"
          content="Generate Encounters"
          primary={true}
          disabled={areas.length === 0}
        />
      </Form>
    </Container>
  );
};

export default RunAssistantForm;
