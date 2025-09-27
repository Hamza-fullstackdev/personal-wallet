"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
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
  const [notifications, setNotifications] = useState([]);

  const getUserNotifications = async () => {
    const res = await fetch("/api/user/notifications");
    const data = await res.json();
    setNotifications(data.notifications);
  };

  useEffect(() => {
    getUserNotifications();
  }, []);
  return (
    <section className='my-10'>
      <h1 className='text-2xl font-bold'>History</h1>
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
            {(notifications.length > 0 &&
              notifications?.map((notification: Notification) => (
                <TableRow key={notification._id}>
                  <TableCell>
                    {new Date(notification.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
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
      </div>
    </section>
  );
}
