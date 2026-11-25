import * as migration_20261125_194515_initial from './20261125_194515_initial';

export const migrations = [
  {
    up: migration_20261125_194515_initial.up,
    down: migration_20261125_194515_initial.down,
    name: '20261125_194515_initial'
  },
];
