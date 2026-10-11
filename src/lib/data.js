import { supabase } from './supabase';

const remote = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=84`;

export const fallbackStyles = [
  { id: 'demo-1', title: 'Sleek Low Bun', category: 'Coiffure', subcategory: 'Style / Look', description: 'Une finition nette, élégante et facile à porter au quotidien.', image_url: remote('photo-1522337360788-8b13dee7a37e'), images: [remote('photo-1522337360788-8b13dee7a37e')], author_name: 'Mamara hair 91', author_email: 'demo@beautybook.fr', author_avatar: remote('photo-1494790108377-be9c29b29330'), likes: 184, comments: 18, views: 3200, created_at: '2026-10-11T09:20:00Z' },
  { id: 'demo-2', title: 'Passion Twists', category: 'Coiffure', subcategory: 'Tresses', description: 'Des twists souples et texturés pour changer de look sans compromis.', image_url: remote('photo-1531123897727-8f129e1688ce'), images: [remote('photo-1531123897727-8f129e1688ce')], author_name: 'Studio bb', author_email: 'studio@beautybook.fr', author_avatar: remote('photo-1524504388940-b1c1722653e1'), likes: 291, comments: 32, views: 5100, created_at: '2026-10-10T15:10:00Z' },
  { id: 'demo-3', title: 'Braids avec Taper Fade', category: 'Coiffure', subcategory: 'Coupe Homme', description: 'Des braids propres avec un dégradé précis pour une silhouette affirmée.', image_url: remote('photo-1539571696357-5a69c17a67c6'), images: [remote('photo-1539571696357-5a69c17a67c6')], author_name: 'BeautyBook Studio', author_email: 'admin@beautybook.fr', author_avatar: remote('photo-1500648767791-00dcc994a43e'), likes: 452, comments: 41, views: 9200, created_at: '2026-10-09T11:05:00Z' },
  { id: 'demo-4', title: 'Glow naturel', category: 'Maquillage', subcategory: 'Conseils', description: 'Une peau lumineuse et une routine pensée pour ton rythme.', image_url: remote('photo-1487412720507-e7ab37603c6f'), images: [remote('photo-1487412720507-e7ab37603c6f')], author_name: 'Kf beauty', author_email: 'kf@beautybook.fr', author_avatar: remote('photo-1496440737103-cd596325d314'), likes: 128, comments: 14, views: 2800, created_at: '2026-10-08T18:22:00Z' },
  { id: 'demo-5', title: 'Soft European Waves', category: 'Coiffure', subcategory: 'Type de cheveux', description: 'Des ondulations douces qui donnent du mouvement et du volume.', image_url: remote('photo-1524250502761-1ac6f2e30d43'), images: [remote('photo-1524250502761-1ac6f2e30d43')], author_name: 'L’Atelier BB', author_email: 'atelier@beautybook.fr', author_avatar: remote('photo-1517841905240-472988babdf9'), likes: 97, comments: 9, views: 1900, created_at: '2026-10-07T12:42:00Z' },
  { id: 'demo-6', title: 'Manucure chrome', category: 'Manucure', subcategory: 'Ongles', description: 'Une finition miroir pour celles qui aiment les détails qui se voient.', image_url: remote('photo-1604654894610-df63bc536371'), images: [remote('photo-1604654894610-df63bc536371')], author_name: 'Nails by Awa', author_email: 'awa@beautybook.fr', author_avatar: remote('photo-1488426862026-3ee34a7d66df'), likes: 76, comments: 6, views: 1400, created_at: '2026-10-06T08:12:00Z' },
];

export const fallbackSalons = [
  { id: 'salon-1', name: 'Studio bb', city: 'Évry-Courcouronnes', type: 'Particulier', rating: 4.8, image: remote('photo-1600948836101-f9ffda59d250'), avatar: remote('photo-1524504388940-b1c1722653e1') },
  { id: 'salon-2', name: 'Kf beauty', city: 'Évry-Courcouronnes', type: 'Salon Pro', rating: 4.9, image: remote('photo-1560066984-138dadb4c035'), avatar: remote('photo-1494790108377-be9c29b29330') },
  { id: 'salon-3', name: 'Mamara hair 91', city: 'Paris & IDF', type: 'Salon Pro', rating: 4.7, image: remote('photo-1556760544-74068565f05c'), avatar: remote('photo-1534528741775-53994a69daeb') },
];

export const fallbackBundles = [
  { id: 'bundle-1', title: 'Bundle Mariage', subtitle: 'Havana twists, Passion Twists', price: 150, oldPrice: 190, discount: 'Économisez 21%', image: remote('photo-1529139574466-a303027c1d8b'), author_name: 'Mamara hair 91', rating: 4.3, reviews: 60, meta: '2 services · 3h20 · 2–4 pers.' },
  { id: 'bundle-2', title: 'Glow up', subtitle: 'Havana twists', price: 60, oldPrice: 70, discount: 'Économisez 14%', image: remote('photo-1515886657613-9f3515b0c78f'), author_name: 'Mamara hair 91', rating: 4.3, reviews: 203, meta: '1 service · 2h · 1 personne' },
];

const first = (value, fallback = '') => Array.isArray(value) ? value.find(Boolean) || fallback : value || fallback;

export function normalizeStyle(row, index = 0) {
  const fallback = fallbackStyles[index % fallbackStyles.length];
  const images = Array.isArray(row?.images) ? row.images.filter(Boolean) : [];
  return {
    ...fallback,
    ...row,
    id: String(row?.id ?? fallback.id),
    title: row?.title || row?.name || fallback.title,
    description: row?.description || row?.caption || fallback.description,
    category: row?.category || row?.type || fallback.category,
    subcategory: row?.subcategory || row?.sub_category || fallback.subcategory,
    image_url: first(row?.image_url || row?.cover_url, images[0] || fallback.image_url),
    images: images.length ? images : [first(row?.image_url || row?.cover_url, fallback.image_url)],
    author_name: row?.author_name || row?.creator_name || row?.pro_name || fallback.author_name,
    author_email: row?.author_email || row?.created_by_email || row?.pro_email || fallback.author_email,
    author_avatar: row?.author_avatar || row?.avatar_url || fallback.author_avatar,
    likes: Number(row?.likes ?? row?.like_count ?? fallback.likes) || 0,
    comments: Number(row?.comments ?? row?.comment_count ?? fallback.comments) || 0,
    views: Number(row?.views ?? row?.view_count ?? fallback.views) || 0,
  };
}

export async function loadBeautyBookData() {
  const [stylesResult, profilesResult, bundlesResult] = await Promise.allSettled([
    supabase.from('Style').select('*').in('status', ['publie', 'actif']).order('created_at', { ascending: false }).limit(60),
    supabase.from('ProfilPro').select('*').eq('status', 'actif').order('created_at', { ascending: false }).limit(24),
    supabase.from('ServiceBundle').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(24),
  ]);

  const styles = stylesResult.status === 'fulfilled' && !stylesResult.value.error && stylesResult.value.data?.length
    ? stylesResult.value.data.map(normalizeStyle)
    : fallbackStyles;
  const salons = profilesResult.status === 'fulfilled' && !profilesResult.value.error && profilesResult.value.data?.length
    ? profilesResult.value.data.map((row, index) => ({ ...fallbackSalons[index % fallbackSalons.length], ...row, id: String(row.id), name: row.name || row.business_name || row.nom || fallbackSalons[index % fallbackSalons.length].name, city: row.city || row.ville || row.address_city || fallbackSalons[index % fallbackSalons.length].city, type: row.type || row.business_type || row.account_type || fallbackSalons[index % fallbackSalons.length].type, image: row.cover_url || row.image_url || row.banner_url || fallbackSalons[index % fallbackSalons.length].image, avatar: row.avatar_url || row.profile_image_url || fallbackSalons[index % fallbackSalons.length].avatar, rating: Number(row.rating || fallbackSalons[index % fallbackSalons.length].rating) }))
    : fallbackSalons;
  const bundles = bundlesResult.status === 'fulfilled' && !bundlesResult.value.error && bundlesResult.value.data?.length
    ? bundlesResult.value.data.map((row, index) => ({ ...fallbackBundles[index % fallbackBundles.length], ...row, id: String(row.id), title: row.title || row.name || fallbackBundles[index % fallbackBundles.length].title, image: row.image_url || row.cover_url || fallbackBundles[index % fallbackBundles.length].image, price: Number(row.price || row.discounted_price || fallbackBundles[index % fallbackBundles.length].price) }))
    : fallbackBundles;

  return { styles, salons, bundles };
}
