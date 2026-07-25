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

    // Filtering parameters
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build filter object
    const filter: Record<string, unknown> = { userId };

    if (type && type !== "all") {
      filter.type = type;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = new Date(
          startDate,
        );
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (filter.createdAt as Record<string, unknown>).$lte = end;
      }
    }

    const totalItems = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    // Get unique notification types
    const types = await Notification.distinct("type", { userId });

    const notifications = await Notification.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        notifications,
        meta: {
          totalItems,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          types,
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
