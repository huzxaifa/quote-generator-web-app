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
  const [selectedTopic, setSelectedTopic] = useState("");
  const topics = useMemo(() => getAllTopics(), []);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter topics and open dropdown on typing
  useEffect(() => {
    const trimmedTopic = topic.trim().toLowerCase();
    const matches = trimmedTopic
      ? topics.filter((t) => t.toLowerCase().includes(trimmedTopic))
      : topics;
    setFilteredTopics(matches);
    if (trimmedTopic) {
      setIsDropdownOpen(true);
    }
  }, [topic, topics]);

  // Close dropdown when clicking outside
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
    setIsDropdownOpen(false);
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 0);
  };

  const toggleDropdown = () => {
    const trimmedTopic = topic.trim().toLowerCase();
    const isValidTopic = topics.some((t) => t.toLowerCase() === trimmedTopic);
    if (!isValidTopic) {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      const selectedTopic = filteredTopics.length === 1 ? filteredTopics[0] : topic;
      setSelectedTopic(selectedTopic);
      onSubmit(selectedTopic);
      setTopic("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <Label htmlFor="topic" className="text-white mb-2">
          Enter or Select a Topic
        </Label>
        <div className="relative" ref={dropdownRef}>
          <Input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredTopics.length === 1) {
                e.preventDefault();
                handleTopicSelect(filteredTopics[0]);
              }
            }}
            placeholder="e.g., motivation, inspiration, life"
            className="input input-bordered w-full pr-10 h-10 text-white placeholder:text-white/70"
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
              className={`w-5 h-5 text-white transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isDropdownOpen && filteredTopics.length > 0 && (
            <ul className="absolute z-20 w-full bg-[#ffffff] rounded-box shadow-lg mt-1 max-h-60 overflow-y-auto p-2 border border-base-300">
              {filteredTopics.map((topicOption) => (
                <li key={topicOption} className="w-full relative">
                  <button
                    type="button"
                    className="w-full text-left capitalize py-2 px-4 hover:bg-base-300 rounded-md focus:outline-none text-base-content"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTopicSelect(topicOption);
                    }}
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
      {selectedTopic && (
        <p className="mt-4 text-center text-white capitalize">
          Showing quotes for: {selectedTopic}
        </p>
      )}
    </form>
  );
}