import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Container, Dropdown, Form, Input, Radio } from 'semantic-ui-react';
import AssassinTable from './assassin-result-table';
import { RNG } from 'suikoden-rng-lib';
import { simulateAssassinFight } from 'suikoden-rng-lib/lib/rng';

const MOVES = [
  'Unknown',
  'Melee',
  'Shuriken'
];

const AssassinResult = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const rng = new RNG(parseInt(params.get('rng')));
  const iterations = parseInt(params.get('iterations'));
  const armor = parseInt(params.get('armor'));
  const [rangeStart, setRangeStart] = useState(parseInt(params.get('range_start')));
  const [rangeEnd, setRangeEnd] = useState(parseInt(params.get('range_end')));
  const [move1, setMove1] = useState(MOVES[0]);
  const [move2, setMove2] = useState(MOVES[0]);
  const [dmg1, setDmg1] = useState();
  const [dmg2, setDmg2] = useState();

  const sim_results = [];

  for (let i = 0; i < iterations; i++) {
    const cur_rng = rng.cloneKeepIndex();
    const sim_result = simulateAssassinFight(cur_rng, armor);
    sim_results.push({
      index: i,
      rng: rng.getRNG().toString(16),
      turn1_move: sim_result.turns[0].move_name,
      turn1_damage: sim_result.turns[0].damage,
      turn2_move: sim_result.turns[1].move_name,
      turn2_damage: sim_result.turns[1].damage,
      end_rng: cur_rng.getRNG().toString(16),
      end_index: cur_rng.count,
      advancement: cur_rng.count - i
    });
    rng.next();
  }

  const move_filter = (sim_move, selected_move) => {
    if (MOVES.indexOf(selected_move) <= 0) return true;
    return sim_move === selected_move;
  }

  const damage_filter = (sim_dmg, selected_dmg) => {
    if (typeof selected_dmg !== 'number' || isNaN(selected_dmg)) return true;
    return sim_dmg === selected_dmg;
  }

  const results_to_show = sim_results
    .slice(rangeStart, rangeEnd)
    .filter(({ turn1_move }) => move_filter(turn1_move, move1))
    .filter(({ turn2_move }) => move_filter(turn2_move, move2))
    .filter(({ turn1_damage }) => damage_filter(turn1_damage, dmg1))
    .filter(({ turn2_damage }) => damage_filter(turn2_damage, dmg2))

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <Form>
        <Form.Group>
          <Form.Dropdown
            label="Turn 1 Move"
            options={MOVES.map((move, index) => ({
              key: index, value: move, text: move
            }))}
            value={move1}
            onChange={(_e, data) => setMove1(data.value)}
            selection={true}
          />
          <Form.Input
            label="Turn 1 Damage"
            value={dmg1}
            type="number"
            min={0}
            step={1}
            onChange={e => setDmg1(parseInt(e.target.value))}
          />
        </Form.Group>
        <Form.Group>
          <Form.Dropdown
            label="Turn 2 Move"
            options={MOVES.map((move, index) => ({
              key: index, value: move, text: move
            }))}
            value={move2}
            onChange={(_e, data) => setMove2(data.value)}
            selection={true}
          />
          <Form.Input
            label="Turn 2 Damage"
            value={dmg2}
            type="number"
            min={0}
            step={1}
            onChange={e => setDmg2(parseInt(e.target.value))}
          />
        </Form.Group>
      </Form>
      <AssassinTable data={results_to_show}/>
    </Container>
  );
}

const MoveSelector = ({ turn, move, onChange }) => {
  return (
    <Form.Field style={{ display: 'flex' }} inline>
      <label>Select Move Turn {turn}</label>
      {MOVES.map((current_move) => (
        <Form.Field key={current_move} inline>
          <Radio
            label={current_move}
            name={`moveGroup ${turn}`}
            value={current_move}
            checked={move === current_move}
            onChange={(_e, { value }) => onChange(value)}
          />
        </Form.Field>
      ))}
    </Form.Field>
  );
};

export default withRouter(AssassinResult);
