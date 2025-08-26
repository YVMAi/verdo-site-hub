import { Client, Site, GenerationData, TabConfig } from '@/types/generation';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Solar Energy Corp',
    allowedEditDays: 7
  },
  {
    id: '2', 
    name: 'Wind Power Solutions',
    allowedEditDays: 5
  },
  {
    id: '3',
    name: 'Green Energy Partners', 
    allowedEditDays: 3
  }
];

export const mockSites: Site[] = [
  {
    id: '101',
    clientId: '1',
    name: 'Desert Solar Farm A',
    columns: [
      { id: 'solarPanelOutput', name: 'Solar Panel Output (kW)', type: 'number', required: true },
      { id: 'windTurbineOutput', name: 'Wind Turbine Output (kW)', type: 'number', required: true },
      { id: 'date', name: 'Date', type: 'date', required: true },
    ]
  },
  {
    id: '102',
    clientId: '1',
    name: 'Desert Solar Farm B',
    columns: [
      { id: 'newMaterialEfficiency', name: 'New Material Efficiency (%)', type: 'number', required: true },
      { id: 'prototypeOutput', name: 'Prototype Output (kW)', type: 'number', required: true },
      { id: 'date', name: 'Date', type: 'date', required: true },
    ]
  },
  {
    id: '201',
    clientId: '2',
    name: 'Coastal Wind Farm',
    columns: [
      { id: 'turbineSpeed', name: 'Turbine Speed (RPM)', type: 'number', required: true },
      { id: 'energyGenerated', name: 'Energy Generated (MWh)', type: 'number', required: true },
      { id: 'date', name: 'Date', type: 'date', required: true },
    ]
  },
  {
    id: '202',
    clientId: '2',
    name: 'Mountain Wind Farm',
    columns: [
      { id: 'turbineSpeed', name: 'Turbine Speed (RPM)', type: 'number', required: true },
      { id: 'energyGenerated', name: 'Energy Generated (MWh)', type: 'number', required: true },
      { id: 'date', name: 'Date', type: 'date', required: true },
    ]
  },
  {
    id: '301',
    clientId: '3',
    name: 'Solar Panel Field A',
    columns: [
      { id: 'panelEfficiency', name: 'Panel Efficiency (%)', type: 'number', required: true },
      { id: 'powerOutput', name: 'Power Output (kW)', type: 'number', required: true },
      { id: 'date', name: 'Date', type: 'date', required: true },
    ],
    meterConfig: {
      meters: ['Main', 'Aux'],
      types: ['Voltage', 'Current', 'Power']
    }
  },
  {
    id: '302',
    clientId: '3',
    name: 'Wind Turbine Park B',
    columns: [
      { id: 'turbineBladeAngle', name: 'Turbine Blade Angle (degrees)', type: 'number', required: true },
      { id: 'energyGenerated', name: 'Energy Generated (MWh)', type: 'number', required: true },
      { id: 'date', name: 'Date', type: 'date', required: true },
    ]
  }
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
    siteId: '301',
    tabType: 'plant-data',
    date: '2024-01-01',
    values: {
      panelEfficiency: 18.5,
      powerOutput: 250,
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    siteId: '301',
    tabType: 'plant-data',
    date: '2024-01-02',
    values: {
      panelEfficiency: 18.7,
      powerOutput: 255,
    },
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
  },
  {
    id: '3',
    siteId: '301',
    tabType: 'meter-data',
    date: '2024-01-01',
    values: {
      'Main-Voltage': 240,
      'Main-Current': 10,
      'Main-Power': 2.4,
      'Aux-Voltage': 120,
      'Aux-Current': 5,
      'Aux-Power': 0.6,
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '4',
    siteId: '301',
    tabType: 'meter-data',
    date: '2024-01-02',
    values: {
      'Main-Voltage': 242,
      'Main-Current': 10.2,
      'Main-Power': 2.47,
      'Aux-Voltage': 121,
      'Aux-Current': 5.1,
      'Aux-Power': 0.62,
    },
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
  },
];

export const mockWeatherData = [
  {
    id: '1',
    siteId: '301',
    tabType: 'weather',
    date: '2024-01-01',
    values: {
      temperature: 25,
      humidity: 60,
      windSpeed: 10,
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    siteId: '301',
    tabType: 'weather',
    date: '2024-01-02',
    values: {
      temperature: 27,
      humidity: 55,
      windSpeed: 12,
    },
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
  },
];

export const mockHtPanelData = [
  {
    id: '1',
    siteId: '301',
    tabType: 'ht-panel',
    date: '2024-01-01',
    values: {
      panelTemperature: 45,
      coolantFlowRate: 5,
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    siteId: '301',
    tabType: 'ht-panel',
    date: '2024-01-02',
    values: {
      panelTemperature: 47,
      coolantFlowRate: 5.2,
    },
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
  },
];

export const mockInverterData = [
  {
    id: '1',
    siteId: '301',
    tabType: 'inverter',
    date: '2024-01-01',
    values: {
      inputVoltage: 300,
      outputCurrent: 10,
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    siteId: '301',
    tabType: 'inverter',
    date: '2024-01-02',
    values: {
      inputVoltage: 302,
      outputCurrent: 10.1,
    },
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
  },
];
