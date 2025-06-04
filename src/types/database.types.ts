// src/types/database.types.ts

export interface Database {
  public: {
    Tables: {
      admins: Admin;
      analytics: Analytics;
      order_items: OrderItem;
      orders: Order;
      products: Product;
      reviews: Review;
      sessions: Session;
      store_settings: StoreSettings;
      users: User;
    };
  };
}

export interface Admin {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export interface Analytics {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  width: number;
  profile?: number;
  diameter: number;
  season?: string;
  price: number;
  sale_price?: number;
  image_url: string[];
  rating: number;
  reviews_count: number;
  wheel_width?: number;
  speed_index?: string;
  load_index?: string;
  fuel_efficiency?: string;
  wet_grip?: string;
  noise_level?: number;
  country: string;
  year: number;
  spikes?: boolean;
  image_size?: bigint;
  image_width?: number;
  image_height?: number;
  stock?: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  comment: string;
  created_at: string;
  user_id?: string;
  rating: number;
}

export interface Session {
  id: string;
  user_id: string | null;
  guest_id: string | null;
  session_start: string;
  last_activity: string;
  is_online: boolean;
}


export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  is_admin?: boolean;
  is_guest?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  key: string;
  value: Json | {  // Уточнение типа для jsonb
    [key: string]: 
      | string 
      | number 
      | boolean 
      | null 
      | JsonArray 
      | JsonObject;
  };
  created_at: string;
  updated_at: string;
}

// Добавить в конец файла:
type Json = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [key: string]: Json; }
type JsonArray = Array<Json>;