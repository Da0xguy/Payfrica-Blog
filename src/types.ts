export interface Author {
  name: string;
  avatar: string;
  role: string;
  bio: string;
  twitter?: string;
  linkedin?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string; // Tailwind bg color class
  textColor: string; // Tailwind text color class
  description: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  date: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Supports markdown formatting
  coverImage: string;
  category: string; // Category slug
  author: string; // Author name
  date: string;
  readTime: string;
  tags: string[];
  views: number;
  claps: number;
  isFeatured?: boolean;
  isPublished: boolean;
  scheduledDate?: string;
}

export interface NewsletterSubscriber {
  email: string;
  date: string;
}
