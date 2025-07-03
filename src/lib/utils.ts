import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import quotesData from "@/data/quotes.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Quote {
  text: string;
  author: string;
}

interface QuoteCategory {
  topic: string;
  quotes: Quote[];
}

export function getQuotesByTopic(topic: string): Quote[] {
  const normalizedTopic = topic.toLowerCase().trim();
  const category = quotesData.find(
    (item: QuoteCategory) => item.topic.toLowerCase() === normalizedTopic
  );
  return category ? category.quotes.slice(0, 3) : [];
}