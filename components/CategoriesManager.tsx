'use client';

import { useState } from 'react';
import type { GiftCategory } from '@/lib/supabase';

interface Props {
  initialCategories: GiftCategory[];
  userEmail: string;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  elements: '',
  base_price: '',
  image_url: '',
};

export default function CategoriesManager({ initialCategories, userEmail }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GiftCategory | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState('');

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (cat: GiftCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      elements: cat.elements ? cat.elements.join('\n') : '',
      base_price: cat.base_price ? cat.base_price.toString() : '',
      image_url: cat.image_url || '',
    });
    setImagePreview(cat.image_url || '');
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setImagePreview(url);
      set('image_url', url);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setLoading(true);

    const payload = {
      name: form.name,
      description: form.description || null,
      elements: form.elements ? form.elements.split('\n').filter(e => e.trim()) : [],
      base_price: form.base_price ? parseFloat(form.base_price) : null,
      image_url: form.image_url || null,
    };

    const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (res.ok) {
      if (editing) {
        setCategories(cats => cats.map(c => c.id === editing.id ? json : c));
      } else {
        setCategories(cats => [...cats, json]);
      }
      setShowForm(false);
      setMessage(editing ? 'Kategoria u përditësua!' : 'Kategoria u krijua!');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Fshi këtë kategori?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories(cats => cats.filter(c => c.id !== id));
    }
  };

  const handleToggleActive = async (cat: GiftCategory) => {
    const res = await fetch(`/api/categories/${cat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !cat.active }),
    });
    const json = await res.json();
    if (res.ok) {
      setCategories(cats => cats.map(c => c.id === cat.id ? json : c));
    }
  };

  return (
    <div>
      {message && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <p className="text-charcoal-500 text-sm">{categories.length} kategori</p>
        <button onClick={openNew} className="btn-gold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Kategori e Re
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6 border-l-4 border-gold-500">
          <h3 className="font-semibold text-charcoal-800 mb-5">
            {editing ? 'Ndrysho Kategori' : 'Kategori e Re'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Emri i Kategorisë *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="p.sh. Romantic Weekend" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Përshkrim i shkurtër</label>
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Paketa perfekte për çifte..." className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Elementet e paketës (çdo element rresht i ri)</label>
              <textarea value={form.elements} onChange={e => set('elements', e.target.value)}
                placeholder={"1 natë akomodim në dhomë deluxe\nMëngjes bufe për 2 persona\nSpa tratament 60 min\nDarkë romantike me verë"}
                rows={5} className="input-field resize-none" />
            </div>
            <div>
              <label className="label">Çmimi Bazë (€)</label>
              <input type="number" min="0" step="0.01" value={form.base_price}
                onChange={e => set('base_price', e.target.value)}
                placeholder="150.00" className="input-field" />
            </div>
            <div>
              <label className="label">Foto e Paketës</label>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                className="input-field py-2 cursor-pointer" />
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="sm:col-span-2">
                <label className="label">Preview</label>
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-charcoal-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => { setImagePreview(''); set('image_url', ''); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-charcoal-600 hover:bg-white">
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Anulo</button>
            <button type="button" onClick={handleSave} disabled={loading} className="btn-gold">
              {loading ? 'Duke ruajtur...' : 'Ruaj'}
            </button>
          </div>
        </div>
      )}

      {/* Categories grid */}
      {categories.length === 0 ? (
        <div className="card p-12 text-center text-charcoal-400">
          <div className="text-4xl mb-3">◇</div>
          <p>Nuk ka kategori ende. Krijo të parën!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className={`card overflow-hidden ${!cat.active ? 'opacity-60' : ''}`}>
              {/* Image */}
              <div className="h-40 bg-charcoal-100 relative">
                {cat.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-charcoal-300">🏨</span>
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${cat.active ? 'bg-emerald-500 text-white' : 'bg-charcoal-400 text-white'}`}>
                  {cat.active ? 'Aktiv' : 'Joaktiv'}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-charcoal-800">{cat.name}</h3>
                  {cat.base_price && (
                    <span className="text-gold-600 font-bold text-sm shrink-0">€{cat.base_price}</span>
                  )}
                </div>
                {cat.description && (
                  <p className="text-charcoal-500 text-xs mb-3">{cat.description}</p>
                )}
                {cat.elements && cat.elements.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {cat.elements.slice(0, 3).map((el, i) => (
                      <li key={i} className="text-xs text-charcoal-600 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
                        {el}
                      </li>
                    ))}
                    {cat.elements.length > 3 && (
                      <li className="text-xs text-charcoal-400">+{cat.elements.length - 3} të tjera...</li>
                    )}
                  </ul>
                )}
                <div className="flex gap-2 pt-2 border-t border-charcoal-100">
                  <button onClick={() => openEdit(cat)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">
                    Ndrysho
                  </button>
                  <button onClick={() => handleToggleActive(cat)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">
                    {cat.active ? 'Çaktivizo' : 'Aktivizo'}
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    className="text-xs py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                    Fshi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
