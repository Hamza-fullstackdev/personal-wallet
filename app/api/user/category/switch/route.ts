import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Category from "@/app/model/Category";
import Notification from "@/app/model/Notification";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();
  const { from, to, balance } = await request.json();
  if (!from || !to || !balance) {
    return NextResponse.json(
      { message: "Please fill all fields" },
      { status: 400 }
    );
  }
  const userId = await verifyUser();
  try {
    const fromCategory = await Category.findById(from);
    const toCategory = await Category.findById(to);
    if (!fromCategory || !toCategory) {
      return NextResponse.json(
        { message: "Categories not found" },
        { status: 404 }
      );
    }
    fromCategory.balance = Number(fromCategory.balance) - Number(balance);
    toCategory.balance = Number(toCategory.balance) + Number(balance);
    await fromCategory.save();
    await toCategory.save();
    await Notification.create({
      userId,
      type: "switch",
      title: `Balance switched`,
      message: `Rs ${balance} Switched from ${fromCategory.name} to ${toCategory.name}`,
    });
    return NextResponse.json({ fromCategory, toCategory }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
