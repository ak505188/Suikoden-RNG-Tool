const CURSOR_POSITIONS = [
  118,
  120,
  122,
  125,
  128,
  132,
  136,
  141,
  146,
  152,
  158,
  165,
  171,
  177,
  182,
  187,
  191,
  195,
  198,
  201,
  203,
  202,
  200,
  198,
  195,
  192,
  188,
  184,
  179,
  174,
  168,
  162,
  155,
  149,
  143,
  138,
  133,
  129,
  125,
  122,
  119,
  117,
];

class Cursor {
  constructor() {
    this.index = 0;
  }

  next() {
    const new_index = self.index + 1
    self.index = CURSOR_POSITIONS[new_index] ? new_index : 0;
    return this;
  }

  getValue() {
    return this.getPos() < 160 ? 144 - this.getPos() : this.getPos() - 176;
  }

  getPos() {
    return CURSOR_POSITIONS[self.index]
  }

  reset() {
    this.index = 0;
    return this;
  }
}

return Cursor;
