// Dao
import RulesDao from "@/dao/rules.dao";
import PaymentDao from "@/dao/payment.dao";
// Helper
import RulesHelper from "@/helper/rules.helper";
// Interfaces
import { ICreateRulesPayload } from "@/interfaces/rules.interface";
import { IUser } from "@/interfaces/user.interface";
import { IPayments } from "@/interfaces/payment.interface";

class RulesService {
  private rulesDao = new RulesDao();
  private paymentDao = new PaymentDao();
  // Helper
  private rulesHelper = new RulesHelper();

  /**
   * This will add the new rule with given conditions
   */
  public addNewRule = async (user: IUser, rulePaylaod: ICreateRulesPayload) => {
    const { tag_name: tagName, bucket_type: bucketType } = rulePaylaod;

    const existingRule = await this.rulesDao.getRuleByTagName(tagName);
    if (existingRule) {
      throw new Error("Rule already exists with this tag");
    }

    const rulePayload = {
      tag_name: rulePaylaod.tag_name,
      description: rulePaylaod.description,
      priority: rulePaylaod.priority,
      bucket_type: bucketType,
      logic: rulePaylaod.logic,
      conditions: rulePaylaod.conditions,
      is_active: true,
      created_by: user._id,
      ...(bucketType === "custom" ? { user_id: user._id } : {}),
    };

    return await this.rulesDao.createRule(rulePayload);
  };

  /**
   * Update rules details from rule id
   */
  public updateRuleDetails = async (
    ruleId: string,
    updatedRulesPayload: ICreateRulesPayload
  ) => {
    const {
      tag_name: tagName,
      logic,
      bucket_type: bucketType,
      user_id: userId,
      description,
      priority,
      conditions,
    } = updatedRulesPayload;

    const existingRule = await this.rulesDao.getRuleById(ruleId);
    if (!existingRule) {
      throw new Error("Rule not found");
    }

    const allConditions = existingRule.conditions;
    // Push the new condition if it doesn't exist
    conditions.forEach((condition) => {
      const isExists = allConditions.some((cond) => {
        return (
          cond.field === condition.field &&
          cond.operation === condition.operation &&
          cond.value === condition.value
        );
      });

      if (!isExists) {
        allConditions.push(condition);
      }
    });

    const updatedRulePayload = {
      $set: {
        ...(tagName ? { tag_name: tagName } : {}),
        ...(description ? { description: description } : {}),
        ...(priority ? { priority: priority } : {}),
        ...(bucketType ? { bucket_type: bucketType } : {}),
        ...(logic ? { logic: logic } : {}),
        ...(userId && bucketType === "custom" ? { user_id: userId } : {}),
        ...(conditions?.length ? { conditions: allConditions } : {}),
      },
    };

    const updatedRule = await this.rulesDao.updateRuleDetails(
      ruleId,
      updatedRulePayload
    );
    return updatedRule;
  };

  /**
   * Assign rule tag to payment from the payment id
   */
  public assignTagToPayment = async (paymentId: string) => {
    const paymentDetails = await this.paymentDao.getPaymentById(paymentId);

    if (!paymentDetails) {
      return `Payment not found with this payment id ${paymentId}`;
    }

    // Get all default rules
    const defaultRules = await this.rulesDao.getAllDefaultRules(
      paymentDetails.user_id
    );

    const assignedTag = [];

    for (const rule of defaultRules) {
      const { conditions: ruleConditions, tag_name: tagName, logic } = rule;

      const isConditionMatch = this.rulesHelper.checkRuleConditions({
        conditionLogic: logic,
        conditions: ruleConditions,
        paymentDetails,
      });

      if (isConditionMatch) {
        assignedTag.push(tagName);
      }
    }

    console.log("ASSIGNED TAG>>> ", assignedTag);

    // Assign the tags for this payments
    await this.paymentDao.assignTagsToPayment(paymentId, assignedTag);

    return "Tag assigned successfully";
  };
}

export default RulesService;
