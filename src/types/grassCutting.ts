export interface GrassCuttingEntry {
  id: string;
  date: string;
  block: string;
  inverter: string;
  totalStrings: number;
  grassCuttingDone: number;
  percentCompleted: number;
  dailyGrassCutting: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockInverterData {
  blockId: string;
  blockName: string;
  inverters: {
    inverterId: string;
    inverterName: string;
    totalStrings: number;
    grassCuttingDone: number;
    percentCompleted: number;
  }[];
}

export interface DailyEntry {
  date: string;
  blockInverterData: {
    [blockId: string]: {
      [inverterId: string]: {
        dailyGrassCutting: number;
        remarks?: string;
      };
    };
  };
  dailyActual: number;
  dailyPlanned: number;
  deviation: number;
  deviationPercent: number;
}

export interface Block {
  id: string;
  name: string;
  siteId: string;
}

export interface Inverter {
  id: string;
  name: string;
  blockId: string;
  totalStrings: number;
}

export interface User {
  id: string;
  name: string;
}