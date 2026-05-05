export interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  views?: number;
  createdAt: any;
  size?: number;
}
