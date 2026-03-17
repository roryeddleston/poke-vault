type GradePillProps = {
  grade: string;
  className?: string;
};

type GradingCompany = "RAW" | "PSA" | "BGS" | "CGC" | "ACE" | "OTHER";

const GRADE_STYLES: Record<GradingCompany, string> = {
  RAW: "grade-pill-raw",
  PSA: "grade-pill-psa",
  BGS: "grade-pill-bgs",
  CGC: "grade-pill-cgc",
  ACE: "grade-pill-ace",
  OTHER: "grade-pill-raw",
};

export function GradePill({ grade, className = "" }: GradePillProps) {
  const company = getGradingCompany(grade);
  const style = GRADE_STYLES[company];

  return (
    <span
      className={`grade-pill-base ${style} ${className}`}
      aria-label={`Grade: ${grade}`}
    >
      {grade}
    </span>
  );
}

function getGradingCompany(grade: string): GradingCompany {
  const normalized = grade.trim().toUpperCase();
  if (normalized === "RAW") return "RAW";
  if (normalized.startsWith("PSA")) return "PSA";
  if (normalized.startsWith("BGS") || normalized.startsWith("BECKETT")) return "BGS";
  if (normalized.startsWith("CGC")) return "CGC";
  if (normalized.startsWith("ACE")) return "ACE";
  return "OTHER";
}
