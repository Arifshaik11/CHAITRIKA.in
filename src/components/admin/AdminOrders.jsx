import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { FiRefreshCw } from 'react-icons/fi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        setOrders([]);
        return;
      }

      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating order:', err);
      alert(`Failed to update order: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Customer Orders & WhatsApp Inquiries</h2>
          <p className="text-xs font-medium text-[#5A5550] mt-1">
            Review custom frame orders and fulfill customer requests
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-white border border-[#DCD6CE] text-[#1C1917] hover:bg-[#FAF7F4] font-bold flex items-center gap-2 px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending_whatsapp', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${
                filterStatus === status
                  ? 'bg-[#1C1917] text-white border-[#1C1917]'
                  : 'bg-white text-[#5A5550] border-[#DCD6CE] hover:border-[#1C1917]'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E7E2DC] rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1C1917]"></div>
            <p className="ml-3 text-xs font-semibold text-[#5A5550]">Loading customer inquiries...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-[#5A5550]">No orders matching selected status</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F4] border-b border-[#E7E2DC]">
                <tr>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Order #</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Customer</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Items</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Total</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Status</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Date</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[#1C1917]">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2DC]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F4] transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-[#1C1917]">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-[#1C1917]">{order.customer_name}</p>
                      <p className="text-[11px] font-medium text-[#78716C]">{order.customer_phone}</p>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-[#5A5550]">
                      {order.order_items?.length || 0} frame(s)
                    </td>
                    <td className="px-6 py-3.5 font-bold text-[#1C1917] text-sm">
                      ₹{order.total_amount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B86B57] bg-[#F9ECE8] px-2 py-0.5 rounded">
                        {order.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[11px] text-[#78716C]">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="px-2.5 py-1.5 border border-[#DCD6CE] rounded-lg bg-[#FCFAF8] text-[#1C1917] font-semibold text-xs focus:outline-none focus:border-[#1C1917]"
                      >
                        <option value="pending_whatsapp">Pending WhatsApp</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
