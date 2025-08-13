
import { GrassCuttingEntry, Block, Inverter, SCB, User } from '@/types/grassCutting';

export const mockBlocks: Block[] = [
  // Site 1 (Solar Farm Alpha) blocks
  { id: '1', name: 'Block A1', siteId: '1' },
  { id: '2', name: 'Block A2', siteId: '1' },
  { id: '3', name: 'Block A3', siteId: '1' },
  { id: '4', name: 'Block A4', siteId: '1' },
  
  // Site 2 (Wind Farm Beta) blocks
  { id: '5', name: 'Block B1', siteId: '2' },
  { id: '6', name: 'Block B2', siteId: '2' },
  { id: '7', name: 'Block B3', siteId: '2' },
  
  // Site 3 (Solar Farm Gamma) blocks
  { id: '8', name: 'Block C1', siteId: '3' },
  { id: '9', name: 'Block C2', siteId: '3' },
  { id: '10', name: 'Block C3', siteId: '3' },
  { id: '11', name: 'Block C4', siteId: '3' },
  { id: '12', name: 'Block C5', siteId: '3' },
];

export const mockInverters: Inverter[] = [
  // Block A1 inverters
  { id: '1', name: 'INV-A1-001', blockId: '1' },
  { id: '2', name: 'INV-A1-002', blockId: '1' },
  { id: '3', name: 'INV-A1-003', blockId: '1' },
  
  // Block A2 inverters
  { id: '4', name: 'INV-A2-001', blockId: '2' },
  { id: '5', name: 'INV-A2-002', blockId: '2' },
  
  // Block A3 inverters
  { id: '6', name: 'INV-A3-001', blockId: '3' },
  { id: '7', name: 'INV-A3-002', blockId: '3' },
  { id: '8', name: 'INV-A3-003', blockId: '3' },
  
  // Block A4 inverters
  { id: '9', name: 'INV-A4-001', blockId: '4' },
  { id: '10', name: 'INV-A4-002', blockId: '4' },
  
  // Block B1 inverters
  { id: '11', name: 'INV-B1-001', blockId: '5' },
  { id: '12', name: 'INV-B1-002', blockId: '5' },
  
  // Block B2 inverters
  { id: '13', name: 'INV-B2-001', blockId: '6' },
  { id: '14', name: 'INV-B2-002', blockId: '6' },
  { id: '15', name: 'INV-B2-003', blockId: '6' },
  
  // Block B3 inverters
  { id: '16', name: 'INV-B3-001', blockId: '7' },
  
  // Block C1 inverters
  { id: '17', name: 'INV-C1-001', blockId: '8' },
  { id: '18', name: 'INV-C1-002', blockId: '8' },
  
  // Block C2 inverters
  { id: '19', name: 'INV-C2-001', blockId: '9' },
  { id: '20', name: 'INV-C2-002', blockId: '9' },
  { id: '21', name: 'INV-C2-003', blockId: '9' },
  
  // Block C3 inverters
  { id: '22', name: 'INV-C3-001', blockId: '10' },
  { id: '23', name: 'INV-C3-002', blockId: '10' },
  
  // Block C4 inverters
  { id: '24', name: 'INV-C4-001', blockId: '11' },
  { id: '25', name: 'INV-C4-002', blockId: '11' },
  { id: '26', name: 'INV-C4-003', blockId: '11' },
  
  // Block C5 inverters
  { id: '27', name: 'INV-C5-001', blockId: '12' },
  { id: '28', name: 'INV-C5-002', blockId: '12' },
];

export const mockSCBs: SCB[] = [
  { id: '1', name: 'SCB-A1', inverterId: '1' },
  { id: '2', name: 'SCB-A2', inverterId: '1' },
  { id: '3', name: 'SCB-B1', inverterId: '2' },
  { id: '4', name: 'SCB-B2', inverterId: '3' },
  { id: '5', name: 'SCB-C1', inverterId: '4' },
  { id: '6', name: 'SCB-C2', inverterId: '5' },
];

export const mockUsers: User[] = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Wilson' },
  { id: '4', name: 'Lisa Brown' },
  { id: '5', name: 'David Chen' },
  { id: '6', name: 'Emma Davis' },
];

export const mockGrassCuttingData: GrassCuttingEntry[] = [
  {
    id: '1',
    date: '2024-08-12',
    block: 'Block A1',
    inverter: 'INV-A1-001',
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
    inverter: 'INV-A2-001',
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
];
