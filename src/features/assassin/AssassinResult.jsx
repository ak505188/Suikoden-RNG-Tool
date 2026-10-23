import React, { useMemo, useState } from 'react';
import { Container, Form } from 'semantic-ui-react';
import { RNG, simulateAssassinFight } from 'suikoden-rng-lib';
import { CHARACTER_KEYS, Character } from 'suikoden-rng-lib/battle';
import DraftNumberInput from 'shared/form/DraftNumberInput';
import { int } from 'shared/lib/params';
import { useQueryParams } from 'shared/lib/useQueryParams';
import InvalidLink from 'shared/ui/InvalidLink';
import AssassinTable from './AssassinTable';

// Kirkis joins at level 1 and levels up to 15 over the course of the fight
const KIRKIS_LEVELS_GAINED = 14;

const SCHEMA = { rng: int(), range_start: int(), range_end: int() };

// A filter box takes a whole number from 0, and an empty box means no filter (0)
const isDamageFilter = (text) => text === '' || parseInt(text) >= 0;

// Every row the table can show: the fight from each RNG index in the range. It depends only on
// the link and McDohl's armor, so typing in a filter box doesn't run it again.
const simulateRows = (seed, rangeStart, rangeEnd, armor) => {
  const kirkis = new Character(CHARACTER_KEYS.KIRKIS);
  const rng = new RNG(seed);
  const sim_results = [];

  rng.jump(rangeStart);

  for (let i = rangeStart; i < rangeEnd; i++) {
    const cur_rng = rng.clone();
    const sim_result = simulateAssassinFight(cur_rng, armor);

    const assassin_end_index = cur_rng.count;
    const gained = kirkis.calculateLevelups(KIRKIS_LEVELS_GAINED, 1, cur_rng);
    const kirkis_stats = (stat) => kirkis.initial[stat] + gained[stat];
    sim_results.push({
      index: i,
      rng: rng.raw.toString(16),
      turn1_move: sim_result.turns[0].move_name,
      turn1_damage: sim_result.turns[0].damage,
      turn2_move: sim_result.turns[1].move_name,
      turn2_damage: sim_result.turns[1].damage,
      end_rng: cur_rng.raw.toString(16),
      end_index: assassin_end_index,
      kirkis_hp: kirkis_stats('HP'),
      kirkis_pwr: kirkis_stats('PWR'),
      kirkis_skl: kirkis_stats('SKL'),
      kirkis_def: kirkis_stats('DEF'),
      kirkis_spd: kirkis_stats('SPD'),
      kirkis_mgc: kirkis_stats('MGC'),
      kirkis_luk: kirkis_stats('LUK'),
      kirkis_index: cur_rng.count,
      advancement: cur_rng.count - i,
    });
    rng.next();
  }
  return sim_results;
};

const damage_filter = (sim_dmg, selected_dmg) => {
  if (typeof selected_dmg != 'number' || isNaN(selected_dmg)) return true;
  if (selected_dmg <= 0) return true;
  return sim_dmg === selected_dmg;
};

const AssassinResult = () => {
  const { params, problems } = useQueryParams(SCHEMA);
  const [heroArmor, setHeroArmor] = useState(80);
  const [dmg1, setDmg1] = useState(27);
  const [dmg2, setDmg2] = useState(27);
  const [kirkisHP, setKirkisHP] = useState(0);
  const rows = useMemo(
    () =>
      problems.length > 0
        ? []
        : simulateRows(params.rng, params.range_start, params.range_end, heroArmor),
    [problems, params, heroArmor],
  );
  const results_to_show = useMemo(
    () =>
      rows
        .filter(({ turn1_damage }) => damage_filter(turn1_damage, dmg1))
        .filter(({ turn2_damage }) => damage_filter(turn2_damage, dmg2))
        .filter(({ kirkis_hp }) => damage_filter(kirkis_hp, kirkisHP)),
    [rows, dmg1, dmg2, kirkisHP],
  );
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/assassin" />;

  return (
    <Container style={{ flex: 1 }} textAlign="center">
      <Form>
        <Form.Group>
          <Form.Field
            control={DraftNumberInput}
            label="McDohl Armor"
            value={heroArmor}
            min={18}
            step={1}
            accepts={(text) => parseInt(text) >= 18}
            onCommit={(text) => setHeroArmor(parseInt(text))}
          />
          <Form.Field
            control={DraftNumberInput}
            label="Turn 1 Damage"
            value={dmg1}
            min={0}
            step={1}
            accepts={isDamageFilter}
            onCommit={(text) => setDmg1(parseInt(text) || 0)}
          />
          <Form.Field
            control={DraftNumberInput}
            label="Turn 2 Damage"
            value={dmg2}
            min={0}
            step={1}
            accepts={isDamageFilter}
            onCommit={(text) => setDmg2(parseInt(text) || 0)}
          />
          <Form.Field
            control={DraftNumberInput}
            label="Kirkis HP"
            value={kirkisHP}
            min={0}
            step={1}
            accepts={isDamageFilter}
            onCommit={(text) => setKirkisHP(parseInt(text) || 0)}
          />
        </Form.Group>
      </Form>
      <AssassinTable rng={`0x${new RNG(params.rng).seed.toString(16)}`} data={results_to_show} />
    </Container>
  );
};

export default AssassinResult;
