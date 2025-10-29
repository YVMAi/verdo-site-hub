export interface ReportDownload {
  id: string;
  dateTime: string;
  userName: string;
  site: string;
  dateRange: string;
  fileName: string;
}

export const mockReportDownloads: ReportDownload[] = [
  {
    id: "1",
    dateTime: "17 Oct 2025 10:32:21",
    userName: "dsmApiKey@truboardpartners.com",
    site: "Bikenar",
    dateRange: "11 Oct 2025 to 19 Oct 2025",
    fileName: "Bikenar-2025-10-11-2025-10-19-20251017050222465.xlsx"
  },
  {
    id: "2",
    dateTime: "16 Oct 2025 20:02:47",
    userName: "dsmApiKey@truboardpartners.com",
    site: "Bikenar",
    dateRange: "01 Jan 2025 to 31 Dec 2025",
    fileName: "Bikenar-2025-01-01-2025-12-31-20251016143248455.xlsx"
  },
  {
    id: "3",
    dateTime: "16 Oct 2025 18:59:32",
    userName: "dsmApiKey@truboardpartners.com",
    site: "Bikenar",
    dateRange: "01 Oct 2025 to 20 Dec 2025",
    fileName: "Bikenar-2025-10-01-2025-12-20-20251016132934035.xlsx"
  },
  {
    id: "4",
    dateTime: "16 Oct 2025 18:59:06",
    userName: "dsmApiKey@truboardpartners.com",
    site: "Bikenar",
    dateRange: "01 Oct 2025 to 20 Dec 2025",
    fileName: "Bikenar-2025-10-01-2025-12-20-20251016132907076.xlsx"
  },
  {
    id: "5",
    dateTime: "16 Oct 2025 18:57:34",
    userName: "dsmApiKey@truboardpartners.com",
    site: "Bikenar",
    dateRange: "01 Oct 2025 to 20 Dec 2025",
    fileName: "Bikenar-2025-10-01-2025-12-20-20251016132735336.xlsx"
  }
];
