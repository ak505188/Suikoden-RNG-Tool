import { EnemyGroupData, Fight } from '../lib/interfaces';
import { Column, RowStyle } from '../Table/interfaces';

export interface TableConfig {
  rowHeight: number;
  headerHeight: number;
  rowStyle: RowStyle;
}

export interface RunAssistState {
  currentArea: number;
  areas: { name: string, enemies: EnemyGroupData[] }[];
  fightsList: Fight[][];
  index: number;
  pattern: number[];
}

export interface ConfigState {
  useImages: boolean;
  columns: Column[];
  table: TableConfig;
}

export interface State {
  RunAssistant: RunAssistState;
  config: ConfigState;
}
