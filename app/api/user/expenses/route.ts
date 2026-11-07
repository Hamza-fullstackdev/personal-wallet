import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Notification from "@/app/model/Notification";
import { NextResponse } from "next/server";

type CalendarEntryType = "outgoing" | "investment" | "incoming";

function resolveRange(startParam: string | null, endParam: string | null) {
  const now = new Date();

  const start = startParam
    ? new Date(startParam)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endParam
    ? new Date(endParam)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return { start, end };
}

export async function GET(req: Request) {
  await connectToDatabase();
  const userId = await verifyUser();

  try {
    const url = new URL(req.url);
    const range = resolveRange(
      url.searchParams.get("startDate"),
      url.searchParams.get("endDate"),
    );

    if (!range) {
      return NextResponse.json(
        { message: "Invalid date range" },
        { status: 400 },
      );
    }

    const notifications = await Notification.find({
      userId,
      type: { $in: ["outgoing", "investment", "incoming"] },
      createdAt: { $gte: range.start, $lte: range.end },
    })
      .sort({ createdAt: 1 })
      .lean();

    const cleanNum = (str: string) => parseFloat(str.replace(/,/g, "")) || 0;

    const entries = notifications.map((notif) => {
      const title = notif.title || "";
      const message = notif.message || "";
      const type = notif.type as CalendarEntryType;
      const amountMatch = title.match(/Rs\s*([\d,.]+)/i);
      const categorySource = type === "investment" ? message : title;
      const categoryMatch = categorySource.match(
        /(?:deducted from|added in)\s*(.*)/i,
      );
      const investmentMatch = title.match(/invested in\s*(.*)/i);

      return {
        id: String(notif._id),
        date: new Date(notif.createdAt).toISOString(),
        amount: amountMatch ? cleanNum(amountMatch[1]) : 0,
        type,
        category: categoryMatch?.[1]?.trim() || "General",
        title,
        description:
          type === "investment"
            ? investmentMatch?.[1]?.trim() || message || title
            : message || title,
      };
    });

    return NextResponse.json(
      {
        expenses: entries,
        period: {
          startDate: range.start.toISOString(),
          endDate: range.end.toISOString(),
        },
      },
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
