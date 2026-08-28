"use client";

import { useMemo, useState } from "react";
import FaqAccordion from "./FaqAccordion";
import HelpCategoryTabs from "./HelpCategoryTabs";
import HelpHero from "./HelpHero";
import SupportCallout from "./SupportCallout";
import SupportPanel from "./SupportPanel";
import { faqItems } from "./data";
import type { HelpCategory } from "./types";

export default function HelpPageClient() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<HelpCategory>("all");
  const [supportOpen, setSupportOpen] = useState(false);

  const filteredFaqs = useMemo(() => {
    const search = query.trim().toLowerCase();

    return faqItems.filter((item) => {
      const categoryMatched =
        activeCategory === "all" || item.category === activeCategory;

      const searchMatched =
        !search ||
        item.question.toLowerCase().includes(search) ||
        item.answer.toLowerCase().includes(search);

      return categoryMatched && searchMatched;
    });
  }, [query, activeCategory]);

  return (
    <div className="space-y-5">
      <HelpHero query={query} onQueryChange={setQuery} />

      <section className="rounded-[22px] border border-[#e1eae4] bg-white px-5 pt-2 shadow-[0_12px_36px_rgba(30,73,46,0.05)] sm:px-6">
        <HelpCategoryTabs
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
      </section>

      <FaqAccordion items={filteredFaqs} />

      <SupportCallout onOpen={() => setSupportOpen(true)} />

      <SupportPanel
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </div>
  );
}
