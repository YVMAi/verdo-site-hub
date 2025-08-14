import { CleaningSiteData } from "@/types/cleaning";

export const mockCleaningData: { [key: string]: CleaningSiteData } = {
  "green-energy-site-a-wet": {
    clientId: "green-energy",
    siteId: "site-a",
    wetDryType: "wet",
    blocks: [
      {
        id: "block-1",
        name: "Block 1",
        inverters: [
          { id: "INV1", totalModules: 768, modulesCleaned: 1536, percentCompleted: 200 },
          { id: "INV2", totalModules: 768, modulesCleaned: 1162, percentCompleted: 151 },
          { id: "INV3", totalModules: 792, modulesCleaned: 792, percentCompleted: 100 },
          { id: "INV4", totalModules: 792, modulesCleaned: 792, percentCompleted: 100 }
        ]
      },
      {
        id: "block-2",
        name: "Block 2",
        inverters: [
          { id: "INV1", totalModules: 777, modulesCleaned: 777, percentCompleted: 100 },
          { id: "INV2", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 },
          { id: "INV3", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 },
          { id: "INV4", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 }
        ]
      },
      {
        id: "block-3",
        name: "Block 3",
        inverters: [
          { id: "INV1", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 },
          { id: "INV2", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 },
          { id: "INV3", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 },
          { id: "INV4", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 }
        ]
      },
      {
        id: "block-4",
        name: "Block 4",
        inverters: [
          { id: "INV1", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 },
          { id: "INV2", totalModules: 768, modulesCleaned: 768, percentCompleted: 100 },
          { id: "INV3", totalModules: 768, modulesCleaned: 765, percentCompleted: 99.6 },
          { id: "INV4", totalModules: 768, modulesCleaned: 765, percentCompleted: 99.6 }
        ]
      }
    ],
    dailyEntries: [
      {
        date: "14-Aug-25",
        inverterData: {
          "block-1-INV1": 202, "block-1-INV2": 370, "block-1-INV3": 268, "block-1-INV4": 47,
          "block-2-INV1": 287, "block-2-INV2": 441, "block-2-INV3": 727, "block-2-INV4": 86,
          "block-3-INV1": 448, "block-3-INV2": 395, "block-3-INV3": 317, "block-3-INV4": 375,
          "block-4-INV1": 717, "block-4-INV2": 116, "block-4-INV3": 127, "block-4-INV4": 299
        },
        plannedModules: 20000,
        totalCleaned: 5222,
        totalUncleaned: 14778,
        rainfallMM: "<INPUT>",
        remarks: "<INPUT>"
      }
    ],
    historicEntries: [
      {
        date: "13-Aug-25",
        inverterData: {
          "block-1-INV1": 4502, "block-1-INV2": 3992, "block-1-INV3": 4924, "block-1-INV4": 5936,
          "block-2-INV1": 3109, "block-2-INV2": 3228, "block-2-INV3": 4440, "block-2-INV4": 818,
          "block-3-INV1": 2582, "block-3-INV2": 884, "block-3-INV3": 2158, "block-3-INV4": 1655,
          "block-4-INV1": 7273, "block-4-INV2": 8925, "block-4-INV3": 500, "block-4-INV4": 4943
        },
        plannedModules: 20000,
        totalCleaned: 59871,
        totalUncleaned: -39871,
        rainfallMM: "2 MM",
        remarks: "NA",
        cyclesCompleted: 0.24
      },
      {
        date: "12-Aug-25",
        inverterData: {
          "block-1-INV1": 2670, "block-1-INV2": 6572, "block-1-INV3": 5642, "block-1-INV4": 5652,
          "block-2-INV1": 2400, "block-2-INV2": 2440, "block-2-INV3": 552, "block-2-INV4": 2838,
          "block-3-INV1": 5669, "block-3-INV2": 1590, "block-3-INV3": 2710, "block-3-INV4": 6193,
          "block-4-INV1": 4410, "block-4-INV2": 5482, "block-4-INV3": 5339, "block-4-INV4": 1267
        },
        plannedModules: 20000,
        totalCleaned: 65876,
        totalUncleaned: -45876,
        rainfallMM: "3 MM",
        remarks: "NA",
        cyclesCompleted: 0.14
      }
    ]
  },
  "green-energy-site-b-dry": {
    clientId: "green-energy",
    siteId: "site-b",
    wetDryType: "dry",
    blocks: [
      {
        id: "block-1",
        name: "Block 1",
        inverters: [
          { id: "INV1", totalModules: 650, modulesCleaned: 1200, percentCompleted: 185 },
          { id: "INV2", totalModules: 650, modulesCleaned: 950, percentCompleted: 146 }
        ]
      },
      {
        id: "block-2",
        name: "Block 2",
        inverters: [
          { id: "INV1", totalModules: 700, modulesCleaned: 700, percentCompleted: 100 },
          { id: "INV2", totalModules: 700, modulesCleaned: 680, percentCompleted: 97 }
        ]
      }
    ],
    dailyEntries: [
      {
        date: "14-Aug-25",
        inverterData: {
          "block-1-INV1": 150, "block-1-INV2": 200,
          "block-2-INV1": 300, "block-2-INV2": 250
        },
        plannedModules: 1500,
        totalCleaned: 900,
        totalUncleaned: 600,
        rainfallMM: "0 MM",
        remarks: "Dry cleaning completed"
      }
    ],
    historicEntries: []
  }
};