import { Request, Response } from "express";
import csv2json from "csvtojson";
import XLSX from "xlsx";
// Services
import BankStatementService from "@/services/bankStatement.service";
// Typings
import { FileType } from "@/typings/common";

class FinanceReportController {
  private bankStatementService = new BankStatementService();

  /**
   * POST /api/v1/platform/report
   *
   * Upload the bank statement report through the CSV
   */
  public postBankStatementReport = async (req: Request, res: Response) => {
    const user = req.user;

    const csvFile = req.file as FileType;
    const bankName = req.body.bank_name as string;

    if (!csvFile?.path) {
      throw new Error("CSV file path is missing");
    }

    const fileExtension = csvFile.originalname.split(".").pop()?.toLowerCase();
    let csvData: Record<string, string>[];

    if (fileExtension === "xls" || fileExtension === "xlsx") {
      // Convert XLS/XLSX → CSV → JSON
      const workbook = XLSX.readFile(csvFile.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const csvString = XLSX.utils.sheet_to_csv(sheet);

      // Parse CSV string to JSON
      csvData = (await csv2json().fromString(csvString)) as Record<
        string,
        string
      >[];
    } else {
      // Parse CSV file directly
      const filePath: string = csvFile.path;
      csvData = (await csv2json().fromFile(filePath)) as Record<
        string,
        string
      >[];
    }

    await this.bankStatementService.getBankStatements({
      reportData: csvData,
      bankName,
      user,
    });

    return res.send({ status: "success" });
  };
}

export default FinanceReportController;
