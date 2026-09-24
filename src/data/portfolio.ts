export const workExperiences = [
	{
		company: "London Stock Exchange Group",
		role: "Software Development Engineer",
		dates: "Feb 2025 - Present",
		location: "Bengaluru, India",
		highlights: [
			"Contributed to MANTA, an AI root-cause analysis engine that fuses 4+ signal channels over a ~1,000-node Neo4j dependency graph, correlating related incidents across ServiceNow, Snowflake, BigPanda, and Azure OpenAI to rank probable root causes.",
			"Worked on ORCA, an explainable change-risk engine combining CAB gates, Azure OpenAI semantic channels, hybrid RAG, and calibrated ML over 6.7M+ change and incident records, delivered as a FastAPI / Next.js POC for 146 users.",
			"Helped develop PostgreSQL / pgvector hybrid retrieval (vector KNN + full-text + pg_trgm via reciprocal-rank fusion), improving MRR 2.4x over vector-only search on a 195-query benchmark.",
			"Instrumented services with OpenTelemetry and contributed to Prometheus / Grafana observability for monitoring, tracing, SLA tracking, and faster incident diagnosis.",
			"Part of the team behind HackArena, an internal PERN-stack hackathon platform supporting 1,000+ users across submission, evaluation, and winner selection.",
		],
	},
	{
		company: "Tech Mahindra",
		role: "Software Development Intern",
		dates: "Oct 2023",
		location: "Pune, India",
		highlights: [
			"Worked on the Q-Radar Jira Alert Sync Tool with React, Node.js, Express.js, and MySQL, helping reduce alert resolution time by 25%.",
		],
	},
] as const;

export const resumePath = "/Jayesh_Rajani_Resume.pdf";

export const skillGroups = [
	{
		label: "LANGUAGES",
		skills: ["Python", "Java", "JavaScript", "SQL"],
	},
	{
		label: "AI + RETRIEVAL",
		skills: ["RAG", "LangChain", "MCP", "Semantic search", "Vector embeddings", "Chunking"],
	},
	{
		label: "WEB DEVELOPMENT",
		skills: ["React", "Next.js", "Node.js", "Express.js", "MERN / PERN"],
	},
	{
		label: "CLOUD + DEVOPS",
		skills: ["AWS", "Docker", "CI / CD", "Infrastructure fundamentals"],
	},
	{
		label: "OBSERVABILITY",
		skills: ["OpenTelemetry", "Prometheus", "Grafana", "HyperDX"],
	},
	{
		label: "TOOLS + CERTIFICATIONS",
		skills: ["PowerApps", "n8n", "GSAP", "Framer Motion", "Azure AI-900", "CKA"],
	},
] as const;

export const athleteProfile = {
	university: {
		title: "Mr. University",
		location: "VIT VELLORE",
		years: ["2023", "2024"],
		context: "PHYSIQUE COMPETITION",
	},
	football: {
		title: "U19 Football Nationals",
		location: "KOLKATA / 2019",
		summary: "Played at the U19 Football Nationals in Kolkata.",
	},
	club: {
		title: "Fitness and Beyond Club",
		role: "CHAIRPERSON",
		summary: "Worked with a 28-member team on campus fitness events and partnerships, helping grow participation by 130%.",
	},
} as const;

export const instagramProfile = {
	handle: "@jayeshrajanii",
	href: "https://www.instagram.com/jayeshrajanii/",
	summary: "Training updates and a little life outside work.",
	themes: ["TRAINING", "SPORT", "LIFE"],
} as const;

export const education = {
	institution: "Vellore Institute of Technology, Vellore",
	degree: "B.Tech, Computer Science & Engineering",
	timeline: "2021 - 2025 / CGPA 8.54/10",
	details: "Billabong High International School, Bhopal / XII: 92.5% (2021) / X: 94% (2019)",
};

export type Project = {
	id: string;
	title: string;
	status?: "upcoming";
	description: string;
	problem: string;
	solution: string;
	technology: string;
	architecture: string;
	result: string;
	href: string;
	banner: string;
	bannerAlt: string;
};

