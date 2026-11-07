import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Todo from "@/app/model/Todo";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  const userId = await verifyUser();
  const { todoId, title, description, targetAmount, targetDate } =
    await request.json();

  if (!todoId) {
    return NextResponse.json({ message: "Todo id is required" }, { status: 400 });
  }

  try {
    const todo = await Todo.findOne({ _id: todoId, userId });
    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    if (todo.status === "completed") {
      return NextResponse.json(
        { message: "Completed todos cannot be edited" },
        { status: 400 },
      );
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return NextResponse.json(
          { message: "Title is required" },
          { status: 400 },
        );
      }
      todo.title = String(title).trim();
    }

    if (description !== undefined) {
      todo.description = String(description).trim();
    }

    if (targetAmount !== undefined) {
      const parsedTarget = targetAmount === "" ? 0 : Number(targetAmount);
      if (!Number.isFinite(parsedTarget) || parsedTarget < 0) {
        return NextResponse.json(
          { message: "Enter a valid target amount" },
          { status: 400 },
        );
      }
      todo.targetAmount = parsedTarget;
    }

    if (targetDate !== undefined) {
      todo.targetDate = targetDate ? new Date(targetDate) : undefined;
    }

    await todo.save();
    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
