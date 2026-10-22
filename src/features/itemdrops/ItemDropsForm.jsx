import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import { formationName } from 'suikoden-rng-lib/encounters';
import { InputRNG, InputIterations } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';
import { FIGHT_AREAS, areaFormations, areaId, findAreaById } from 'shared/lib/encounters';

const ItemDropsForm = () => {
  const history = useHistory();
  const [rng, setRNG] = useState(Helpers.numToHexString(0x12));
  const [iterations, setIterations] = useState(1000);
  const [area, setArea] = useState('Cave of the Past');
  const [enemyGroup, setEnemyGroup] = useState(0);

  const handleSubmit = submitTo(history, '/drops/result', { rng, iterations, area, enemyGroup });

  return (
    <Container textAlign="center">
      <Form size="large" onSubmit={handleSubmit}>
        <InputRNG value={rng} onChange={(e) => setRNG(e.target.value)} />
        <InputIterations value={iterations} onChange={(e) => setIterations(e.target.value)} />
        <Form.Dropdown
          label="Area"
          placeholder="Area"
          options={FIGHT_AREAS.map((a) => ({
            key: areaId(a),
            value: areaId(a),
            text: a.name,
          }))}
          value={area}
          onChange={(_e, data) => {
            setArea(data.value);
            setEnemyGroup(0);
          }}
          search={true}
          selection={true}
        />
        <Form.Dropdown
          label="Enemy Group"
          placeholder="Enemy Group"
          options={areaFormations(findAreaById(area)).map(({ formation }, index) => ({
            key: index,
            value: index,
            text: formationName(formation),
          }))}
          value={enemyGroup}
          onChange={(_e, data) => setEnemyGroup(data.value)}
          search={true}
          selection={true}
        />
        <Form.Button type="submit" content="Calculate Drops" primary={true} />
      </Form>
    </Container>
  );
};

export default ItemDropsForm;
