import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { IRules } from "@/interfaces/rules.interface";
import { nanoid } from "nanoid";

const dbConnection = MONGO_INSTANCES.finance;

const RulesConditionsSchema = new Schema({
  field: { type: String, required: true },
  operation: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
});

const RulesSchema: Schema<IRules> = new Schema(
  {
    short_id: { type: String },

    tag_name: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: Number, required: true },

    bucket_type: { type: String, required: true },
    logic: { type: String, required: true },
    conditions: { type: [RulesConditionsSchema], required: true },

    is_active: { type: Boolean, default: true },

    user_id: { type: String },
    created_by: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

RulesSchema.pre("save", function (next) {
  if (!this.short_id) {
    this.short_id = nanoid(8);
  }
  next();
});

const RulesModel = dbConnection.model("rules", RulesSchema);
export default RulesModel;
