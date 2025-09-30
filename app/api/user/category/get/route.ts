import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Category from "@/app/model/Category";
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
    const categories = await Category.find({ userId });

    if (user?.currency && currencies.length > 0) {
      const userCurrency = currencies.find((c) => c.currency === user.currency);
      if (userCurrency) {
        userCurrencyPrice = userCurrency.price;
      }
    }

    const formatValue = (value: number) =>
      user.currency === "PKR" ? value : Number(value.toFixed(2));

    const categoriesWithConvertedPrice = categories.map((category) => ({
      ...category.toObject(),
      balance: formatValue(category.balance * userCurrencyPrice),
    }));

    const totalBalance = categories.reduce(
      (acc, category) => acc + category.balance,
      0
    );

    const loans = await Loan.find({ userId, status: "pending" });
    const loanBalance = loans.reduce((acc, loan) => acc + loan.balance, 0);

    return NextResponse.json(
      {
        categories: categoriesWithConvertedPrice,
        totalBalance: formatValue(totalBalance * userCurrencyPrice),
        loanBalance: formatValue(loanBalance * userCurrencyPrice),
      },
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
