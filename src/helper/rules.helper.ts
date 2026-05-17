// Modules
import * as R from "ramda";
// Dao
import PaymentDao from "@/dao/payment.dao";
// Interface
import { IPayments } from "@/interfaces/payment.interface";
import { IRulesConditions } from "@/interfaces/rules.interface";

class RulesHelper {
  private paymentDao = new PaymentDao();

  private normalizeTokens = (str: string): string[] => {
    return str
      .toUpperCase()
      .replace(/[-_@./0-9]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4);
  };

  private fuzzyMatch = (description: string, ruleValue: string): boolean => {
    const descTokens = this.normalizeTokens(description);
    const valueTokens = this.normalizeTokens(ruleValue);
    return valueTokens.some((vt) =>
      descTokens.some((dt) => dt.includes(vt) || vt.includes(dt)),
    );
  };

  public checkRuleConditions = async (payload: {
    conditionLogic: "and" | "or";
    conditions: IRulesConditions[];
    paymentDetails: IPayments;
  }) => {
    const { conditionLogic, conditions, paymentDetails } = payload;
    let isAllConditionMatched;

    if (conditionLogic === "and") {
      isAllConditionMatched = true;
    } else if (conditionLogic === "or") {
      isAllConditionMatched = false;
    } else {
      throw new Error("Invalid Condition Logic Operation");
    }

    for (const condition of conditions) {
      let isConditionMatched = false;
      const { type, field, value, operation } = condition;

      const conditionFieldValue = R.path<string | number | null>(
        [field],
        paymentDetails,
      );

      if (!conditionFieldValue) {
        // No value found for this field make the condition false
        if (conditionLogic === "and") {
          isAllConditionMatched = isAllConditionMatched && false;
        } else if (conditionLogic === "or") {
          isAllConditionMatched = isAllConditionMatched || false;
        }
        continue;
      }

      if (type === "cross_transaction") {
        isConditionMatched = await this.checkCrossTransactionCondition(
          operation,
          conditionFieldValue,
          paymentDetails,
        );
      } else {
        // For the simple condition type
        switch (operation) {
          case "in":
            if (Array.isArray(value)) {
              isConditionMatched = Boolean(
                value.find((valueEl) => {
                  return conditionFieldValue.includes(valueEl);
                }),
              );
            } else {
              isConditionMatched = Boolean(conditionFieldValue.includes(value));
            }
            break;
          case "fuzzy":
            if (Array.isArray(value)) {
              isConditionMatched = (value as string[]).some((valueEl) =>
                this.fuzzyMatch(String(conditionFieldValue), valueEl),
              );
            } else {
              isConditionMatched = this.fuzzyMatch(
                String(conditionFieldValue),
                String(value),
              );
            }
            break;
          case "equals":
            isConditionMatched = Boolean(conditionFieldValue === value);
            break;
          case "greater":
            isConditionMatched = Boolean(conditionFieldValue > value);
            break;
          case "greaterEqual":
            isConditionMatched = Boolean(conditionFieldValue >= value);
            break;
          case "less":
            isConditionMatched = Boolean(conditionFieldValue < value);
            break;
          case "lessEqual":
            isConditionMatched = Boolean(conditionFieldValue <= value);
            break;
          default:
            // No operatoin found
            isConditionMatched = false;
            break;
        }
      }

      if (conditionLogic === "and") {
        // Directly return false as no need to check further
        if (!isConditionMatched) {
          return false;
        }
      } else if (conditionLogic === "or") {
        isAllConditionMatched = isAllConditionMatched || isConditionMatched;
      }
    }

    return isAllConditionMatched;
  };

  public checkCrossTransactionCondition = async (
    operation: string,
    operationValue: string | number,
    paymentDetails: IPayments,
  ) => {
    if (operation === "same_amount_same_day") {
      const transactions =
        await this.paymentDao.getTransactionCountByAmountAndDate(
          paymentDetails.transaction_created_at,
          paymentDetails.transaction_id,
          operationValue as number,
        );
      return transactions > 0;
    }
    return false;
  };
}

export default RulesHelper;
