export interface SDGItem {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  color: string;
  description: string;
  globalTarget: string;
  whyItMatters: string;
  keyTargets: string[];
  localImpact: string;
  image: string;
  stats: {
    label: string;
    value: string;
  };
  sampleProblems: string[];
  recommendedActions: string[];
}

export const SDG_LIST: SDGItem[] = [
  {
    id: 1,
    code: "01",
    title: "NO POVERTY",
    subtitle: "End poverty in all its forms everywhere",
    color: "#E5243B",
    description: "Eradicate extreme poverty and ensure resilient social safety nets for vulnerable communities worldwide.",
    globalTarget: "TARGET 1.1: By 2030, eradicate extreme poverty for all people everywhere.",
    whyItMatters: "Poverty entails more than a lack of income; it manifests as hunger, malnutrition, limited access to education, and social exclusion.",
    keyTargets: [
      "1.1 Eradicate extreme poverty (living on < $2.15/day)",
      "1.3 Implement nationally appropriate social protection systems",
      "1.4 Ensure equal rights to economic resources and basic services",
      "1.5 Build resilience against climate-induced economic shocks"
    ],
    localImpact: "Micro-grant distribution directly reduced economic instability in 42 regional districts.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Target Reduction", value: "50%" },
    sampleProblems: ["Lack of rural banking access", "Seasonal income vulnerability"],
    recommendedActions: ["Establish micro-lending circles", "Community skills incubation"]
  },
  {
    id: 2,
    code: "02",
    title: "ZERO HUNGER",
    subtitle: "End hunger, achieve food security and improved nutrition",
    color: "#DDA63A",
    description: "Transform food production, eliminate food deserts, and empower regenerative agriculture at regional scale.",
    globalTarget: "TARGET 2.4: Ensure sustainable food production systems and resilient agricultural practices.",
    whyItMatters: "A profound change of the global food and agriculture system is needed to nourish the 800+ million hungry people today.",
    keyTargets: [
      "2.1 Universal access to safe, nutritious and sufficient food",
      "2.3 Double agricultural productivity of small-scale food producers",
      "2.4 Foster regenerative, climate-adaptive farming techniques",
      "2.c Regulate commodity markets to avoid severe food price spikes"
    ],
    localImpact: "310 local community seed banks established, cutting post-harvest grain loss by 38%.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Yield Protection", value: "+38%" },
    sampleProblems: ["Urban food waste accumulation", "Soil nutrient depletion in peri-urban farms"],
    recommendedActions: ["Urban surplus food redistribution", "Community biochar soil restoration"]
  },
  {
    id: 3,
    code: "03",
    title: "GOOD HEALTH & WELL-BEING",
    subtitle: "Ensure healthy lives and promote well-being for all",
    color: "#4C9F38",
    description: "Provide universal access to preventive healthcare, maternal safety, clean air, and psychological well-being.",
    globalTarget: "TARGET 3.8: Achieve universal health coverage, including financial risk protection.",
    whyItMatters: "Good health is foundational for thriving societies, economic mobility, and resilient families across generations.",
    keyTargets: [
      "3.1 Reduce global maternal mortality ratio below 70 per 100,000",
      "3.3 End epidemics of malaria, tuberculosis, and neglected tropical diseases",
      "3.8 Universal access to quality essential healthcare and medicines",
      "3.9 Substantially reduce illnesses from hazardous chemicals and air pollution"
    ],
    localImpact: "Decentralized diagnostics provided preventive care to 45,000 underserved residents.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Care Reached", value: "45K+" },
    sampleProblems: ["Air quality spikes in urban corridors", "Inadequate primary triage in remote clinics"],
    recommendedActions: ["Deploy hyper-local PM2.5 sensors", "Tele-consultation community kiosks"]
  },
  {
    id: 4,
    code: "04",
    title: "QUALITY EDUCATION",
    subtitle: "Ensure inclusive and equitable quality education for all",
    color: "#C5192D",
    description: "Break educational divides through open-source learning, digital literacy, and equitable STEM infrastructure.",
    globalTarget: "TARGET 4.4: Increase the number of youth and adults with relevant technical skills.",
    whyItMatters: "Education enables upward socioeconomic mobility and serves as the ultimate catalyst for escaping generational poverty.",
    keyTargets: [
      "4.1 Free, equitable and quality primary and secondary education",
      "4.3 Equal access to affordable technical, vocational, and tertiary education",
      "4.4 Boost workforce competencies for decent jobs and entrepreneurship",
      "4.a Build and upgrade inclusive, child and disability-sensitive facilities"
    ],
    localImpact: "Trained 1,400 returnship mentors across 26 technical and vocational institutes.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Learners Empowered", value: "18.2K" },
    sampleProblems: ["Digital divide in offline schools", "Lack of vocational returnship pathways"],
    recommendedActions: ["Deploy offline mesh learning kits", "Structured skill-passport training"]
  },
  {
    id: 5,
    code: "05",
    title: "GENDER EQUALITY",
    subtitle: "Achieve gender equality and empower all women and girls",
    color: "#FF3A21",
    description: "Dismantle career continuity friction, eliminate unpaid care penalties, and foster women leadership across sectors.",
    globalTarget: "TARGET 5.5: Ensure women’s full and effective participation and equal opportunities for leadership.",
    whyItMatters: "Gender equality is not only a fundamental human right, but a prerequisite for peaceful, prosperous, and sustainable communities.",
    keyTargets: [
      "5.1 End all forms of discrimination against women and girls everywhere",
      "5.4 Value unpaid care and domestic work through public infrastructure",
      "5.5 Equal leadership opportunities at all levels of decision-making",
      "5.b Enhance use of enabling technology to promote women's empowerment"
    ],
    localImpact: "Empowered 3,400+ women returning to technology, engineering, and climate governance.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Women Relaunched", value: "3.4K+" },
    sampleProblems: ["Career break penalties in tech hiring", "Unrepresented women in urban planning"],
    recommendedActions: ["Standardize career continuity passports", "Affirmative returnship programs"]
  },
  {
    id: 6,
    code: "06",
    title: "CLEAN WATER & SANITATION",
    subtitle: "Ensure availability and sustainable management of water",
    color: "#26BDE2",
    description: "Safeguard freshwater ecosystems, prevent toxic industrial runoff, and deploy decentralized filtration grids.",
    globalTarget: "TARGET 6.1: Achieve universal and equitable access to safe and affordable drinking water.",
    whyItMatters: "Billions of people lack safely managed drinking water and sanitation services, risking catastrophic disease outbreaks.",
    keyTargets: [
      "6.1 Safe, affordable drinking water for all by 2030",
      "6.3 Improve water quality by eliminating dumping and minimizing hazardous chemicals",
      "6.4 Substantially increase water-use efficiency across all sectors",
      "6.6 Protect and restore water-related ecosystems including rivers and aquifers"
    ],
    localImpact: "Restored 12 natural municipal wetlands, filtering 4.2 million liters of greywater daily.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Liters Filtered/Day", value: "4.2M" },
    sampleProblems: ["Groundwater depletion in industrial zones", "Untreated municipal runoff into canals"],
    recommendedActions: ["Construct ecological reed-bed filters", "Deploy smart aquifer flow meters"]
  },
  {
    id: 7,
    code: "07",
    title: "AFFORDABLE & CLEAN ENERGY",
    subtitle: "Ensure access to affordable, reliable, sustainable modern energy",
    color: "#FCC30B",
    description: "Accelerate distributed rooftop solar, microgrid storage, and clean community energy independence.",
    globalTarget: "TARGET 7.2: Increase substantially the share of renewable energy in the global energy mix.",
    whyItMatters: "Energy accounts for 73% of human greenhouse gas emissions. Clean transition is the cornerstone of climate survival.",
    keyTargets: [
      "7.1 Universal access to affordable, reliable and modern energy services",
      "7.2 Substantially expand renewable generation capacity worldwide",
      "7.3 Double the global rate of improvement in energy efficiency",
      "7.a Promote investment in clean energy research and renewable infrastructure"
    ],
    localImpact: "48 community solar microgrids installed, offsetting 14,200 metric tons of carbon annually.",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "CO2 Offset / Yr", value: "14.2K T" },
    sampleProblems: ["Diesel generator dependence in off-grid wards", "Peak-hour grid blackouts in heatwaves"],
    recommendedActions: ["Rooftop solar aggregation", "Community battery energy storage"]
  },
  {
    id: 8,
    code: "08",
    title: "DECENT WORK & ECONOMIC GROWTH",
    subtitle: "Promote sustained, inclusive and sustainable economic growth",
    color: "#A21942",
    description: "Foster green jobs, protect worker rights, and create dignified economic continuity for transitioning workforces.",
    globalTarget: "TARGET 8.5: Achieve full and productive employment and decent work for all women and men.",
    whyItMatters: "Sustainable economic growth requires societies to create conditions allowing people to have quality, stable jobs.",
    keyTargets: [
      "8.2 Achieve higher levels of economic productivity through technological upgrading",
      "8.5 Full and productive employment with equal pay for work of equal value",
      "8.6 Substantially reduce proportion of youth not in employment, education or training",
      "8.8 Protect labour rights and promote safe, secure working environments"
    ],
    localImpact: "Facilitated 820+ verified returnship placements with 100% pay parity guarantees.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Placements", value: "820+" },
    sampleProblems: ["Informal sector exploitation", "Systemic career hiatus penalties"],
    recommendedActions: ["Verified digital career passports", "Equitable apprenticeship wage pacts"]
  },
  {
    id: 9,
    code: "09",
    title: "INDUSTRY, INNOVATION & INFRASTRUCTURE",
    subtitle: "Build resilient infrastructure, promote sustainable industrialization",
    color: "#FD6925",
    description: "Pioneer circular manufacturing, low-carbon materials, and resilient open-hardware data networks.",
    globalTarget: "TARGET 9.4: Upgrade infrastructure and retrofit industries to make them sustainable.",
    whyItMatters: "Technological progress and resilient infrastructure are essential to finding lasting solutions to economic and environmental challenges.",
    keyTargets: [
      "9.1 Develop quality, reliable, sustainable and resilient infrastructure",
      "9.4 Retrofit industries to make them sustainable with increased resource-use efficiency",
      "9.5 Enhance scientific research and upgrade technological capabilities",
      "9.c Significantly increase access to information and communications technology"
    ],
    localImpact: "Piloted low-carbon bio-composite building materials across 18 public facilities.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Carbon Saved", value: "-42%" },
    sampleProblems: ["Concrete-heavy urban heat traps", "Inefficient industrial thermal leaks"],
    recommendedActions: ["Thermal recovery retrofits", "Locally manufactured bio-composites"]
  },
  {
    id: 10,
    code: "10",
    title: "REDUCED INEQUALITIES",
    subtitle: "Reduce inequality within and among countries",
    color: "#DD1367",
    description: "Level disparities in wealth, representation, and opportunity through transparent public resource allocation.",
    globalTarget: "TARGET 10.2: Empower and promote the social, economic and political inclusion of all.",
    whyItMatters: "Inequalities threaten long-term social cohesion, harm economic development, and destroy people's sense of fulfillment.",
    keyTargets: [
      "10.1 Progressively achieve income growth of the bottom 40% at a rate higher than national average",
      "10.2 Empower and promote social, economic and political inclusion of all",
      "10.3 Ensure equal opportunity and reduce inequalities of outcome",
      "10.4 Adopt wage, social protection and fiscal policies that progressively achieve greater equality"
    ],
    localImpact: "Delivered digital financial literacy to 12,000 marginalized youth and domestic workers.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Equity Index", value: "+28pt" },
    sampleProblems: ["Disproportionate civic representation", "Algorithmic bias in hiring pipelines"],
    recommendedActions: ["Blind skills-first matching", "Participatory municipal budgeting"]
  },
  {
    id: 11,
    code: "11",
    title: "SUSTAINABLE CITIES & COMMUNITIES",
    subtitle: "Make cities and human settlements inclusive, safe, resilient",
    color: "#FD9D24",
    description: "Design 15-minute walkable neighborhoods, urban tree canopies, zero-emission transit, and flood sponges.",
    globalTarget: "TARGET 11.7: Provide universal access to safe, inclusive and accessible green and public spaces.",
    whyItMatters: "Cities occupy 3% of Earth's land but account for 70% of global emissions and 80% of energy consumption.",
    keyTargets: [
      "11.1 Ensure access to adequate, safe and affordable housing and basic services",
      "11.2 Provide access to safe, affordable, accessible and sustainable transport systems",
      "11.3 Enhance inclusive and sustainable urbanization and participatory planning",
      "11.7 Universal access to safe, inclusive and green public spaces"
    ],
    localImpact: "Transformed 6 abandoned rail spurs into 14km of native biophilic linear parks.",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Urban Green Space", value: "+14km" },
    sampleProblems: ["Severe urban heat island effect", "Lack of segregated cycling corridors"],
    recommendedActions: ["Urban micro-forest planting", "Protected active mobility lanes"]
  },
  {
    id: 12,
    code: "12",
    title: "RESPONSIBLE CONSUMPTION & PRODUCTION",
    subtitle: "Ensure sustainable consumption and production patterns",
    color: "#BF8B2E",
    description: "Eliminate single-use plastics, enforce extended producer responsibility, and close material loops.",
    globalTarget: "TARGET 12.5: Substantially reduce waste generation through prevention, reduction, recycling, and reuse.",
    whyItMatters: "If the global population reaches 9.6 billion by 2050, three planets will be required to provide the natural resources needed.",
    keyTargets: [
      "12.2 Achieve sustainable management and efficient use of natural resources",
      "12.3 Halve per capita global food waste at retail and consumer levels",
      "12.4 Sound management of chemicals and hazardous wastes throughout lifecycle",
      "12.5 Substantially reduce waste generation through circular reuse and repair"
    ],
    localImpact: "Diverted 840 metric tons of commercial textile and electronic waste from regional landfills.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Waste Diverted", value: "840 T" },
    sampleProblems: ["Unregulated e-waste discarding", "Fast fashion textile dumping"],
    recommendedActions: ["Neighborhood repair cafes", "Closed-loop material take-back schemes"]
  },
  {
    id: 13,
    code: "13",
    title: "CLIMATE ACTION",
    subtitle: "Take urgent action to combat climate change and its impacts",
    color: "#3F7E44",
    description: "Halt planetary heating below 1.5°C through deep decarbonization, ecosystem restoration, and adaptive infrastructure.",
    globalTarget: "TARGET 13.2: Integrate climate change measures into national policies, strategies and planning.",
    whyItMatters: "Climate change is affecting every country on every continent. It is disrupting national economies and transforming lives.",
    keyTargets: [
      "13.1 Strengthen resilience and adaptive capacity to climate-related hazards",
      "13.2 Integrate climate change measures into policies and urban planning",
      "13.3 Improve education, awareness-raising and human and institutional capacity",
      "13.a Mobilize $100 billion annually to address the needs of developing countries"
    ],
    localImpact: "Orchestrated 180,000 native mangrove plantings along coastal flood defense zones.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Mangroves Planted", value: "180K" },
    sampleProblems: ["Coastal storm surge vulnerability", "Methane venting from municipal landfills"],
    recommendedActions: ["Living shoreline restoration", "Landfill biogas capture systems"]
  },
  {
    id: 14,
    code: "14",
    title: "LIFE BELOW WATER",
    subtitle: "Conserve and sustainably use the oceans, seas and marine resources",
    color: "#0A97D9",
    description: "End overfishing, halt coral bleaching, stop coastal plastic choke points, and designate marine sanctuaries.",
    globalTarget: "TARGET 14.1: Prevent and significantly reduce marine pollution of all kinds.",
    whyItMatters: "Oceans absorb 30% of carbon dioxide produced by humans and produce over 50% of the world's oxygen.",
    keyTargets: [
      "14.1 Prevent and significantly reduce marine pollution, particularly land-based litter",
      "14.2 Sustainably manage and protect marine and coastal ecosystems",
      "14.4 Effectively regulate harvesting and end overfishing, illegal and unregulated fishing",
      "14.5 Conserve at least 10% of coastal and marine areas in line with national law"
    ],
    localImpact: "Removed 190 tons of abandoned ghost nets and plastic debris across 4 coral reefs.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Ghost Nets Removed", value: "190 T" },
    sampleProblems: ["Microplastic runoff into estuaries", "Destructive bottom-trawling in nursery zones"],
    recommendedActions: ["Estuary trash interceptor booms", "Community-patrolled marine reserves"]
  },
  {
    id: 15,
    code: "15",
    title: "LIFE ON LAND",
    subtitle: "Protect, restore and promote sustainable use of terrestrial ecosystems",
    color: "#56C02B",
    description: "Stop deforestation, rehabilitate degraded topsoil, protect keystone species, and preserve biodiversity.",
    globalTarget: "TARGET 15.5: Take urgent action to reduce degradation of natural habitats and halt biodiversity loss.",
    whyItMatters: "Deforestation and desertification caused by human activities affect the lives and livelihoods of millions of people.",
    keyTargets: [
      "15.1 Ensure conservation, restoration and sustainable use of terrestrial ecosystems",
      "15.2 Promote implementation of sustainable management of all types of forests",
      "15.3 Combat desertification, restore degraded land and soil",
      "15.5 Take urgent action to halt biodiversity loss and protect threatened species"
    ],
    localImpact: "Reforested 2,100 hectares of critical wildlife corridors with native evergreen trees.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Hectares Protected", value: "2,100" },
    sampleProblems: ["Unchecked illegal logging corridors", "Invasive weed displacement of native flora"],
    recommendedActions: ["Satellite acoustic biodiversity monitors", "Targeted endemic tree reforestation"]
  },
  {
    id: 16,
    code: "16",
    title: "PEACE, JUSTICE & STRONG INSTITUTIONS",
    subtitle: "Promote peaceful and inclusive societies for sustainable development",
    color: "#00689D",
    description: "Safeguard civic freedoms, combat corruption, ensure open public access to data, and protect whistleblowers.",
    globalTarget: "TARGET 16.6: Develop effective, accountable and transparent institutions at all levels.",
    whyItMatters: "Conflict, insecurity, weak institutions and limited access to justice remain great threats to sustainable human development.",
    keyTargets: [
      "16.1 Significantly reduce all forms of violence and related death rates everywhere",
      "16.5 Substantially reduce corruption and bribery in all their forms",
      "16.6 Develop effective, accountable and transparent public institutions",
      "16.10 Ensure public access to information and protect fundamental freedoms"
    ],
    localImpact: "Implemented open civic audit dashboards for 64 municipal infrastructure contracts.",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Civic Audits", value: "64 Pub." },
    sampleProblems: ["Opaque municipal budget allocations", "Suppression of environmental whistleblowers"],
    recommendedActions: ["Public open-data expenditure explorer", "Encrypted civic report channels"]
  },
  {
    id: 17,
    code: "17",
    title: "PARTNERSHIPS FOR THE GOALS",
    subtitle: "Strengthen the means of implementation and revitalize global partnership",
    color: "#19486A",
    description: "Unite grassroots activists, universities, policymakers, and innovative technology enterprises into collective action.",
    globalTarget: "TARGET 17.16: Enhance the global partnership for sustainable development through multi-stakeholder coalitions.",
    whyItMatters: "A successful sustainable development agenda requires inclusive partnerships built upon principles and values across all borders.",
    keyTargets: [
      "17.1 Strengthen domestic resource mobilization to improve revenue collection",
      "17.6 Enhance North-South, South-South and triangular regional cooperation",
      "17.16 Foster multi-stakeholder partnerships that mobilize and share knowledge and technology",
      "17.19 Develop measurements of progress on sustainable development that complement GDP"
    ],
    localImpact: "Connected 140 cross-border research and community coalitions tackling regional environmental challenges.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop",
    stats: { label: "Active Coalitions", value: "140+" },
    sampleProblems: ["Fragmented cross-border climate data", "Siloed NGO project duplication"],
    recommendedActions: ["Federated SDG intelligence network", "Cross-institutional impact pledges"]
  }
];

