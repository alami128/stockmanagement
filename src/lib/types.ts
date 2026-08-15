export type Role = "chef" | "senior_chef" | "admin";
export type OrderStatus = "draft" | "ordered" | "completed";
export type StockUnit = "pcs" | "bottle" | "kg" | "g" | "L" | "ml";
export type StockStatus = "available" | "low" | "needs_order";
export type ItemCategory =
  | "vegetables"
  | "meat"
  | "seafood"
  | "dairy_eggs"
  | "fats_oils"
  | "grains"
  | "herbs_spices"
  | "other";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  unit: StockUnit;
  category: ItemCategory;
  low_stock_threshold: number;
  updated_at: string;
  updated_by: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_by: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  notes: string | null;
}

// Minimal Supabase Database type. Hand-written to match supabase/schema.sql.
// If you use the Supabase CLI, you can replace this with a generated
// type via `supabase gen types typescript`.
export interface Database {
  public: {
    Tables: {
      users: {
        Row: AppUser;
        Insert: Partial<AppUser> & { id: string; email: string };
        Update: Partial<AppUser>;
      };
      items: {
        Row: Item;
        Insert: Partial<Item> & { name: string };
        Update: Partial<Item>;
      };
      orders: {
        Row: Order;
        Insert: Partial<Order> & { created_by: string };
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem> & {
          order_id: string;
          item_id: string;
          quantity: number;
        };
        Update: Partial<OrderItem>;
      };
    };
  };
}
