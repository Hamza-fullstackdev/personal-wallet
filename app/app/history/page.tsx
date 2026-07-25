"use client";
import { Input } from "@/components/ui/input";
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
import { useEffect, useState } from "react";

interface Notification {
  _id: string;
  createdAt: string;
  type: string;
  title: string;
  message: string;
  userId: string;
}

export default function History() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const recordsPerPage = 10;

  const getUserNotifications = async (page = 1) => {
    setLoading(true);
    const res = await fetch(
      `/api/user/notifications?page=${page}&limit=${recordsPerPage}`,
    );
    const data = await res.json();
    setNotifications(data.notifications || []);
    setTotalPages(data.meta?.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    getUserNotifications(currentPage);
  }, [currentPage]);

  // filter applies only to the current page's notifications returned by server
  const filteredLogs = searchTerm
    ? notifications.filter((log: Notification) => {
        const lowerSearch = searchTerm.toLowerCase().trim();
        const createdAtString = new Date(log.createdAt)
          .toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          .toLowerCase();

        return (
          log?.type?.toString().toLowerCase().includes(lowerSearch) ||
          log?.title?.toLowerCase().includes(lowerSearch) ||
          log?.message?.toLowerCase().includes(lowerSearch) ||
          createdAtString.includes(lowerSearch)
        );
      })
    : notifications;

  // notifications from the server are already paged; display them directly
  const currentRecords = filteredLogs;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      getUserNotifications(page);
    }
  };

  // Generate page items with sliding window of 4 buttons
  const getPageItems = (tp: number, cp: number) => {
    const pages: number[] = [];
    const windowSize = 4;

    if (tp <= windowSize) {
      // If total pages <= 4, show all
      for (let i = 1; i <= tp; i++) pages.push(i);
      return pages;
    }

    // Calculate start of the sliding window
    let start = Math.max(1, cp - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;

    // Adjust if window goes beyond total pages
    if (end > tp) {
      end = tp;
      start = Math.max(1, end - windowSize + 1);
    }

    // Fill the window
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
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='font-bold text-2xl text-gray-800'>History</h1>
        </div>
        <div className='mb-2 flex items-end justify-end'>
          <Input
            type='search'
            id='search'
            name='search'
            placeholder='Start typing to search'
            className='w-[300px] bg-transparent border border-gray-300 focus-visible:ring-0'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
              getUserNotifications(1);
            }}
          />
        </div>
      </div>
      <div className='mt-5'>
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
            {(currentRecords.length > 0 &&
              currentRecords.map((notification: Notification) => (
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
                    {notification.type}
                  </TableCell>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                </TableRow>
              ))) || (
              <TableRow>
                <TableCell colSpan={4} className='text-center'>
                  No notifications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className='flex justify-center mt-6'>
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

                {getPageItems(totalPages, currentPage).map((p, idx) => (
                  <PaginationItem key={p + idx}>
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
      </div>
    </section>
  );
}
