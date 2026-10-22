import React, { useState } from 'react';

// A number input that lets you type freely: while it's focused it shows exactly what was typed
// (including an empty field), and only text that `accepts` is passed on to `onCommit`. When it
// loses focus it goes back to showing `value`, so abandoned or rejected text never sticks.
const DraftNumberInput = ({ value, accepts, onCommit, ...inputProps }) => {
  const [draft, setDraft] = useState(null);

  return (
    <input
      {...inputProps}
      type="number"
      value={draft ?? value}
      onChange={(e) => {
        const text = e.target.value;
        setDraft(text);
        if (accepts(text)) onCommit(text);
      }}
      onBlur={() => setDraft(null)}
    />
  );
};

export default DraftNumberInput;
