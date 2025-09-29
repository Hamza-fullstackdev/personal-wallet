import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Currencie from "@/app/model/Currencie";
import Loan from "@/app/model/Loan";
import User from "@/app/model/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  const userId = await verifyUser();
  let userCurrencyPrice = 1;

  try {
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

    const loans = await Loan.find({ userId }).sort({ createdAt: -1 });
    const loansWithConvertedBalance = loans.map((loan) => ({
      ...loan.toObject(),
      balance: formatValue(loan.balance * userCurrencyPrice),
    }));

    return NextResponse.json(
      { loans: loansWithConvertedBalance },
      { status: 200 }
    );
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
