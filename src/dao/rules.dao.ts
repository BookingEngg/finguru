import { IRulesConditions } from "@/interfaces/rules.interface";
import RulesModel from "@/models/rules.model";

class RulesDao {
  private rulesModel = RulesModel;

  public createRule = async (rule: object) => {
    return await this.rulesModel.create(rule);
  };

  public getRuleByFilter = async (filter: object) => {
    return await this.rulesModel.find(filter).lean();
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

  public getAllDefaultRules = async (userId: string, fields: string[] = []) => {
    return await this.rulesModel
      .find({ $or: [{ user_id: userId }, { bucket_type: "default" }] })
      .select(fields)
      .lean();
  };

  public updateRuleDetails = async (ruleId: string, updatePayload: object) => {
    return await this.rulesModel.updateOne({ short_id: ruleId }, updatePayload);
  };

  public deleteRule = async (ruleId: string) => {
    return await this.rulesModel.updateOne(
      { short_id: ruleId },
      { $set: { is_active: false } },
    );
  };
}

export default RulesDao;
