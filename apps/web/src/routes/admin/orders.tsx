import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getOrders, type AdminOrder, updateOrderStatus } from "../../lib/types";

export const Route = createFileRoute("/admin/orders")({
  loader: () => getOrders(),
  component: OrdersDashboard,
});

const columnHelper = createColumnHelper<AdminOrder>();

function OrdersDashboard() {
  const initialData = Route.useLoaderData();
  const navigate = useNavigate();
  // We keep local state for rapid UI updates, but typically this would use useMutation
  const [data, setData] = useState(() => initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // We'll manage modals via route params eventually, but for orders we can just use the nested route
  // Actually, wait, let's use a nested route for the modal so urls like /admin/orders/$orderId work!
  // To do that gracefully, we can trigger navigation to that route.

  const handleStatusChange = async (id: string, newStatus: AdminOrder['status']) => {
      setData(prev => prev.map(order => order.id === id ? { ...order, status: newStatus } : order));
      await updateOrderStatus(id, newStatus);
      if (newStatus === 'ready') toast.success(`Order ${id} is ready! Confetti time! 🎉`);
      if (newStatus === 'out_for_delivery') toast.success(`Order ${id} is out for delivery! 🚚`);
  };

  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "Order ID",
      cell: info => (
        <Link 
           to={`/admin/orders/${info.getValue()}`}
           className="font-bold text-primary cursor-pointer hover:underline"
        >
            {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("customer", {
      header: "Customer",
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: info => (
          <span className="uppercase text-xs font-bold bg-muted px-2 py-1 rounded-md">
              {info.getValue()}
          </span>
      )
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: info => {
          const status = info.getValue();
          const colors = {
              pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
              preparing: "bg-blue-100 text-blue-800 border-blue-200",
              ready: "bg-green-100 text-green-800 border-green-200",
              out_for_delivery: "bg-orange-100 text-orange-800 border-orange-200",
              delivered: "bg-gray-100 text-gray-800 border-gray-200"
          };
          
          return (
              <select
                 className={`text-xs font-bold uppercase rounded-full px-3 py-1 border outline-none cursor-pointer hover:scale-105 transition-transform ${colors[status]}`}
                 value={status}
                 onChange={(e) => handleStatusChange(info.row.original.id, e.target.value as AdminOrder['status'])}
              >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready/Pickup</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Completed</option>
              </select>
          )
      }
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: info => (
            <div className="flex gap-2 items-center">
              <Link 
                 to={`/admin/orders/${info.row.original.id}`}
                 className="flex items-center gap-1 text-primary hover:bg-primary/10 px-3 py-1 rounded-full transition-colors text-sm font-bold"
              >
                  Review
              </Link>
            </div>
        )
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <motion.div 
       key="orders"
       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
       className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl shadow-black/5"
    >
      <div className="p-6 bg-muted/30 border-b border-border flex justify-between items-center">
          <h2 className="font-display text-2xl">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                  {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                              <th 
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                className="p-4 font-bold text-muted-foreground uppercase text-xs tracking-wider cursor-pointer hover:bg-muted transition-colors"
                              >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
                              </th>
                          ))}
                      </tr>
                  ))}
              </thead>
              <tbody>
                  {table.getRowModel().rows.map(row => (
                      <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={row.id} 
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                          {row.getVisibleCells().map(cell => (
                              <td key={cell.id} className="p-4 text-sm font-medium">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                          ))}
                      </motion.tr>
                  ))}
              </tbody>
          </table>
      </div>
    </motion.div>
  );
}
