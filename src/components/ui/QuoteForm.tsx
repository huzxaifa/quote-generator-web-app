"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDownIcon } from "lucide-react";
import { getAllTopics } from "@/lib/utils";

interface QuoteFormProps {
  onSubmit: (topic: string) => void;
}

export default function QuoteForm({ onSubmit }: QuoteFormProps) {
  const [topic, setTopic] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState<string[]>([]);
  const topics = useMemo(() => getAllTopics(), []);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmedTopic = topic.trim().toLowerCase();
    const matches = trimmedTopic
      ? topics.filter((t) => t.toLowerCase().includes(trimmedTopic))
      : topics;
    if (JSON.stringify(matches) !== JSON.stringify(filteredTopics)) {
      setFilteredTopics(matches);
    }
  }, [topic, topics, filteredTopics]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    onSubmit(selectedTopic);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
      setTopic("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <Label htmlFor="topic" className="text-base-content">
          Enter or Select a Topic
        </Label>
        <div className="relative" ref={dropdownRef}>
          <Input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., motivation, inspiration, life"
            className="input input-bordered w-full pr-10 h-10 text-base"
            aria-label="Topic for quotes"
            autoComplete="off"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-transparent hover:bg-base-200 rounded-full"
            onClick={toggleDropdown}
            aria-label={isDropdownOpen ? "Close topic dropdown" : "Open topic dropdown"}
          >
            <ChevronDownIcon
              className={`w-5 h-5 text-base-content transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isDropdownOpen && filteredTopics.length > 0 && (
            <ul className="absolute z-10 w-full bg-base-200 rounded-box shadow-lg mt-1 max-h-60 overflow-y-auto p-2 border border-base-300">
              {filteredTopics.map((topicOption) => (
                <li key={topicOption} className="w-full">
                  <button
                    type="button"
                    className="w-full text-left capitalize btn btn-ghost btn-sm hover:bg-base-300"
                    onClick={() => handleTopicSelect(topicOption)}
                  >
                    {topicOption}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Button type="submit" className="btn btn-primary w-full">
        Get Quotes
      </Button>
    </form>
  );
}
