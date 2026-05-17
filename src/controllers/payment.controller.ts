// Modules
import moment from "moment";
import { Request, Response } from "express";
// Services
import PaymentService from "@/services/payment.service";
// Dao
import PaymentDao from "@dao/payment.dao";
// Interfaces
import { IFinancialQueryPayload } from "@/interfaces/payment.interface";

class PaymentController {
  private paymentDao = new PaymentDao();
  private paymentService = new PaymentService();

  /**
   * Get all the payment objects based on filters
   * @deprecated
   */
  public getPayments = async (req: Request, res: Response) => {
    const { transaction_type, bank_name, start_date, end_date } = req.body;

    const startDate = start_date
      ? moment(start_date, "YYYY-MM-DD")
          .startOf("day")
          .utcOffset(330, true)
          .toDate()
      : undefined;
    const endDate = end_date
      ? moment(end_date, "YYYY-MM-DD")
          .endOf("day")
          .utcOffset(330, true)
          .toDate()
      : undefined;

    const filterObj: any = {
      ...(transaction_type ? { transaction_type } : {}),
      ...(bank_name ? { bank_name } : {}),
      ...(startDate || endDate
        ? {
            transaction_created_at: {
              ...(startDate ? { $gte: startDate } : {}),
              ...(endDate ? { $lte: endDate } : {}),
            },
          }
        : {}),
    };

    const payments = await this.paymentDao.getPaymentsByFilter(filterObj);
    return res.send({ status: "success", data: payments });
  };

  public executeFinancialQuery = async (
    req: Request<{}, {}, IFinancialQueryPayload>,
    res: Response,
  ) => {
    const userId = req.user?._id;
    console.log("REQUEST Payload>>> ", req.body);
    const data = await this.paymentService.executeFinancialQuery(userId, req.body);
    return res.send({ status: "success", operation: req.body.operation, data });
  };
}

export default PaymentController;
