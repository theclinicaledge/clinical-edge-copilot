process.env.ANTHROPIC_API_KEY = '';
const { run } = require('./harness');
const results = run();
console.log(JSON.stringify({ benchmark: 'P1 offline contract/usefulness fixtures, not legacy Gold or provider validation', results }, null, 2));
// Adversaries are expected failures, not failed release cases.
if (results.filter(x => x.id.startsWith('p1-')).some(x => x.status !== 'PASS')
  || results.filter(x => !x.id.startsWith('p1-')).some(x => x.status !== 'FAIL')) process.exitCode = 1;
