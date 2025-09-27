import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Category from "@/app/model/Category";
import Notification from "@/app/model/Notification";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  const userId = await verifyUser();
  const { balance, categoryId, description } = await request.json();
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    category.balance = Number(category.balance) - Number(balance);
    await Notification.create({
      userId,
      type: "outgoing",
      title: `Balance deducted from ${category.name}`,
      message: description,
    });
    await category.save();
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
