import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Compass, Eye, Heart, Home,
  Image as ImageIcon, MapPin, MessageCircle, MoreHorizontal, Palette, Play, Plus, Search, Send,
  Settings, Share2, Sparkles, Store, Sun, UserRound, Users, Volume2, VolumeX, X, LogOut,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { fallbackStyles, loadBeautyBookData } from './lib/data';
import './styles.css';

const navItems = [
  { id: 'feed', label: 'Pour toi', icon: Home },
  { id: 'explore', label: 'Explorer', icon: Compass },
  { id: 'following', label: 'Suivis', icon: Users },
  { id: 'salons', label: 'Salons', icon: Store },
  { id: 'saved', label: 'Favoris', icon: Bookmark },
];

const categoryItems = ['Tous', 'Coiffure', 'Tresses', 'Perruques', 'Manucure', 'Maquillage', 'Conseils'];

function formatCount(value) {
  const count = Number(value || 0);
  if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace('.0', '')}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace('.0', '')}K`;
  return String(count);
}

function compactDate(date) {
  try { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(date)); } catch { return ''; }
}

function IconButton({ label, active = false, onClick, children, className = '' }) {
  return <button className={`icon-button ${active ? 'is-active' : ''} ${className}`} onClick={onClick} aria-label={label} title={label}>{children}</button>;
}

function BrandMark({ compact = false }) {
  return <div className={`brand-mark ${compact ? 'compact' : ''}`}><span>B</span><i /></div>;
}

function Sidebar({ activeView, onChange, session, onLogin, onLogout }) {
  return <aside className="sidebar">
    <div className="sidebar-brand"><BrandMark /><strong>BeautyBook</strong></div>
    <div className="sidebar-slogan">INSPIRATION · BEAUTÉ · RÉSERVATION</div>
    <nav className="sidebar-nav" aria-label="Navigation principale">
      {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${activeView === id ? 'active' : ''}`} onClick={() => onChange(id)}>
        <Icon size={20} strokeWidth={activeView === id ? 2.5 : 2} /><span>{label}</span>
      </button>)}
    </nav>
    <div className="sidebar-divider" />
    <div className="sidebar-label">Ton espace</div>
    <button className="nav-link" onClick={() => onChange('profile')}><UserRound size={20} /><span>Mon profil</span></button>
    <button className="nav-link" onClick={() => onChange('appointments')}><CalendarDays size={20} /><span>Mes rendez-vous</span></button>
    <button className="nav-link" onClick={() => onChange('messages')}><MessageCircle size={20} /><span>Messages</span><em className="nav-badge">2</em></button>
    <div className="sidebar-spacer" />
    <div className="sidebar-promo"><Sparkles size={18} /><div><strong>Maria AI</strong><span>Ton coach beauté</span></div><ChevronRight size={16} /></div>
    <div className="sidebar-footer">
      <button className="nav-link subtle"><Settings size={18} /><span>Paramètres</span></button>
      {session ? <button className="nav-link subtle" onClick={onLogout}><LogOut size={18} /><span>Se déconnecter</span></button> : <button className="login-button" onClick={onLogin}>Se connecter <ChevronRight size={16} /></button>}
      <p>© 2026 BeautyBook</p>
    </div>
  </aside>;
}

function TopBar({ onSearch, onLogin, session, profile, onProfile }) {
  return <header className="topbar">
    <div className="mobile-brand"><BrandMark compact /><strong>BeautyBook</strong></div>
    <button className="desktop-search" onClick={onSearch}><Search size={18} /><span>Rechercher un style, un salon...</span><kbd>⌘ K</kbd></button>
    <div className="topbar-actions">
      <div className="location-pill"><MapPin size={15} /><span>Évry-Courcouronnes</span><ChevronDown size={14} /></div>
      <IconButton label="Mode lumineux"><Sun size={18} /></IconButton>
      <button className="profile-chip" onClick={onProfile}>{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span className="profile-initial">{profile?.email?.[0]?.toUpperCase() || 'B'}</span>}<span>{profile?.username || profile?.prenom || 'Mon compte'}</span></button>
      {!session && <button className="top-login" onClick={onLogin}>Connexion</button>}
    </div>
  </header>;
}

