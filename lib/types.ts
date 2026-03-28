export interface User {
  id: string;
  name: string;
  avatar_url: string;
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
  id: string;
  store: string;
  date: string;
  amount_jpy: number;
  amount_twd: number;
  category: string;
  payment: string;
  paid_by: string;
  paid_by_name: string;
  split_with: string[];
  items: { name_zh: string; price: number }[];
}

export interface DashboardData {
  total_jpy: number;
  total_twd: number;
  by_person: { user_id: string; name: string; amount: number }[];
  by_category: { category: string; amount: number }[];
  settlements: {
    from: string;
    from_name: string;
    to: string;
    to_name: string;
    amount: number;
  }[];
  records: Record[];
}

export interface Trip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  notion_page_id: string;
  notion_db_id: string;
  invite_code: string;
  created_at: string;
}

export interface Member {
  id: string;
  trip_id: string;
  name: string;
  avatar_color: string;
  is_owner: boolean;
  created_at: string;
}

export interface SettlementResult {
  total_jpy: number;
  by_member: {
    member: Member;
    paid_jpy: number;
    owe_jpy: number;
    diff_jpy: number;
  }[];
  settlements: {
    from: Member;
    to: Member;
    amount_jpy: number;
  }[];
}

export interface ApiError {
  message: string;
  code?: string;
}
