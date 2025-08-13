
import { CleaningEntry } from '@/types/cleaning';

export const mockCleaningData: CleaningEntry[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    cleaningType: 'Wet',
    clientId: 'client-1',
    siteId: 'site-1',
    block: 'Block A',
    inverter: 'INV001',
    scbNumber: 'SCB001',
    stringTableNumber: 'ST001',
    modulesCleaned: 150,
    waterConsumption: 500,
    rainfall: 2.5,
    remarks: 'Regular cleaning completed',
    photos: [],
    verifiedBy: 'supervisor-1',
    createdAt: new Date('2024-01-15T08:00:00'),
    updatedAt: new Date('2024-01-15T08:00:00'),
  },
  {
    id: '2',
    date: new Date('2024-01-14'),
    cleaningType: 'Dry',
    clientId: 'client-1',
    siteId: 'site-1',
    block: 'Block A',
    inverter: 'INV002',
    scbNumber: 'SCB002',
    modulesCleaned: 200,
    rainfall: 0,
    remarks: 'Dry cleaning after dust storm',
    photos: [],
    verifiedBy: 'supervisor-1',
    createdAt: new Date('2024-01-14T09:00:00'),
    updatedAt: new Date('2024-01-14T09:00:00'),
  },
];

// Mock site configuration data
export const mockSiteConfig = {
  blocks: {
    'Block A': {
      inverters: ['INV001', 'INV002', 'INV003', 'INV004'],
      totalModules: 1000,
      dailyPlannedModules: 800,
    },
    'Block B': {
      inverters: ['INV005', 'INV006', 'INV007', 'INV008'],
      totalModules: 1200,
      dailyPlannedModules: 1000,
    },
  },
};
