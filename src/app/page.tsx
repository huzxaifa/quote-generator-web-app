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
    <div className="page-background">
      <main className="container mx-auto p-4 relative z-10">
        <div className="navbar bg-neutral text-neutral-content">
            <button className="btn btn-ghost text-xl">daisyUI</button>
          </div>
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
    </div>
  );
}