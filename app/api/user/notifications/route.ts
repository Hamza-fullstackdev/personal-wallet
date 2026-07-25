import { NextResponse } from "next/server";
import { connectToDatabase } from "../../utils/db";
import { verifyUser } from "../../utils/verify-user";
import Notification from "@/app/model/Notification";

export async function GET(req: Request) {
  await connectToDatabase();
  const userId = await verifyUser();

  try {
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const limit = Math.max(
      parseInt(url.searchParams.get("limit") || "10", 10),
      1,
    );

    const filter = { userId };

    const totalItems = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      { notifications, meta: { totalItems, totalPages, page, perPage: limit } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
