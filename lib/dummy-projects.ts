/**
 * PLACEHOLDER PROJECTS: shown on the home page only until you publish real ones.
 *
 * As soon as you add a project in /admin → Showcase (category "Projects"), this list stops being
 * used and your real projects take its place. You can delete this file once you have a few real
 * ones (and remove its import in components/home/Work.tsx).
 */
export type DummyProject = { title: string; category: string; summary: string; tags: string[] };

export const DUMMY_PROJECTS: DummyProject[] = [
  { title: "E-commerce Web Application", category: "Software Engineering", summary: "A full online store with product search, a shopping basket, secure checkout and an admin dashboard.", tags: ["React", "Node.js", "MongoDB"] },
  { title: "Hospital Management System", category: "Computer Science", summary: "A database-driven system for patient records, appointments and billing, with role-based access.", tags: ["Java", "SQL", "UML"] },
  { title: "Customer Churn Prediction", category: "Data Science", summary: "A machine learning model that predicts which customers are likely to leave, with a written analysis of the results.", tags: ["Python", "scikit-learn", "Pandas"] },
  { title: "Mobile Banking App Design", category: "UI/UX Design", summary: "User research, wireframes and a clickable prototype for a mobile banking app, with a design rationale document.", tags: ["Figma", "Prototyping", "User research"] },
  { title: "Sentiment Analysis of Social Media", category: "Artificial Intelligence", summary: "A natural language processing project that classifies opinions in posts and visualises the trends.", tags: ["NLP", "Python", "Visualisation"] },
  { title: "Smart Irrigation System", category: "Electrical Engineering", summary: "A sensor-based controller that waters crops only when needed, with circuit design and a project report.", tags: ["IoT", "Arduino", "Embedded"] },
  { title: "Supply Chain Optimisation", category: "Business", summary: "A dissertation analysing delivery costs and proposing a cheaper distribution plan for a mid-sized retailer.", tags: ["Dissertation", "Operations", "Excel"] },
  { title: "Footbridge Structural Analysis", category: "Civil Engineering", summary: "Load and stress calculations for a pedestrian bridge, with drawings and a design report.", tags: ["Structural", "AutoCAD", "Report"] },
];
