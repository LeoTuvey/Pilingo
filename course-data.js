function lessonList(...titles) {
  return titles.map((title, index) => ({
    id: `lesson-${index + 1}`,
    title,
    type: index === titles.length - 1 ? "quiz" : "lesson"
  }));
}

const SECTION_ONE_PARTS = [
  {
    id: "part-1",
    number: 1,
    title: "🔤 Alphabets",
    summary: "Letters, sounds, and first symbols.",
    href: "game1.html?coursePart=alphabets",
    icon: "🔤",
    accent: "gold",
    lessons: lessonList(
      "Kurmanji letters and Sorani matching",
      "Letter sounds and example names",
      "Alphabet review",
      "Final alphabet quiz"
    )
  },
  {
    id: "part-2",
    number: 2,
    title: "👨‍👩‍👧‍👦 Describe Your Family",
    summary: "Family words, roles, and simple descriptions.",
    href: "game1.html?coursePart=family",
    icon: "👨‍👩‍👧‍👦",
    accent: "orange",
    lessons: lessonList(
      "Family member matching",
      "Meaning and missing-word practice",
      "Write family words in English",
      "Listening and typing review",
      "Translate family sentences",
      "Final family quiz"
    )
  },
  {
    id: "part-3",
    number: 3,
    title: "👋 Greet People",
    summary: "Greetings, introductions, and polite phrases.",
    href: "game1.html?coursePart=greetings",
    icon: "👋",
    accent: "sky",
    lessons: lessonList(
      "Greeting words",
      "Simple greeting review",
      "Final greetings quiz"
    )
  },
  {
    id: "part-4",
    number: 4,
    title: "🍎 Talk About Food and Drink",
    summary: "Everyday food, drinks, and simple choices.",
    href: "game1.html?coursePart=food-drink",
    icon: "🍎",
    accent: "pink",
    lessons: lessonList(
      "Daily food and drink words",
      "Meaning and review practice",
      "Final food and drink quiz"
    )
  },
  {
    id: "part-5",
    number: 5,
    title: "💼 Describe Your Job",
    summary: "Work, roles, and describing what people do.",
    icon: "💼",
    accent: "violet",
    lessons: lessonList(
      "Job words coming soon",
      "Job sentence review coming soon",
      "Final job quiz coming soon"
    )
  },
  {
    id: "part-6",
    number: 6,
    title: "🎒 Talk About Possessions",
    summary: "Ownership, items, and who has what.",
    href: "game1.html?coursePart=possessions",
    icon: "🎒",
    accent: "leaf",
    lessons: lessonList(
      "Book vocabulary",
      "Ball vocabulary",
      "House vocabulary",
      "Objects review",
      "Final possessions quiz"
    )
  },
  {
    id: "part-7",
    number: 7,
    title: "⚽ Discuss Hobbies",
    summary: "Free time, likes, and fun activities.",
    icon: "⚽",
    accent: "gold",
    lessons: lessonList(
      "Hobby words coming soon",
      "Hobby sentence review coming soon",
      "Final hobbies quiz coming soon"
    )
  },
  {
    id: "part-8",
    number: 8,
    title: "🐶 Describe Animals",
    summary: "Animal names and basic descriptions.",
    href: "game1.html?coursePart=animals",
    icon: "🐶",
    accent: "orange",
    lessons: lessonList(
      "Cat lesson",
      "Dog lesson",
      "Animal review",
      "Final animals quiz"
    )
  },
  {
    id: "part-9",
    number: 9,
    title: "❓ Form Questions",
    summary: "Question words, patterns, and review.",
    href: "game1.html?coursePart=questions",
    icon: "❓",
    accent: "sky",
    lessons: lessonList(
      "This, that, these, and those",
      "Color sentence questions",
      "Listening challenge",
      "Boss level review",
      "Final questions quiz"
    )
  },
  {
    id: "part-10",
    number: 10,
    title: "🏆 Final Exam of the Section",
    summary: "A final checkpoint for everything learned in Section 1.",
    icon: "🏆",
    accent: "violet",
    lessons: lessonList(
      "Section 1 review",
      "Mixed practice challenge",
      "Final section exam"
    )
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