export interface CommunityProject {
  id: string;
  projectCode: string;
  title: string;
  location: string;
  sdgs: number[];
  status: "ACTIVE" | "VERIFIED" | "ACCELERATING";
  contributors: number;
  impactMetrics: string;
  projectLead: string;
  image: string;
  problemSummary: string;
  approachSummary: string;
  timeline: string;
  updates: string[];
}

export const COMMUNITY_PROJECTS: CommunityProject[] = [
  {
    id: "proj-001",
    projectCode: "PROJECT / 001",
    title: "URBAN CANOPY & HEAT SHIELD INITIATIVE",
    location: "Bangalore, India",
    sdgs: [11, 13, 15],
    status: "ACTIVE",
    contributors: 142,
    impactMetrics: "+18,000 Native Trees Planted // -2.4°C Local Temp Reduction",
    projectLead: "Dr. Maya Sen, Urban Ecologist",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1600&auto=format&fit=crop",
    problemSummary: "Rapid asphalt expansion created severe 41°C micro-climate heat islands across dense residential wards.",
    approachSummary: "Deploying high-density Miyawaki micro-forests along barren railway edges and public school peripheries.",
    timeline: "Phase 1 Completed (June 2025) // Phase 2 Canopy Growth (Current)",
    updates: [
      "Soil moisture telemetry sensors installed across 14 zones.",
      "7,400 students integrated into weekly biophilic stewardship."
    ]
  },
  {
    id: "proj-002",
    projectCode: "PROJECT / 002",
    title: "RIVERINE PLASTIC INTERCEPTOR MATRIX",
    location: "Mithi River Basin, Mumbai",
    sdgs: [6, 12, 14],
    status: "ACCELERATING",
    contributors: 89,
    impactMetrics: "92 Metric Tons Debris Captured Before Arabian Sea Entry",
    projectLead: "Arun Kulkarni, Marine Systems Engineer",
    image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1600&auto=format&fit=crop",
    problemSummary: "Monsoon floods wash hundreds of tons of single-use polyethelene and packaging into fragile coastal mangroves.",
    approachSummary: "Autonomous solar-powered floating boom barriers that funnel floating waste into bio-digestive sorting terminals.",
    timeline: "Design Proven (Q3 2025) // 6 Booms Active (2026)",
    updates: [
      "Boom 04 upgraded with solar AI computer vision for real-time plastic mass telemetry.",
      "18 informal waste pickers formally employed as maintenance technicians."
    ]
  },
  {
    id: "proj-003",
    projectCode: "PROJECT / 003",
    title: "DECENTRALIZED AGRI-SOLAR REGENERATIVE COMMONS",
    location: "Kolar Drylands, Karnataka",
    sdgs: [7, 8, 13],
    status: "VERIFIED",
    contributors: 210,
    impactMetrics: "340 MWh Clean Solar Delivered // 65 Farming Families Powered",
    projectLead: "Priya Sharma & Nova Tech Coalition",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1600&auto=format&fit=crop",
    problemSummary: "Frequent 12-hour grid blackouts halted irrigation pumps, forcing heavy reliance on polluting diesel fuel.",
    approachSummary: "Elevated dual-use bifacial solar canopies that provide shade for sensitive crops while generating microgrid power.",
    timeline: "Commissioned (January 2026) // Continuous Operation",
    updates: [
      "Microgrid storage expanded with 120 kWh phosphate iron battery bank.",
      "Crop moisture retention increased by 22% under panel shade."
    ]
  }
];
