import { Request, Response } from "express";
import RulesService from "@/services/rules.service";
import { ICreateRulesPayload } from "@/interfaces/rules.interface";

class RulesController {
  private rulesService = new RulesService();

  public addNewRule = async (
    req: Request<{}, {}, ICreateRulesPayload>,
    res: Response
  ) => {
    const user = req.user;
    const payload = req.body;

    await this.rulesService.addNewRule(user, payload);

    return res.send({ status: "success" });
  };

  public updateRule = async (
    req: Request<{ ruleId: string }, {}, ICreateRulesPayload>,
    res: Response
  ) => {
    const payload = req.body;
    const { ruleId } = req.params;

    await this.rulesService.updateRuleDetails(ruleId, payload);
    return res.send({ status: "success" });
  };
}

export default RulesController;
