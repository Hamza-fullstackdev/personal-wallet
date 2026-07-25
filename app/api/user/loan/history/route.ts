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

    const filter = { userId };
    const totalItems = await Loan.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const loans = await Loan.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const loansWithConvertedBalance = loans.map((loan) => ({
      ...loan.toObject(),
      balance: formatValue(loan.balance * userCurrencyPrice),
    }));

    return NextResponse.json(
      {
        loans: loansWithConvertedBalance,
        meta: { totalItems, totalPages, page, perPage: limit },
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
