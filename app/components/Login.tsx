"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/lib/features/user/userSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const Login = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleFormData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/login`, {
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
        dispatch(loginUser(data.user));
        router.push("/app");
      } else {
        setErrorMessage(data.message);
        setError(true);
        setLoading(false);
      }
    } catch {
      setLoading(false);
      alert("Something went wrong");
    }
  };
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      {loading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center animate-fadeIn'>
          <div className='absolute inset-0 bg-black/40'></div>
          <div className='relative z-10'>
            <div className='h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin'></div>
          </div>
        </div>
      )}
      <div className='w-full max-w-md rounded-2xl p-6 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-700'>
        <div className='my-4'>
          <div className='flex items-center justify-center'>
            <h1 className='text-2xl font-bold'>Login to wallet</h1>
          </div>
          <div className='mt-2 flex items-center justify-center'>
            <svg width='33' height='6' xmlns='https://www.w3.org/2000/svg'>
              <defs>
                <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                  <stop offset='0%' stopColor='#3a287a'></stop>
                  <stop offset='100%' stopColor='#3a287a'></stop>
                </linearGradient>
              </defs>
              <path
                d='M33 1c-3.3 0-3.3 4-6.598 4C23.1 5 23.1 1 19.8 1c-3.3 0-3.3 4-6.599 4-3.3 0-3.3-4-6.6-4S3.303 5 0 5'
                stroke='url(#gradient)'
                strokeWidth='2'
                fill='none'
              ></path>
            </svg>
          </div>
        </div>
        {error && (
          <div className='mb-3 flex items-center rounded-lg bg-red-100 text-red-300 p-4'>
            <span className='font-normal text-sm'>{errorMessage}</span>
          </div>
        )}
        <form className='space-y-4' onSubmit={handleFormData}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              autoComplete='on'
              placeholder='Enter your email'
              required
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              placeholder='Enter your password'
              required
              autoComplete='on'
              onChange={handleChange}
            />
          </div>

          <button
            disabled={loading}
            type='submit'
            className='w-full from-[#524ffe] to-[#3a287a] bg-gradient-to-r py-2 px-4 rounded-md text-white hover:bg-gradient-to-r hover:from-[#524ffe] hover:to-[#3a287a] cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
