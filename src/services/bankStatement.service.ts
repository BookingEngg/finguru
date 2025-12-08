import { TRANSACTION_IDENTIFIER_SIZE } from "@/constants/payment.constants";
import PaymentDao from "@/dao/payment.dao";
import { IUser } from "@/interfaces/user.interface";
import { getUniqueIdentifierFromParameters } from "@/util/utils.util";
import * as R from "ramda";

class BankStatementService {
  private paymentDao = new PaymentDao();

  /**
   * Check if the current row is the header row in the bank statement
   */
  private isHeaderStatementRow = (
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
   * This will give the formatted payment for sbi bank statement
   * @param transactionStatementRow : Transaction statement row
   */
  private getFormattedPmtForSbiStatement = (
    transactionStatementRow: Record<string, string>,
    userId: string
  ) => {
    const debitAmount = R.pathOr("", ["field5"], transactionStatementRow);
    const creditAmount = R.pathOr("", ["field6"], transactionStatementRow);
    const transactionDescription =
      R.path(["field3"], transactionStatementRow) || "";
    const transactionCreatedAt =
      R.path(["Account Name       :"], transactionStatementRow) || "";

    const transactionId = getUniqueIdentifierFromParameters(
      [transactionCreatedAt, transactionDescription],
      TRANSACTION_IDENTIFIER_SIZE
    );
    return {
      bank_name: "SBI",
      user_id: userId,
      flags: [],

      transaction_id: transactionId,
      description: transactionDescription,
      transaction_type: debitAmount ? "debit" : "credit",
      amount: debitAmount
        ? Number(debitAmount.replace(/,/g, ""))
        : Number(creditAmount.replace(/,/g, "")),
      transaction_created_at: transactionCreatedAt,
    };
  };

  /**
   * This will give the formatted payment for hdfc bank statement
   * @param transactionStatementRow : Transaction statement row
   */
  private getFormattedPmtForHdfcStatement = (
    transactionStatementRow: Record<string, string>,
    userId: string
  ) => {
    const debitAmount = R.path(["field5"], transactionStatementRow) || "";
    const creditAmount = R.path(["field6"], transactionStatementRow) || "";
    const transactionDescription =
      R.path(["field2"], transactionStatementRow) || "";
    const transactionCreatedAt =
      R.path(["field4"], transactionStatementRow) || "";

    const transactionId = getUniqueIdentifierFromParameters(
      [transactionCreatedAt, transactionDescription],
      TRANSACTION_IDENTIFIER_SIZE
    );

    return {
      bank_name: "HDFC",
      user_id: userId,
      flags: [],

      transaction_id: transactionId,
      description: transactionDescription,
      transaction_type: debitAmount ? "debit" : "credit",
      amount: debitAmount
        ? Number(debitAmount.replace(/,/g, ""))
        : Number(creditAmount.replace(/,/g, "")),
      transaction_created_at: transactionCreatedAt,
    };
  };

  /**
   * This will ge the parsed filtered transactions of hdfc bank statement
   * @param reportData : HDFC Bank Statement Data
   */
  private getHdfcBankStatement = (
    reportData: Record<string, string>[],
    userId: string
  ) => {
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
        // console.log(transactionRow);
        parsedFilteredStatements.push(
          this.getFormattedPmtForHdfcStatement(transactionRow, userId)
        );
      }

      const isHeader = this.isHeaderStatementRow(
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

  /**
   * This will ge the parsed filtered transactions of sbi bank statement
   * @param reportData : SBI Bank Statement Data
   */
  private getSbiBankStatement = (
    reportData: Record<string, string>[],
    userId: string
  ) => {
    const parsedFilteredStatements = [];
    const { header_fields, fields_args } = this.BANK_STATEMENT_MAPPER.SBI;

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
        parsedFilteredStatements.push(
          this.getFormattedPmtForSbiStatement(transactionRow, userId)
        );
      }

      const isHeader = this.isHeaderStatementRow(
        currentUnformattedStatementRow,
        header_fields,
        fields_args
      );

      // Check if the current row is header row => start the transaction filtering
      if (isHeader) {
        isTransactionRow = true;
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
    SBI: {
      header_fields: [
        "Account Name       :",
        "field3",
        "field4",
        "field5",
        "field6",
        "field7",
      ],
      fields_args: [
        "Txn Date",
        "Description",
        "Ref No./Cheque No.",
        "Debit",
        "Credit",
        "Balance",
      ],
      getStatement: this.getSbiBankStatement,
    },
  };

  public getBankStatements = async (payload: {
    reportData: Record<string, string>[];
    bankName: string;
    user: IUser;
  }) => {
    const { reportData, bankName, user } = payload;

    const bankStatementDetails = this.BANK_STATEMENT_MAPPER[bankName];

    if (!bankStatementDetails) {
      throw new Error("Bank not found");
    }

    const bankStatement = bankStatementDetails.getStatement(
      reportData,
      user._id
    );

    const existingPayments = await this.paymentDao.getPaymentsByTransactionIds(
      bankStatement.map((pmt) => pmt.transaction_id),
      ["transaction_id", "_id"]
    );
    const exisitingPaymentMapper = R.indexBy(
      R.prop("transaction_id"),
      existingPayments
    );

    const newStatements = bankStatement.filter((statement) => {
      return !exisitingPaymentMapper[statement.transaction_id];
    });

    newStatements.length &&
      (await this.paymentDao.createBulkPayments(newStatements));
  };
}

export default BankStatementService;
