export const workExperiences = [
	{
		company: "London Stock Exchange Group",
		role: "Software Development Engineer",
		dates: "Feb 2025 - Present",
		location: "Bengaluru, India",
		highlights: [
			"Built VRSY (Virtual SRE), combining AI-powered Change and Incident Analysers with RAG, LangChain, semantic search, vector embeddings, and chunked historical data.",
			"Implemented distributed observability for PRISM with OpenTelemetry, Prometheus, and Grafana for service monitoring, tracing, SLA tracking, and faster incident resolution.",
			"Built and scaled HackArena with the PERN stack, supporting 1,000+ users across submission, evaluation, and winner-selection workflows.",
		],
	},
	{
		company: "Tech Mahindra",
		role: "Software Development Intern",
		dates: "Oct 2023",
		location: "Pune, India",
		highlights: [
			"Developed the Q-Radar Jira Alert Sync Tool with React, Node.js, Express.js, and MySQL, reducing alert resolution time by 25%.",
		],
	},
	{
		company: "BioDimension Technology",
		role: "Product Development Strategist / Content Analyst",
		dates: null,
		location: "Vellore, India",
		highlights: ["Worked across product development strategy and content analysis."],
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
		skills: ["React", "Next.js", "Node.js", "Express.js", "MERN / PERN", "Socket.IO"],
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
		title: "MR. UNIVERSITY",
		location: "VIT VELLORE",
		years: ["2023", "2024"],
		context: "BACK-TO-BACK TITLE HOLDER",
	},
	football: {
		title: "U19 FOOTBALL NATIONALS",
		location: "KOLKATA / 2019",
		summary: "Competed at the U19 Football Nationals in Kolkata in 2019.",
	},
	club: {
		title: "FITNESS AND BEYOND CLUB",
		role: "CHAIRPERSON / LED A 28-MEMBER TEAM",
		summary: "Built an active campus fitness community through well-run events, partnerships, and regular training initiatives.",
	},
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

export const contactDetails = [
	{ label: "EMAIL", value: "rajani.jass@gmail.com", href: "mailto:rajani.jass@gmail.com" },
	{ label: "PHONE", value: "+91 99933 74777", href: "tel:+919993374777" },
	{ label: "LOCATION", value: "Bengaluru, India" },
	{ label: "LINKEDIN", value: "jayesh-rajani-010a08225", href: "https://www.linkedin.com/in/jayesh-rajani-010a08225/" },
	{ label: "GITHUB", value: "github.com/jayeshrajani", href: "https://github.com/jayeshrajani" },
] as const;
