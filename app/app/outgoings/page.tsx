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
export default function Outgoing() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useRouter();
  const getUserCategrories = async () => {
    setLoading(true);
    const res = await fetch("/api/user/category/get");
    const data = await res.json();
    setCategories(data.categories);
    setLoading(false);
  };
  useEffect(() => {
    getUserCategrories();
  }, []);

  const handleFormData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`/api/user/outgoings/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        navigate.push("/app");
      } else {
        alert(data.message);
        setLoading(false);
      }
    } catch {
      alert("Something went wrong");
      setLoading(false);
    }
  };
  return (
    <section className='my-10'>
      {loading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center animate-fadeIn'>
          <div className='absolute inset-0 bg-black/40'></div>
          <div className='relative z-10'>
            <div className='h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin'></div>
          </div>
        </div>
      )}
      <h1 className='text-2xl font-bold'>Outgoings</h1>
      <form className='mt-5 flex flex-col gap-4' onSubmit={handleFormData}>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='description'>Label Outgoings</Label>
          <Input
            className='mt-2'
            type='text'
            id='description'
            name='description'
            placeholder='Specify Incomings'
            required
            autoComplete='off'
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='balance'>Outgoing Amount</Label>
          <Input
            className='mt-2'
            type='number'
            id='balance'
            name='balance'
            required
            autoComplete='off'
            placeholder='Enter outgoing amount'
            onChange={(e) =>
              setFormData({ ...formData, balance: e.target.value })
            }
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label htmlFor='categoryId'>Outgoing from</Label>
          <Select
            name='categoryId'
            onValueChange={(e) => setFormData({ ...formData, categoryId: e })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Outgoing from' />
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
        <div className='mt-1'>
          <button
            type='submit'
            className='w-full py-3 px-4 bg-gradient-to-r from-[#524ffe] to-[#3a287a] cursor-pointer text-white rounded-full text-sm'
          >
            Add Outcomings
          </button>
        </div>
      </form>
    </section>
  );
}
