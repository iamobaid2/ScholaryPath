export type ShowcaseKind = "marks" | "assignment" | "project" | "documentation" | "dissertation";

export const SHOWCASE_KINDS: { id: ShowcaseKind; label: string; short: string }[] = [
  { id: "marks", label: "Students' marks", short: "Marks" },
  { id: "assignment", label: "High-scoring assignments", short: "Assignments" },
  { id: "project", label: "Projects", short: "Projects" },
  { id: "documentation", label: "Documentation", short: "Documentation" },
  { id: "dissertation", label: "Dissertations", short: "Dissertations" },
];

export type ShowcaseItem = {
  id: string;
  kind: ShowcaseKind;
  title: string;
  subject: string;
  level: string;
  grade: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  fileUrl: string;
  filePublicId: string;
  fileResourceType: string;
  createdAt: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  uid: string;
  name: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
};

export type PublicReview = Pick<Review, "id" | "name" | "rating" | "comment" | "createdAt">;
