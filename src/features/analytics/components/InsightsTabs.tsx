"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export type InsightsTab = "overview" | "country" | "department" | "distribution" | "reports";

type Props = {
  activeTab: InsightsTab;
  onChange: (tab: InsightsTab) => void;
};

const tabs: Array<{ id: InsightsTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "country", label: "Country Analytics" },
  { id: "department", label: "Department Analytics" },
  { id: "distribution", label: "Salary Distribution" },
  { id: "reports", label: "Reports" }
];

export default function InsightsTabs({ activeTab, onChange }: Props) {
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  function onTabsKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    let nextIndex = activeTabIndex;
    if (event.key === "ArrowRight") nextIndex = (activeTabIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (activeTabIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    onChange(tabs[nextIndex].id);
  }

  return (
    <section className="sticky top-2 z-20 rounded-2xl border border-gray-200 bg-white/95 p-1 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Insights analytics sections" onKeyDown={onTabsKeyDown}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            role="tab"
            id={`insights-tab-${tab.id}`}
            aria-controls={`insights-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/40"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
}
