// The tools, as the navbar and the home page list them. Each one has a `path` (its form; see
// pages.js for every page), a `name` for the navbar, and optionally a `title` and `description`
// for the home page, which lists only the entries that have a description. To add a tool, add it
// here and its pages to pages.js.
export const TOOL_GROUPS = [
  {
    name: 'Predict',
    tools: [
      {
        name: 'Encounters',
        title: 'Encounter Tool',
        path: '/encounters',
        description: 'Calculate upcoming fights based off the RNG seed and area.',
      },
      {
        name: 'RNG Sequence',
        path: '/sequence',
        description: 'Calculate the sequence of upcoming RNG seeds based off a RNG seed.',
      },
      {
        name: 'Item Drops',
        path: '/drops',
        description:
          'Calculate what RNG seeds drop items based off a starting RNG seed and enemy group.',
      },
      {
        name: 'NPC Movements',
        path: '/npc',
        description: 'Calculate where NPCs will be over the coming RNG seeds.',
      },
      {
        name: 'Chinchironin',
        title: 'Chinchironin Generator',
        path: '/chinchironin',
        description: 'Simulate rolls for yourself, Tai Ho, and Gaspar.',
      },
    ],
  },
  {
    name: 'Stats',
    tools: [
      {
        name: 'Overview',
        title: 'Stats',
        path: '/stats',
        description: 'Generate stat growths for characters based on RNG and levels.',
      },
      { name: 'Starting Stats', path: '/stats/starting-stats' },
      { name: 'Level Ups', path: '/stats/level-ups' },
    ],
  },
  {
    name: 'Find your RNG',
    tools: [
      {
        name: 'RNG Finder',
        path: '/rngfinder',
        description: 'Find (approximately) the current RNG seed based off a sequence of fights.',
      },
      {
        name: 'Assassin Fight',
        path: '/assassin',
        description:
          'Use this to find your RNG index mid-run based off the Assassin fight and Kirkis stats.',
      },
      {
        name: 'Kaku NPCs',
        title: 'Kaku NPC Simulator',
        path: '/kaku',
        description:
          "If you know what RNG you enter Kaku on (use the Assassin tool), you can use this to simulate NPC movements to determine what RNG you're on.",
      },
    ],
  },
  {
    name: 'Run',
    tools: [
      {
        name: 'Experience',
        title: 'Experience Planner',
        path: '/experience',
        description:
          'Plan a run of fights and see how each character levels up. Drag fights and characters to reorder, and click a level to sit that character out.',
      },
      {
        name: 'Run Assistant',
        path: '/runassist',
        description:
          'Tool to assist in implementing RNG manipulation strategies while speedrunning.',
      },
    ],
  },
];

export const TOOLS = TOOL_GROUPS.flatMap((group) => group.tools);
