import { Client, Site, TabConfig, GenerationData } from '@/types/generation';

export const mockClients: Client[] = [
  { id: 'client-1', name: 'Verdo Renewables', allowedEditDays: 30 },
  { id: 'client-2', name: 'EcoPower Solutions', allowedEditDays: 15 },
];

export const tabConfigs: TabConfig[] = [
  { id: 'plant-data', label: 'Plant Data', icon: 'factory' },
  { id: 'meter-data', label: 'Meter Data', icon: 'gauge' },
  { id: 'weather', label: 'Weather', icon: 'cloud-sun' },
  { id: 'ht-panel', label: 'HT Panel', icon: 'zap' },
  { id: 'inverter', label: 'Inverter', icon: 'cpu' },
];

export const mockSites: Site[] = [
  {
    id: 'site-1',
    name: 'Solar Farm Alpha',
    clientId: 'client-1',
    columns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'plantStartTime', name: 'Plant Start Time', type: 'text', required: true },
      { id: 'plantEndTime', name: 'Plant End Time', type: 'text', required: true },
      { id: 'peakLoad', name: 'Peak Load (MW)', type: 'number', required: true },
      { id: 'peakLoadTime', name: 'Peak Load Time', type: 'text', required: true },
      { id: 'ghi', name: 'GHI (kWh/m²)', type: 'number', required: true },
      { id: 'gti', name: 'GTI (kWh/m²)', type: 'number', required: true },
    ],
    meterConfig: {
      meters: ['Meter 1', 'Meter 2', 'Meter 3'],
      types: ['Export', 'Import']
    }
  },
  {
    id: 'site-2',
    name: 'Wind Park Beta',
    clientId: 'client-1',
    columns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'plantStartTime', name: 'Plant Start Time', type: 'text', required: true },
      { id: 'plantEndTime', name: 'Plant End Time', type: 'text', required: true },
      { id: 'peakLoad', name: 'Peak Load (MW)', type: 'number', required: true },
      { id: 'peakLoadTime', name: 'Peak Load Time', type: 'text', required: true },
      { id: 'ghi', name: 'GHI (kWh/m²)', type: 'number', required: true },
      { id: 'gti', name: 'GTI (kWh/m²)', type: 'number', required: true },
    ],
    meterConfig: {
      meters: ['Meter 1', 'Meter 2'],
      types: ['Export', 'Import']
    }
  },
  {
    id: 'site-3',
    name: 'Hydro Station Gamma',
    clientId: 'client-2',
    columns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'plantStartTime', name: 'Plant Start Time', type: 'text', required: true },
      { id: 'plantEndTime', name: 'Plant End Time', type: 'text', required: true },
      { id: 'peakLoad', name: 'Peak Load (MW)', type: 'number', required: true },
      { id: 'peakLoadTime', name: 'Peak Load Time', type: 'text', required: true },
      { id: 'ghi', name: 'GHI (kWh/m²)', type: 'number', required: true },
      { id: 'gti', name: 'GTI (kWh/m²)', type: 'number', required: true },
    ],
    meterConfig: {
      meters: ['Meter 1', 'Meter 2', 'Meter 3', 'Meter 4'],
      types: ['Export', 'Import']
    }
  }
];

export const mockHistoricData: GenerationData[] = [
  // Plant data entries
  {
    id: 'data-1',
    siteId: 'site-1',
    tabType: 'plant-data',
    date: '2024-08-25',
    values: {
      date: '2024-08-25',
      plantStartTime: '06:30',
      plantEndTime: '18:45',
      peakLoad: 45.2,
      peakLoadTime: '12:30',
      ghi: 6.8,
      gti: 7.2
    },
    createdAt: '2024-08-25T07:00:00Z',
    updatedAt: '2024-08-25T07:00:00Z'
  },
  {
    id: 'data-2',
    siteId: 'site-1',
    tabType: 'plant-data',
    date: '2024-08-24',
    values: {
      date: '2024-08-24',
      plantStartTime: '06:25',
      plantEndTime: '18:50',
      peakLoad: 42.8,
      peakLoadTime: '13:15',
      ghi: 6.5,
      gti: 6.9
    },
    createdAt: '2024-08-24T07:00:00Z',
    updatedAt: '2024-08-24T07:00:00Z'
  },
  // Meter data entries
  {
    id: 'meter-data-1',
    siteId: 'site-1',
    tabType: 'meter-data',
    date: '2024-08-25',
    values: {
      date: '2024-08-25',
      'meter-1-export': 1250.5,
      'meter-1-import': 15.2,
      'meter-2-export': 980.3,
      'meter-2-import': 8.7,
      'meter-3-export': 1100.8,
      'meter-3-import': 12.4
    },
    createdAt: '2024-08-25T07:00:00Z',
    updatedAt: '2024-08-25T07:00:00Z'
  },
  {
    id: 'meter-data-2',
    siteId: 'site-1',
    tabType: 'meter-data',
    date: '2024-08-24',
    values: {
      date: '2024-08-24',
      'meter-1-export': 1185.3,
      'meter-1-import': 18.9,
      'meter-2-export': 925.7,
      'meter-2-import': 11.2,
      'meter-3-export': 1045.6,
      'meter-3-import': 14.8
    },
    createdAt: '2024-08-24T07:00:00Z',
    updatedAt: '2024-08-24T07:00:00Z'
  },
  {
    id: 'meter-data-3',
    siteId: 'site-2',
    tabType: 'meter-data',
    date: '2024-08-25',
    values: {
      date: '2024-08-25',
      'meter-1-export': 890.2,
      'meter-1-import': 22.1,
      'meter-2-export': 745.6,
      'meter-2-import': 16.8
    },
    createdAt: '2024-08-25T07:00:00Z',
    updatedAt: '2024-08-25T07:00:00Z'
  }
];
