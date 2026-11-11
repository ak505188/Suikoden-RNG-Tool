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

const SCHEMA = {
  rng: int(),
  rangeStart: int({ alias: 'range_start' }),
  rangeEnd: int({ alias: 'range_end' }),
};

// A filter box takes a whole number from 0, and an empty box means no filter (0)
const isDamageFilter = (text) => text === '' || parseInt(text) >= 0;

// Every row the table can show: the fight from each RNG index in the range. It depends only on
// the link and McDohl's armor, so typing in a filter box doesn't run it again.
const simulateRows = (seed, rangeStart, rangeEnd, armor) => {
  const kirkis = new Character(CHARACTER_KEYS.KIRKIS);
  const rng = new RNG(seed);
  const simResults = [];

  rng.jump(rangeStart);

  for (let i = rangeStart; i < rangeEnd; i++) {
    const curRng = rng.clone();
    const simResult = simulateAssassinFight(curRng, armor);

    const assassinEndIndex = curRng.count;
    const gained = kirkis.calculateLevelups(KIRKIS_LEVELS_GAINED, 1, curRng);
    const kirkisStat = (stat) => kirkis.initial[stat] + gained[stat];
    simResults.push({
      index: i,
      rng: rng.raw.toString(16),
      turn1_move: simResult.turns[0].move_name,
      turn1_damage: simResult.turns[0].damage,
      turn2_move: simResult.turns[1].move_name,
      turn2_damage: simResult.turns[1].damage,
      end_rng: curRng.raw.toString(16),
      end_index: assassinEndIndex,
      kirkis_hp: kirkisStat('HP'),
      kirkis_pwr: kirkisStat('PWR'),
      kirkis_skl: kirkisStat('SKL'),
      kirkis_def: kirkisStat('DEF'),
      kirkis_spd: kirkisStat('SPD'),
      kirkis_mgc: kirkisStat('MGC'),
      kirkis_luk: kirkisStat('LUK'),
      kirkis_index: curRng.count,
      advancement: curRng.count - i,
    });
    rng.next();
  }
  return simResults;
};

const damageFilter = (simDmg, selectedDmg) => {
  if (typeof selectedDmg != 'number' || isNaN(selectedDmg)) return true;
  if (selectedDmg <= 0) return true;
  return simDmg === selectedDmg;
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
        : simulateRows(params.rng, params.rangeStart, params.rangeEnd, heroArmor),
    [problems, params, heroArmor],
  );
  const resultsToShow = useMemo(
    () =>
      rows
        .filter(({ turn1_damage }) => damageFilter(turn1_damage, dmg1))
        .filter(({ turn2_damage }) => damageFilter(turn2_damage, dmg2))
        .filter(({ kirkis_hp }) => damageFilter(kirkis_hp, kirkisHP)),
    [rows, dmg1, dmg2, kirkisHP],
  );
  if (problems.length > 0) return <InvalidLink problems={problems} formPath="/assassin" />;

  return (
    <Container className="page-fill" textAlign="center">
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
      <AssassinTable rng={`0x${new RNG(params.rng).seed.toString(16)}`} data={resultsToShow} />
    </Container>
  );
};

export default AssassinResult;
