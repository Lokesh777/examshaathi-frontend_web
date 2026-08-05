import type { Topic } from "@/types/api";

/** Mirrors backend resolveTopicLanguage — used for admin UI labels only. */
export function getTopicContentLanguage(topic: Topic): "english" | "hindi" {
  const name = topic.name || "";
  const section = topic.patternSection || "";

  if (
    /english|grammar|tense|voice|narration|comprehension|synonym|antonym|vocabulary|idiom|preposition|article|substitution|letter writing|translation/i.test(
      name
    ) ||
    /सामान्य अंग्रेजी|general english/i.test(section)
  ) {
    return "english";
  }

  return "hindi";
}
