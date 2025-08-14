import { Block, Inverter, User, BlockInverterData, DailyEntry } from '@/types/grassCutting';

export const mockBlocks: Block[] = [
  // Site 1 (Solar Farm Alpha) blocks
  { id: '1', name: 'Block 1', siteId: '1' },
  { id: '2', name: 'Block 2', siteId: '1' },
  { id: '3', name: 'Block 3', siteId: '1' },
  { id: '4', name: 'Block 4', siteId: '1' },
  
  // Site 2 (Wind Farm Beta) blocks
  { id: '5', name: 'Block 1', siteId: '2' },
  { id: '6', name: 'Block 2', siteId: '2' },
  
  // Site 3 (Solar Farm Gamma) blocks
  { id: '7', name: 'Block 1', siteId: '3' },
  { id: '8', name: 'Block 2', siteId: '3' },
  { id: '9', name: 'Block 3', siteId: '3' },
];

export const mockInverters: Inverter[] = [
  // Block 1 inverters
  { id: '1', name: 'INV1', blockId: '1', totalStrings: 768 },
  { id: '2', name: 'INV2', blockId: '1', totalStrings: 768 },
  { id: '3', name: 'INV3', blockId: '1', totalStrings: 792 },
  { id: '4', name: 'INV4', blockId: '1', totalStrings: 792 },
  
  // Block 2 inverters
  { id: '5', name: 'INV1', blockId: '2', totalStrings: 777 },
  { id: '6', name: 'INV2', blockId: '2', totalStrings: 768 },
  { id: '7', name: 'INV3', blockId: '2', totalStrings: 768 },
  { id: '8', name: 'INV4', blockId: '2', totalStrings: 768 },
  
  // Block 3 inverters
  { id: '9', name: 'INV1', blockId: '3', totalStrings: 768 },
  { id: '10', name: 'INV2', blockId: '3', totalStrings: 768 },
  { id: '11', name: 'INV3', blockId: '3', totalStrings: 768 },
  { id: '12', name: 'INV4', blockId: '3', totalStrings: 768 },
  
  // Block 4 inverters
  { id: '13', name: 'INV1', blockId: '4', totalStrings: 768 },
  { id: '14', name: 'INV2', blockId: '4', totalStrings: 768 },
  { id: '15', name: 'INV3', blockId: '4', totalStrings: 768 },
  { id: '16', name: 'INV4', blockId: '4', totalStrings: 768 },
];

export const mockUsers: User[] = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Wilson' },
  { id: '4', name: 'Lisa Brown' },
  { id: '5', name: 'David Chen' },
  { id: '6', name: 'Emma Davis' },
];

export const mockGrassCuttingData: BlockInverterData[] = [
  {
    blockId: '1',
    blockName: 'Block 1',
    inverters: [
      { inverterId: '1', inverterName: 'INV1', totalStrings: 768, grassCuttingDone: 1536, percentCompleted: 6 },
      { inverterId: '2', inverterName: 'INV2', totalStrings: 768, grassCuttingDone: 1162, percentCompleted: 60 },
      { inverterId: '3', inverterName: 'INV3', totalStrings: 792, grassCuttingDone: 792, percentCompleted: 89 },
      { inverterId: '4', inverterName: 'INV4', totalStrings: 792, grassCuttingDone: 792, percentCompleted: 88 },
    ]
  },
  {
    blockId: '2',
    blockName: 'Block 2',
    inverters: [
      { inverterId: '5', inverterName: 'INV1', totalStrings: 777, grassCuttingDone: 777, percentCompleted: 11 },
      { inverterId: '6', inverterName: 'INV2', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 32 },
      { inverterId: '7', inverterName: 'INV3', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 90 },
      { inverterId: '8', inverterName: 'INV4', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 9 },
    ]
  },
  {
    blockId: '3',
    blockName: 'Block 3',
    inverters: [
      { inverterId: '9', inverterName: 'INV1', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 46 },
      { inverterId: '10', inverterName: 'INV2', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 53 },
      { inverterId: '11', inverterName: 'INV3', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 40 },
      { inverterId: '12', inverterName: 'INV4', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 11 },
    ]
  },
  {
    blockId: '4',
    blockName: 'Block 4',
    inverters: [
      { inverterId: '13', inverterName: 'INV1', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 42 },
      { inverterId: '14', inverterName: 'INV2', totalStrings: 768, grassCuttingDone: 768, percentCompleted: 40 },
      { inverterId: '15', inverterName: 'INV3', totalStrings: 768, grassCuttingDone: 765, percentCompleted: 11 },
      { inverterId: '16', inverterName: 'INV4', totalStrings: 768, grassCuttingDone: 765, percentCompleted: 97 },
    ]
  }
];

export const mockHistoricalData: DailyEntry[] = [
  {
    date: '2025-08-14',
    blockInverterData: {
      '1': {
        '1': { dailyGrassCutting: 45, remarks: 'NA' },
        '2': { dailyGrassCutting: 462, remarks: 'NA' },
        '3': { dailyGrassCutting: 701, remarks: 'NA' },
        '4': { dailyGrassCutting: 700, remarks: 'NA' }
      },
      '2': {
        '5': { dailyGrassCutting: 87, remarks: 'NA' },
        '6': { dailyGrassCutting: 247, remarks: 'NA' },
        '7': { dailyGrassCutting: 694, remarks: 'NA' },
        '8': { dailyGrassCutting: 72, remarks: 'NA' }
      },
      '3': {
        '9': { dailyGrassCutting: 354, remarks: 'NA' },
        '10': { dailyGrassCutting: 410, remarks: 'NA' },
        '11': { dailyGrassCutting: 304, remarks: 'NA' },
        '12': { dailyGrassCutting: 81, remarks: 'NA' }
      },
      '4': {
        '13': { dailyGrassCutting: 322, remarks: 'NA' },
        '14': { dailyGrassCutting: 309, remarks: 'NA' },
        '15': { dailyGrassCutting: 84, remarks: 'NA' },
        '16': { dailyGrassCutting: 742, remarks: 'NA' }
      }
    },
    dailyActual: 6516,
    dailyPlanned: 20000,
    deviation: 13484,
    deviationPercent: 67
  },
  {
    date: '2025-08-13',
    blockInverterData: {
      '1': {
        '1': { dailyGrassCutting: 615, remarks: 'NA' },
        '2': { dailyGrassCutting: 199, remarks: 'NA' },
        '3': { dailyGrassCutting: 499, remarks: 'NA' },
        '4': { dailyGrassCutting: 173, remarks: 'NA' }
      },
      '2': {
        '5': { dailyGrassCutting: 164, remarks: 'NA' },
        '6': { dailyGrassCutting: 702, remarks: 'NA' },
        '7': { dailyGrassCutting: 733, remarks: 'NA' },
        '8': { dailyGrassCutting: 551, remarks: 'NA' }
      },
      '3': {
        '9': { dailyGrassCutting: 424, remarks: 'NA' },
        '10': { dailyGrassCutting: 225, remarks: 'NA' },
        '11': { dailyGrassCutting: 470, remarks: 'NA' },
        '12': { dailyGrassCutting: 384, remarks: 'NA' }
      },
      '4': {
        '13': { dailyGrassCutting: 298, remarks: 'NA' },
        '14': { dailyGrassCutting: 320, remarks: 'NA' },
        '15': { dailyGrassCutting: 663, remarks: 'NA' },
        '16': { dailyGrassCutting: 96, remarks: 'NA' }
      }
    },
    dailyActual: 6516,
    dailyPlanned: 20000,
    deviation: 13484,
    deviationPercent: 67
  }
];