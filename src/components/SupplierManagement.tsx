'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Package,
  Search
} from 'lucide-react';
import { useBusiness } from '../context/TransactionContext';
import { supabase } from '../utils/supabaseClient';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  rating: number;
  itemsSupplied: string[];
  notes: string;
  createdAt: Date;
}

type DbSupplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_person: string;
  rating?: number;
  notes: string;
  created_at?: string;
};

type SupplierForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  notes: string;
  rating?: number;
};

const SupplierManagement: React.FC = () => {
  const { state } = useBusiness();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    notes: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    notes: ''
  });

  // Helper: map DB row to UI Supplier
  function mapDbToSupplier(row: DbSupplier): Supplier {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      contactPerson: row.contact_person,
      rating: row.rating ?? 0,
      itemsSupplied: [], // You can link this later
      notes: row.notes,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    };
  }

  // Helper: map UI Supplier to DB row
  function mapSupplierToDb(s: SupplierForm): Omit<DbSupplier, 'id' | 'created_at'> {
    return {
      name: s.name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      contact_person: s.contactPerson,
      notes: s.notes,
      rating: s.rating ?? 0,
    };
  }

  // Fetch suppliers from Supabase on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase environment variables are missing. Please check your .env.local file.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
      if (error) {
        setError('Failed to fetch suppliers.');
        setSuppliers([]);
      } else {
        setSuppliers((data || []).map(mapDbToSupplier));
      }
      setLoading(false);
    };
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add supplier to Supabase
  const handleAddSupplier = async () => {
    setError(null);
    const { data, error } = await supabase.from('suppliers').insert([
      mapSupplierToDb({ ...newSupplier, rating: 0 })
    ]).select();
    if (error) {
      setError('Failed to add supplier.');
      return;
    }
    setSuppliers(prev => [mapDbToSupplier(data[0]), ...prev]);
    setNewSupplier({ name: '', email: '', phone: '', address: '', contactPerson: '', notes: '' });
    setShowAddModal(false);
  };

  // Edit supplier in Supabase
  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSupplier) return;
    setError(null);
    const { data, error } = await supabase.from('suppliers').update(
      mapSupplierToDb(editForm)
    ).eq('id', editSupplier.id).select();
    if (error) {
      setError('Failed to update supplier.');
      return;
    }
    setSuppliers(prev => prev.map(sup =>
      sup.id === editSupplier.id ? mapDbToSupplier(data[0]) : sup
    ));
    setShowEditModal(false);
    setEditSupplier(null);
  };

  // Delete supplier from Supabase
  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    setError(null);
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) {
      setError('Failed to delete supplier.');
      return;
    }
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };

  const getItemsSuppliedBySupplier = (supplierId: string) => {
    return state.inventory.filter(item => item.vendor === suppliers.find(s => s.id === supplierId)?.name);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setEditForm({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      contactPerson: supplier.contactPerson,
      notes: supplier.notes
    });
    setShowEditModal(true);
  };

  // Show loading and error states
  if (loading) {
    return <div className="text-center py-12 text-lg text-gray-500">Loading suppliers...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-lg text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-luvora/10 rounded-xl">
            <Users className="w-8 h-8 text-luvora" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Supplier Management</h2>
            <p className="text-gray-600">Manage your vendors and contact information</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-luvora text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{supplier.name}</h3>
                <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{supplier.rating}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{supplier.address}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Package className="w-4 h-4" />
                <span>Items Supplied: {getItemsSuppliedBySupplier(supplier.id).length}</span>
              </div>
              {supplier.notes && (
                <p className="text-sm text-gray-600 italic">&ldquo;{supplier.notes}&rdquo;</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                onClick={() => openEditModal(supplier)}
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteSupplier(supplier.id)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSuppliers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No suppliers found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first supplier.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-luvora text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Add Your First Supplier
            </button>
          )}
        </motion.div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Supplier</h3>
            <form onSubmit={e => { e.preventDefault(); handleAddSupplier(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, contactPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter contact person name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter address"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter any additional notes"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-luvora text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && editSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Supplier</h3>
            <form onSubmit={handleEditSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editForm.contactPerson}
                  onChange={(e) => setEditForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter contact person name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter address"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora text-gray-900 placeholder-gray-400"
                  placeholder="Enter any additional notes"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-luvora text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement; 