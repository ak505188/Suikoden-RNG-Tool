import * as React from 'react';
import { Form } from 'semantic-ui-react';
import { Helpers } from 'suikoden-rng-lib';

// The RNG value every form starts with
export const DEFAULT_RNG = Helpers.numToHexString(0x12);

export const InputRNG = ({ value, onChange }) => (
  <Form.Input label="Initial RNG Value" name="rng" type="text" value={value} onChange={onChange} />
);

export const InputIterations = ({ value, onChange }) => (
  <Form.Input
    label="Iterations"
    name="iterations"
    step="500"
    type="number"
    value={value}
    onChange={onChange}
  />
);

export const InputPartyLevel = ({ value, onChange }) => (
  <Form.Input
    label="Party Level"
    name="partyLevel"
    type="number"
    value={value}
    onChange={onChange}
  />
);
