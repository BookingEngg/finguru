import { IUser } from "@/interfaces/user.interface";
import * as R from "ramda";

class BankStatementService {
  /**
   * Check if the current row is the header row in the hdfc bank statement
   */
  private isHdfcBankHeader = (
    currentRow: Record<string, string>,
    rowKey: string[],
    headerFields: string[]
  ) => {
    for (let i = 0; i < rowKey.length; i++) {
      if (currentRow[rowKey[i]] !== headerFields[i]) {
        return false;
      }
    }

    return true;
  };

  /**
   * Will give the current statement row is having start row or no
   * or all empty row
   */
  private isInvalidStatementRow = (
    currentRow: Record<string, string>,
    rowKey: string[]
  ) => {
    let isStarRow = false,
      isAllEmptyRow = true;

    for (let i = 0; i < rowKey.length; i++) {
      isStarRow = isStarRow || currentRow[rowKey[i]].includes("***");
      isAllEmptyRow = isAllEmptyRow && currentRow[rowKey[i]] === "";
    }

    return {
      isStarRow,
      isAllEmptyRow,
    };
  };

  /**
   * This will ge the parsed filtered transactions of hdfc bank statement
   * @param reportData : HDFC Bank Statement Data
   */
  private getHdfcBankStatement = (reportData: Record<string, string>[]) => {
    const parsedFilteredStatements = [];
    const { header_fields, fields_args } = this.BANK_STATEMENT_MAPPER.HDFC;

    let isTransactionRow = false;

    for (let i = 0; i < reportData.length; i++) {
      const currentUnformattedStatementRow = reportData[i];

      // Current row is transaction row
      if (isTransactionRow) {
        // Pick only the header fields value (valid_values)
        const transactionRow = R.pick(
          header_fields,
          currentUnformattedStatementRow
        );

        // Check if the transaction row is start row or empty row
        const isInvalidRow = this.isInvalidStatementRow(
          currentUnformattedStatementRow,
          header_fields
        );

        // Invalid transaction row means => all transaction completed need to stop the transaction filtering
        if (isInvalidRow.isStarRow || isInvalidRow.isAllEmptyRow) {
          isTransactionRow = false;
          continue;
        }

        // Push the valid transaction row
        parsedFilteredStatements.push(transactionRow);
      }

      const isHeader = this.isHdfcBankHeader(
        currentUnformattedStatementRow,
        header_fields,
        fields_args
      );

      // Check if the current row is header row => start the transaction filtering
      if (isHeader) {
        isTransactionRow = true;
        i += 1; // Skip the next star row
      }
    }

    return parsedFilteredStatements;
  };

  private BANK_STATEMENT_MAPPER = {
    HDFC: {
      header_fields: [
        "field2",
        "field3",
        "field4",
        "field5",
        "field6",
        "field7",
      ],
      fields_args: [
        "Narration",
        "Chq./Ref.No.",
        "Value Dt",
        "Withdrawal Amt.",
        "Deposit Amt.",
        "Closing Balance",
      ],
      getStatement: this.getHdfcBankStatement,
    },
  };

  public getBankStatements = async (payload: {
    reportData: Record<string, string>[];
    bankName: string;
    user: IUser;
  }) => {
    const { reportData, bankName } = payload;

    const bankStatementDetails = this.BANK_STATEMENT_MAPPER[bankName];

    if (!bankStatementDetails) {
      throw new Error("Bank statement details not found");
    }

    const bankStatement = bankStatementDetails.getStatement(reportData);
    console.dir(bankStatement, { depth: null });

    console.dir(reportData, { depth: null });
  };
}

export default BankStatementService;
