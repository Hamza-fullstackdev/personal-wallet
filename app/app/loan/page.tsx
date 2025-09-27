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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  balance: number;
}
export default function AddLoan() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useRouter();
  const getUserCategrories = async () => {
    const res = await fetch("/api/user/category/get");
    const data = await res.json();
    setCategories(data.categories);
  };
  useEffect(() => {
    getUserCategrories();
  }, []);

  const handleFormData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/user/loan/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        navigate.push("/app");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };
  return (
    <section className='my-10'>
      <h1 className='text-2xl font-bold'>Loan Management</h1>
      <form className='mt-5 flex flex-col gap-4' onSubmit={handleFormData}>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='name'>Loan Receipant</Label>
          <Input
            className='mt-2'
            type='text'
            id='name'
            name='name'
            placeholder='Loan Receiver'
            required
            autoComplete='off'
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='reason'>Reason for loan</Label>
          <Input
            className='mt-2'
            type='text'
            id='reason'
            name='reason'
            placeholder='Reason for loan'
            required
            autoComplete='off'
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='balance'>Loan Amount</Label>
          <Input
            className='mt-2'
            type='number'
            id='balance'
            name='balance'
            required
            autoComplete='off'
            placeholder='Enter loan amount'
            onChange={(e) =>
              setFormData({ ...formData, balance: e.target.value })
            }
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='categoryId'>Paying from</Label>
          <Select
            name='categoryId'
            onValueChange={(e) => setFormData({ ...formData, categoryId: e })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select paying account' />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: Category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name} ({category.balance})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='date'>Date</Label>
          <Input
            className='mt-2'
            type='date'
            id='date'
            name='date'
            required
            autoComplete='off'
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='return'>Expected Return</Label>
          <Input
            className='mt-2'
            type='date'
            id='return'
            name='return'
            required
            autoComplete='off'
            onChange={(e) =>
              setFormData({ ...formData, return: e.target.value })
            }
          />
        </div>
        <div className='mt-1'>
          <button
            type='submit'
            className='w-full py-3 px-4 bg-gradient-to-r from-[#524ffe] to-[#3a287a] cursor-pointer text-white rounded-full text-sm'
          >
            Give Loan
          </button>
        </div>
      </form>
    </section>
  );
}
