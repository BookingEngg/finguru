import PaymentModel from "@/models/payments.model";
import RulesService from "@/services/rules.service";

(async () => {
  const rulesService = new RulesService();

  const payments = await PaymentModel.find();

  for (const payment of payments) {
    await rulesService.autoAssignTagToPayment(payment._id.toString());
  }

  process.exit(0);
})();
