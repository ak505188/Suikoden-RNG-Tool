import { findRNG } from './findRNG';

self.addEventListener('message', function (e) {
  const { area, encounters, rng } = e.data;
  findRNG(area, encounters, rng, (status) => {
    postMessage(status);
  });
});
