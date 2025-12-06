import { Request, Response } from "express";
import csv2json from "csvtojson";
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

    const filePath: string = csvFile.path;
    const csvData = (await csv2json().fromFile(filePath)) as Record<
      string,
      string
    >[];

    await this.bankStatementService.getBankStatements({
      reportData: csvData,
      bankName,
      user,
    });

    return res.send({ status: "success" });
  };
}

export default FinanceReportController;