function Media({ item, active = false, muted, onToggleMute }) {
  const videoRef = useRef(null);
  const isVideo = Boolean(item.video_url);
  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    if (active) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [active, isVideo]);
  if (isVideo) return <div className="media-wrap"><video ref={videoRef} src={item.video_url} poster={item.image_url} muted={muted} playsInline loop preload="metadata" /><button className="media-sound" onClick={onToggleMute} aria-label={muted ? 'Activer le son' : 'Couper le son'}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button></div>;
  return <div className="media-wrap"><img src={item.image_url} alt={item.title} /></div>;
}

function ActionRail({ item, liked, saved, onLike, onSave, onComment, onShare }) {
  return <div className="action-rail">
    <div className="creator-avatar-wrap"><img src={item.author_avatar} alt={item.author_name} /><button className="follow-dot" aria-label={`Suivre ${item.author_name}`}><Plus size={15} /></button></div>
    <button className={`rail-action ${liked ? 'active' : ''}`} onClick={onLike} aria-label="J'aime"><Heart size={25} fill={liked ? 'currentColor' : 'none'} /><span>{formatCount(item.likes + (liked ? 1 : 0))}</span></button>
    <button className="rail-action" onClick={onComment} aria-label="Commenter"><MessageCircle size={24} /><span>{formatCount(item.comments)}</span></button>
    <button className={`rail-action ${saved ? 'active saved' : ''}`} onClick={onSave} aria-label="Enregistrer"><Bookmark size={24} fill={saved ? 'currentColor' : 'none'} /><span>{saved ? 'Enregistré' : 'Garder'}</span></button>
    <button className="rail-action" onClick={onShare} aria-label="Partager"><Share2 size={23} /><span>Partager</span></button>
    <div className="audio-disc"><span>♪</span></div>
  </div>;
}

function FeedCard({ item, active, liked, saved, onLike, onSave, onDetail, onComment, onShare }) {
  const [muted, setMuted] = useState(true);
  return <article className="feed-card">
    <Media item={item} active={active} muted={muted} onToggleMute={() => setMuted(v => !v)} />
    <div className="feed-overlay" />
    <div className="feed-meta">
      <div className="feed-category"><Palette size={14} /> {item.category || 'Coiffure'} <span>·</span> {item.subcategory || 'Style / Look'}</div>
      <button className="feed-title" onClick={onDetail}>{item.title}</button>
      <p>{item.description}</p>
      <button className="more-link" onClick={onDetail}>Voir les détails <ChevronRight size={15} /></button>
      <div className="feed-author"><img src={item.author_avatar} alt="" /><strong>{item.author_name}</strong><span>·</span><span>{compactDate(item.created_at)}</span><button>Suivre</button></div>
    </div>
    <ActionRail item={item} liked={liked} saved={saved} onLike={onLike} onSave={onSave} onComment={onComment} onShare={onShare} />
    <div className="feed-progress"><span /><span /><span /><span /></div>
  </article>;
}

function FeedView({ styles, liked, saved, onLike, onSave, onDetail, onComment, onShare }) {
  const feedRef = useRef(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const node = feedRef.current;
    if (!node) return undefined;
    const onScroll = () => setActive(Math.round(node.scrollTop / Math.max(node.clientHeight, 1)));
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, []);
  return <section className="view feed-view">
    <div className="feed-header"><div><p className="eyebrow">Le fil BeautyBook</p><h1>Pour toi</h1></div><div className="feed-tabs"><button className="active">Récent</button><button>Populaire</button><button>Près de chez toi</button></div></div>
    <div className="category-row">{categoryItems.map((item, index) => <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>)}</div>
    <div className="feed-scroll" ref={feedRef}>{styles.map((item, index) => <FeedCard key={item.id} item={item} active={active === index} liked={liked.has(item.id)} saved={saved.has(item.id)} onLike={() => onLike(item)} onSave={() => onSave(item)} onDetail={() => onDetail(item)} onComment={() => onDetail(item, 'comments')} onShare={() => onShare(item)} />)}</div>
  </section>;
}

