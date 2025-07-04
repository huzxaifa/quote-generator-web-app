import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface QuoteCardProps {
  quote: {
    text: string;
    author: string;
  };
}

export default function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <Card className="card bg-black/80 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardContent className="pt-6">
        <blockquote className="text-lg italic font-medium text-white">
          "{quote.text}"
        </blockquote>
      </CardContent>
      <CardFooter className="text-right">
        <cite className="text-white/80">— {quote.author}</cite>
      </CardFooter>
    </Card>
  );
}