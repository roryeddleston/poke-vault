import { NextResponse } from "next/server";
import { getPortfolioResponse } from "@/lib/get-portfolio-response";

export async function GET() {
  try {
    const payload = await getPortfolioResponse();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/portfolio failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 },
    );
  }
}
