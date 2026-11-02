// Backup copy of the FCS logic model content.
// The page reads the live content from the FCS Google Sheet (see assets/sheet-loader.js).
// It falls back to this copy only if the sheet can't be reached, so refresh this file
// from the sheet now and then.
//
// Field notes:
//   program.moves    = measures the program moves today
//   program.proposed = measures it is proposed for
//   program.status   = "running" or "proposed"
//   program.partners = partner ids from the partners list below
//   program.type     = "partnership" (FCS works with a partner who delivers),
//                      "asset" (FCS owns it), "program" (FCS runs it), "confirm" (type or FCS' role not settled)
//   measure.status   = "now" (FCS can count it today), "later" (waits on a data source), "held"

window.FCS_DATA = {
  org: "Focused Community Strategies",
  title: "Logic Model",
  mission:
    "Mission: to partner with local neighborhoods to provide innovative and holistic development that promotes flourishing communities and God’s Shalom.",
  placeNote:
    "Each result is read separately in Historic South Atlanta and Thomasville Heights, never averaged.",

  howToRead: {
    intro:
      "Every model reads left to right, from the result we want to the program that works toward it. The same five steps repeat on every model page.",
    steps: [
      {
        n: 1,
        name: "Desired result",
        q: "What is the end goal for children and families?",
        text: "The result FCS works toward for the neighborhood population in this area. It is read separately in Historic South Atlanta and Thomasville Heights."
      },
      {
        n: 2,
        name: "Community indicators",
        q: "How do we measure that result across the neighborhood?",
        text: "Neighborhood-wide numbers that show whether the result is moving, usually from public data such as the Census. FCS contributes to them and does not control them."
      },
      {
        n: 3,
        name: "What needs to be true?",
        q: "What needs to be achieved to reach the desired result?",
        text: "The change a program makes for the people it reaches, and why that change should move an indicator."
      },
      {
        n: 4,
        name: "What measures need to be achieved?",
        q: "What are the measures to track our progress?",
        text: "What measure is needed to track our progress, and what is the end goal for each one?"
      },
      {
        n: 5,
        name: "What programs are working to impact these measures?",
        q: "Which program or partnership effects the measures",
        text: "The line of work itself: a partnership, an asset FCS owns, or a program FCS runs, with FCS’ role."
      }
    ]
  },

  types: {
    partnership: { label: "Partnership", text: "FCS works with a partner who delivers" },
    asset: { label: "Asset", text: "FCS owns it" },
    program: { label: "Program", text: "FCS runs it" },
    confirm: { label: "To confirm", text: "Type or FCS’ role not settled" }
  },

  measureStatus: {
    now: { label: "Start now", text: "FCS can count it today" },
    later: { label: "Later", text: "Waits on a data source that does not exist yet" },
    held: { label: "Held", text: "On hold until the program or data is ready" }
  },

  // "confirm: true" marks a partner still to be confirmed.
  partnerTypes: [
    "Schools and school operators",
    "Early learning and youth organizations",
    "Colleges and universities",
    "Food access",
    "Builders and lenders",
    "Government",
    "Legal services"
  ],
  partners: [
    { id: "pbsa", name: "Purpose Built Schools Atlanta", type: "Schools and school operators" },
    { id: "aps", name: "Atlanta Public Schools", type: "Schools and school operators" },
    { id: "ymca", name: "YMCA", type: "Early learning and youth organizations" },
    { id: "united-way", name: "United Way", type: "Early learning and youth organizations" },
    { id: "qcc", name: "Quality Care for Children", type: "Early learning and youth organizations" },
    { id: "geears", name: "Geears", type: "Early learning and youth organizations" },
    { id: "emory", name: "Emory University", type: "Colleges and universities" },
    { id: "urban-recipe", name: "Urban Recipe", type: "Food access" },
    { id: "fortis", name: "Fortis Homes", type: "Builders and lenders" },
    { id: "pinnacle", name: "Pinnacle", type: "Builders and lenders" },
    { id: "fulton-tax", name: "Fulton County Tax Commissioner", type: "Government", confirm: true },
    { id: "legal-aid", name: "Atlanta Legal Aid", type: "Legal services", confirm: true }
  ],

  dependencies: {
    title: "What each area needs from the others",
    subtitle: "As FCS named it in the second draft",
    columns: [
      { area: "Economic Vitality", named: "Named by 5 of 5" },
      { area: "Stable Homes", named: "Named by 4 of 5" },
      { area: "Early Childhood", named: "Named by 3 of 5" },
      { area: "Health and Wellness", named: "Named by 2 of 5" }
    ],
    rows: [
      {
        area: "Economic Vitality",
        cells: {
          "Stable Homes": { text: "So income gains are not absorbed by rent" },
          "Early Childhood": { text: "A seat frees a parent to work" },
          "Health and Wellness": { text: "Neighbors’ ability to stay healthy" }
        }
      },
      {
        area: "Early Childhood",
        cells: {
          "Economic Vitality": { text: "Affordable early learning lets parents work" },
          "Stable Homes": { text: "A stable address keeps a child in one seat" },
          "Health and Wellness": { text: "Early screenings catch delays" }
        }
      },
      {
        area: "Elementary",
        cells: {
          "Economic Vitality": { text: "Families need to be able to remain in the neighborhood" },
          "Stable Homes": { text: "A stable address keeps a child in one school" },
          "Early Childhood": { text: "Children who start ready are easier to keep on track", test: true }
        }
      },
      {
        area: "Stable Homes",
        cells: {
          "Economic Vitality": { text: "Rising income is what covers rising costs", test: true }
        }
      },
      {
        area: "Legacy Residents",
        cells: {
          "Economic Vitality": { text: "Income is what covers rising taxes" },
          "Stable Homes": { text: "Named, reason not written yet", unwritten: true }
        }
      },
      {
        area: "Health and Wellness",
        cells: {
          "Economic Vitality": { text: "Food security follows income" },
          "Early Childhood": { text: "Screenings catch delays before school", test: true }
        }
      }
    ],
    note:
      "The draft already lists a related assumption to test. Each line is FCS’ own reason, from “Other FCS areas this depends on.” Named dependencies, not overlaps shown in data."
  },

  results: [
    {
      id: "P-01",
      code: "EC",
      area: "Education: Early Childhood",
      result: "Children are ready for kindergarten",
      lead: { name: "Marvin Nesbitt", title: "President" },
      relation: { kind: "Also contributes to", id: "P-04", text: "Neighborhood residents are economically secure" },
      logic:
        "When FCS expands and fills high-quality early learning seats with neighborhood children and reaches families at home before pre-K, this changes for children in Historic South Atlanta and Thomasville Heights from birth to kindergarten entry, and that moves the result because more of them spend the years before kindergarten in quality early learning, so more start kindergarten ready.",
      indicators: [
        { id: "CI-01A", text: "Kindergartners ready on the GKIDS Readiness Check", status: "later" }
      ],
      needsTrue: "Most of our neighborhood 0-4 year-olds are enrolled in a high-quality early education experience.",
      questionsLabel: "Key Questions:",
      questions: [
        "How many spaces do we have?",
        "If filled by our kids, what % of our kids does that cover?",
        "Are the kids enrolled successfully entering kindergarten ready?"
      ],
      measures: [
        { id: "EC1", text: "Recruitment: xx% of early childhood slots are held by neighborhood kids", status: "now" },
        { id: "EC2", text: "Availability of slots: xx slots are provided by local childhood education to meet the needs of the neighborhood", status: "now" },
        { id: "EC3", text: "Quality of Slots: XX% of kids matriculating from early childhood providers into kindergarten are ready.", status: "later" },
        { id: "EC4", text: "Attendance in Slots: xx% of kids are achieving xx% attendance rate", status: "later" }
      ],
      programGroups: [
        {
          name: null,
          programs: [
            { name: "Pre-K and Head Start seats at Slater", type: "partnership", status: "running", moves: ["EC1", "EC2", "EC3", "EC4"], proposed: [], partners: ["ymca", "pbsa"] },
            { name: "Learning Spaces (drop-in early learning)", type: "partnership", status: "running", moves: ["EC2", "EC3"], proposed: [], partners: ["united-way", "ymca"] },
            { name: "Early Learning Ambassador", type: "program", status: "proposed", moves: [], proposed: ["EC1", "EC4"], partners: ["geears"] },
            { name: "Pathways to Promise (home-based early learning)", type: "partnership", status: "running", moves: ["EC2", "EC3"], proposed: [], partners: ["qcc"] }
          ]
        }
      ]
    },
    {
      id: "P-02",
      code: "ED",
      area: "Education: Elementary",
      result: "Children graduate ready for a career or college",
      lead: { name: "Marvin Nesbitt", title: "President" },
      relation: { kind: "Builds on", id: "P-01", text: "Children are ready for kindergarten" },
      logic:
        "When FCS brings the right partners together around a shared process for continuous improvement and shared accountability to keep neighborhood children reading proficient and in school every day, this changes for students in kindergarten through fifth grade from both neighborhoods, and that moves the result because more of them read on grade level by the end of third grade, which is the hinge for graduating ready.",
      indicators: [
        { id: "CI-02A", text: "Third graders proficient in English language arts", status: "now" },
        { id: "CI-02B", text: "Slater enrollment by where students live (number to watch)", status: "now", watch: true }
      ],
      needsTrue: "Our students at Slater are achieving regular attendance, receiving high quality education, and low transiency rates.",
      questionsLabel: "Questions:",
      questions: [
        "Is Slater serving our students?",
        "What is the attendance rate?",
        "If filled by our kids, what % of our kids does that cover?",
        "Are kids enrolled successfully achieving 3rd grade reading rates on time?"
      ],
      measures: [
        { id: "ED1", text: "xx% attendance rate achieved", status: "later" },
        { id: "ED2", text: "xx% of slater 3rd graders are achieving 3rd grade reading levels.", status: "now" },
        { id: "ED3", text: "xx% of Slater students being from the neighborhood", status: "now" }
      ],
      programGroups: [
        {
          name: null,
          programs: [
            { name: "Attendance support through the Early Learning Ambassador", type: "program", status: "proposed", moves: [], proposed: ["ED1"], partners: [] },
            { name: "One table for the education partners", type: "partnership", status: "proposed", moves: [], proposed: ["ED2", "ED3"], partners: ["pbsa", "ymca", "aps", "united-way", "qcc"] }
          ]
        }
      ]
    },
    {
      id: "P-03",
      code: "HW",
      area: "Health and Wellness",
      result: "Families and their children are healthy",
      lead: { name: "Marvin Nesbitt", title: "President" },
      relation: { kind: "Also contributes to", id: "P-01", text: "Children are ready for kindergarten" },
      logic:
        "When FCS keeps fresh food close to home, connects families to coverage and a regular doctor, and gives young people safe places to be active, this changes for neighborhood children from birth through eighteen and their families, and that moves the result because fewer of their health needs go unmet, which is what a parent would recognize as a healthy family.",
      indicators: [
        { id: "CI-03A", text: "Children under 19 with health insurance coverage", status: "now" },
        { id: null, text: "Food, activity, and adult connection", gap: true }
      ],
      needsTrue: "Our neighborhood children and families have fresh food close to home, health coverage and a regular doctor, and safe places to be active.",
      questionsLabel: "Questions:",
      questions: [
        "Do our families have fresh food close to home?",
        "Are our children and families covered, with a regular doctor?",
        "Do our young people have safe places to be active and an adult to go to?"
      ],
      measures: [
        { id: "HW1", text: "xx% of surveyed families say they eat more fresh food because of the market", status: "later" },
        { id: "HW2", text: "xx% of members say they have enough food through the month", status: "later" },
        { id: "HW3", text: "xx% of children served have a well-child visit within twelve months", status: "later" },
        { id: "HW4", text: "xx young people enrolled", status: "now" },
        { id: "HW5", text: "xx% of young people return month to month", status: "now" },
        { id: "HW6", text: "xx% report an adult they can go to, and are active xx days each week", status: "later" },
        { id: "HW7", text: "xx% of children report an adult they can go to, and are active xx days each week", status: "later" }
      ],
      programGroups: [
        {
          name: null,
          programs: [
            { name: "Carver Market and Community Grounds", type: "program", status: "running", moves: ["HW1"], proposed: [], partners: [] },
            { name: "Food co-op for seniors", type: "program", status: "running", moves: ["HW2"], proposed: [], partners: ["urban-recipe"] },
            { name: "Community Health Navigators", type: "program", status: "proposed", moves: [], proposed: ["HW3"], partners: [] },
            { name: "Bike clubs at Price Middle School", type: "program", status: "running", moves: ["HW4", "HW5", "HW6"], proposed: [], partners: [] },
            { name: "Summer camp", type: "confirm", status: "running", moves: ["HW7"], proposed: [], partners: [] },
            { name: "Enrichment fund and resources", type: "confirm", status: "running", moves: ["HW7"], proposed: [], partners: [] }
          ]
        }
      ]
    },
    {
      id: "P-04",
      code: "EV",
      area: "Economic Vitality",
      result: "Neighborhood residents are economically secure",
      lead: { name: "Kim Jones", title: "Director of Economic Vitality" },
      relation: { kind: "Also contributes to", id: "P-05", text: "Families of our children have stable housing in the neighborhood" },
      logic:
        "When FCS connects neighborhood residents to work that pays a living wage, creates opportunities for them to build wealth, and helps them hold on to what they earn, this changes for households in Historic South Atlanta and Thomasville Heights, and that moves the result because income and savings rise together, and that is what keeps a household at 200 percent above the poverty line when costs go up.",
      indicators: [
        { id: "CI-04A", text: "Employment rate", status: "now" },
        { id: "CI-04B", text: "Median earnings, full-time workers", status: "now" },
        { id: "CI-04C", text: "Residents below 200% of poverty", status: "now" },
        { id: "CI-04D", text: "Cost-burdened households", status: "now" },
        {
          id: null,
          text: "Assets: savings, credit, money returned at tax time",
          gap: true,
          note: "Financial coaching and VITA measure assets, not income, so they reach none of the four community indicators."
        }
      ],
      needsTrue: "Our neighborhood residents have jobs that pay a living wage, ways to build wealth, and help keeping what they earn, so their households stay above 200 percent of poverty as costs rise.",
      questionsLabel: "Questions:",
      questions: [
        "Are residents getting connected to work, and how many are raising children?",
        "Are those jobs full-time at a living wage, and do residents still have them a year later?",
        "Are businesses started here still operating a year later?",
        "Are households building savings and getting the credits they qualify for?"
      ],
      measures: [
        { id: "EV1", text: "xx% of StartMe businesses still operating 12 months after the program", status: "later" },
        { id: "EV2", text: "xx% of member businesses still operating 12 months later", status: "later" },
        { id: "EV3", text: "xx adults referred, xx% placed yearly", status: "later" },
        { id: "EV4", text: "xx% of placements full-time, living wage", status: "later" },
        { id: "EV5", text: "xx% still employed at 12 months, earning more", status: "later" },
        { id: "EV6", text: "xx% of placed households above 200% poverty", status: "later" },
        { id: "EV7", text: "xx% of neighborhood staff paid at or above a living wage", status: "now" },
        { id: "EV8", text: "xx% of clients can cover a $400 expense without borrowing, at entry and six months later", status: "later" },
        { id: "EV9", text: "xx% of households receive the credits they qualify for, and xx dollars returned", status: "later" }
      ],
      programGroups: [
        {
          name: "Entrepreneurship and small business growth",
          programs: [
            { name: "StartMe", type: "partnership", status: "running", moves: ["EV1"], proposed: [], partners: ["emory"] },
            { name: "Southside Assembly", type: "confirm", status: "running", moves: ["EV2"], proposed: [], partners: [] },
            { name: "A CDFI", type: "asset", status: "proposed", moves: [], proposed: ["EV1", "EV2"], partners: [] }
          ]
        },
        {
          name: "Workforce development",
          programs: [
            { name: "Employment connections", type: "partnership", status: "running", moves: ["EV3", "EV4", "EV5", "EV6"], proposed: [], partners: [] },
            { name: "Carver Market jobs", type: "program", status: "running", moves: ["EV7"], proposed: ["EV3", "EV4", "EV5", "EV6"], partners: [] },
            { name: "Micro-business spaces, Brownsville Point", type: "asset", status: "proposed", moves: [], proposed: ["EV1", "EV2"], partners: [] }
          ]
        },
        {
          name: "Financial literacy",
          programs: [
            { name: "Financial coaching", type: "program", status: "running", moves: ["EV8"], proposed: [], partners: [] },
            { name: "VITA tax credits", type: "program", status: "running", moves: ["EV8", "EV9"], proposed: [], partners: [] }
          ]
        }
      ]
    },
    {
      id: "P-05",
      code: "SH",
      area: "Housing: Stable Homes",
      result: "Families of our children have stable housing in the neighborhood",
      lead: { name: "Marvin Nesbitt", title: "President" },
      relation: { kind: "Also contributes to", id: "P-02", text: "Children graduate ready for a career or college" },
      logic:
        "When FCS keeps rents within reach, helps renters buy, and keeps borrowers current, this changes for families raising children in both neighborhoods, and that moves the result because housing costs stay manageable as values rise, so the families already here are still here a year later.",
      indicators: [
        { id: "CI-05A", text: "Cost-burdened households", status: "now" },
        { id: "CI-05B", text: "Students who start and finish the year at the same school", status: "now" },
        { id: "CI-05C", text: "Vacancy at FCS and partner developments", status: "now" }
      ],
      needsTrue: "Families raising children in our neighborhood can afford to rent or buy a home here, and are still here a year later.",
      questionsLabel: "Questions:",
      questions: [
        "How many homes do we hold, and how many are home to families with children?",
        "Are families paying a manageable share of their income on housing?",
        "Are renters and buyers still in the neighborhood a year or two later?"
      ],
      measures: [
        { id: "SH1", text: "xx rental units held, and xx home to households with children", status: "now" },
        { id: "SH2", text: "xx% of renter households pay more than 30% of income on rent, and xx% more than 50%", status: "now" },
        { id: "SH3", text: "xx% of students at Slater from the neighborhood who have the same address registered year after year", status: "now" },
        { id: "SH4", text: "xx homes sold, by neighborhood", status: "now" },
        { id: "SH5", text: "xx% sold to neighborhood renters and to households with children", status: "now" },
        { id: "SH6", text: "xx% of FCS mortgage loans current on payments", status: "now" },
        { id: "SH7", text: "xx% of borrowers still in the home 24 months after closing", status: "now" },
        { id: "SH8", text: "xx% of neighborhood households leasing there still in the neighborhood 12 months later", status: "later" }
      ],
      programGroups: [
        {
          name: null,
          programs: [
            { name: "Rental portfolio", type: "asset", status: "running", moves: ["SH1", "SH2", "SH3"], proposed: ["SH4", "SH5", "SH6", "SH7"], partners: [] },
            { name: "Single-family homes and mortgage lending", type: "partnership", status: "running", moves: ["SH4", "SH5", "SH6", "SH7"], proposed: [], partners: ["fortis", "pinnacle"] },
            { name: "Brownsville Point (18 mixed-income rental units)", type: "asset", status: "running", moves: ["SH8"], proposed: [], partners: [] }
          ]
        }
      ]
    },
    {
      id: "P-06",
      code: "LR",
      area: "Housing: Legacy Residents",
      result: "Legacy residents remain in the neighborhood",
      lead: { name: "Marvin Nesbitt", title: "President" },
      relation: { kind: "Also contributes to", id: "P-05", text: "Families of our children have stable housing in the neighborhood" },
      logic:
        "When FCS repairs legacy owners’ homes and helps them keep the title and the tax bill manageable, this changes for the legacy households in our neighborhoods, and that moves the result because the most common reasons legacy residents are displaced are removed, so more of them are able to stay.",
      indicators: [
        {
          id: "CI-06A",
          text: "Residents who have lived in the neighborhood eight years or more",
          status: "now",
          note: "Note: the dashboard counts households at their current address eight years or more. The legacy definition (65 or older, or ten years or more) does not line up yet. FCS decides which to use."
        }
      ],
      needsTrue: "Our legacy residents keep homes that are safe to live in, a clear title, and a tax bill they can manage, so they are able to stay.",
      questionsLabel: "Questions:",
      questions: [
        "How many legacy homes have we repaired, and how quickly?",
        "Do the households we serve meet the legacy definition?",
        "Are owners getting tax relief and clear title?",
        "Are repaired households still in their homes two years later?"
      ],
      measures: [
        { id: "LR1", text: "xx homes repaired, in an average of xx days from application", status: "now" },
        { id: "LR2", text: "xx% of repaired households meet the legacy definition", status: "now" },
        { id: "LR3", text: "xx% of repaired households still in the same home 24 months later", status: "later" },
        { id: "LR4", text: "xx owners helped to apply, and xx% enrolled the next tax year", status: "later" },
        { id: "LR5", text: "xx families referred, and xx% reach clear title", status: "later" },
        { id: "LR6", text: "xx% of households helped still in their home 12 months later", status: "later" }
      ],
      programGroups: [
        {
          name: null,
          programs: [
            { name: "Legacy Home Preservation and Repair Program", type: "program", status: "running", moves: ["LR1", "LR2", "LR3"], proposed: [], partners: [] },
            { name: "Homestead exemption and property tax abatement", type: "partnership", status: "running", moves: ["LR4"], proposed: [], partners: ["fulton-tax"] },
            { name: "Title clearing for heirs’ property", type: "partnership", status: "running", moves: ["LR1", "LR2", "LR3", "LR4", "LR5"], proposed: [], partners: ["legal-aid"] },
            { name: "Stepping Forward (basic needs for renters)", type: "confirm", status: "running", moves: ["LR6"], proposed: [], partners: [] }
          ]
        }
      ]
    }
  ]
};
