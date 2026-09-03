"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  balance: number;
}

export default function BankStatement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [periodFilter, setPeriodFilter] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getUserCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/category/get");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyPeriod = (val: string) => {
    setPeriodFilter(val);
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    if (val === "30") {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (val === "60") {
      const past = new Date();
      past.setDate(today.getDate() - 60);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (val === "90") {
      const past = new Date();
      past.setDate(today.getDate() - 90);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (val === "all") {
      setStartDate("");
      setEndDate("");
    }
  };

  useEffect(() => {
    getUserCategories();
    // Default to Last 30 Days
    applyPeriod("30");
  }, []);

  const handleDownloadPDF = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setDownloading(true);

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const res = await fetch(
        `/api/user/bank-statement/pdf?${params.toString()}`
      );
      if (!res.ok) {
        alert("Failed to generate statement");
        setDownloading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bank-statement-${startDate || "all"}-to-${
        endDate || "today"
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDownloading(false);
    } catch {
      alert("Something went wrong generating statement");
      setDownloading(false);
    }
  };

  return (
    <section className='my-10'>
      {(loading || downloading) && (
        <div className='fixed inset-0 z-50 flex items-center justify-center animate-fadeIn'>
          <div className='absolute inset-0 bg-black/40'></div>
          <div className='relative z-10'>
            <div className='h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin'></div>
          </div>
        </div>
      )}

      <h1 className='text-2xl font-bold'>Bank Statement</h1>

      <form className='mt-5 flex flex-col gap-4' onSubmit={handleDownloadPDF}>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='periodFilter'>Filter by Period</Label>
          <Select value={periodFilter} onValueChange={applyPeriod}>
            <SelectTrigger className='w-full mt-2'>
              <SelectValue placeholder='Select Period' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='30'>Last 30 Days</SelectItem>
              <SelectItem value='60'>Last 60 Days</SelectItem>
              <SelectItem value='90'>Last 90 Days</SelectItem>
              <SelectItem value='all'>All Time</SelectItem>
              <SelectItem value='custom'>Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor='startDate'>From Date</Label>
          <Input
            className='mt-2'
            type='date'
            id='startDate'
            name='startDate'
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPeriodFilter("custom");
            }}
          />
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor='endDate'>To Date</Label>
          <Input
            className='mt-2'
            type='date'
            id='endDate'
            name='endDate'
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPeriodFilter("custom");
            }}
          />
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor='typeFilter'>Movement Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-full mt-2'>
              <SelectValue placeholder='All Movements' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Movements</SelectItem>
              <SelectItem value='incoming'>Incomings</SelectItem>
              <SelectItem value='outgoing'>Outgoings</SelectItem>
              <SelectItem value='loan'>Loan Given</SelectItem>
              <SelectItem value='return'>Loan Returned</SelectItem>
              <SelectItem value='switch'>Balance Switch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor='categoryFilter'>Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='w-full mt-2'>
              <SelectValue placeholder='All Categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((category: Category) => (
                <SelectItem key={category._id} value={category.name}>
                  {category.name} ({category.balance})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='mt-2'>
          <button
            type='submit'
            disabled={downloading}
            className='w-full py-3 px-4 bg-gradient-to-r from-[#524ffe] to-[#3a287a] cursor-pointer text-white rounded-full text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60'
          >
            {downloading
              ? "Generating PDF Statement..."
              : "Download Bank Statement"}
          </button>
        </div>
      </form>
    </section>
  );
}
