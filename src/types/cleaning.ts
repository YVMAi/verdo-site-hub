
export interface CleaningEntry {
  id: string;
  date: Date;
  cleaningType: 'Wet' | 'Dry';
  clientId: string;
  siteId: string;
  block: string;
  inverter: string;
  scbNumber: string;
  stringTableNumber?: string;
  modulesCleaned?: number;
  waterConsumption?: number;
  rainfall?: number;
  remarks?: string;
  photos?: string[];
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CleaningTableRow {
  block: string;
  inverter: string;
  scbNumber: string;
  stringTableNumber?: string;
  modulesCleaned?: number;
  waterConsumption?: number;
  rainfall?: number;
  totalModules: number;
  totalModulesCleaned: number;
  cyclesCleaned: number;
  dailyPlannedModules: number;
  totalCleanedPercent: number;
  uncleanedModules: number;
  remarks?: string;
}

export interface BlockSummary {
  blockName: string;
  inverters: string[];
  totalModules: number;
  totalCleaned: number;
  cleanedPercent: number;
}
