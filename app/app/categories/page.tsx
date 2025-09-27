"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddCategory() {
  const [formData, setFormData] = useState({});
  const navigate = useRouter();
  const handleFormData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/user/category/add`, {
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
      <h1 className='text-2xl font-bold'>Add new category</h1>
      <form onSubmit={handleFormData}>
        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='name'>Category name</Label>
            <Input
              type='text'
              id='name'
              name='name'
              placeholder='Enter category name'
              required
              autoComplete='off'
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='description'>Category description</Label>
            <Input
              type='text'
              id='description'
              name='description'
              placeholder='Enter category description'
              required
              autoComplete='off'
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className='col-span-2 flex flex-col gap-1.5'>
            <Label htmlFor='balance'>Balance</Label>
            <Input
              type='number'
              id='balance'
              name='balance'
              placeholder='Enter category balance'
              required
              autoComplete='off'
              onChange={(e) =>
                setFormData({ ...formData, balance: e.target.value })
              }
            />
          </div>
        </div>
        <div className='mt-6'>
          <button
            type='submit'
            className='w-full py-3 px-4 bg-gradient-to-r from-[#524ffe] to-[#3a287a] cursor-pointer text-white rounded-full text-sm'
          >
            Add category
          </button>
        </div>
      </form>
    </section>
  );
}
