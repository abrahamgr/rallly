"use client";

import { cn } from "@rallly/ui";
import { Badge } from "@rallly/ui/badge";

export interface TopicsDisplayProps {
  topics: string[];
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  maxDisplay?: number;
  clickable?: boolean;
  onTopicClick?: (topic: string) => void;
  className?: string;
}

export const TopicsDisplay = ({
  topics,
  variant = "secondary",
  size = "sm",
  maxDisplay = 5,
  clickable = false,
  onTopicClick,
  className,
}: TopicsDisplayProps) => {
  if (!topics || topics.length === 0) {
    return null;
  }

  const displayTopics = topics.slice(0, maxDisplay);
  const remainingCount = Math.max(0, topics.length - maxDisplay);

  const handleTopicClick = (topic: string) => {
    if (clickable && onTopicClick) {
      onTopicClick(topic);
    }
  };

  return (
    <div
      data-testid="topic-display"
      className={cn("flex flex-wrap items-center gap-1", className)}
    >
      {displayTopics.map((topic, index) => (
        <Badge
          data-testid={`topic-tag-${index}`}
          key={`${topic}-${
            // biome-ignore lint/suspicious/noArrayIndexKey: fine to use index
            index
          }`}
          variant={variant}
          className={cn(
            "font-normal text-xs",
            size === "sm" && "px-2 py-0.5",
            size === "lg" && "px-3 py-1 text-sm",
            clickable && "cursor-pointer transition-colors hover:bg-gray-200",
          )}
          onClick={() => handleTopicClick(topic)}
          role={clickable ? "button" : undefined}
          tabIndex={clickable ? 0 : undefined}
          onKeyDown={
            clickable
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleTopicClick(topic);
                  }
                }
              : undefined
          }
        >
          {topic}
        </Badge>
      ))}

      {remainingCount > 0 && (
        <Badge
          data-testid="remaining-count"
          variant="outline"
          className={cn(
            "font-normal text-gray-600 text-xs",
            size === "sm" && "px-2 py-0.5",
            size === "lg" && "px-3 py-1 text-sm",
          )}
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};
