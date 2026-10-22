// An onSubmit handler that sends a form's values to its result page in the URL query:
//   <Form onSubmit={submitTo(history, '/sequence/result', { rng, iterations })}>
// Arrays become comma separated lists and booleans 'true' / 'false'.
export const submitTo = (history, path, params) => (event) => {
  event.preventDefault();
  history.push(`${path}?${new URLSearchParams(params)}`);
};
