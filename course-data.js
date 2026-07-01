function buildLessonFlow(partKey) {
  return [
    { id: `${partKey}-intro`, title: "Introduction", type: "lesson" },
    { id: `${partKey}-vocabulary`, title: "Vocabulary", type: "lesson" },
    { id: `${partKey}-pronunciation`, title: "Pronunciation", type: "activity" },
    { id: `${partKey}-grammar`, title: "Grammar", type: "lesson" },
    { id: `${partKey}-listening`, title: "Listening", type: "activity" },
    { id: `${partKey}-reading`, title: "Reading", type: "activity" },
    { id: `${partKey}-speaking`, title: "Speaking", type: "activity" },
    { id: `${partKey}-writing`, title: "Writing", type: "activity" },
    { id: `${partKey}-matching`, title: "Matching", type: "quiz" },
    { id: `${partKey}-drag-drop`, title: "Drag and Drop", type: "activity" },
    { id: `${partKey}-practice`, title: "Practice", type: "quiz" },
    { id: `${partKey}-review`, title: "Review", type: "review" },
    { id: `${partKey}-final-quiz`, title: "Final Quiz", type: "quiz" }
  ];
}

const SECTION_ONE_PARTS = [
  {
    id: "part-1",
    number: 1,
    title: "🔤 Alphabets",
    summary: "Letters, sounds, and first symbols.",
    href: "game1.html",
    icon: "🔤",
    accent: "gold",
    lessons: buildLessonFlow("alphabets")
  },
  {
    id: "part-2",
    number: 2,
    title: "👨‍👩‍👧‍👦 Describe Your Family",
    summary: "Family words, roles, and simple descriptions.",
    icon: "👨‍👩‍👧‍👦",
    accent: "orange",
    lessons: buildLessonFlow("family")
  },
  {
    id: "part-3",
    number: 3,
    title: "👋 Greet People",
    summary: "Greetings, introductions, and polite phrases.",
    icon: "👋",
    accent: "sky",
    lessons: buildLessonFlow("greetings")
  },
  {
    id: "part-4",
    number: 4,
    title: "🍎 Talk About Food and Drink",
    summary: "Everyday food, drinks, and simple choices.",
    icon: "🍎",
    accent: "pink",
    lessons: buildLessonFlow("food-drink")
  },
  {
    id: "part-5",
    number: 5,
    title: "💼 Describe Your Job",
    summary: "Work, roles, and describing what people do.",
    icon: "💼",
    accent: "violet",
    lessons: buildLessonFlow("jobs")
  },
  {
    id: "part-6",
    number: 6,
    title: "🎒 Talk About Possessions",
    summary: "Ownership, items, and who has what.",
    icon: "🎒",
    accent: "leaf",
    lessons: buildLessonFlow("possessions")
  },
  {
    id: "part-7",
    number: 7,
    title: "⚽ Discuss Hobbies",
    summary: "Free time, likes, and fun activities.",
    icon: "⚽",
    accent: "gold",
    lessons: buildLessonFlow("hobbies")
  },
  {
    id: "part-8",
    number: 8,
    title: "🐶 Describe Animals",
    summary: "Animal names and basic descriptions.",
    icon: "🐶",
    accent: "orange",
    lessons: buildLessonFlow("animals")
  },
  {
    id: "part-9",
    number: 9,
    title: "❓ Form Questions",
    summary: "Question words, patterns, and review.",
    icon: "❓",
    accent: "sky",
    lessons: buildLessonFlow("questions")
  }
];

const COURSE_DATA = {
  id: "kurmanji-english-course",
  title: "Kurmanji to English",
  totalSections: 15,
  structure: ["Course", "Section", "Part", "Lesson", "Activity", "Quiz", "Review"],
  sections: Array.from({ length: 15 }, (_, index) => {
    const number = index + 1;

    if (number === 1) {
      return {
        id: "section-1",
        number,
        title: "Section 1",
        subtitle: "Foundations",
        summary: "A gentle first journey through beginner Kurmanji.",
        placeholder: false,
        parts: SECTION_ONE_PARTS
      };
    }

    return {
      id: `section-${number}`,
      number,
      title: `Section ${number}`,
      subtitle: "Coming Soon",
      summary: "This section is already on the course map and will unlock later.",
      placeholder: true,
      parts: []
    };
  })
};

window.COURSE_DATA = COURSE_DATA;
