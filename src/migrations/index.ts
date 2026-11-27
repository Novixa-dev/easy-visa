import * as migration_20261125_194515_initial from './20261125_194515_initial';
import * as migration_20261127_010243_trip_discovery_filters from './20261127_010243_trip_discovery_filters';

export const migrations = [
  {
    up: migration_20261125_194515_initial.up,
    down: migration_20261125_194515_initial.down,
    name: '20261125_194515_initial',
  },
  {
    up: migration_20261127_010243_trip_discovery_filters.up,
    down: migration_20261127_010243_trip_discovery_filters.down,
    name: '20261127_010243_trip_discovery_filters'
  },
];
