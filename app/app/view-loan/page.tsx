"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Category {
  _id: string;
  name: string;
  balance: number;
}
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
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const recordsPerPage = 9;
  const user = useSelector((state: any) => state.user); // eslint-disable-line @typescript-eslint/no-explicit-any
  const getUserLoans = async (page = 1) => {
    setLoading(true);
    const res = await fetch(
      `/api/user/loan/history?page=${page}&limit=${recordsPerPage}`,
    );
    const data = await res.json();
    setLoans(data.loans || []);
    setTotalPages(data.meta?.totalPages || 1);
    setLoading(false);
  };
  const getUserCategrories = async () => {
    setLoading(true);
    const res = await fetch("/api/user/category/get");
    const data = await res.json();
    setCategories(data.categories);
    setLoading(false);
  };

  useEffect(() => {
    getUserCategrories();
    getUserLoans(currentPage);
  }, [currentPage]);

  const handleFormData = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`/api/user/loan/return`, {
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
        getUserLoans(currentPage);
        setLoading(false);
      } else {
        alert(data.message);
        setLoading(false);
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      getUserLoans(page);
    }
  };

  const getPageItems = (tp: number, cp: number) => {
    const pages: number[] = [];
    const windowSize = 4;

    if (tp <= windowSize) {
      for (let i = 1; i <= tp; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(1, cp - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;

    if (end > tp) {
      end = tp;
      start = Math.max(1, end - windowSize + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
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
                    {user.currency} {loan.balance.toLocaleString()}
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
              {loan?.status === "pending" && (
                <CardFooter className='flex item-end justify-end'>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className='bg-green-500 text-white px-4 py-2 rounded text-sm cursor-pointer'>
                        Returned
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Please select how you returned the loan
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <Select
                            name='categoryId'
                            onValueChange={(e) =>
                              setFormData({
                                ...formData,
                                categoryId: e,
                                loanId: loan._id,
                                balance: loan.balance,
                              })
                            }
                          >
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select a category' />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category: Category) => (
                                <SelectItem
                                  key={category._id}
                                  value={category._id}
                                >
                                  {category.name} ({category.balance})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFormData}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              )}
            </Card>
          ))}
      </div>

      {totalPages > 1 && (
        <div className='flex justify-center mt-8'>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {getPageItems(totalPages, currentPage).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href='#'
                    isActive={currentPage === p}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}
