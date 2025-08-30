"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { TopicsFilter } from "@/components/topics-filter";
import { trpc } from "@/trpc/client";

interface TopicsFilterWrapperProps {
  placeholder?: string;
  selectedTopics?: string[];
}

export function TopicsFilterWrapper({
  placeholder = "Filter by topics",
  selectedTopics = [],
}: TopicsFilterWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get all available topics from polls (you might want to cache this or get it from server)
  const { data: pollsData } = trpc.polls.infiniteChronological.useInfiniteQuery(
    {
      // Get all polls to extract topics
      limit: 1000, // Large number to get all topics
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const availableTopics = React.useMemo(() => {
    const allPolls = pollsData?.pages?.flatMap((page) => page.polls) ?? [];
    const topicsSet = new Set<string>();

    allPolls.forEach((poll) => {
      if (poll.topics) {
        poll.topics.forEach((topic) => topicsSet.add(topic));
      }
    });

    return Array.from(topicsSet).sort();
  }, [pollsData]);

  const handleTopicsChange = React.useCallback(
    (topics: string[]) => {
      const params = new URLSearchParams(searchParams);

      if (topics.length > 0) {
        params.set("topics", topics.join(","));
      } else {
        params.delete("topics");
      }

      // Reset page when changing filters
      params.delete("page");

      const newUrl = `?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <TopicsFilter
      selectedTopics={selectedTopics}
      availableTopics={availableTopics}
      onTopicsChange={handleTopicsChange}
      placeholder={placeholder}
    />
  );
}
