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
    href: "game1.html?coursePart=alphabets&v=lessonpath2",
    icon: "🔤",
    accent: "gold",
    lessons: lessonList(
      "Kurmanji letters and Sorani matching",
      "Letter sounds and example names"
    )
  },
  {
    id: "part-2",
    number: 2,
    title: "👨‍👩‍👧‍👦 Describe Your Family",
    summary: "Family words, roles, and simple descriptions.",
    href: "game1.html?coursePart=family&v=lessonpath5",
    icon: "👨‍👩‍👧‍👦",
    accent: "orange",
    lessons: lessonList(
      "Family member matching",
      "Meaning and missing-word practice",
      "Write family words in English",
      "Listening and typing review",
      "Translate Kurmanji family sentences into English",
      "Translate English family sentences into Kurmanji",
      "Extended family words and relationships",
      "Family groups and review"
    )
  },
  {
    id: "part-3",
    number: 3,
    title: "👋 Greet People",
    summary: "Greetings, introductions, and polite phrases.",
    href: "game1.html?coursePart=greetings&v=lessonpath2",
    icon: "👋",
    accent: "sky",
    lessons: lessonList(
      "Greeting words",
      "Simple greeting review"
    )
  },
  {
    id: "part-4",
    number: 4,
    title: "🍎 Talk About Food and Drink",
    summary: "Everyday food, drinks, and simple choices.",
    href: "game1.html?coursePart=food-drink&v=lessonpath2",
    icon: "🍎",
    accent: "pink",
    lessons: lessonList(
      "Daily food and drink words",
      "Meaning and review practice"
    )
  },
  {
    id: "part-5",
    number: 5,
    title: "💼 Describe Your Job",
    summary: "Work, roles, and describing what people do.",
    icon: "💼",
    accent: "violet",
    lessons: []
  },
  {
    id: "part-6",
    number: 6,
    title: "🎒 Talk About Possessions",
    summary: "Ownership, items, and who has what.",
    href: "game1.html?coursePart=possessions&v=lessonpath2",
    icon: "🎒",
    accent: "leaf",
    lessons: lessonList(
      "Book vocabulary",
      "Book sentence review",
      "Ball vocabulary",
      "Ball sentence review",
      "House vocabulary",
      "House sentence review"
    )
  },
  {
    id: "part-7",
    number: 7,
    title: "⚽ Discuss Hobbies",
    summary: "Free time, likes, and fun activities.",
    icon: "⚽",
    accent: "gold",
    lessons: []
  },
  {
    id: "part-8",
    number: 8,
    title: "🐶 Describe Animals",
    summary: "Animal names and basic descriptions.",
    href: "game1.html?coursePart=animals&v=lessonpath2",
    icon: "🐶",
    accent: "orange",
    lessons: lessonList(
      "Cat lesson",
      "Cat review",
      "Dog lesson",
      "Dog review"
    )
  },
  {
    id: "part-9",
    number: 9,
    title: "❓ Form Questions",
    summary: "Question words, patterns, and review.",
    href: "game1.html?coursePart=questions&v=lessonpath2",
    icon: "❓",
    accent: "sky",
    lessons: lessonList(
      "This, that, these, and those",
      "This, that, these, and those in English",
      "Kurmanji noun forms",
      "Apple and apples review",
      "This, that, these, and those with colors",
      "Ev and Ew with color sentences",
      "Is and are endings",
      "English is and are review",
      "True or false sentence check",
      "Pair matching",
      "Listening challenge",
      "Match the meaning",
      "Fill in the missing word",
      "Boss level review"
    )
  },
  {
    id: "part-10",
    number: 10,
    title: "🏆 Final Exam of the Section",
    summary: "A final checkpoint for everything learned in Section 1.",
    icon: "🏆",
    accent: "violet",
    lessons: []
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
