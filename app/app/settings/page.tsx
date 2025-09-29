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
import { updateUser } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface Currency {
  _id: string;
  name: string;
  country: string;
  currency: string;
}

export default function Settings() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const router = useRouter();

  const getAllCurrencies = async () => {
    setLoading(true);
    const res = await fetch("/api/currency/get-all");
    const data = await res.json();
    setCurrencies(data.currencies);
    setLoading(false);
  };
  useEffect(() => {
    getAllCurrencies();
  }, []);

  const handleFormData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/user/update`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      dispatch(updateUser(data.user));
      router.push("/app");
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
      <h1 className='text-2xl font-bold'>Settings</h1>
      <div className='mt-5'>
        <form onSubmit={handleFormData} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='name'>Change Name</Label>
            <Input
              id='name'
              name='text'
              type='name'
              placeholder='name'
              defaultValue={user?.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='email'>Change Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='Email'
              defaultValue={user?.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='password'>Change Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              placeholder='password'
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='email'>Change Currency</Label>
            <Select
              name='currency'
              defaultValue={user?.currency}
              onValueChange={(e) => setFormData({ ...formData, currency: e })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select currency' />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency: Currency) => (
                  <SelectItem key={currency._id} value={currency.currency}>
                    {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <button
              type='submit'
              className='w-full py-3 px-4 bg-gradient-to-r from-[#524ffe] to-[#3a287a] cursor-pointer text-white rounded-full text-sm'
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
