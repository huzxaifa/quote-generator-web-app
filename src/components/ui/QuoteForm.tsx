"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuoteFormProps {
  onSubmit: (topic: string) => void;
}

export default function QuoteForm({ onSubmit }: QuoteFormProps) {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
      setTopic("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <Label htmlFor="topic" className="text-base-content">
          Enter a Topic
        </Label>
        <Input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., motivation, inspiration, life"
          className="input input-bordered w-full"
          aria-label="Topic for quotes"
        />
      </div>
      <Button type="submit" className="btn btn-primary w-full">
        Get Quotes
      </Button>
    </form>
  );
}