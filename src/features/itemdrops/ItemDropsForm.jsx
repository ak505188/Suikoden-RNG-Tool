import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';
import AreaGroupPicker from 'shared/form/AreaGroupPicker';
import { InputRNG, InputIterations } from 'shared/form/inputs';
import { submitTo } from 'shared/form/submitTo';

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
        <AreaGroupPicker
          area={area}
          enemyGroup={enemyGroup}
          onChange={(picked) => {
            setArea(picked.area);
            setEnemyGroup(picked.enemyGroup);
          }}
        />
        <Form.Button type="submit" content="Calculate Drops" primary={true} />
      </Form>
    </Container>
  );
};

export default ItemDropsForm;
