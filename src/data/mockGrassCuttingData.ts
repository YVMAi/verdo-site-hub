
import { GrassCuttingEntry, Block, Inverter, SCB, User } from '@/types/grassCutting';

export const mockBlocks: Block[] = [
  { id: '1', name: 'Block A1', siteId: '1' },
  { id: '2', name: 'Block A2', siteId: '1' },
  { id: '3', name: 'Block B1', siteId: '2' },
  { id: '4', name: 'Block B2', siteId: '2' },
  { id: '5', name: 'Block C1', siteId: '3' },
];

export const mockInverters: Inverter[] = [
  { id: '1', name: 'INV-001', blockId: '1' },
  { id: '2', name: 'INV-002', blockId: '1' },
  { id: '3', name: 'INV-003', blockId: '2' },
  { id: '4', name: 'INV-004', blockId: '3' },
  { id: '5', name: 'INV-005', blockId: '4' },
];

export const mockSCBs: SCB[] = [
  { id: '1', name: 'SCB-A1', inverterId: '1' },
  { id: '2', name: 'SCB-A2', inverterId: '1' },
  { id: '3', name: 'SCB-B1', inverterId: '2' },
  { id: '4', name: 'SCB-B2', inverterId: '3' },
];

export const mockUsers: User[] = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Wilson' },
  { id: '4', name: 'Lisa Brown' },
];

export const mockGrassCuttingData: GrassCuttingEntry[] = [
  {
    id: '1',
    date: '2024-08-12',
    block: 'Block A1',
    inverter: 'INV-001',
    scb: 'SCB-A1',
    numberOfStringsCleaned: 24,
    startTime: '08:00',
    stopTime: '12:00',
    verifiedBy: 'John Smith',
    remarks: 'Completed successfully',
    photos: [],
    planned: 25,
    deviation: -1,
    percentComplete: 96,
    linkedTask: 'FI-001',
    createdAt: '2024-08-12T08:00:00Z',
    updatedAt: '2024-08-12T12:00:00Z',
  },
  {
    id: '2',
    date: '2024-08-11',
    block: 'Block A2',
    inverter: 'INV-003',
    numberOfStringsCleaned: 30,
    startTime: '09:00',
    stopTime: '14:00',
    verifiedBy: 'Sarah Johnson',
    remarks: 'Heavy vegetation, took longer than expected',
    photos: [],
    planned: 28,
    deviation: 2,
    percentComplete: 107,
    createdAt: '2024-08-11T09:00:00Z',
    updatedAt: '2024-08-11T14:00:00Z',
  },
  {
    id: '3',
    date: '2024-08-10',
    block: 'Block B1',
    inverter: 'INV-004',
    numberOfStringsCleaned: 18,
    startTime: '07:30',
    stopTime: '11:30',
    verifiedBy: 'Mike Wilson',
    photos: [],
    planned: 25,
    deviation: -7,
    percentComplete: 72,
    createdAt: '2024-08-10T07:30:00Z',
    updatedAt: '2024-08-10T11:30:00Z',
  },
];
