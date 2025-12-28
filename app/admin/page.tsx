'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [gifts, setGifts] = useState<any[]>([]);

  useEffect(() => { fetchGifts(); }, []);

  async function fetchGifts() {
    const { data } = await supabase.from('gifts').select('*').order('created_at', { ascending: false });
    if (data) setGifts(data);
  }

  async function createLink() {
    await supabase.from('gifts').insert([{ status: 'draft' }]);
    fetchGifts();
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Админ-панель</h1>
      <button onClick={createLink} className="bg-blue-500 text-white px-4 py-2 rounded">Создать новую ссылку</button>
      <div className="mt-8 space-y-2">
        {gifts.map(g => (
          <div key={g.id} className="border p-2 flex justify-between items-center">
            <span>ID: {g.id.slice(0,8)}... <b>[{g.status}]</b></span>
            <a href={`/gift/${g.id}`} className="text-blue-500 underline" target="_blank">Открыть ссылку</a>
          </div>
        ))}
      </div>
    </div>
  );
}