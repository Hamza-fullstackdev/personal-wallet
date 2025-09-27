"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

interface Loan {
  _id: string;
  name: string;
  balance: number;
  reason: string;
  date: string;
  return: string;
  status: string;
}

export default function ViewLoan() {
  const [loans, setLoans] = useState([]);
  const getUserLoans = async () => {
    const res = await fetch("/api/user/loan/history");
    const data = await res.json();
    setLoans(data.loans);
  };

  useEffect(() => {
    getUserLoans();
  }, []);
  return (
    <section className='my-10'>
      <h1 className='text-2xl font-bold'>Loan History</h1>
      <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {loans.length > 0 &&
          loans.map((loan: Loan) => (
            <Card
              key={loan._id}
              className='relative border shadow-md hover:shadow-lg transition rounded-xl'
            >
              <span
                className={`absolute top-3 right-3 capitalize text-xs font-medium px-3 py-1 rounded-full ${
                  loan.status === "returned"
                    ? "bg-green-100 text-green-600"
                    : loan.status === "pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {loan.status}
              </span>

              <CardHeader>
                <CardTitle className='capitalize text-lg'>
                  {loan.name}
                </CardTitle>
                <CardDescription className='capitalize text-sm text-gray-500'>
                  {loan.reason}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div>
                  <p className='text-2xl font-bold text-gray-800'>
                    Rs {loan.balance.toLocaleString()}
                  </p>
                </div>
                <div className='flex justify-between text-sm'>
                  <div>
                    <p className='text-gray-500'>Paid Date</p>
                    <p className='font-medium'>
                      {new Date(loan.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-gray-500'>Expected Return</p>
                    <p className='font-medium'>
                      {new Date(loan.return).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </section>
  );
}
