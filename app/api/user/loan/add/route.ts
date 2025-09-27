import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Category from "@/app/model/Category";
import Loan from "@/app/model/Loan";
import Notification from "@/app/model/Notification";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  const {
    name,
    reason,
    balance,
    categoryId,
    date,
    return: returnDate,
  } = await request.json();
  if (!name || !reason || !balance || !categoryId || !date || !returnDate) {
    return NextResponse.json(
      { message: "Please fill all fields" },
      { status: 400 }
    );
  }
  const userId = await verifyUser();
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    category.balance = Number(category.balance) - Number(balance);
    await Loan.create({
      userId,
      name,
      reason,
      balance,
      categoryId,
      date,
      return: returnDate,
    });
    await Notification.create({
      userId,
      type: "loan",
      title: `Loan balance deducted from ${category.name}`,
      message: reason,
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
