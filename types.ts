
export interface Book {
  title: string;
  author: string;
  genre: string;
}

export interface PurchaseLink {
  storeName: string;
  url: string;
}

export interface Recommendation {
  title: string;
  author: string;
  year: number;
  genre: string;
  summary: string;
  reasoning: string;
  averageRating: number;
  purchaseLinks: PurchaseLink[];
  coverImageUrl: string;
}
