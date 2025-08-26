
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
  weatherColumns?: SiteColumn[];
  htPanelColumns?: SiteColumn[];
  meterConfig?: {
    meterCount: number;
    meterNames: string[];
  };
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

export type TabType = 'plant-data' | 'meter-data' | 'weather' | 'ht-panel' | 'inverter';

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}
