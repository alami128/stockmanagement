export type Role = "chef" | "senior_chef" | "admin";
export type OrderStatus = "draft" | "ordered" | "completed";
export type StockUnit =
  | "pcs"
  | "bottle"
  | "bags"
  | "packets"
  | "boxes"
  | "kg"
  | "g"
  | "L"
  | "ml";
export type StockStatus = "available" | "low" | "needs_order";
export type ItemCategory =
  | "vegetables"
  | "meat"
  | "seafood"
  | "dairy_eggs"
  | "bread_bakery"
  | "sauces"
  | "dry_goods"
  | "desserts"
  | "beverages"
  | "fats_oils"
  | "grains"
  | "herbs_spices"
  | "cleaning"
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

export interface PrepItem {
  id: string;
  name: string;
  section: string;
  sort_order: number;
  active: boolean;
}

export interface PrepSelection {
  id: string;
  prep_item_id: string | null;
  prep_date: string;
  name: string;
  section: string;
  done: boolean;
  done_at: string | null;
  selected_by: string;
  created_at: string;
}

export type KitchenTaskType = "clean" | "fix";

export interface KitchenEquipment {
  id: string;
  name: string;
  area: string;
  sort_order: number;
  active: boolean;
}

export interface KitchenStatusTask {
  id: string;
  task_date: string;
  task_type: KitchenTaskType;
  name: string;
  equipment_id: string | null;
  done: boolean;
  done_at: string | null;
  created_by: string;
  created_at: string;
}

export interface OrderNeed {
  id: string;
  item_id: string;
  need_date: string;
  flagged_by: string;
  created_at: string;
}

export type ItemWithUpdater = Item & {
  users?: { name: string } | null;
};

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
      prep_items: {
        Row: PrepItem;
        Insert: Partial<PrepItem> & { name: string };
        Update: Partial<PrepItem>;
      };
      prep_selections: {
        Row: PrepSelection;
        Insert: Partial<PrepSelection> & {
          prep_date: string;
          name: string;
          selected_by: string;
        };
        Update: Partial<PrepSelection>;
      };
      kitchen_equipment: {
        Row: KitchenEquipment;
        Insert: Partial<KitchenEquipment> & { name: string };
        Update: Partial<KitchenEquipment>;
      };
      kitchen_status_tasks: {
        Row: KitchenStatusTask;
        Insert: Partial<KitchenStatusTask> & {
          task_date: string;
          task_type: KitchenTaskType;
          name: string;
          created_by: string;
        };
        Update: Partial<KitchenStatusTask>;
      };
      order_needs: {
        Row: OrderNeed;
        Insert: Partial<OrderNeed> & {
          item_id: string;
          need_date: string;
          flagged_by: string;
        };
        Update: Partial<OrderNeed>;
      };
    };
  };
}
