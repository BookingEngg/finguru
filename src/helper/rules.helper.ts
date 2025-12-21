// Modules
import * as R from "ramda";
// Helper
import { IPayments } from "@/interfaces/payment.interface";
import { IRulesConditions } from "@/interfaces/rules.interface";

class RulesHelper {
  public checkRuleConditions = (
    conditions: IRulesConditions[],
    paymentDetails: IPayments
  ) => {
    for (const condition of conditions) {
      let isConditionMatched = false;

      const { field, value, operation } = condition;

      const conditionFieldValue = R.path<string | number | null>(
        [field],
        paymentDetails
      );

      if (!conditionFieldValue) {
        // No value found for this field
        return false;
      }

      switch (operation) {
        case "in":
          isConditionMatched = Boolean(conditionFieldValue.includes(value));
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
          return false;
      }

      // console.log("LOGS>>> ", conditionFieldValue, value, operation, isConditionMatched);

      // The condition is not matched with given condition then return false
      if (!isConditionMatched) {
        return false;
      }
    }

    // Match all the conditions
    return true;
  };
}

export default RulesHelper;
