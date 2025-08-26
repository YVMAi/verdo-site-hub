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
      { id: 'plantStartTime', name: 'Plant Start Time', type: 'text', required: true },
      { id: 'plantEndTime', name: 'Plant End Time', type: 'text', required: true },
      { id: 'peakLoad', name: 'Peak Load (MW)', type: 'number', required: true },
      { id: 'peakLoadTime', name: 'Peak Load Time', type: 'text', required: true },
      { id: 'ghi', name: 'GHI (W/m²)', type: 'number', required: true },
      { id: 'gti', name: 'GTI (W/m²)', type: 'number', required: true },
    ],
    weatherColumns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'rainfall', name: 'Rainfall (mm)', type: 'number', required: false },
      { id: 'ambientTemp', name: 'Ambient Temp (°C)', type: 'number', required: false },
      { id: 'windSpeed', name: 'Wind Speed (m/s)', type: 'number', required: false },
      { id: 'windDirection', name: 'Wind Direction (°)', type: 'number', required: false },
      { id: 'moduleTemp', name: 'Module Temp (°C)', type: 'number', required: false },
      { id: 'humidity', name: 'Humidity (%)', type: 'number', required: false },
    ],
    htPanelColumns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'block', name: 'Block', type: 'text', required: true },
      { id: 'incoming', name: 'Incoming', type: 'number', required: true },
      { id: 'outgoing', name: 'Outgoing', type: 'number', required: true },
    ],
    meterConfig: {
      meterCount: 2,
      meterNames: ['Meter 1', 'Meter 2']
    }
  },
  {
    id: '2',
    name: 'Desert Solar Farm B',
    clientId: '1',
    columns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'plantStartTime', name: 'Plant Start Time', type: 'text', required: true },
      { id: 'plantEndTime', name: 'Plant End Time', type: 'text', required: true },
      { id: 'peakLoad', name: 'Peak Load (MW)', type: 'number', required: true },
      { id: 'peakLoadTime', name: 'Peak Load Time', type: 'text', required: true },
      { id: 'ghi', name: 'GHI (W/m²)', type: 'number', required: true },
      { id: 'gti', name: 'GTI (W/m²)', type: 'number', required: true },
    ],
    weatherColumns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'rainfall', name: 'Rainfall (mm)', type: 'number', required: false },
      { id: 'ambientTemp', name: 'Ambient Temp (°C)', type: 'number', required: false },
      { id: 'windSpeed', name: 'Wind Speed (m/s)', type: 'number', required: false },
      { id: 'windDirection', name: 'Wind Direction (°)', type: 'number', required: false },
      { id: 'moduleTemp', name: 'Module Temp (°C)', type: 'number', required: false },
      { id: 'humidity', name: 'Humidity (%)', type: 'number', required: false },
    ],
    htPanelColumns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'block', name: 'Block', type: 'text', required: true },
      { id: 'incoming', name: 'Incoming', type: 'number', required: true },
      { id: 'outgoing', name: 'Outgoing', type: 'number', required: true },
    ],
    meterConfig: {
      meterCount: 3,
      meterNames: ['Meter 1', 'Meter 2', 'Meter 3']
    }
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
    weatherColumns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'rainfall', name: 'Rainfall (mm)', type: 'number', required: false },
      { id: 'ambientTemp', name: 'Ambient Temp (°C)', type: 'number', required: false },
      { id: 'windSpeed', name: 'Wind Speed (m/s)', type: 'number', required: false },
      { id: 'windDirection', name: 'Wind Direction (°)', type: 'number', required: false },
      { id: 'moduleTemp', name: 'Module Temp (°C)', type: 'number', required: false },
      { id: 'humidity', name: 'Humidity (%)', type: 'number', required: false },
    ],
    htPanelColumns: [
      { id: 'date', name: 'Date', type: 'date', required: true },
      { id: 'block', name: 'Block', type: 'text', required: true },
      { id: 'incoming', name: 'Incoming', type: 'number', required: true },
      { id: 'outgoing', name: 'Outgoing', type: 'number', required: true },
    ],
    meterConfig: {
      meterCount: 1,
      meterNames: ['Main Meter']
    }
  },
];

export const tabConfigs: TabConfig[] = [
  { id: 'plant-data', label: 'Plant Data', icon: 'factory' },
  { id: 'meter-data', label: 'Meter Data', icon: 'gauge' },
  { id: 'weather', label: 'Weather', icon: 'cloud-sun' },
  { id: 'ht-panel', label: 'HT Panel', icon: 'zap' },
  { id: 'inverter', label: 'Inverter', icon: 'cpu' },
];

