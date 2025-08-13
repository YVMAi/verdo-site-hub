
import { Client, Site, GenerationData, TabConfig } from '@/types/generation';

export const mockClients: Client[] = [
  { id: '1', name: 'Solar Energy Corp', allowedEditDays: 30 },
  { id: '2', name: 'Wind Power Solutions', allowedEditDays: 45 },
  { id: '3', name: 'Green Energy Partners', allowedEditDays: 15 },
];

export const mockSites: Site[] = [
  {
    id: '1',
    name: 'Desert Solar Farm A',
    clientId: '1',
    columns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'inverter1', name: 'Inverter 1 (kWh)', type: 'number', required: true },
      { id: 'inverter2', name: 'Inverter 2 (kWh)', type: 'number', required: true },
      { id: 'inverter3', name: 'Inverter 3 (kWh)', type: 'number', required: false },
      { id: 'totalGeneration', name: 'Total Generation (MWh)', type: 'number', required: true },
      { id: 'notes', name: 'Notes', type: 'text', required: false },
    ],
  },
  {
    id: '2',
    name: 'Desert Solar Farm B',
    clientId: '1',
    columns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'panel1', name: 'Panel Array 1 (kWh)', type: 'number', required: true },
      { id: 'panel2', name: 'Panel Array 2 (kWh)', type: 'number', required: true },
      { id: 'efficiency', name: 'Efficiency %', type: 'number', required: false },
    ],
  },
  {
    id: '3',
    name: 'Mountain Wind Site',
    clientId: '2',
    columns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'turbine1', name: 'Turbine 1 (MWh)', type: 'number', required: true },
      { id: 'turbine2', name: 'Turbine 2 (MWh)', type: 'number', required: true },
      { id: 'turbine3', name: 'Turbine 3 (MWh)', type: 'number', required: true },
      { id: 'windSpeed', name: 'Avg Wind Speed (m/s)', type: 'number', required: false },
    ],
  },
];

export const tabConfigs: TabConfig[] = [
  { id: 'meter-reading', label: 'Meter Reading', icon: 'gauge' },
  { id: 'inverter', label: 'Inverter', icon: 'zap' },
  { id: 'wms', label: 'WMS', icon: 'monitor' },
];

export const mockHistoricData: GenerationData[] = [
  {
    id: '1',
    siteId: '1',
    tabType: 'meter-reading',
    date: '2024-08-10',
    values: {
      date: '2024-08-10',
      inverter1: 1250.5,
      inverter2: 1180.2,
      inverter3: 995.8,
      totalGeneration: 3.426,
      notes: 'Clear weather conditions',
    },
    createdAt: '2024-08-10T08:00:00Z',
    updatedAt: '2024-08-10T08:00:00Z',
  },
  {
    id: '2',
    siteId: '1',
    tabType: 'meter-reading',
    date: '2024-08-09',
    values: {
      date: '2024-08-09',
      inverter1: 1180.3,
      inverter2: 1095.7,
      inverter3: 890.2,
      totalGeneration: 3.166,
      notes: 'Partly cloudy',
    },
    createdAt: '2024-08-09T08:00:00Z',
    updatedAt: '2024-08-09T08:00:00Z',
  },
  {
    id: '3',
    siteId: '1',
    tabType: 'inverter',
    date: '2024-08-10',
    values: {
      date: '2024-08-10',
      inverter1: 1250.5,
      inverter2: 1180.2,
      inverter3: 995.8,
      totalGeneration: 3.426,
      notes: 'All inverters operational',
    },
    createdAt: '2024-08-10T08:00:00Z',
    updatedAt: '2024-08-10T08:00:00Z',
  },
];