function ExploreView({ styles, salons, bundles, onDetail, onProfile, initialTab = 'Styles' }) {
  const [active, setActive] = useState(initialTab);
  const [category, setCategory] = useState('Tous');
  const filteredStyles = useMemo(() => category === 'Tous' ? styles : styles.filter(item => `${item.category} ${item.subcategory}`.toLowerCase().includes(category.toLowerCase())), [styles, category]);
  return <section className="view explore-view">
    <div className="explore-heading"><div><p className="eyebrow">Découvrir</p><h1>Explorer les univers beauté</h1><p>Trouve une idée, un geste ou un salon pour ton prochain rendez-vous.</p></div><button className="circle-cta"><Search size={21} /></button></div>
    <div className="content-tabs">{['Styles', 'Prestations', 'Bundles', 'Salons'].map(item => <button className={active === item ? 'active' : ''} key={item} onClick={() => setActive(item)}>{item}</button>)}</div>
    <div className="category-row explorer-categories">{categoryItems.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {active === 'Styles' && <div className="mosaic-grid">{filteredStyles.map((item, index) => <button className={`mosaic-card ${index % 5 === 0 ? 'tall' : ''}`} key={item.id} onClick={() => onDetail(item)}><img src={item.image_url} alt={item.title} loading="lazy" /><span className="mosaic-shade" /><span className="mosaic-play">{item.video_url ? <Play size={14} fill="currentColor" /> : <ImageIcon size={14} />}</span><div><small>{item.category}</small><strong>{item.title}</strong><span>{formatCount(item.views)} vues</span></div></button>)}</div>}
    {active === 'Prestations' && <ServiceGrid styles={styles} onDetail={onDetail} />}
    {active === 'Bundles' && <BundleGrid bundles={bundles} />}
    {active === 'Salons' && <SalonGrid salons={salons} onProfile={onProfile} />}
  </section>;
}

function ServiceGrid({ styles, onDetail }) {
  return <div className="service-grid">{styles.slice(0, 6).map((item, index) => <button className="service-card" key={`${item.id}-service`} onClick={() => onDetail(item)}><img src={item.image_url} alt="" /><div><div className="card-topline"><span>{index % 2 ? 'Salon Pro' : 'Particulier'}</span><Heart size={17} /></div><h3>{item.title}</h3><p>{item.author_name} · {item.category}</p><div className="service-bottom"><span><CalendarDays size={15} /> {45 + index * 10} min</span><strong>{35 + index * 15} €</strong></div></div></button>)}</div>;
}

function BundleGrid({ bundles }) {
  return <div className="bundle-grid">{bundles.map(bundle => <article className="bundle-card" key={bundle.id}><img src={bundle.image} alt="" /><div><span className="bundle-tag">Le plus réservé</span><h3>{bundle.title}</h3><p>{bundle.subtitle}</p><p className="bundle-author">✦ {bundle.author_name} <span>✓</span> <strong>★ {bundle.rating}</strong> ({bundle.reviews})</p><p className="bundle-meta">{bundle.meta}</p><div className="bundle-price"><span>{bundle.discount}</span><del>{bundle.oldPrice}€</del><strong>{bundle.price}€</strong></div></div><button className="heart-corner" aria-label="Ajouter aux favoris"><Heart size={20} /></button></article>)}</div>;
}

function SalonGrid({ salons, onProfile }) {
  return <div className="salon-grid">{salons.map(salon => <button className="salon-card" key={salon.id} onClick={() => onProfile(salon)}><div className="salon-cover"><img src={salon.image} alt="" /><span>{salon.type}</span><button className="salon-arrow" aria-label="Voir le salon"><ChevronRight size={18} /></button></div><div className="salon-info"><img src={salon.avatar} alt="" /><div><h3>{salon.name}</h3><p><MapPin size={14} /> {salon.city}</p></div><strong>★ {salon.rating}</strong></div></button>)}</div>;
}

function SearchView({ styles, salons, bundles, onDetail, onProfile }) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Tout');
  const q = query.trim().toLowerCase();
  const styleResults = styles.filter(item => !q || `${item.title} ${item.category} ${item.subcategory} ${item.author_name}`.toLowerCase().includes(q));
  const salonResults = salons.filter(item => !q || `${item.name} ${item.city} ${item.type}`.toLowerCase().includes(q));
  const bundleResults = bundles.filter(item => !q || `${item.title} ${item.subtitle}`.toLowerCase().includes(q));
  return <section className="view search-view"><div className="search-hero"><button className="back-button"><ChevronLeft size={20} /></button><div><p className="eyebrow">Recherche</p><h1>Trouve ton prochain look</h1></div></div><label className="large-search"><Search size={22} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Styles, salons, prestations..." /><kbd>ESC</kbd></label><div className="search-tabs">{['Tout', 'Styles', 'Salons', 'Bundles'].map(item => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>{!q && <div className="search-suggestions"><span>Recherches populaires</span>{['Tresses protectrices', 'Coupe homme', 'Manucure chrome', 'Évry-Courcouronnes'].map(item => <button key={item} onClick={() => setQuery(item)}>{item} <Search size={14} /></button>)}</div>}<div className="search-results">{(tab === 'Tout' || tab === 'Styles') && <ResultSection title="Styles" count={styleResults.length}><div className="result-style-grid">{styleResults.slice(0, 8).map(item => <button key={item.id} onClick={() => onDetail(item)}><img src={item.image_url} alt="" /><span>{item.title}</span></button>)}</div></ResultSection>}{(tab === 'Tout' || tab === 'Salons') && <ResultSection title="Salons" count={salonResults.length}><SalonGrid salons={salonResults} onProfile={onProfile} /></ResultSection>}{(tab === 'Tout' || tab === 'Bundles') && <ResultSection title="Bundles" count={bundleResults.length}><BundleGrid bundles={bundleResults} /></ResultSection>}</div></section>;
}

