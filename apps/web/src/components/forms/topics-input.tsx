"use client";

import { FormField, FormItem, FormLabel, FormMessage } from "@rallly/ui/form";
import { Input } from "@rallly/ui/input";
import { X } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Trans } from "@/components/trans";

export interface TopicsInputProps {
  name?: string;
  label?: string;
  placeholder?: string;
  maxTopics?: number;
}

export const TopicsInput = ({
  name = "topics",
  label = "Topics",
  placeholder = "Add topics separated by commas",
  maxTopics = 10,
}: TopicsInputProps) => {
  const form = useFormContext();
  const currentTopics: string[] = form.watch(name) || [];
  const [inputValue, setInputValue] = useState(
    () => currentTopics?.join(", ") ?? "",
  );

  const parseTopicsFromInput = (value: string): string[] => {
    return value
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic.length > 0);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const topics = parseTopicsFromInput(value);
    form.setValue(name, topics, { shouldValidate: true });
  };

  const removeTopic = (indexToRemove: number) => {
    const updatedTopics = currentTopics.filter(
      (_, index) => index !== indexToRemove,
    );
    form.setValue(name, updatedTopics, { shouldValidate: true });

    // Update input value to reflect the remaining topics
    setInputValue(updatedTopics.join(", "));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key to prevent form submission when editing topics
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => {
        return (
          <FormItem>
            <div>
              <FormLabel className="inline-block" htmlFor="topics">
                {label}
              </FormLabel>
              <span className="ml-1 text-muted-foreground text-sm">
                <Trans i18nKey="optionalLabel" defaults="(Optional)" />
              </span>
            </div>

            <Input
              id="topics"
              data-testid="topics-input"
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => {
                handleInputChange(e.target.value);
                // registerProps.onChange(e);
              }}
              onKeyDown={handleKeyDown}
              className="w-full"
            />

            {/* Topics Display */}
            {currentTopics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {currentTopics.slice(0, maxTopics).map((topic, index) => (
                  <span
                    data-testid={`topic-tag-${index}`}
                    key={`${topic}-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: fine to use index
                      index
                    }`}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-sm"
                  >
                    {topic}
                    <button
                      data-testid={`remove-topic-${index}`}
                      type="button"
                      onClick={() => removeTopic(index)}
                      className="text-gray-500 hover:text-gray-700 focus:text-gray-700 focus:outline-none"
                      aria-label={`Remove topic: ${topic}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {currentTopics.length > maxTopics && (
                  <span className="px-2 py-1 text-gray-500 text-sm">
                    +{currentTopics.length - maxTopics} more
                  </span>
                )}
              </div>
            )}

            {currentTopics.length > maxTopics && (
              <p className="mt-1 text-gray-600 text-sm">
                Showing first {maxTopics} topics.{" "}
                {currentTopics.length - maxTopics} more topics will be saved.
              </p>
            )}

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