export const projects: readonly Project[] = [
	{
		id: "are-you-liv",
		title: "AreYouLiv",
		description: "Real-time SonyLIV concurrency analytics built during the ClickHouse Clickathon.",
		problem: "Measure foreground-only concurrent viewers from roughly one million playback and app-state events.",
		solution: "Reconstructed active intervals from heartbeats and state changes while excluding paused, backgrounded, and disconnected sessions.",
		technology: "ClickHouse, Python, HyperDX",
		architecture: "Event ingestion -> interval reconstruction -> ClickHouse aggregation -> minute-level metrics",
		result: "Delivered low-latency concurrency metrics with observability and correctness cross-checks.",
		href: "https://github.com/jayeshrajani/AreYouLiv",
		banner: "/project-banners/are-you-liv.png",
		bannerAlt: "A rising foreground-viewer concurrency curve surrounded by streaming event signals.",
	},
	{
		id: "chess-royale",
		title: "Chess Royale",
		description: "Real-time multiplayer chess with synchronized matches and spectator viewing.",
		problem: "Keep legal game state synchronized across online players and spectators.",
		solution: "Used server-managed Socket.IO rooms and Chess.js validation for live moves and game-state broadcasts.",
		technology: "JavaScript, Node.js, Express.js, Socket.IO, Chess.js",
		architecture: "Browser clients -> Socket.IO rooms -> Node / Express server -> Chess.js rules engine",
		result: "Supports synchronized competition, legal-move handling, live updates, and spectators.",
		href: "https://github.com/jayeshrajani/chess.com",
		banner: "/project-banners/chess-royale.png",
		bannerAlt: "A live multiplayer chessboard shown in perspective with an active move highlighted.",
	},
];

export const upcomingProjects: readonly Project[] = [
	{
		id: "driftcue",
		title: "DriftCue",
		status: "upcoming",
		description: "AI-driven music curation for adaptive listening sessions.",
		problem: "Choose the next track from session context, track metadata, and user interaction signals while staying resilient when AI availability degrades.",
		solution: "Built a mock-first provider and decision-engine architecture with SoundCloud OAuth, fallback logic, and real-time session analytics for energy, mode, exploration, and recommendation probabilities.",
		technology: "Next.js, React, TypeScript, Zustand, SoundCloud OAuth",
		architecture: "SoundCloud provider -> session state -> pluggable decision engine -> responsive playback UI",
		result: "Created an extensible foundation for secure music integrations and adaptive recommendation flows.",
		href: "https://github.com/jayeshrajani",
		banner: "/project-banners/driftcue.png",
		bannerAlt: "A session energy curve over a track waveform with next-track recommendation probabilities.",
	},
	{
		id: "creatorlens",
		title: "CreatorLens",
		status: "upcoming",
		description: "Retrieval and analytics platform for YouTube creators.",
		problem: "Turn creator content, audience comments, retention curves, and channel history into recommendations that are searchable, explainable, and measurable.",
		solution: "Built pure scoring-based recommendations, a tunable BM25 index, hybrid retrieval with Reciprocal Rank Fusion, pgvector embeddings, an offline clustering worker, and threshold-driven retention signal detection. An optional LLM only rewords results.",
		technology: "Next.js 15, TypeScript, PostgreSQL, pgvector, Python, scikit-learn, sentence-transformers, Drizzle ORM",
		architecture: "YouTube OAuth sync -> Postgres / pgvector -> BM25 + semantic retrieval -> explainable scoring and analytics",
		result: "Covered the system with 196 TypeScript tests and 39 Python tests, including ranking evaluation and no-LLM fallback paths.",
		href: "https://github.com/jayeshrajani",
		banner: "/project-banners/creatorlens.png",
		bannerAlt: "Ranked creator insights fused from BM25 and vector search results.",
	},
];

export const contactDetails = [
	{ label: "EMAIL", value: "rajani.jass@gmail.com", href: "mailto:rajani.jass@gmail.com" },
	{ label: "PHONE", value: "+91 99933 74777", href: "tel:+919993374777" },
	{ label: "LOCATION", value: "Bengaluru, India" },
	{ label: "LINKEDIN", value: "jayesh-rajani", href: "https://www.linkedin.com/in/jayesh-rajani/" },
	{ label: "GITHUB", value: "github.com/jayeshrajani", href: "https://github.com/jayeshrajani" },
] as const;
