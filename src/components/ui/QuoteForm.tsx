"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllTopics } from "@/lib/utils";

interface QuoteFormProps {
  onSubmit: (topic: string) => void;
}

export default function QuoteForm({ onSubmit }: QuoteFormProps) {
  const [topic, setTopic] = useState("");
  const topics = getAllTopics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
      setTopic("");
    }
  };

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    onSubmit(selectedTopic);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <Label htmlFor="topic" className="text-base-content">
          Enter or Select a Topic
        </Label>
        <div className="relative dropdown">
          <Input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., motivation, inspiration, life"
            className="input input-bordered w-full pr-10"
            aria-label="Topic for quotes"
          />
          <div
            tabIndex={0}
            role="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs p-1"
            aria-label="Open topic dropdown"
          >
            <svg
              width="12px"
              height="12px"
              className="fill-current opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-200 rounded-box z-10 w-full p-2 shadow-lg mt-2 max-h-60 overflow-y-auto"
          >
            {topics.map((topicOption) => (
              <li key={topicOption}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm w-full text-left capitalize"
                  onClick={() => handleTopicSelect(topicOption)}
                  aria-label={`Select ${topicOption} topic`}
                >
                  {topicOption}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button type="submit" className="btn btn-primary w-full">
        Get Quotes
      </Button>
    </form>
  );
}