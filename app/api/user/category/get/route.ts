import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Category from "@/app/model/Category";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  const userId = await verifyUser();
  try {
    const categories = await Category.find({ userId });
    const totalBalance = categories.reduce(
      (acc, category) => acc + category.balance,
      0
    );
    return NextResponse.json({ categories, totalBalance }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
