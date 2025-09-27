import { connectToDatabase } from "@/app/api/utils/db";
import Category from "@/app/model/Category";
import { NextResponse } from "next/server";
import { verifyUser } from "@/app/api/utils/verify-user";

export async function POST(request: Request) {
  await connectToDatabase();
  const { name, description, balance } = await request.json();
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    return NextResponse.json(
      { message: "Category already exists" },
      { status: 400 }
    );
  }
  try {
    const userId = await verifyUser();
    const category = await Category.create({
      userId,
      name,
      slug,
      description,
      balance,
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
