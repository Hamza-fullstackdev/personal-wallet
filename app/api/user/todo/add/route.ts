import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Todo from "@/app/model/Todo";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  const userId = await verifyUser();
  const { title, description, targetAmount, targetDate } = await request.json();

  if (!title || !String(title).trim()) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }

  const parsedTarget = targetAmount === undefined || targetAmount === "" ? 0 : Number(targetAmount);
  if (!Number.isFinite(parsedTarget) || parsedTarget < 0) {
    return NextResponse.json(
      { message: "Enter a valid target amount" },
      { status: 400 },
    );
  }

  try {
    const todo = await Todo.create({
      userId,
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      targetAmount: parsedTarget,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
