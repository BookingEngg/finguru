// Dao
import RulesDao from "@/dao/rules.dao";
// Interfaces
import {
  ICreateRulesPayload,
  IRulesConditions,
} from "@/interfaces/rules.interface";
import { IUser } from "@/interfaces/user.interface";
import { nanoid } from "nanoid";

class RulesService {
  private rulesDao = new RulesDao();

  public addNewRule = async (user: IUser, rulePaylaod: ICreateRulesPayload) => {
    const { tag_name: tagName } = rulePaylaod;

    const existingRule = await this.rulesDao.getRuleByTagName(tagName);
    if (existingRule) {
      throw new Error("Rule already exists with this tag");
    }

    const rulePayload = {
      tag_name: rulePaylaod.tag_name,
      description: rulePaylaod.description,
      priority: rulePaylaod.priority,
      bucket_type: rulePaylaod.bucket_type,
      conditions: rulePaylaod.conditions,
      is_active: true,
      created_by: user._id,
    };

    return await this.rulesDao.createRule(rulePayload);
  };

  public updateRuleDetails = async (
    ruleId: string,
    updatedRulesPayload: ICreateRulesPayload
  ) => {
    const {
      tag_name: tagName,
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
        ...(conditions?.length ? { conditions: allConditions } : {}),
      },
    };

    const updatedRule = await this.rulesDao.updateRuleDetails(
      ruleId,
      updatedRulePayload
    );
    return updatedRule;
  };
}

export default RulesService;
