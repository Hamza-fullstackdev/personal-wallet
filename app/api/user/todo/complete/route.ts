import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Category from "@/app/model/Category";
import Notification from "@/app/model/Notification";
import Todo from "@/app/model/Todo";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  const userId = await verifyUser();
  const { todoId, amount, categoryId } = await request.json();

  if (!todoId || !categoryId) {
    return NextResponse.json(
      { message: "Todo and category are required" },
      { status: 400 },
    );
  }

  const numeric = Number(amount);
  if (amount === undefined || amount === "" || !Number.isFinite(numeric) || numeric <= 0) {
    return NextResponse.json(
      { message: "Enter a valid amount" },
      { status: 400 },
    );
  }

  try {
    const todo = await Todo.findOne({ _id: todoId, userId });
    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    if (todo.status === "completed") {
      return NextResponse.json(
        { message: "This todo is already completed" },
        { status: 400 },
      );
    }

    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    category.balance = Number(category.balance) - numeric;

    todo.status = "completed";
    todo.spentAmount = numeric;
    todo.categoryId = category._id;
    todo.completedAt = new Date();

    await Notification.create({
      userId,
      type: "investment",
      title: `Rs ${numeric} invested in ${todo.title}`,
      message: `Deducted from ${category.name}`,
    });

    await category.save();
    await todo.save();

    return NextResponse.json({ todo, category }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
