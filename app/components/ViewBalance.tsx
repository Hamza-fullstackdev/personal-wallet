"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  description: string;
  balance: number;
}
const ViewBalance = () => {
  const [categories, setCategories] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loanBalance, setLoanBalance] = useState(0);
  const getUserCategrories = async () => {
    const res = await fetch("/api/user/category/get");
    const data = await res.json();
    setCategories(data.categories);
    setTotalBalance(data.totalBalance);
    setLoanBalance(data.loanBalance);
  };
  useEffect(() => {
    getUserCategrories();
  }, []);
  return (
    <>
      <h1 className='text-2xl md:text-3xl font-bold'>Financial Overview</h1>
      <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>Overall balance</CardDescription>
            <CardAction className='text-sm'>View details</CardAction>
          </CardHeader>
          <CardContent>
            <div>
              <div className='text-2xl font-bold'>
                Rs {totalBalance.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
        {categories.length > 0 &&
          categories?.map((category: Category) => (
            <Card key={category._id}>
              <CardHeader>
                <CardTitle className='capitalize'>{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
                <CardAction className='text-sm'>View details</CardAction>
              </CardHeader>
              <CardContent>
                <div>
                  <div className='text-2xl font-bold'>
                    Rs {category.balance.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        <Card>
          <CardHeader>
            <CardTitle>Loan Given</CardTitle>
            <CardDescription>To friends, collegues etc</CardDescription>
            <CardAction className='text-sm'>
              <Link href='/app/view-loan'>View details</Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div>
              <div className='text-2xl font-bold'>
                Rs {loanBalance.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ViewBalance;
