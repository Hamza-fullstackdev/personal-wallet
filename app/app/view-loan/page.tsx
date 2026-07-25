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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
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

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  loans: Loan[];
  meta: PaginationMeta;
  filters: {
    statuses: string[];
  };
}

export default function ViewLoan() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<PaginationMeta>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 9,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const recordsPerPage = 9;
  const user = useSelector((state: any) => state.user); // eslint-disable-line @typescript-eslint/no-explicit-any

  const buildQueryParams = useCallback(
    (page: number = 1): URLSearchParams => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", recordsPerPage.toString());

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      params.append("sortBy", "createdAt");
      params.append("sortOrder", sortOrder);

      return params;
    },
    [searchTerm, statusFilter, startDate, endDate, sortOrder],
  );

  const getUserLoans = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params = buildQueryParams(page);
        const res = await fetch(`/api/user/loan/history?${params.toString()}`);
        const data: ApiResponse = await res.json();
        setLoans(data.loans || []);
        setMeta(
          data.meta || {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            perPage: 9,
            hasNextPage: false,
            hasPrevPage: false,
          },
        );
        setAvailableStatuses(data.filters?.statuses || []);
      } catch (error) {
        console.error("Failed to fetch loans:", error);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams],
  );

  const getUserCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/category/get");
      const data = await res.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserCategories();
  }, []);

  useEffect(() => {
    getUserLoans(1);
  }, [searchTerm, statusFilter, startDate, endDate, sortOrder, getUserLoans]);

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
        getUserLoans(meta.currentPage);
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
    if (page >= 1 && page <= meta.totalPages) {
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

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setSortOrder("desc");
  };

  const startRecord = (meta.currentPage - 1) * meta.perPage + 1;
  const endRecord = Math.min(meta.currentPage * meta.perPage, meta.totalItems);

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

      {/* Header Section */}
      <div className='mb-8'>
        <div className='mb-6'>
          <h1 className='font-bold text-3xl text-gray-800'>Loan History</h1>
        </div>

        {/* Filters Section */}
        <div className='bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {/* Search Filter */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                Search
              </label>
              <Input
                type='search'
                placeholder='Search by name/reason'
                className='bg-white border border-gray-300 focus-visible:ring-1'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
            </div>

            {/* Status Filter */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='bg-white border border-gray-300'>
                  <SelectValue placeholder='All Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      <span className='capitalize'>{status}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                From Date
              </label>
              <Input
                type='date'
                className='bg-white border border-gray-300 focus-visible:ring-1'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date Filter */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>
                To Date
              </label>
              <Input
                type='date'
                className='bg-white border border-gray-300 focus-visible:ring-1'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Sort Options */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>Sort</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className='bg-white border border-gray-300'>
                  <SelectValue placeholder='Sort Order' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>Newest First</SelectItem>
                  <SelectItem value='asc'>Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className='flex gap-2'>
            <Button
              onClick={handleResetFilters}
              variant='outline'
              className='text-gray-700 border-gray-300 hover:bg-gray-100'
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Records Info */}
      {meta.totalItems > 0 && (
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='text-sm text-gray-600'>
              Showing <span className='font-semibold'>{startRecord}</span> to{" "}
              <span className='font-semibold'>{endRecord}</span> of{" "}
              <span className='font-semibold'>{meta.totalItems}</span> records
            </div>
            <div className='text-sm text-gray-600'>
              Total Records:{" "}
              <span className='font-semibold'>{meta.totalItems}</span> | Total
              Pages: <span className='font-semibold'>{meta.totalPages}</span> |
              Current Page:{" "}
              <span className='font-semibold'>{meta.currentPage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className='mt-5'>
        {loans.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              {loans.map((loan: Loan) => (
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

            {/* Pagination Section */}
            {meta.totalPages > 1 && (
              <div className='flex flex-col items-center justify-center mt-8 gap-4'>
                <div className='text-sm text-gray-600'>
                  Page <span className='font-semibold'>{meta.currentPage}</span>{" "}
                  of <span className='font-semibold'>{meta.totalPages}</span>
                </div>
                <div className='overflow-x-auto'>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            if (meta.hasPrevPage) {
                              goToPage(meta.currentPage - 1);
                            }
                          }}
                          className={
                            !meta.hasPrevPage
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {getPageItems(meta.totalPages, meta.currentPage).map(
                        (p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href='#'
                              isActive={meta.currentPage === p}
                              onClick={(e) => {
                                e.preventDefault();
                                goToPage(p);
                              }}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            if (meta.hasNextPage) {
                              goToPage(meta.currentPage + 1);
                            }
                          }}
                          className={
                            !meta.hasNextPage
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className='text-center py-12'>
            <p className='text-gray-500 font-medium'>No loans found</p>
            <p className='text-sm text-gray-400 mt-1'>
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
