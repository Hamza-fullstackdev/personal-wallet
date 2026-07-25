"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";

interface Notification {
  _id: string;
  createdAt: string;
  type: string;
  title: string;
  message: string;
  userId: string;
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
  notifications: Notification[];
  meta: PaginationMeta;
  filters: {
    types: string[];
  };
}

export default function History() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);

  const recordsPerPage = 10;

  const buildQueryParams = useCallback(
    (page: number = 1): URLSearchParams => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", recordsPerPage.toString());

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      if (typeFilter && typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      return params;
    },
    [searchTerm, typeFilter, startDate, endDate, sortBy, sortOrder],
  );

  const getUserNotifications = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params = buildQueryParams(page);
        const res = await fetch(`/api/user/notifications?${params.toString()}`);
        const data: ApiResponse = await res.json();

        setNotifications(data.notifications || []);
        setMeta(
          data.meta || {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            perPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        );
        setAvailableTypes(data.filters?.types || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams],
  );

  useEffect(() => {
    getUserNotifications(1);
  }, [
    searchTerm,
    typeFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    getUserNotifications,
  ]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= meta.totalPages) {
      getUserNotifications(page);
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
    setTypeFilter("all");
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
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
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='font-bold text-3xl text-gray-800'>History</h1>
          </div>
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
                placeholder='Search by title/message'
                className='bg-white border border-gray-300 focus-visible:ring-1'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
            </div>

            {/* Type Filter */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium text-gray-700'>Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='bg-white border border-gray-300'>
                  <SelectValue placeholder='All Types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
        <div className='mb-4 text-sm text-gray-600'>
          Showing <span className='font-semibold'>{startRecord}</span> to{" "}
          <span className='font-semibold'>{endRecord}</span> of{" "}
          <span className='font-semibold'>{meta.totalItems}</span> records
        </div>
      )}

      {/* Table Section */}
      <div className='mt-5 space-y-4'>
        <div className='overflow-x-auto rounded-lg'>
          <Table>
            <TableCaption>A list of your recent notifications.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length > 0 ? (
                notifications.map((notification: Notification) => (
                  <TableRow key={notification._id}>
                    <TableCell>
                      {new Date(notification.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell className='capitalize'>
                      <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs'>
                        {notification.type}
                      </span>
                    </TableCell>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>{notification.message}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-8'>
                    <div className='text-gray-500'>
                      <p className='font-medium'>No notifications found</p>
                      <p className='text-sm mt-1'>Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Stats - Bottom Right */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div />
          <div className='text-sm text-gray-600'>
            Total Records:{" "}
            <span className='font-semibold'>{meta.totalItems}</span> | Total
            Pages: <span className='font-semibold'>{meta.totalPages}</span> |
            Current Page:{" "}
            <span className='font-semibold'>{meta.currentPage}</span>
          </div>
        </div>

        {/* Pagination Section */}
        {meta.totalPages > 1 && (
          <div className='flex flex-col items-center justify-center mt-8 gap-4'>
            <div className='text-sm text-gray-600'>
              Page <span className='font-semibold'>{meta.currentPage}</span> of{" "}
              <span className='font-semibold'>{meta.totalPages}</span>
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

                  {getPageItems(meta.totalPages, meta.currentPage).map((p) => (
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
                  ))}

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
      </div>
    </section>
  );
}
