import { IRulesConditions } from "@/interfaces/rules.interface";
import RulesModel from "@/models/rules.model";

class RulesDao {
  private rulesModel = RulesModel;

  public createRule = async (rule: object) => {
    return await this.rulesModel.create(rule);
  };

  public getRuleByTagName = async (tagName: string) => {
    return await this.rulesModel
      .findOne({ tag_name: tagName, is_active: true })
      .lean();
  };

  public getRuleById = async (shortId: string) => {
    return await this.rulesModel
      .findOne({ short_id: shortId, is_active: true })
      .lean();
  };

  public updateRuleDetails = async (ruleId: string, updatePayload: object) => {
    console.log("UPDATED>>>", updatePayload);
    return await this.rulesModel.updateOne(
      { short_id: ruleId },
      updatePayload,
    );
  };
}

export default RulesDao;