export const mockHistoricData: GenerationData[] = [
  {
    id: '1',
    siteId: '1',
    tabType: 'plant-data',
    date: '2024-08-25',
    values: {
      date: '2024-08-25',
      plantStartTime: '06:30',
      plantEndTime: '18:45',
      peakLoad: 45.2,
      peakLoadTime: '13:15',
      ghi: 850,
      gti: 920,
    },
    createdAt: '2024-08-25T08:00:00Z',
    updatedAt: '2024-08-25T08:00:00Z',
  },
  {
    id: '2',
    siteId: '1',
    tabType: 'plant-data',
    date: '2024-08-24',
    values: {
      date: '2024-08-24',
      plantStartTime: '06:35',
      plantEndTime: '18:40',
      peakLoad: 43.8,
      peakLoadTime: '12:45',
      ghi: 820,
      gti: 890,
    },
    createdAt: '2024-08-24T08:00:00Z',
    updatedAt: '2024-08-24T08:00:00Z',
  },
  {
    id: '3',
    siteId: '1',
    tabType: 'plant-data',
    date: '2024-08-23',
    values: {
      date: '2024-08-23',
      plantStartTime: '06:40',
      plantEndTime: '18:35',
      peakLoad: 41.5,
      peakLoadTime: '13:00',
      ghi: 780,
      gti: 840,
    },
    createdAt: '2024-08-23T08:00:00Z',
    updatedAt: '2024-08-23T08:00:00Z',
  },
  // Meter data entries
  {
    id: '4',
    siteId: '1',
    tabType: 'meter-data',
    date: '2024-08-25',
    values: {
      date: '2024-08-25',
      'meter1Export': 939,
      'meter1Import': 312,
      'meter2Export': 313,
      'meter2Import': 321,
    },
    createdAt: '2024-08-25T08:00:00Z',
    updatedAt: '2024-08-25T08:00:00Z',
  },
  {
    id: '5',
    siteId: '1',
    tabType: 'meter-data',
    date: '2024-08-24',
    values: {
      date: '2024-08-24',
      'meter1Export': 925,
      'meter1Import': 298,
      'meter2Export': 305,
      'meter2Import': 315,
    },
    createdAt: '2024-08-24T08:00:00Z',
    updatedAt: '2024-08-24T08:00:00Z',
  },
  // Weather data entries
  {
    id: '6',
    siteId: '1',
    tabType: 'weather',
    date: '2024-08-25',
    values: {
      date: '2024-08-25',
      rainfall: 0,
      ambientTemp: 32.5,
      windSpeed: 12.3,
      windDirection: 180,
      moduleTemp: 55.2,
      humidity: 45,
    },
    createdAt: '2024-08-25T08:00:00Z',
    updatedAt: '2024-08-25T08:00:00Z',
  },
  {
    id: '7',
    siteId: '1',
    tabType: 'weather',
    date: '2024-08-24',
    values: {
      date: '2024-08-24',
      rainfall: 2.5,
      ambientTemp: 28.8,
      windSpeed: 15.1,
      windDirection: 165,
      moduleTemp: 48.9,
      humidity: 62,
    },
    createdAt: '2024-08-24T08:00:00Z',
    updatedAt: '2024-08-24T08:00:00Z',
  },
  {
    id: '8',
    siteId: '1',
    tabType: 'weather',
    date: '2024-08-23',
    values: {
      date: '2024-08-23',
      rainfall: 0,
      ambientTemp: 35.1,
      windSpeed: 8.7,
      windDirection: 200,
      moduleTemp: 58.6,
      humidity: 38,
    },
    createdAt: '2024-08-23T08:00:00Z',
    updatedAt: '2024-08-23T08:00:00Z',
  },
  // HT Panel data entries
  {
    id: '9',
    siteId: '1',
    tabType: 'ht-panel',
    date: '2024-08-25',
    values: {
      date: '2024-08-25',
      block: 'Block 1',
      incoming: 143,
      outgoing: 15541,
    },
    createdAt: '2024-08-25T08:00:00Z',
    updatedAt: '2024-08-25T08:00:00Z',
  },
  {
    id: '10',
    siteId: '1',
    tabType: 'ht-panel',
    date: '2024-08-24',
    values: {
      date: '2024-08-24',
      block: 'Block 1',
      incoming: 138,
      outgoing: 15245,
    },
    createdAt: '2024-08-24T08:00:00Z',
    updatedAt: '2024-08-24T08:00:00Z',
  },
  {
    id: '11',
    siteId: '1',
    tabType: 'ht-panel',
    date: '2024-08-23',
    values: {
      date: '2024-08-23',
      block: 'Block 1',
      incoming: 135,
      outgoing: 14892,
    },
    createdAt: '2024-08-23T08:00:00Z',
    updatedAt: '2024-08-23T08:00:00Z',
  },
  // Inverter data entries
  {
    id: '12',
    siteId: '1',
    tabType: 'inverter',
    date: '2024-08-25',
    values: {
      date: '2024-08-25',
      plantStartTime: '06:30',
      plantEndTime: '18:45',
      peakLoad: 45.2,
      peakLoadTime: '13:15',
      ghi: 850,
      gti: 920,
    },
    createdAt: '2024-08-25T08:00:00Z',
    updatedAt: '2024-08-25T08:00:00Z',
  },
];
