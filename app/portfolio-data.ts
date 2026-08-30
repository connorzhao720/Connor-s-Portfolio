export type Chapter = {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  boss: string;
  bossSpecies: string;
  difficulty: string;
  route: string;
  intro: string;
  copy: string[];
  stats: { label: string; value: string }[];
  panels: string[];
};

export const storageKey = "forest-storyboard-unlocked";

export const chapters: Chapter[] = [
  {
    slug: "roots",
    title: "Roots",
    shortTitle: "Roots",
    subtitle: "Origins, early interests, and the questions that set everything in motion.",
    boss: "Bristleback",
    bossSpecies: "Boar",
    difficulty: "Chapter I",
    route: "/chapters/roots",
    intro:
      "This chapter is a placeholder for where the story starts: early interests, family influences, and the first moments that made curiosity feel natural.",
    copy: [
      "Use this page for the details that explain the foundation of your personal story. It can hold early memories, first creative sparks, technical curiosity, or the people who shaped your point of view.",
      "The tone should feel reflective rather than resume-like. This is where visitors understand the human context behind the work that appears later.",
    ],
    stats: [
      { label: "Theme", value: "Curiosity" },
      { label: "Energy", value: "Observant" },
      { label: "Entry Challenge", value: "Timing" },
    ],
    panels: ["First questions", "Small discoveries", "A point of view"],
  },
  {
    slug: "first-trails",
    title: "First Steps",
    shortTitle: "Steps",
    subtitle: "Learning, mentors, risks, and growth through unfamiliar work.",
    boss: "Moonwing",
    bossSpecies: "Owl",
    difficulty: "Chapter II",
    route: "/chapters/first-trails",
    intro:
      "This chapter is for formative experiences: school, mentors, friendships, false starts, and the first times you learned to adapt.",
    copy: [
      "Frame this section around growth. Visitors should see how you handled unfamiliar environments and what kind of learner you became along the way.",
      "It can include lessons, turning points, and the habits that helped you move from interest into deliberate practice.",
    ],
    stats: [
      { label: "Theme", value: "Learning" },
      { label: "Energy", value: "Adaptive" },
      { label: "Entry Challenge", value: "Awareness" },
    ],
    panels: ["New environments", "Mentor signals", "Confidence forms"],
  },
  {
    slug: "craft",
    title: "Craft",
    shortTitle: "Craft",
    subtitle: "Skills, discipline, standards, and how good work gets made.",
    boss: "Riverdash",
    bossSpecies: "Otter",
    difficulty: "Chapter III",
    route: "/chapters/craft",
    intro:
      "This chapter is the personal portfolio core: skills, process, tools, taste, and the standards you bring into any serious project.",
    copy: [
      "Describe how you work when no one is watching. This is where you can talk about iteration, problem solving, communication, and the kinds of constraints that make your work stronger.",
      "The content can later become a skills section, a process note, or a more personal explanation of what makes your approach distinct.",
    ],
    stats: [
      { label: "Theme", value: "Practice" },
      { label: "Energy", value: "Precise" },
      { label: "Entry Challenge", value: "Reaction" },
    ],
    panels: ["Practice loops", "Useful limits", "Standards sharpen"],
  },
  {
    slug: "projects",
    title: "Projects",
    shortTitle: "Projects",
    subtitle: "Featured work, proof points, experiments, and outcomes.",
    boss: "Crownfall",
    bossSpecies: "Elk",
    difficulty: "Chapter IV",
    route: "/chapters/projects",
    intro:
      "This chapter is where the portfolio becomes concrete: selected projects, case studies, experiments, and the results visitors should remember.",
    copy: [
      "Use this page to feature the strongest work first. Each project can eventually include context, your role, the process, the outcome, and what you would improve next.",
      "The layout is designed to become a real portfolio page, not a game trophy room. The game simply opens the door.",
    ],
    stats: [
      { label: "Theme", value: "Evidence" },
      { label: "Energy", value: "Focused" },
      { label: "Entry Challenge", value: "Positioning" },
    ],
    panels: ["Problem framed", "Prototype tested", "Results shown"],
  },
  {
    slug: "next-clearing",
    title: "What’s Next",
    shortTitle: "Next",
    subtitle: "Goals, collaborations, contact, and the work ahead.",
    boss: "Oldgrowth",
    bossSpecies: "Bear",
    difficulty: "Final Chapter",
    route: "/chapters/next-clearing",
    intro:
      "This final chapter looks forward: what you want next, who you want to work with, and how someone should reach out.",
    copy: [
      "Make this section clear and useful. It can hold contact details, collaboration interests, future ambitions, and the specific kinds of opportunities you want to attract.",
      "After the final challenge, visitors should know who you are, what you can do, and where the conversation can go next.",
    ],
    stats: [
      { label: "Theme", value: "Direction" },
      { label: "Energy", value: "Open" },
      { label: "Entry Challenge", value: "Mastery" },
    ],
    panels: ["The next ask", "People to meet", "A wider view"],
  },
];

export const getChapter = (slug: string) => chapters.find((chapter) => chapter.slug === slug);

export const getChapterIndex = (slug: string) => chapters.findIndex((chapter) => chapter.slug === slug);
