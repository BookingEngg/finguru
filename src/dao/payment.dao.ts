import PaymentModel from "@/models/payments.model";

class PaymentDao {
  private paymentModel = PaymentModel;

  public createBulkPayments = async (payload: object) => {
    return await this.paymentModel.insertMany(payload);
  };

  public getPaymentsByTransactionIds = async (
    transactionIds: string[],
    fields: string[]
  ) => {
    return await this.paymentModel
      .find({ transaction_id: { $in: transactionIds } })
      .select(fields)
      .lean();
  };
}

export default PaymentDao;
