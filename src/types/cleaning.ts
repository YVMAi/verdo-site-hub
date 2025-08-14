export interface CleaningInverterData {
  id: string;
  totalModules: number;
  modulesCleaned: number;
  percentCompleted: number;
}

export interface CleaningBlockData {
  id: string;
  name: string;
  inverters: CleaningInverterData[];
}

export interface CleaningDailyEntry {
  date: string;
  inverterData: { [inverterId: string]: number };
  plannedModules: number;
  totalCleaned: number;
  totalUncleaned: number;
  rainfallMM: string;
  remarks: string;
}

export interface CleaningHistoricEntry extends CleaningDailyEntry {
  cyclesCompleted: number;
}

export interface CleaningSiteData {
  clientId: string;
  siteId: string;
  wetDryType: 'wet' | 'dry';
  blocks: CleaningBlockData[];
  dailyEntries: CleaningDailyEntry[];
  historicEntries: CleaningHistoricEntry[];
}