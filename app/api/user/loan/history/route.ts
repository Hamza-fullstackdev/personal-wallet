import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Currencie from "@/app/model/Currencie";
import Loan from "@/app/model/Loan";
import User from "@/app/model/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectToDatabase();
  const userId = await verifyUser();
  let userCurrencyPrice = 1;

  try {
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const limit = Math.max(
      parseInt(url.searchParams.get("limit") || "9", 10),
      1,
    );

    // Filtering parameters
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const currencies = await Currencie.find();

    if (user?.currency && currencies.length > 0) {
      const userCurrency = currencies.find((c) => c.currency === user.currency);
      if (userCurrency) {
        userCurrencyPrice = userCurrency.price;
      }
    }

    const formatValue = (value: number) =>
      user.currency === "PKR" ? value : Number(value.toFixed(2));

    // Build filter object
    const filter: Record<string, unknown> = { userId };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        (filter.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (filter.date as Record<string, unknown>).$lte = end;
      }
    }

    const totalItems = await Loan.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    // Get unique loan statuses
    const statuses = await Loan.distinct("status", { userId });

    const loans = await Loan.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const loansWithConvertedBalance = loans.map((loan: any) => ({
      ...loan,
      balance: formatValue(loan.balance * userCurrencyPrice),
    }));

    return NextResponse.json(
      {
        loans: loansWithConvertedBalance,
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
