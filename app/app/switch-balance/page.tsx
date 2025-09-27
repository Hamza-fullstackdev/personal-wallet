"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  balance: number;
}
export default function SwitchBalance() {
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
      const res = await fetch(`/api/user/category/switch`, {
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
      <h1 className='text-2xl font-bold'>Switch Balance</h1>
      <div className='mt-5'>
        <Card className='w-full md:w-[500px] mx-auto'>
          <CardContent>
            <form onSubmit={handleFormData}>
              <div>
                <div className='my-3 flex flex-col gap-1.5'>
                  <Label htmlFor='balance'>Amount</Label>
                  <Input
                    type='number'
                    name='balance'
                    id='balance'
                    autoComplete='off'
                    required
                    placeholder='Enter amount'
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                  />
                </div>
                <Select
                  name='categoryId'
                  onValueChange={(e) => setFormData({ ...formData, from: e })}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select from category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name} ({category.balance})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className='my-5 flex items-center justify-center'>
                  <ArrowLeftRight className='w-6 h-6 text-gray-500' />
                </div>
                <Select
                  name='categoryId'
                  onValueChange={(e) => setFormData({ ...formData, to: e })}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Destination category' />
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
              <div className='mt-5'>
                <button
                  type='submit'
                  className='w-full py-3 px-4 bg-gradient-to-r from-[#524ffe] to-[#3a287a] cursor-pointer text-white rounded-full text-sm'
                >
                  Switch
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
