import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Category from "@/app/model/Category";
import Loan from "@/app/model/Loan";
import Notification from "@/app/model/Notification";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  await verifyUser();
  const { categoryId, loanId, balance } = await request.json();
  try {
    const loan = await Loan.findById(loanId);
    const category = await Category.findById(categoryId);
    if (!loan) {
      return NextResponse.json({ message: "Loan not found" }, { status: 404 });
    }
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    loan.status = "returned";
    category.balance = Number(category.balance) + Number(balance);
    await Notification.create({
      userId: loan.userId,
      type: "return",
      title: `Loan returned`,
      message: `${loan.name} loan has returned loan of Rs ${balance}, deposited in ${category.name}`,
    });
    await loan.save();
    await category.save();
    return NextResponse.json({ loan }, { status: 201 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
