import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Todo from "@/app/model/Todo";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectToDatabase();
  const userId = await verifyUser();

  try {
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const limit = Math.max(
      parseInt(url.searchParams.get("limit") || "20", 10),
      1,
    );

    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = { userId };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const totalItems = await Todo.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const statuses = await Todo.distinct("status", { userId });

    const todos = await Todo.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        todos,
        meta: {
          totalItems,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          statuses,
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
