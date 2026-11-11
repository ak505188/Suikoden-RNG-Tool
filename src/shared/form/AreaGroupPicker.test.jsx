import React, { useState } from 'react';
import { Simulate } from 'react-dom/test-utils';
import { Form } from 'semantic-ui-react';
import { describe, expect, test } from 'vitest';
import { act, render as mount } from 'test/render';
import { FIGHT_AREAS, areaId } from 'shared/lib/encounters';
import AreaGroupPicker from './AreaGroupPicker';

let container;

const render = (initial) => {
  const picks = [];
  const Harness = () => {
    const [picked, setPicked] = useState(initial);
    return (
      <Form>
        <AreaGroupPicker
          {...picked}
          onChange={(next) => {
            picks.push(next);
            setPicked(next);
          }}
        />
      </Form>
    );
  };
  container = mount(<Harness />);
  return picks;
};

const dropdown = (label) =>
  [...container.querySelectorAll('.field')].find(
    (field) => field.querySelector('label').textContent === label,
  );
const choose = (label, text) =>
  act(() => {
    const item = [...dropdown(label).querySelectorAll('[role=option]')].find(
      (option) => option.textContent === text,
    );
    Simulate.click(item);
  });

describe('AreaGroupPicker', () => {
  test('lists the picked area as selected and its groups', () => {
    render({ area: areaId(FIGHT_AREAS[0]), enemyGroup: 0 });
    expect(dropdown('Area').querySelector('.text').textContent).toBe(FIGHT_AREAS[0].name);
    expect(dropdown('Enemy Group').querySelectorAll('[role=option]').length).toBeGreaterThan(0);
  });

  test('picking another area resets the enemy group to the first', () => {
    const picks = render({ area: areaId(FIGHT_AREAS[0]), enemyGroup: 2 });
    choose('Area', FIGHT_AREAS[1].name);
    expect(picks).toEqual([{ area: areaId(FIGHT_AREAS[1]), enemyGroup: 0 }]);
  });

  test('picking a group keeps the area', () => {
    const picks = render({ area: areaId(FIGHT_AREAS[0]), enemyGroup: 0 });
    const options = dropdown('Enemy Group').querySelectorAll('[role=option]');
    choose('Enemy Group', options[1].textContent);
    expect(picks).toEqual([{ area: areaId(FIGHT_AREAS[0]), enemyGroup: 1 }]);
  });

  test('scripted fights follow the random ones, tinted, with a line above the first and no suffix', () => {
    const area = FIGHT_AREAS.find((a) => a.scripted?.length);
    render({ area: areaId(area), enemyGroup: 0 });
    const options = [...dropdown('Enemy Group').querySelectorAll('[role=option]')];
    const scripted = options.filter((option) => option.classList.contains('scripted'));
    expect(scripted).toHaveLength(area.scripted.length);
    expect(options.slice(-scripted.length)).toEqual(scripted);
    expect(options.filter((option) => option.classList.contains('scripted-start'))).toEqual([
      scripted[0],
    ]);
    expect(options.some((option) => option.textContent.includes('scripted'))).toBe(false);
  });
});
