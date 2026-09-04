import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Loan from "@/app/model/Loan";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  const userId = await verifyUser();

  try {
    const names: string[] = await Loan.distinct("name", { userId });
    names.sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ people: names }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch loan people:", error);
    return NextResponse.json(
      { message: "Failed to fetch people" },
      { status: 500 }
    );
  }
}
