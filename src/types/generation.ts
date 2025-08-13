
export interface Client {
  id: string;
  name: string;
  allowedEditDays: number;
}

export interface Site {
  id: string;
  name: string;
  clientId: string;
  columns: SiteColumn[];
}

export interface SiteColumn {
  id: string;
  name: string;
  type: 'number' | 'text' | 'date';
  required: boolean;
}

export interface GenerationData {
  id: string;
  siteId: string;
  tabType: TabType;
  date: string;
  values: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type TabType = 'meter-reading' | 'inverter' | 'wms';

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}
