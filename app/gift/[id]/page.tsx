'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function GiftPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [gift, setGift] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<any[]>(Array(7).fill(null));
  const [captions, setCaptions] = useState<string[]>(Array(7).fill(''));
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (id) fetchGift();
  }, [id]);

  async function fetchGift() {
    const { data } = await supabase.from('gifts').select('*').eq('id', id).single();
    if (data) {
      setGift(data);
      setTitle(data.title || '');
    }
    setLoading(false);
  }

  const handleFinalize = async () => {
    if (!confirm("Внимание! После закрытия редактирование будет невозможно. Продолжить?")) return;
    setLoading(true);

    const updatedContent = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i]) {
        const fileExt = files[i].name.split('.').pop();
        const fileName = `${id}/photo_${i}_${Date.now()}.${fileExt}`;
        await supabase.storage.from('media').upload(fileName, files[i]);
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
        updatedContent.push({ photo_url: urlData.publicUrl, caption: captions[i] });
      }
    }

    let musicUrl = gift.music_url;
    if (musicFile) {
      const fileName = `${id}/music_${Date.now()}.mp3`;
      await supabase.storage.from('media').upload(fileName, musicFile);
      musicUrl = supabase.storage.from('media').getPublicUrl(fileName).data.publicUrl;
    }

    await supabase.from('gifts').update({
      title,
      content: updatedContent,
      music_url: musicUrl,
      status: 'final'
    }).eq('id', id);

    window.location.reload();
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;
  if (!gift) return <div className="p-10 text-center">Подарок не найден</div>;

  if (gift.status === 'final') {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center p-4">
        {!isStarted ? (
          <button onClick={() => setIsStarted(true)} className="mt-20 px-8 py-4 bg-red-400 text-white rounded-full text-xl animate-bounce">
            Открыть подарок ❤️
          </button>
        ) : (
          <div className="max-w-md w-full">
            {gift.music_url && <audio src={gift.music_url} autoPlay loop />}
            <h1 className="text-3xl font-serif text-center my-8 text-red-600">{gift.title}</h1>
            <div className="space-y-12 pb-20">
              {gift.content?.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-2 rounded shadow-xl">
                  <img src={item.photo_url} alt="" className="w-full h-auto rounded" />
                  <p className="mt-4 text-center text-lg text-gray-700 italic">{item.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Создание подарка</h1>
      <input type="text" className="w-full border p-2 rounded mb-4" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок (например: Мои чувства)" />
      <div className="mb-6 text-sm text-gray-600">Музыка (mp3): <input type="file" accept="audio/*" onChange={(e) => setMusicFile(e.target.files?.[0] || null)} /></div>
      <div className="space-y-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="border-t pt-4">
            <p className="text-xs text-gray-400">Фото {i+1}</p>
            <input type="file" accept="image/*" onChange={(e) => {
              const newFiles = [...files];
              newFiles[i] = e.target.files?.[0];
              setFiles(newFiles);
            }} className="block w-full text-sm" />
            <input type="text" placeholder="Подпись" value={captions[i]} onChange={(e) => {
              const newCaps = [...captions];
              newCaps[i] = e.target.value;
              setCaptions(newCaps);
            }} className="w-full border p-2 rounded mt-2 text-sm" />
          </div>
        ))}
      </div>
      <button onClick={handleFinalize} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl mt-10">Завершить и закрыть</button>
    </div>
  );
}