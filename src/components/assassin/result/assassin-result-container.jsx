import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Form } from 'semantic-ui-react';
import AssassinTable from './assassin-result-table';
import { RNG } from 'suikoden-rng-lib';
import { simulateAssassinFight } from 'suikoden-rng-lib/lib/rng';
import { characterLevelUps } from 'suikoden-rng-lib/stats/growths';

const KIRKIS_STARTING_HP = 20;

const AssassinResult = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const armor = parseInt(params.get('armor'));
  const rangeStart = parseInt(params.get('range_start'));
  const rangeEnd = parseInt(params.get('range_end'));
  const [dmg1, setDmg1] = useState(0);
  const [dmg2, setDmg2] = useState(0);
  const [kirkisHP, setKirkisHP] = useState(0);

  const sim_results = [];

  rng.next(rangeStart);

  for (let i = rangeStart; i < rangeEnd; i++) {
    const cur_rng = rng.cloneKeepIndex();
    const sim_result = simulateAssassinFight(cur_rng, armor);

    const assassin_end_index = cur_rng.count;
    const kirkis_stats = characterLevelUps('Kirkis', 1, 14, cur_rng);
    sim_results.push({
      index: i,
      rng: rng.getRNG().toString(16),
      turn1_move: sim_result.turns[0].move_name,
      turn1_damage: sim_result.turns[0].damage,
      turn2_move: sim_result.turns[1].move_name,
      turn2_damage: sim_result.turns[1].damage,
      end_rng: cur_rng.getRNG().toString(16),
      end_index: assassin_end_index,
      kirkis_hp: kirkis_stats.HP + KIRKIS_STARTING_HP,
      kirkis_index: cur_rng.count,
      advancement: cur_rng.count - i
    });
    rng.next();
  }

  const damage_filter = (sim_dmg, selected_dmg) => {
    if (typeof selected_dmg != 'number' || isNaN(selected_dmg)) return true;
    if (selected_dmg <= 0) return true;
    return sim_dmg === selected_dmg;
  }

  const results_to_show = sim_results
    .filter(({ turn1_damage }) => damage_filter(turn1_damage, dmg1))
    .filter(({ turn2_damage }) => damage_filter(turn2_damage, dmg2))
    .filter(({ kirkis_hp }) => damage_filter(kirkis_hp, kirkisHP))

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <Form>
        <Form.Group>
          <Form.Input
            label="Turn 1 Damage"
            value={dmg1}
            type="number"
            min={0}
            step={1}
            onChange={e => setDmg1(parseInt(e.target.value))}
          />
          <Form.Input
            label="Turn 2 Damage"
            value={dmg2}
            type="number"
            min={0}
            step={1}
            onChange={e => setDmg2(parseInt(e.target.value))}
          />
          <Form.Input
            label="Kirkis HP"
            value={kirkisHP}
            type="number"
            min={0}
            step={1}
            onChange={e => setKirkisHP(parseInt(e.target.value))}
          />
        </Form.Group>
      </Form>
      <AssassinTable data={results_to_show}/>
    </Container>
  );
}

export default withRouter(AssassinResult);