function ResultSection({ title, count, children }) { return <section className="result-section"><div className="section-head"><h2>{title}</h2><span>{count} résultat{count > 1 ? 's' : ''}</span></div>{count ? children : <div className="empty-state">Aucun résultat ici. Essaie un autre mot.</div>}</section>; }

function ProfileView({ profile, styles, onDetail }) {
  const [tab, setTab] = useState('Styles');
  const name = profile?.name || profile?.business_name || profile?.nom || profile?.username || 'BeautyBook Studio';
  const avatar = profile?.avatar || profile?.avatar_url || profile?.profile_image_url || styles[0]?.author_avatar;
  return <section className="view profile-view"><div className="profile-hero"><div className="profile-cover" style={{ backgroundImage: `url(${profile?.image || profile?.cover_url || styles[2]?.image_url})` }} /><div className="profile-main"><img className="profile-avatar-large" src={avatar} alt={name} /><div className="profile-copy"><div className="profile-title-row"><div><p className="eyebrow">Profil BeautyBook</p><h1>{name}</h1><p className="profile-handle">@{name.toLowerCase().replace(/[^a-z0-9]+/g, '')}</p></div><div className="profile-actions"><button className="primary-button">Suivre</button><IconButton label="Partager"><Share2 size={18} /></IconButton><IconButton label="Options"><MoreHorizontal size={18} /></IconButton></div></div><p className="profile-bio">Des idées beauté qui te ressemblent, des prestations choisies avec soin et des rendez-vous plus simples à réserver.</p><div className="profile-stats"><span><strong>54</strong> abonnés</span><span><strong>{styles.length}</strong> publications</span><span><strong>4,8</strong> note moyenne</span></div><p className="profile-location"><MapPin size={15} /> {profile?.city || profile?.ville || 'Évry-Courcouronnes · Île-de-France'}</p></div></div></div><div className="profile-tabs">{['Styles', 'Prestations', 'Avis'].map(item => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === 'Styles' && <div className="profile-grid">{styles.map(item => <button key={item.id} onClick={() => onDetail(item)}><img src={item.image_url} alt={item.title} /><span><Eye size={13} /> {formatCount(item.views)}</span></button>)}</div>}{tab === 'Prestations' && <ServiceGrid styles={styles} onDetail={onDetail} />}{tab === 'Avis' && <div className="review-placeholder"><Sparkles size={30} /><h2>Une expérience qui se partage</h2><p>Les avis et les recommandations de la communauté apparaîtront ici.</p></div>}</section>;
}

function DetailModal({ item, tab = 'details', onClose, liked, saved, onLike, onSave, onShare }) {
  if (!item) return null;
  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="detail-modal"><button className="modal-close" onClick={onClose} aria-label="Fermer"><X size={20} /></button><div className="detail-media"><img src={item.image_url} alt={item.title} /><div className="detail-media-shade" /><div><span>{item.category}</span><h2>{item.title}</h2></div></div><div className="detail-body"><div className="detail-author"><img src={item.author_avatar} alt="" /><div><strong>{item.author_name}</strong><span>{item.author_email}</span></div><button>Suivre</button></div><p className="detail-description">{item.description}</p><div className="detail-tags"><span><Eye size={15} /> {formatCount(item.views)} vues</span><span><Heart size={15} /> {formatCount(item.likes)} likes</span><span><MessageCircle size={15} /> {formatCount(item.comments)} commentaires</span></div><div className="detail-actions"><button className={liked ? 'active' : ''} onClick={onLike}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /> J'aime</button><button className={saved ? 'active' : ''} onClick={onSave}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Enregistré' : 'Enregistrer'}</button><button onClick={onShare}><Share2 size={18} /> Partager</button></div><div className="detail-tabs"><button className={tab === 'details' ? 'active' : ''}>À propos</button><button className={tab === 'comments' ? 'active' : ''}>Commentaires ({item.comments})</button></div><div className="comment-box"><div className="comment-avatar">B</div><input placeholder="Ajouter un commentaire..." /><button aria-label="Envoyer"><Send size={17} /></button></div></div></div></div>;
}

