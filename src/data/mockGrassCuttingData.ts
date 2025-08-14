import { GrassCuttingSiteData } from "@/types/grassCutting";

export const mockGrassCuttingData: { [key: string]: GrassCuttingSiteData } = {
  "1-1": {
    clientId: "1",
    siteId: "1",
    blocks: [
      {
        id: "block-1",
        name: "Block 1",
        inverters: [
          { id: "INV1", totalStrings: 768, grassCuttingDone: 340, percentCompleted: 44 },
          { id: "INV2", totalStrings: 768, grassCuttingDone: 520, percentCompleted: 68 },
          { id: "INV3", totalStrings: 792, grassCuttingDone: 280, percentCompleted: 35 },
          { id: "INV4", totalStrings: 792, grassCuttingDone: 475, percentCompleted: 60 }
        ]
      },
      {
        id: "block-2",
        name: "Block 2",
        inverters: [
          { id: "INV1", totalStrings: 777, grassCuttingDone: 460, percentCompleted: 59 },
          { id: "INV2", totalStrings: 768, grassCuttingDone: 615, percentCompleted: 80 },
          { id: "INV3", totalStrings: 768, grassCuttingDone: 692, percentCompleted: 90 },
          { id: "INV4", totalStrings: 768, grassCuttingDone: 307, percentCompleted: 40 }
        ]
      },
      {
        id: "block-3",
        name: "Block 3",
        inverters: [
          { id: "INV1", totalStrings: 768, grassCuttingDone: 384, percentCompleted: 50 },
          { id: "INV2", totalStrings: 768, grassCuttingDone: 461, percentCompleted: 60 },
          { id: "INV3", totalStrings: 768, grassCuttingDone: 345, percentCompleted: 45 },
          { id: "INV4", totalStrings: 768, grassCuttingDone: 537, percentCompleted: 70 }
        ]
      },
      {
        id: "block-4",
        name: "Block 4",
        inverters: [
          { id: "INV1", totalStrings: 768, grassCuttingDone: 614, percentCompleted: 80 },
          { id: "INV2", totalStrings: 768, grassCuttingDone: 307, percentCompleted: 40 },
          { id: "INV3", totalStrings: 768, grassCuttingDone: 230, percentCompleted: 30 },
          { id: "INV4", totalStrings: 768, grassCuttingDone: 460, percentCompleted: 60 }
        ]
      }
    ],
    dailyEntries: [
      {
        date: "14-Aug-25",
        inverterData: {
          "block-1-INV1": 45, "block-1-INV2": 462, "block-1-INV3": 701, "block-1-INV4": 700,
          "block-2-INV1": 87, "block-2-INV2": 247, "block-2-INV3": 694, "block-2-INV4": 72,
          "block-3-INV1": 354, "block-3-INV2": 410, "block-3-INV3": 304, "block-3-INV4": 81,
          "block-4-INV1": 322, "block-4-INV2": 309, "block-4-INV3": 84, "block-4-INV4": 742
        },
        plannedStrings: 20000,
        dailyActual: 6516,
        deviation: 13484,
        rainfallMM: "<INPUT>",
        remarks: "<INPUT>"
      }
    ],
    historicEntries: [
      {
        date: "13-Aug-25",
        inverterData: {
          "block-1-INV1": 615, "block-1-INV2": 199, "block-1-INV3": 499, "block-1-INV4": 173,
          "block-2-INV1": 164, "block-2-INV2": 702, "block-2-INV3": 733, "block-2-INV4": 551,
          "block-3-INV1": 424, "block-3-INV2": 225, "block-3-INV3": 470, "block-3-INV4": 384,
          "block-4-INV1": 298, "block-4-INV2": 320, "block-4-INV3": 663, "block-4-INV4": 96
        },
        plannedStrings: 20000,
        dailyActual: 6516,
        deviation: 13484,
        rainfallMM: "2 MM",
        remarks: "NA",
        cyclesCompleted: 1.2
      },
      {
        date: "12-Aug-25",
        inverterData: {
          "block-1-INV1": 520, "block-1-INV2": 350, "block-1-INV3": 280, "block-1-INV4": 410,
          "block-2-INV1": 380, "block-2-INV2": 460, "block-2-INV3": 520, "block-2-INV4": 340,
          "block-3-INV1": 290, "block-3-INV2": 370, "block-3-INV3": 450, "block-3-INV4": 320,
          "block-4-INV1": 400, "block-4-INV2": 480, "block-4-INV3": 360, "block-4-INV4": 440
        },
        plannedStrings: 18000,
        dailyActual: 6570,
        deviation: 11430,
        rainfallMM: "0 MM",
        remarks: "Clear weather",
        cyclesCompleted: 1.1
      }
    ]
  },
  "1-2": {
    clientId: "1",
    siteId: "2",
    blocks: [
      {
        id: "block-1",
        name: "Block 1",
        inverters: [
          { id: "INV1", totalStrings: 650, grassCuttingDone: 520, percentCompleted: 80 },
          { id: "INV2", totalStrings: 650, grassCuttingDone: 455, percentCompleted: 70 }
        ]
      },
      {
        id: "block-2",
        name: "Block 2",
        inverters: [
          { id: "INV1", totalStrings: 720, grassCuttingDone: 576, percentCompleted: 80 },
          { id: "INV2", totalStrings: 720, grassCuttingDone: 504, percentCompleted: 70 },
          { id: "INV3", totalStrings: 700, grassCuttingDone: 350, percentCompleted: 50 }
        ]
      }
    ],
    dailyEntries: [
      {
        date: "14-Aug-25",
        inverterData: {
          "block-1-INV1": 120, "block-1-INV2": 150,
          "block-2-INV1": 180, "block-2-INV2": 160, "block-2-INV3": 140
        },
        plannedStrings: 1000,
        dailyActual: 750,
        deviation: 250,
        rainfallMM: "<INPUT>",
        remarks: "<INPUT>"
      }
    ],
    historicEntries: [
      {
        date: "13-Aug-25",
        inverterData: {
          "block-1-INV1": 100, "block-1-INV2": 130,
          "block-2-INV1": 150, "block-2-INV2": 140, "block-2-INV3": 120
        },
        plannedStrings: 900,
        dailyActual: 640,
        deviation: 260,
        rainfallMM: "1 MM",
        remarks: "Good progress",
        cyclesCompleted: 0.8
      }
    ]
  }
};