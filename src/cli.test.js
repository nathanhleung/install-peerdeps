import { spawn } from 'child_process';

function spawnCli(extraArgs) {
  return spawn('node', ['--require', 'babel-register', 'cli.js'].concat(extraArgs));
}

it('errors when more than one package is provided', () => {
  const cli = spawnCli(['eslint-config-airbnb', 'angular']);
  cli.on('exit', (code) => {
    expect(code).toBe(1);
  });
});

it('errors when no arguments are provided', () => {
  const cli = spawnCli();
  cli.on('exit', (code) => {
    expect(code).toBe(1);
  });
});

it('errors when the package name argument is formatted incorrectly', () => {
  const cli = spawnCli('heyhe#@&*()');
  cli.on('exit', (code) => {
    expect(code).toBe(1);
  });
});

// @todo - tests for the actual install process
// see https://github.com/sindresorhus/has-yarn/blob/master/test.js for details
// Perhaps abstract the functionality of getting the package name
// into its own function, and test that
