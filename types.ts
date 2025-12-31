
export interface Toy {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  ageRange: string;
  images: string[];
  description: string;
}

export interface CartItem extends Toy {
  quantity: number;
}

export interface RecommendedToy {
  toyId: string;
  name: string;
  reason: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'new' | 'completed';
}

export interface ShopSettings {
  telegramToken: string;
  telegramChatId: string;
}
