import * as React from 'react';
import { Form } from 'semantic-ui-react';

export const InputRNG = ({ value, onChange }) => (
  <Form.Input
    label="Initial RNG Value"
    name="rng"
    type="text"
    value={value}
    onChange={onChange}
  />
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
    name="partylevel"
    type="number"
    value={value}
    onChange={onChange}
  />
);
