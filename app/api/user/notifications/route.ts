import { NextResponse } from "next/server";
import { connectToDatabase } from "../../utils/db";
import { verifyUser } from "../../utils/verify-user";
import Notification from "@/app/model/Notification";

export async function GET() {
  await connectToDatabase();
  const userId = await verifyUser();
  try {
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
