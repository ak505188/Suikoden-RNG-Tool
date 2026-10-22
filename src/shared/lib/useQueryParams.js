import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { parseParams } from './params';

// The current URL's query read against `schema` (see params.js). Keep the schema outside the
// component, or it is read again on every render.
export function useQueryParams(schema) {
  const { search } = useLocation();
  return useMemo(() => parseParams(search, schema), [search, schema]);
}
