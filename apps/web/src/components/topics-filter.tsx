"use client";

import { cn } from "@rallly/ui";
import { Badge } from "@rallly/ui/badge";
import { Button } from "@rallly/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@rallly/ui/command";
import { Icon } from "@rallly/ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@rallly/ui/popover";
import { Check, Filter, X } from "lucide-react";
import React from "react";

import { Trans } from "@/components/trans";

interface TopicsFilterProps {
  selectedTopics?: string[];
  availableTopics?: string[];
  onTopicsChange?: (topics: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function TopicsFilter({
  selectedTopics = [],
  availableTopics = [],
  onTopicsChange,
  className,
  placeholder = "Filter by topics",
}: TopicsFilterProps) {
  const [open, setOpen] = React.useState(false);

  const handleTopicToggle = (topic: string) => {
    const newSelectedTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter((t) => t !== topic)
      : [...selectedTopics, topic];

    onTopicsChange?.(newSelectedTopics);
  };

  const clearAllTopics = () => {
    onTopicsChange?.([]);
  };

  const hasSelectedTopics = selectedTopics.length > 0;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/** biome-ignore lint/a11y/useSemanticElements: it's fine to get this role */}
          <Button
            data-testid="topics-filter-button"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            <div className="flex items-center gap-2">
              <Icon>
                <Filter size={16} />
              </Icon>
              {hasSelectedTopics ? (
                <span data-testid="results-count">
                  <Trans
                    i18nKey="topicsSelected"
                    defaults="{count, plural, one {1 topic} other {# topics}} selected"
                    values={{ count: selectedTopics.length }}
                  />
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput
              data-testid="search-input"
              placeholder="Search topics..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No topics found.</CommandEmpty>
              {availableTopics.length > 0 && (
                <CommandGroup data-testid="topics-list">
                  {availableTopics.map((topic) => (
                    // biome-ignore lint/a11y/useSemanticElements: it will act as checkbox
                    <CommandItem
                      data-testid={`topic-checkbox-${topic}`}
                      key={topic}
                      value={topic}
                      onSelect={() => handleTopicToggle(topic)}
                      className="cursor-pointer"
                      role="checkbox"
                    >
                      <Icon className="mr-2 h-4 w-4">
                        <Check
                          className={cn(
                            selectedTopics.includes(topic)
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </Icon>
                      {topic}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Topics Display */}
      {hasSelectedTopics && (
        <div className="flex flex-wrap items-center gap-1">
          {selectedTopics.map((topic) => (
            <Badge
              data-testid={`selected-topic-${topic}`}
              key={topic}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {topic}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  handleTopicToggle(topic);
                }}
              >
                <Icon>
                  <X size={12} />
                </Icon>
                <span className="sr-only">Remove {topic}</span>
              </Button>
            </Badge>
          ))}

          {selectedTopics.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTopics}
              className="h-auto px-2 py-1 text-muted-foreground text-xs hover:text-foreground"
            >
              <Trans i18nKey="clearAll" defaults="Clear all" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
