import Currencie from "@/app/model/Currencie";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../utils/db";
export async function POST(req: Request) {
  await connectToDatabase();
  const { name, country, currency, symbol, price } = await req.json();
  try {
    const newCurrency = await Currencie.create({
      name,
      country,
      currency,
      symbol,
      price,
    });
    if (!newCurrency)
      return NextResponse.json(
        { message: "Error adding currency" },
        { status: 500 }
      );
    return NextResponse.json(
      { message: "Currency added successfully", currency: newCurrency },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
