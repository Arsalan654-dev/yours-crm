'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, Clock, XCircle, Search, Edit2 } from 'lucide-react';
import moment from 'moment';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('crm_token');
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setEditingOrder(null);
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update order', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> PENDING</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1" /> CONFIRMED</span>;
      case 'CANCELED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> CANCELED</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.phoneNumber.includes(searchTerm) ||
    o.products.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0a1142] flex items-center mb-2">
            <ShoppingCart className="w-8 h-8 mr-3 text-[#d51381]" /> Order Confirmations
          </h2>
          <p className="text-gray-500 font-medium">Manage and confirm orders automatically collected by AI Agents.</p>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d51381]/50 shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Client / Agent</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Delivery Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-medium">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-medium">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0a1142]">{order.name}</div>
                      <div className="text-sm text-gray-500 font-medium">{order.phoneNumber}</div>
                      {order.companyName && <div className="text-xs text-gray-400 mt-1">{order.companyName}</div>}
                      <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-700">{order.client?.name || 'Unknown Client'}</div>
                      <div className="text-xs text-gray-400">{order.client?.companyName || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#0a1142] font-medium max-w-xs truncate" title={order.products}>
                        {order.products}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={order.address}>
                        {order.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingOrder === order.id ? (
                        <div className="flex flex-col items-end gap-2">
                          <select 
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#d51381]/50 font-medium"
                            defaultValue={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="CANCELED">CANCELED</option>
                          </select>
                          <button 
                            onClick={() => setEditingOrder(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setEditingOrder(order.id)}
                          className="text-[#d51381] hover:bg-pink-50 p-2 rounded-lg transition-colors flex items-center ml-auto font-bold text-sm"
                        >
                          <Edit2 className="w-4 h-4 mr-1" /> Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
