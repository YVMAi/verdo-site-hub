
export interface GrassCuttingEntry {
  id: string;
  date: string;
  block: string;
  inverter: string;
  scb?: string;
  numberOfStringsCleaned: number;
  startTime: string;
  stopTime: string;
  verifiedBy: string;
  remarks?: string;
  photos: string[];
  planned: number;
  deviation: number;
  percentComplete: number;
  linkedTask?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrassCuttingFormData {
  date: Date;
  block: string;
  inverter: string;
  scb?: string;
  numberOfStringsCleaned: number;
  startTime: string;
  stopTime: string;
  verifiedBy: string;
  remarks?: string;
  photos: File[];
}

export interface GrassCuttingTableRow {
  id: string;
  block: string;
  inverter: string;
  scb?: string;
  numberOfStringsCleaned: number;
  startTime: string;
  stopTime: string;
  verifiedBy: string;
  remarks?: string;
  photos: File[];
  planned: number;
  deviation: number;
  percentComplete: number;
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
}

export interface SCB {
  id: string;
  name: string;
  inverterId: string;
}

export interface User {
  id: string;
  name: string;
}
