import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Todo from "@/app/model/Todo";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  const userId = await verifyUser();
  const { todoId } = await request.json();

  if (!todoId) {
    return NextResponse.json({ message: "Todo id is required" }, { status: 400 });
  }

  try {
    const todo = await Todo.findOneAndDelete({ _id: todoId, userId });
    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Todo deleted" }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
