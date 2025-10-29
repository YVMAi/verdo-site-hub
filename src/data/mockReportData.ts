export interface HistoricReport {
  id: string;
  generatedAt: string;
  userName: string;
  siteName: string;
  dateRange: string;
  fileName: string;
  fileUrl: string;
}

export const mockHistoricReports: HistoricReport[] = [
  {
    id: "1",
    generatedAt: "2024-01-15 14:30",
    userName: "John Smith",
    siteName: "Solar Farm A",
    dateRange: "Jan 1 - Jan 15, 2024",
    fileName: "Solar_Farm_A_Jan_2024.pdf",
    fileUrl: "#"
  },
  {
    id: "2",
    generatedAt: "2024-01-10 09:15",
    userName: "Sarah Johnson",
    siteName: "Solar Farm B",
    dateRange: "Dec 1 - Dec 31, 2023",
    fileName: "Solar_Farm_B_Dec_2023.pdf",
    fileUrl: "#"
  },
  {
    id: "3",
    generatedAt: "2024-01-08 16:45",
    userName: "Michael Chen",
    siteName: "Solar Farm A",
    dateRange: "Dec 15 - Dec 31, 2023",
    fileName: "Solar_Farm_A_Dec_2023.pdf",
    fileUrl: "#"
  },
  {
    id: "4",
    generatedAt: "2024-01-05 11:20",
    userName: "John Smith",
    siteName: "Solar Farm C",
    dateRange: "Nov 1 - Nov 30, 2023",
    fileName: "Solar_Farm_C_Nov_2023.pdf",
    fileUrl: "#"
  },
  {
    id: "5",
    generatedAt: "2023-12-28 13:00",
    userName: "Emily Davis",
    siteName: "Solar Farm B",
    dateRange: "Nov 15 - Dec 15, 2023",
    fileName: "Solar_Farm_B_Nov_Dec_2023.pdf",
    fileUrl: "#"
  },
  {
    id: "6",
    generatedAt: "2023-12-20 10:30",
    userName: "Sarah Johnson",
    siteName: "Solar Farm A",
    dateRange: "Oct 1 - Oct 31, 2023",
    fileName: "Solar_Farm_A_Oct_2023.pdf",
    fileUrl: "#"
  }
];
