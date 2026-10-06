const { run } = require('./harness');
const results = run();
console.log(JSON.stringify({ benchmark: 'Ask Clinical Edge offline education fixtures; no provider or P1 Gold validation', results }, null, 2));
if (results.filter(x => x.level !== 'adversarial').some(x => x.status !== 'PASS') || results.filter(x => x.level === 'adversarial').some(x => x.status !== 'FAIL')) process.exitCode = 1;
