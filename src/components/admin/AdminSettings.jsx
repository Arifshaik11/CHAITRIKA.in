import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { FiSave } from 'react-icons/fi';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: '+918499999498',
    delivery_charge: '50',
    store_name: 'Chaitrika Frame Studio',
    currency: 'INR',
    currency_symbol: '₹',
    tax_percent: '0',
    order_prefix: 'CHTR',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;

      const settingsObj = {};
      (data || []).forEach((setting) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });

      setSettings(prev => ({ ...prev, ...settingsObj }));
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      if (!supabase) throw new Error('Supabase not configured');

      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert({
            setting_key: update.setting_key,
            setting_value: update.setting_value,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }

      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1C1917]"></div>
        <p className="ml-3 text-xs font-semibold text-[#5A5550]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#1C1917]">Store Preferences & Settings</h1>
        <p className="text-xs font-medium text-[#5A5550] mt-1">Configure WhatsApp channel number and store defaults</p>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold shadow-xs">
          {message}
        </div>
      )}

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <div className="bg-white border border-[#E7E2DC] rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917] mb-4">Brand & Currency</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Store Title
              </label>
              <input
                type="text"
                value={settings.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Currency Code
              </label>
              <input
                type="text"
                value={settings.currency || ''}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder="INR"
                className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currency_symbol || ''}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                placeholder="₹"
                className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Order Number Prefix
              </label>
              <input
                type="text"
                value={settings.order_prefix || ''}
                onChange={(e) => handleChange('order_prefix', e.target.value)}
                placeholder="ORD"
                className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Delivery */}
        <div className="bg-white border border-[#E7E2DC] rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917] mb-4">Ordering & Delivery Channel</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Standard Shipping Charge (₹)
              </label>
              <input
                type="number"
                value={settings.delivery_charge || ''}
                onChange={(e) => handleChange('delivery_charge', e.target.value)}
                step="1"
                min="0"
                className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                WhatsApp Order Line Number
              </label>
              <input
                type="tel"
                value={settings.whatsapp_number || ''}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="+91 XXXXXXXXXX"
                className="w-full px-4 py-2.5 border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] bg-[#FCFAF8]"
              />
              <p className="text-[11px] font-medium text-[#78716C] mt-1.5">
                Direct WhatsApp channel receiving automated customer carts and personalized photos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1C1917] hover:bg-[#332E2A] text-white font-bold flex items-center gap-2 px-8 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
        >
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
