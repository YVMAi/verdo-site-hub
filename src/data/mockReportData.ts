export interface HistoricReport {
  id: string;
  generatedAt: string;
  userName: string;
  siteName: string;
  reportDate: string;
  reportTitle: string;
  reportType: "DGR" | "DOR" | "HSE";
  fileName: string;
  fileUrl: string;
}

export const mockHistoricReports: HistoricReport[] = [
  {
    id: "1",
    generatedAt: "2024-10-29 14:30",
    userName: "John Smith",
    siteName: "Solar Farm A",
    reportDate: "29 Oct",
    reportTitle: "Report as on 29 Oct",
    reportType: "DGR",
    fileName: "Solar_Farm_A_DGR_29_Oct_2024.pdf",
    fileUrl: "#"
  },
  {
    id: "2",
    generatedAt: "2024-10-28 09:15",
    userName: "Sarah Johnson",
    siteName: "Solar Farm B",
    reportDate: "28 Oct",
    reportTitle: "Report as on 28 Oct",
    reportType: "DOR",
    fileName: "Solar_Farm_B_DOR_28_Oct_2024.pdf",
    fileUrl: "#"
  },
  {
    id: "3",
    generatedAt: "2024-10-28 16:45",
    userName: "Michael Chen",
    siteName: "Solar Farm A",
    reportDate: "28 Oct",
    reportTitle: "Report as on 28 Oct",
    reportType: "HSE",
    fileName: "Solar_Farm_A_HSE_28_Oct_2024.pdf",
    fileUrl: "#"
  },
  {
    id: "4",
    generatedAt: "2024-10-27 11:20",
    userName: "John Smith",
    siteName: "Solar Farm C",
    reportDate: "27 Oct",
    reportTitle: "Report as on 27 Oct",
    reportType: "DGR",
    fileName: "Solar_Farm_C_DGR_27_Oct_2024.pdf",
    fileUrl: "#"
  },
  {
    id: "5",
    generatedAt: "2024-10-27 13:00",
    userName: "Emily Davis",
    siteName: "Solar Farm B",
    reportDate: "27 Oct",
    reportTitle: "Report as on 27 Oct",
    reportType: "DOR",
    fileName: "Solar_Farm_B_DOR_27_Oct_2024.pdf",
    fileUrl: "#"
  },
  {
    id: "6",
    generatedAt: "2024-10-26 10:30",
    userName: "Sarah Johnson",
    siteName: "Solar Farm A",
    reportDate: "26 Oct",
    reportTitle: "Report as on 26 Oct",
    reportType: "HSE",
    fileName: "Solar_Farm_A_HSE_26_Oct_2024.pdf",
    fileUrl: "#"
  },
  {
    id: "7",
    generatedAt: "2024-10-25 15:45",
    userName: "Michael Chen",
    siteName: "Solar Farm C",
    reportDate: "25 Oct",
    reportTitle: "Report as on 25 Oct",
    reportType: "DGR",
    fileName: "Solar_Farm_C_DGR_25_Oct_2024.pdf",
    fileUrl: "#"
  },
  {
    id: "8",
    generatedAt: "2024-10-25 08:20",
    userName: "John Smith",
    siteName: "Solar Farm B",
    reportDate: "25 Oct",
    reportTitle: "Report as on 25 Oct",
    reportType: "DOR",
    fileName: "Solar_Farm_B_DOR_25_Oct_2024.pdf",
    fileUrl: "#"
  }
];
