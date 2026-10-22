// Reads a result page's URL query against a schema, so a missing or bad value is reported as a
// problem instead of becoming NaN or a crash further down. A parameter with no `default` is
// required.
//
//   parseParams('?rng=0x12&iterations=100', { rng: int(), iterations: int(), offset: int({ default: 0 }) })
//   -> { params: { rng: 18, iterations: 100, offset: 0 }, problems: [] }

export const int = (options) => ({ type: 'int', ...options });
export const string = (options) => ({ type: 'string', ...options });
export const bool = (options) => ({ type: 'bool', ...options });
// A comma separated list: ?characters=Cleo,Viktor
export const list = (options) => ({ type: 'list', ...options });
export const oneOf = (values, options) => ({ type: 'oneOf', values, ...options });

export function parseParams(search, schema) {
  const query = new URLSearchParams(search);
  const params = {};
  const problems = [];

  for (const [name, spec] of Object.entries(schema)) {
    const raw = query.get(name);
    if (raw === null || raw === '') {
      if ('default' in spec) params[name] = spec.default;
      else problems.push(`${name} is missing`);
      continue;
    }

    switch (spec.type) {
      case 'int': {
        const value = parseInt(raw);
        if (Number.isNaN(value)) problems.push(`${name} is not a number ("${raw}")`);
        else params[name] = value;
        break;
      }
      case 'bool':
        params[name] = raw === 'true';
        break;
      case 'list':
        params[name] = raw.split(',').filter(Boolean);
        break;
      case 'oneOf':
        if (spec.values.includes(raw)) params[name] = raw;
        else problems.push(`${name} must be one of: ${spec.values.join(', ')} (not "${raw}")`);
        break;
      default:
        params[name] = raw;
    }
  }

  return { params, problems };
}