function LoginModal({ onClose, onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const submit = async event => { event.preventDefault(); if (!email.trim()) return; setState('loading'); const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin } }); setState(error ? 'error' : 'sent'); if (!error) onLoggedIn?.(); };
  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="login-modal"><button className="modal-close" onClick={onClose} aria-label="Fermer"><X size={20} /></button><BrandMark /><p className="eyebrow">BeautyBook</p><h2>Retrouve tes inspirations.</h2><p>Connecte-toi pour garder tes styles, suivre tes salons et retrouver tes rendez-vous sur tous tes appareils.</p>{state === 'sent' ? <div className="success-box"><Check size={24} /><strong>Lien envoyé</strong><span>Vérifie ta boîte mail pour continuer.</span></div> : <form onSubmit={submit}><label>Adresse e-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="toi@exemple.fr" required /></label>{state === 'error' && <div className="form-error">Impossible de se connecter pour le moment.</div>}<button className="gradient-button" disabled={state === 'loading'}>{state === 'loading' ? 'Envoi...' : 'Recevoir mon lien de connexion'} <ChevronRight size={17} /></button></form>}<div className="login-benefits"><span><Heart size={15} /> Favoris synchronisés</span><span><CalendarDays size={15} /> Rendez-vous partout</span></div></div></div>;
}

