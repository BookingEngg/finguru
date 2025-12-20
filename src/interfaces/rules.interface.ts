export interface IRules extends Document {
  short_id: string;

  tag_name: string;
  description: string;
  priority: number;
  bucket_type: "default" | "custom";

  conditions: IRulesConditions[];
  is_active: boolean;

  user_id: string; // In case of custom
  created_by: string; // Created by admin id
}

export interface IRulesConditions {
  field: string;
  operation: "in" | "equals" | "greater" | "lower";
  value: string | number;
}

export interface ICreateRulesPayload {
  tag_name: string;
  description: string;
  priority: number;
  bucket_type: "default" | "custom";
  conditions: IRulesConditions[];
}
