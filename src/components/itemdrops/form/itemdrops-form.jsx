import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import { InputRNG, InputIterations } from 'components/form/inputs';

const ItemDropsForm = ({ areas, history }) => {
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [area, setArea] = useState('Cave of the Past');
  const [enemyGroup, setEnemyGroup] = useState(0);

  const handleSubmit = event => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.append('rng', rng);
    params.append('iterations', iterations);
    params.append('area', area);
    params.append('enemyGroup', enemyGroup);
    history.push(`/drops/result?${params.toString()}`);
  }

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG
          value={rng}
          onChange={e => setRNG(e.target.value)}
        />
        <InputIterations
          value={iterations}
          onChange={e => setIterations(e.target.value)}
        />
        <Form.Dropdown
          label="Area"
          placeholder="Area"
          options={Object.keys(areas).map(name =>
            ({ key: name, value: name, text: areas[name].name })
          )}
          value={area}
          onChange={(_e, data) => setArea(data.value)}
          search={true}
          selection={true}
        />
        <Form.Dropdown
          label="Enemy Group"
          placeholder="Enemy Group"
          options={areas[area].encounterTable.map((group, index) => ({
            key: group.name, value: index, text: group.name
          }))}
          value={enemyGroup}
          onChange={(_e, data) => setEnemyGroup(data.value)}
          search={true}
          selection={true}
        />
        <Form.Button type="submit" content="Calculate Drops" primary={true}/>
      </Form>
    </Container>
  );
};

export default withRouter(ItemDropsForm);
