import { Request, Response } from "express";
import RulesService from "@/services/rules.service";
import PaymentDao from "@/dao/payment.dao";
import { ICreateRulesPayload } from "@/interfaces/rules.interface";

class RulesController {
  private rulesService = new RulesService();
  private paymentDao = new PaymentDao();

  public getRules = async (
    req: Request<{}, {}, {}, { user_id: string; rule_id: string }>,
    res: Response,
  ) => {
    const { user_id, rule_id } = req.query;

    const response = await this.rulesService.getRules({ user_id, rule_id });
    return res.send({ status: "success", data: response });
  };

  public addNewRule = async (
    req: Request<{}, {}, ICreateRulesPayload>,
    res: Response,
  ) => {
    const user = req.user;
    const payload = req.body;

    await this.rulesService.addNewRule(user, payload);

    return res.send({ status: "success" });
  };

  public updateRule = async (
    req: Request<{ ruleId: string }, {}, ICreateRulesPayload>,
    res: Response,
  ) => {
    const payload = req.body;
    const { ruleId } = req.params;

    await this.rulesService.updateRuleDetails(ruleId, payload);
    return res.send({ status: "success" });
  };

  public assignTagToPayment = async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    const message = await this.rulesService.autoAssignTagToPayment(paymentId);
    return res.send({ status: "success", message });
  };

  public getPayments = async (req: Request, res: Response) => {
    const filter = req.body;
    console.log("FILTER>> ", filter)
    const payments = await this.paymentDao.getPaymentsByFilter(filter);
    return res.send({ status: "success", data: payments });
  };

  public deleteRule = async (
    req: Request<{ ruleId: string }>,
    res: Response,
  ) => {
    const { ruleId } = req.params;
    await this.rulesService.deleteRule(ruleId);
    return res.send({ status: "success" });
  };
}

export default RulesController;
