// Modules
import moment from "moment";
// Dao
import PaymentDao from "@/dao/payment.dao";
// Interfaces
import {
  IFinancialQueryFilters,
  IFinancialQueryPayload,
} from "@/interfaces/payment.interface";

class PaymentService {
  private paymentDao = new PaymentDao();

  public executeFinancialQuery = async (
    userId: string,
    payload: IFinancialQueryPayload,
  ) => {
    const {
      operation,
      metric = "amount",
      filters,
      group_by,
      period = "month",
    } = payload;

    const matchStage = { $match: this.buildMatchStage(userId, filters) };

    switch (operation) {
      case "sum":
      case "avg": {
        const aggOp = operation === "sum" ? "$sum" : "$avg";
        const rows = await this.paymentDao.runAggregation([
          matchStage,
          {
            $group: {
              _id: null,
              result: { [aggOp]: `$${metric}` },
              count: { $sum: 1 },
            },
          },
        ]);
        return rows[0]
          ? { result: rows[0].result, count: rows[0].count }
          : { result: 0, count: 0 };
      }

      case "trend": {
        const dateGroupId: Record<string, any> = {
          year: { $year: "$transaction_created_at" },
          month: { $month: "$transaction_created_at" },
        };
        if (period === "day")
          dateGroupId.day = { $dayOfMonth: "$transaction_created_at" };
        if (period === "week")
          dateGroupId.week = { $week: "$transaction_created_at" };

        const rows = await this.paymentDao.runAggregation([
          matchStage,
          {
            $group: {
              _id: dateGroupId,
              total: { $sum: `$${metric}` },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);
        return rows.map((row: any) => ({
          period: this.formatPeriodLabel(row._id, period),
          total: row.total,
          count: row.count,
        }));
      }

      case "group_by": {
        if (!group_by)
          throw new Error("group_by field is required for group_by operation");
        const rows = await this.paymentDao.runAggregation([
          matchStage,
          {
            $group: {
              _id: `$${group_by}`,
              total: { $sum: `$${metric}` },
              avg: { $avg: `$${metric}` },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ]);
        return rows.map((row: any) => ({
          group: row._id,
          total: row.total,
          avg: row.avg,
          count: row.count,
        }));
      }

      case "category_analysis": {
        const rows = await this.paymentDao.runAggregation([
          matchStage,
          { $unwind: "$tags" },
          {
            $group: {
              _id: "$tags",
              total: { $sum: `$${metric}` },
              avg: { $avg: `$${metric}` },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ]);
        return rows.map((row: any) => ({
          category: row._id,
          total: row.total,
          avg: row.avg,
          count: row.count,
        }));
      }

      case "monthly_growth": {
        const rows = await this.paymentDao.runAggregation([
          matchStage,
          {
            $group: {
              _id: {
                year: { $year: "$transaction_created_at" },
                month: { $month: "$transaction_created_at" },
              },
              total: { $sum: `$${metric}` },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
        return rows.map((row: any, idx: number) => {
          const prev = rows[idx - 1];
          const growth_pct =
            prev && prev.total !== 0
              ? parseFloat(
                  (((row.total - prev.total) / prev.total) * 100).toFixed(2),
                )
              : null;
          return {
            period: `${row._id.year}-${String(row._id.month).padStart(2, "0")}`,
            total: row.total,
            count: row.count,
            growth_pct,
          };
        });
      }

      case "merchant_analysis": {
        const rows = await this.paymentDao.runAggregation([
          matchStage,
          {
            $group: {
              _id: "$description",
              total: { $sum: `$${metric}` },
              avg: { $avg: `$${metric}` },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 20 },
        ]);
        return rows.map((row: any) => ({
          merchant: row._id,
          total: row.total,
          avg: row.avg,
          count: row.count,
        }));
      }

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  };

  private buildMatchStage = (
    userId: string,
    filters?: IFinancialQueryFilters,
  ): Record<string, any> => {
    const match: Record<string, any> = { };

    if (filters?.transaction_type)
      match.transaction_type = filters.transaction_type;
    if (filters?.bank_name) match.bank_name = filters.bank_name;
    if (filters?.tag) match.tags = filters.tag;

    if (filters?.date_range?.start || filters?.date_range?.end) {
      const dateFilter: Record<string, Date> = {};
      if (filters.date_range?.start) {
        dateFilter.$gte = moment(filters.date_range.start, "YYYY-MM-DD")
          .startOf("day")
          .utcOffset(330, true)
          .toDate();
      }
      if (filters.date_range?.end) {
        dateFilter.$lte = moment(filters.date_range.end, "YYYY-MM-DD")
          .endOf("day")
          .utcOffset(330, true)
          .toDate();
      }
      match.transaction_created_at = dateFilter;
    }

    if (filters?.amount_gt !== undefined || filters?.amount_lt !== undefined) {
      const amtFilter: Record<string, number> = {};
      if (filters.amount_gt !== undefined) amtFilter.$gt = filters.amount_gt;
      if (filters.amount_lt !== undefined) amtFilter.$lt = filters.amount_lt;
      match.amount = amtFilter;
    }

    return match;
  };

  private formatPeriodLabel = (id: any, period: string): string => {
    const y = id.year;
    const m = String(id.month).padStart(2, "0");
    if (period === "day") return `${y}-${m}-${String(id.day).padStart(2, "0")}`;
    if (period === "week") return `${y}-W${String(id.week).padStart(2, "0")}`;
    return `${y}-${m}`;
  };
}

export default PaymentService;
