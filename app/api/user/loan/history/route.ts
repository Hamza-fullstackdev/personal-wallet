import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Loan from "@/app/model/Loan";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  const userId = await verifyUser();
  try {
    const loans = await Loan.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ loans }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
