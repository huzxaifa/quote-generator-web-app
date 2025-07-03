"use client";

import { useState } from "react";
import QuoteCard from "@/components/ui/QuoteCard";
import QuoteForm from "@/components/ui/QuoteForm";
import { getQuotesByTopic } from "@/lib/utils";

export default function Home() {
  const [quotes, setQuotes] = useState<
    { text: string; author: string }[]
  >([]);

  const handleTopicSubmit = (topic: string) => {
    const filteredQuotes = getQuotesByTopic(topic);
    setQuotes(filteredQuotes);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-center text-base-content mb-8">
          Quote Generator
        </h1>
        <div className="mb-12">
          <QuoteForm onSubmit={handleTopicSubmit} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.length > 0 ? (
            quotes.map((quote, index) => (
              <QuoteCard key={index} quote={quote} />
            ))
          ) : (
            <p className="text-center text-base-content/70 col-span-full">
              Enter a topic to see quotes!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}