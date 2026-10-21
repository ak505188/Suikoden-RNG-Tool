import { findRNG } from './findRNG';

self.addEventListener('message', function(e) {
  const { workerParams, encounters, rng } = e.data;
  findRNG(workerParams, encounters, rng, (status) => {
    postMessage(status);
  });
});
