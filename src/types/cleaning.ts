
export interface CleaningEntry {
  id: string;
  date: string;
  cleaningType: 'wet' | 'dry';
  block: string;
  inverter: string;
  scb: string;
  stringTableNumber?: string;
  modulesCleaned: number;
  waterConsumption?: number;
  rainfall?: number;
  remarks?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CleaningFormData {
  date: Date;
  cleaningType: 'wet' | 'dry';
  block: string;
  inverter: string;
  scb: string;
  stringTableNumber?: string;
  modulesCleaned: number;
  waterConsumption?: number;
  rainfall?: number;
  remarks?: string;
  photos: File[];
}

export interface CleaningTableRow {
  id: string;
  block: string;
  inverter: string;
  scb: string;
  stringTableNumber?: string;
  modulesCleaned: number;
  waterConsumption?: number;
  rainfall?: number;
  remarks?: string;
  photos: File[];
  totalModules: number;
  cyclesCleaned: number;
  plannedModules: number;
  percentCleaned: number;
  uncleanedModules: number;
}

export interface CleaningConfig {
  totalModulesPerInverter: Record<string, number>;
  plannedModulesPerDay: Record<string, number>;
}
