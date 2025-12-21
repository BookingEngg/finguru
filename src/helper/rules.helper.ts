// Modules
import * as R from "ramda";
// Helper
import { IPayments } from "@/interfaces/payment.interface";
import { IRulesConditions } from "@/interfaces/rules.interface";

class RulesHelper {
  public checkRuleConditions = (payload: {
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
      const { field, value, operation } = condition;

      const conditionFieldValue = R.path<string | number | null>(
        [field],
        paymentDetails
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

      switch (operation) {
        case "in":
          if (Array.isArray(value)) {
            isConditionMatched = Boolean(
              value.find((valueEl) => {
                return conditionFieldValue.includes(valueEl);
              })
            );
          } else {
            isConditionMatched = Boolean(conditionFieldValue.includes(value));
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
}

export default RulesHelper;
