import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { ENCOUNTER_AREAS, areaId } from 'shared/lib/encounters';
import { DEFAULT_RNG, InputRNG, InputIterations, InputPartyLevel } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';

const EncountersForm = () => {
  const history = useHistory();
  const [rng, setRNG] = useState(DEFAULT_RNG);
  const [iterations, setIterations] = useState(1000);
  const [offset, setOffset] = useState(0);
  const [partyLevel, setPartyLevel] = useState(0);
  const [realistic, setRealistic] = useState(true);
  const [selectedAreas, setSelectedAreas] = useState([]);

  const handleSubmit = submitTo(history, '/encounters/result', {
    rng,
    iterations,
    offset,
    partyLevel,
    realistic,
    areas: selectedAreas,
  });

  return (
    <Container textAlign="center">
      <Form onSubmit={handleSubmit} action="result" size="large">
        <InputRNG value={rng} onChange={(e) => setRNG(e.target.value)} />
        <InputIterations value={iterations} onChange={(e) => setIterations(e.target.value)} />
        <Form.Input
          label="RNG offset to start from"
          name="offset"
          step="500"
          type="number"
          value={offset}
          onChange={(e) => setOffset(e.target.value)}
        />
        <InputPartyLevel value={partyLevel} onChange={(e) => setPartyLevel(e.target.value)} />
        <Form.Dropdown
          label="Areas"
          placeholder="Area"
          options={ENCOUNTER_AREAS.map((area) => ({
            key: areaId(area),
            value: areaId(area),
            text: area.name,
          }))}
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
          onChange={(_e, data) => setRealistic(data.checked)}
        />
        <Form.Button
          type="submit"
          content="Generate Encounters"
          primary={true}
          disabled={selectedAreas.length === 0}
        />
      </Form>
    </Container>
  );
};

export default EncountersForm;
