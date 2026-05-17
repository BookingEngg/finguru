import PaymentModel from "@/models/payments.model";
import moment from "moment";

class PaymentDao {
  private paymentModel = PaymentModel;

  public createBulkPayments = async (payload: object) => {
    return await this.paymentModel.insertMany(payload);
  };

  public getPaymentsByTransactionIds = async (
    transactionIds: string[],
    fields: string[],
  ) => {
    return await this.paymentModel
      .find({ transaction_id: { $in: transactionIds } })
      .select(fields)
      .lean();
  };

  public getPaymentById = async (id: string) => {
    return await this.paymentModel.findOne({ _id: id }).lean();
  };

  public assignTagsToPayment = async (paymentId: string, tags: string[]) => {
    return await this.paymentModel.updateOne(
      { _id: paymentId },
      { $set: { tags: tags } },
    );
  };

  public getPaymentsByFilter = async (filter: object) => {
    return await this.paymentModel.find(filter).lean();
  };

  public runAggregation = async (pipeline: any[]) => {
    return await this.paymentModel.aggregate(pipeline);
  };

  public getTransactionCountByAmountAndDate = async (
    transactionCreatedDate: Date,
    transactionId: string,
    amount: number,
  ) => {
    return await this.paymentModel.countDocuments({
      transaction_created_at: {
        $gte: moment(transactionCreatedDate).startOf("day").toDate(),
        $lte: moment(transactionCreatedDate).endOf("day").toDate(),
      },
      transaction_id: { $ne: transactionId },
      amount,
    });
  };
}

export default PaymentDao;
