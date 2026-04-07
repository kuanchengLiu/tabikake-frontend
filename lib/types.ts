export interface User {
  id: string;        // Notion user_id
  name: string;
  avatar_url: string;
  created_at: string;
}

export interface ParsedReceipt {
  store_name_jp: string;
  store_name_zh: string;
  amount_jpy: number;
  tax_jpy: number;
  payment_method: "現金" | "Suica" | "PayPay" | "信用卡";
  category: "餐飲" | "交通" | "購物" | "住宿" | "其他";
  items: { name_jp: string; name_zh: string; price: number }[];
  date: string;
}

export interface Record {
  id: string;             // Notion page_id
  store_name_zh: string;
  store_name_jp: string;
  date: string;
  amount_jpy: number;
  amount_twd: number;
  tax_jpy: number;
  category: string;
  payment: string;
  paid_by_user_id: string;
  paid_by_user?: User;
  split_with: string[];   // user_ids (empty = split among all)
  items: { name_zh: string; price: number }[];
}

export interface JoinInfo {
  trip_name: string;
  owner_name: string;
  member_count: number;
}

export interface DashboardData {
  total_jpy: number;
  total_twd: number;
  by_person: { user_id: string; name: string; amount: number }[];
  by_category: { category: string; amount: number }[];
  records: Record[];
}

export interface Trip {
  id: string;
  name: string;
  owner_id: string;
  notion_page_id: string;
  notion_db_id: string;
  budget_jpy: number;
  budget_suica: number;
  start_date: string;
  end_date: string;
  invite_code: string;
  is_owner: boolean;
  member_count: number;
  created_at: string;
}

export interface Member {
  id: string;
  trip_id: string;
  user_id: string;
  is_owner: boolean;
  joined_at: string;
  user: User;
}

export interface SettlementResult {
  total_jpy: number;
  settlements: {
    from: User;
    to: User;
    amount_jpy: number;
  }[];
}

export interface ApiError {
  message: string;
  code?: string;
}
