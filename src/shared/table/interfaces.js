export interface Column {
  key: string | number;
  label: string;
  width: number;
  show?: boolean;
}

export interface RowStyle {
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
}
