import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import BankStatementPDF from "@/app/components/pdf/BankStatementPDF";
import { connectToDatabase } from "@/app/api/utils/db";
import { verifyUser } from "@/app/api/utils/verify-user";
import Notification from "@/app/model/Notification";
import Category from "@/app/model/Category";
import Currencie from "@/app/model/Currencie";
import Loan from "@/app/model/Loan";
import User from "@/app/model/User";
import mongoose from "mongoose";
import type { StatementData, StatementItem } from "../data/route";

function parseNotification(
  notif: any,
  rate: number,
  currency: string
) {
  const title = notif.title || "";
  const message = notif.message || "";
  const type = notif.type;

  let amount = 0;
  let category = "General";
  let debit = 0;
  let credit = 0;
  let typeLabel = "Transaction";
  let description = message || title;

  const cleanNum = (str: string) => parseFloat(str.replace(/,/g, "")) || 0;

  if (type === "incoming") {
    typeLabel = "Incoming (Credit)";
    const match = title.match(/Rs\s*([\d,.]+)\s*balance added in\s*(.*)/i);
    if (match) {
      amount = cleanNum(match[1]);
      category = match[2]?.trim() || "General";
    } else {
      const fallback = title.match(/Rs\s*([\d,.]+)/i);
      amount = fallback ? cleanNum(fallback[1]) : 0;
    }
    credit = amount;
    description = message && message !== title ? message : "Deposit / Inflow";
  } else if (type === "outgoing") {
    typeLabel = "Outgoing (Debit)";
    const match = title.match(/Rs\s*([\d,.]+)\s*balance deducted from\s*(.*)/i);
    if (match) {
      amount = cleanNum(match[1]);
      category = match[2]?.trim() || "General";
    } else {
      const fallback = title.match(/Rs\s*([\d,.]+)/i);
      amount = fallback ? cleanNum(fallback[1]) : 0;
    }
    debit = amount;
    description = message && message !== title ? message : "Expense / Withdrawal";
  } else if (type === "loan") {
    typeLabel = "Loan Given (Debit)";
    const match = title.match(
      /(?:Loan balance of\s*)?Rs\s*([\d,.]+)\s*(?:balance\s*)?deducted from\s*(.*)/i
    );
    if (match) {
      amount = cleanNum(match[1]);
      category = match[2]?.trim() || "Loan";
    } else {
      const fallback = title.match(/Rs\s*([\d,.]+)/i);
      amount = fallback ? cleanNum(fallback[1]) : 0;
    }
    debit = amount;
    description = message ? `Loan to: ${message}` : "Loan Given";
  } else if (type === "return") {
    typeLabel = "Loan Returned (Credit)";
    const match = message.match(
      /returned loan of Rs\s*([\d,.]+),\s*deposited in\s*(.*)/i
    );
    if (match) {
      amount = cleanNum(match[1]);
      category = match[2]?.trim() || "General";
    } else {
      const fallback = (title + " " + message).match(/Rs\s*([\d,.]+)/i);
      amount = fallback ? cleanNum(fallback[1]) : 0;
    }
    credit = amount;
    description = message || "Loan Repayment Received";
  } else if (type === "switch") {
    typeLabel = "Balance Switched";
    const match = message.match(/Rs\s*([\d,.]+)\s*Switched from\s*(.*?)\s*to\s*(.*)/i);
    if (match) {
      amount = cleanNum(match[1]);
      category = `${match[2]?.trim()} → ${match[3]?.trim()}`;
    } else {
      const fallback = message.match(/Rs\s*([\d,.]+)/i);
      amount = fallback ? cleanNum(fallback[1]) : 0;
    }
    debit = 0;
    credit = 0;
    description = message || "Internal Category Transfer";
  } else {
    typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const fallback = (title + " " + message).match(/Rs\s*([\d,.]+)/i);
    amount = fallback ? cleanNum(fallback[1]) : 0;
    description = message || title;
  }

  const formatVal = (v: number) =>
    currency === "PKR" ? Math.round(v * rate) : Number((v * rate).toFixed(2));

  return {
    type: (["incoming", "outgoing", "loan", "return", "switch"].includes(type)
      ? type
      : "other") as StatementItem["type"],
    typeLabel,
    category,
    amount: formatVal(amount),
    debit: formatVal(debit),
    credit: formatVal(credit),
    description,
  };
}