function App() {
  const [view, setView] = useState('feed');
  const [data, setData] = useState({ styles: fallbackStyles, salons: [], bundles: [] });
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [liked, setLiked] = useState(new Set());
  const [saved, setSaved] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [detailTab, setDetailTab] = useState('details');
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const refresh = useCallback(async () => { setLoading(true); const next = await loadBeautyBookData(); setData(next); setLoading(false); }, []);
  useEffect(() => { refresh(); const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => { setSession(nextSession); if (nextSession?.user) { const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', nextSession.user.id).maybeSingle(); setProfile(userProfile || nextSession.user); } else setProfile(null); }); supabase.auth.getSession().then(({ data: auth }) => { setSession(auth.session); if (auth.session?.user) setProfile(auth.session.user); }); const styleChannel = supabase.channel('siteweb-styles').on('postgres_changes', { event: '*', schema: 'public', table: 'Style' }, refresh).subscribe(); return () => { listener.subscription.unsubscribe(); supabase.removeChannel(styleChannel); }; }, [refresh]);
  useEffect(() => { if (!session?.user?.email) return undefined; let cancelled = false; const loadPersonal = async () => { const [{ data: likes }, { data: favorites }] = await Promise.all([supabase.from('user_like').select('target_id').eq('user_email', session.user.email).eq('target_type', 'style'), supabase.from('user_favorite').select('target_id').eq('user_email', session.user.email).eq('target_type', 'style')]); if (!cancelled) { setLiked(new Set((likes || []).map(row => String(row.target_id)))); setSaved(new Set((favorites || []).map(row => String(row.target_id)))); } }; loadPersonal(); return () => { cancelled = true; }; }, [session]);
  const handleLike = async item => { if (!session?.user?.email) { setLoginOpen(true); return; } const id = String(item.id); const next = new Set(liked); if (next.has(id)) { next.delete(id); await supabase.from('user_like').delete().eq('user_email', session.user.email).eq('target_id', id).eq('target_type', 'style'); } else { next.add(id); await supabase.from('user_like').upsert({ user_email: session.user.email, target_id: id, target_type: 'style' }, { onConflict: 'user_email,target_id,target_type' }); } setLiked(next); };
  const handleSave = async item => { if (!session?.user?.email) { setLoginOpen(true); return; } const id = String(item.id); const next = new Set(saved); if (next.has(id)) { next.delete(id); await supabase.from('user_favorite').delete().eq('user_email', session.user.email).eq('target_id', id).eq('target_type', 'style'); } else { next.add(id); await supabase.from('user_favorite').upsert({ user_email: session.user.email, target_id: id, target_type: 'style' }, { onConflict: 'user_email,target_id,target_type' }); } setSaved(next); };
  const handleShare = async item => { const url = `${window.location.origin}/style/${item.id}`; try { await navigator.clipboard.writeText(url); } catch {} window.alert('Lien copié.'); };
  const openDetail = (item, tab = 'details') => { setSelected(item); setDetailTab(tab); };
  const openProfile = salon => { setSelectedProfile(salon); setView('profile'); };
  const logout = async () => { await supabase.auth.signOut(); setSession(null); setProfile(null); };
  const renderView = () => {
    if (searchOpen) return <SearchView styles={data.styles} salons={data.salons} bundles={data.bundles} onDetail={openDetail} onProfile={openProfile} />;
    if (view === 'feed' || view === 'following' || view === 'saved') { const list = view === 'saved' ? data.styles.filter(item => saved.has(String(item.id))) : data.styles; return <FeedView styles={list.length ? list : data.styles} liked={liked} saved={saved} onLike={handleLike} onSave={handleSave} onDetail={openDetail} onComment={(item) => openDetail(item, 'comments')} onShare={handleShare} />; }
    if (view === 'explore') return <ExploreView styles={data.styles} salons={data.salons} bundles={data.bundles} onDetail={openDetail} onProfile={openProfile} />;
    if (view === 'salons') return <ExploreView styles={data.styles} salons={data.salons} bundles={data.bundles} initialTab="Salons" onDetail={openDetail} onProfile={openProfile} />;
    if (view === 'profile') return <ProfileView profile={selectedProfile || profile} styles={data.styles} onDetail={openDetail} />;
    return <ExploreView styles={data.styles} salons={data.salons} bundles={data.bundles} onDetail={openDetail} onProfile={openProfile} />;
  };
  return <div className="app-shell"><Sidebar activeView={view} onChange={(next) => { setSearchOpen(false); setView(next); }} session={session} onLogin={() => setLoginOpen(true)} onLogout={logout} /><main className="main-content"><TopBar onSearch={() => setSearchOpen(true)} onLogin={() => setLoginOpen(true)} session={session} profile={profile} onProfile={() => { setSelectedProfile(null); setView('profile'); }} /><div className="page-content">{loading && <div className="loading-bar" />}{renderView()}</div></main><nav className="mobile-nav">{navItems.slice(0, 4).map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'active' : ''} onClick={() => { setSearchOpen(false); setView(id); }}><Icon size={20} /><span>{label}</span></button>)}<button onClick={() => setSearchOpen(true)}><Search size={20} /><span>Rechercher</span></button></nav>{selected && <DetailModal item={selected} tab={detailTab} onClose={() => setSelected(null)} liked={liked.has(String(selected.id))} saved={saved.has(String(selected.id))} onLike={() => handleLike(selected)} onSave={() => handleSave(selected)} onShare={() => handleShare(selected)} />}{loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onLoggedIn={() => setLoginOpen(false)} />}</div>;
}

export default App;