export async function GET(req: Request) {
  await connectToDatabase();
  const userId = await verifyUser();

  try {
    const url = new URL(req.url);
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    const categoryFilter = url.searchParams.get("category");
    const typeFilter = url.searchParams.get("type");
    const personFilter = url.searchParams.get("person");

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let rate = 1;
    const currencies = await Currencie.find();
    if (user.currency && user.currency !== "PKR" && currencies.length > 0) {
      const curr = currencies.find((c) => c.currency === user.currency);
      if (curr) {
        rate = curr.price;
      }
    }

    const formatVal = (v: number) =>
      user.currency === "PKR" ? Math.round(v * rate) : Number((v * rate).toFixed(2));

    const categories = await Category.find({ userId });
    const currentTotalBalance = categories.reduce(
      (sum, cat) => sum + (Number(cat.balance) || 0),
      0
    );

    const allNotifications = await Notification.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    const allLedger = allNotifications.map((notif) => {
      const parsed = parseNotification(notif, rate, user.currency);
      return {
        id: String(notif._id),
        date: new Date(notif.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
        rawDate: notif.createdAt.toISOString(),
        title: notif.title,
        ...parsed,
      };
    });

    let startTimestamp = 0;
    let endTimestamp = Infinity;

    if (startDateParam) {
      const s = new Date(startDateParam);
      s.setHours(0, 0, 0, 0);
      startTimestamp = s.getTime();
    }

    if (endDateParam) {
      const e = new Date(endDateParam);
      e.setHours(23, 59, 59, 999);
      endTimestamp = e.getTime();
    }

    const isPersonFilter = Boolean(personFilter && personFilter !== "all");

    const futureChanges = allLedger.filter((item) => {
      const itemTime = new Date(item.rawDate).getTime();
      return itemTime >= startTimestamp;
    });

    const netChangeSinceStart = futureChanges.reduce(
      (acc, item) => acc + (item.credit - item.debit),
      0
    );

    const openingBalance = formatVal(currentTotalBalance) - netChangeSinceStart;

    let filteredTransactions = allLedger.filter((item) => {
      const itemTime = new Date(item.rawDate).getTime();
      return itemTime >= startTimestamp && itemTime <= endTimestamp;
    });

    if (typeFilter && typeFilter !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.type === typeFilter
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    let personOpeningOutstanding = 0;

    if (isPersonFilter && personFilter) {
      const personLoans = await Loan.find({
        userId: new mongoose.Types.ObjectId(String(userId)),
        name: { $regex: new RegExp(`^${personFilter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      }).lean();

      const personReasons = new Set(
        personLoans.map((l: any) => (l.reason || "").trim().toLowerCase())
      );

      const isPersonTx = (t: any) => {
        if (t.type === "loan") {
          return personReasons.has((t.description || "").replace(/^Loan to:\s*/i, "").trim().toLowerCase());
        }
        if (t.type === "return") {
          const msgLower = (t.description || "").toLowerCase();
          return msgLower.startsWith(personFilter.toLowerCase());
        }
        return false;
      };

      const priorPersonTxs = allLedger.filter((item) => {
        const itemTime = new Date(item.rawDate).getTime();
        return itemTime < startTimestamp && isPersonTx(item);
      });

      personOpeningOutstanding = priorPersonTxs.reduce(
        (acc, item) => acc + (item.debit - item.credit),
        0
      );

      filteredTransactions = filteredTransactions.filter(isPersonTx).map((item) => ({
        ...item,
        category: "Loan Record",
      }));
    }
    let running = isPersonFilter ? personOpeningOutstanding : openingBalance;
    const transactionsWithRunningBalance: StatementItem[] = filteredTransactions.map(
      (item) => {
        if (isPersonFilter) {
          running = running + item.debit - item.credit;
        } else {
          running = running + item.credit - item.debit;
        }
        return {
          ...item,
          runningBalance: Number(running.toFixed(2)),
        };
      }
    );

    const totalIncoming = isPersonFilter
      ? 0
      : filteredTransactions
        .filter((t) => t.type === "incoming")
        .reduce((sum, t) => sum + t.credit, 0);

    const totalOutgoing = isPersonFilter
      ? 0
      : filteredTransactions
        .filter((t) => t.type === "outgoing")
        .reduce((sum, t) => sum + t.debit, 0);

    const totalLoanGiven = filteredTransactions
      .filter((t) => t.type === "loan")
      .reduce((sum, t) => sum + t.debit, 0);

    const totalLoanReturned = filteredTransactions
      .filter((t) => t.type === "return")
      .reduce((sum, t) => sum + t.credit, 0);

    const totalCredit = filteredTransactions.reduce(
      (sum, t) => sum + t.credit,
      0
    );
    const totalDebit = filteredTransactions.reduce(
      (sum, t) => sum + t.debit,
      0
    );
    const netCashFlow = isPersonFilter
      ? totalLoanReturned - totalLoanGiven
      : totalCredit - totalDebit;

    const closingBalance = isPersonFilter
      ? Number(running.toFixed(2))
      : transactionsWithRunningBalance.length > 0
        ? transactionsWithRunningBalance[
          transactionsWithRunningBalance.length - 1
        ].runningBalance
        : openingBalance;

    const effectiveOpeningBalance = isPersonFilter
      ? Number(personOpeningOutstanding.toFixed(2))
      : Number(openingBalance.toFixed(2));

    const statementRef = `STMT-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${userId.toString().slice(-4).toUpperCase()}`;

    const statementData: StatementData = {
      accountHolder: {
        name: user.name || "Wallet User",
        email: user.email || "",
        currency: user.currency || "PKR",
      },
      filterPerson:
        personFilter && personFilter !== "all" ? personFilter : undefined,
      period: {
        startDate: startDateParam || (allLedger[0]?.rawDate?.slice(0, 10) ?? null),
        endDate: endDateParam || new Date().toISOString().slice(0, 10),
        statementDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        statementRef,
      },
      summary: {
        openingBalance: effectiveOpeningBalance,
        closingBalance: Number(closingBalance.toFixed(2)),
        totalIncoming: Number(totalIncoming.toFixed(2)),
        totalOutgoing: Number(totalOutgoing.toFixed(2)),
        totalLoanGiven: Number(totalLoanGiven.toFixed(2)),
        totalLoanReturned: Number(totalLoanReturned.toFixed(2)),
        totalCredit: Number(totalCredit.toFixed(2)),
        totalDebit: Number(totalDebit.toFixed(2)),
        netCashFlow: Number(netCashFlow.toFixed(2)),
        transactionCount: filteredTransactions.length,
      },
      categories: isPersonFilter
        ? []
        : categories.map((c) => ({
          id: String(c._id),
          name: c.name,
          balance: formatVal(Number(c.balance) || 0),
        })),
      transactions: transactionsWithRunningBalance,
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(BankStatementPDF, { data: statementData }) as any
    );

    const sanitizedPerson =
      personFilter && personFilter !== "all"
        ? `-${personFilter.replace(/[^a-zA-Z0-9_-]/g, "_")}`
        : "";

    const filename = `bank-statement${sanitizedPerson}-${startDateParam || "all"}-to-${endDateParam || "today"
      }.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { message: "Failed to render PDF" },
      { status: 500 }
    );
  }
}
