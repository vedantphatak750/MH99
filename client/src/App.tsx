import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Coffee,
  Edit3,
  Flame,
  LayoutDashboard,
  MapPin,
  Menu as MenuIcon,
  Minus,
  MoreHorizontal,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import {
  categories,
  menuItems,
  nextStatus,
  outlets,
  seedOrders,
  statusLabels,
  statusSteps,
  type MenuItem,
  type Order,
  type OrderItem,
  type OrderStatus,
  type Role,
} from './data';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo-mark" aria-label="Hearth and Press">
      <span className="logo-flame"><Flame size={compact ? 16 : 18} strokeWidth={2.4} /></span>
      {!compact && <span className="logo-wordmark">HEARTH <i>&</i> PRESS</span>}
    </div>
  );
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'orange' | 'red' | 'green' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }: { children: React.ReactNode; variant?: 'primary' | 'ghost' | 'outline' | 'soft' | 'dark'; className?: string; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  return <button disabled={disabled} type={type} onClick={onClick} className={`btn btn-${variant} ${className}`}>{children}</button>;
}

function Topbar({ role, setRole, cartCount, cartTotal, onCart, selectedOutlet }: { role: Role; setRole: (role: Role) => void; cartCount: number; cartTotal: number; onCart: () => void; selectedOutlet?: string }) {
  const roleLabel = role === 'customer' ? 'Customer view' : role === 'counter' ? 'Counter staff' : 'Owner dashboard';
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand-button" onClick={() => setRole('customer')} aria-label="Go to customer view"><Logo /></button>
        <div className="topbar-context">
          <span className="context-dot" />
          <span>{roleLabel}</span>
          {selectedOutlet && <><span className="context-divider">/</span><span className="context-muted">{selectedOutlet}</span></>}
        </div>
        <div className="topbar-actions">
          <nav className="role-switcher" aria-label="Switch application view">
            <button className={role === 'customer' ? 'active' : ''} onClick={() => setRole('customer')}><Utensils size={14} /> Customer</button>
            <button className={role === 'counter' ? 'active' : ''} onClick={() => setRole('counter')}><PackageCheck size={14} /> Counter</button>
            <button className={role === 'owner' ? 'active' : ''} onClick={() => setRole('owner')}><BarChart3 size={14} /> Owner</button>
          </nav>
          {role === 'customer' && <button className="cart-pill" onClick={onCart} aria-label={`Open cart with ${cartCount} items`}><ShoppingBag size={17} /><span>Cart · {cartCount} {cartCount === 1 ? 'item' : 'items'} · {money(cartTotal)}</span></button>}
          <button className="mobile-menu" aria-label="Open menu"><MenuIcon size={18} /></button>
        </div>
      </div>
    </header>
  );
}

function SectionHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: React.ReactNode }) {
  return <div className="section-heading reveal"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{action}</div>;
}

function OutletPicker({ selectedOutlet, onSelect }: { selectedOutlet: string | null; onSelect: (id: string) => void }) {
  return <section className="outlet-section" id="outlets">
    <SectionHeading eyebrow="Choose your outlet" title="Good food, close by." copy="Every order is made fresh at the MH99 outlet you choose. Pick a branch to see its live menu." />
    <div className="outlet-grid">
      {outlets.map((outlet, index) => <button key={outlet.id} onClick={() => onSelect(outlet.id)} className={`outlet-card ${selectedOutlet === outlet.id ? 'selected' : ''}`} style={{ '--accent': outlet.accent } as React.CSSProperties}>
        <div className="outlet-card-top"><span className="outlet-number">0{index + 1}</span><Badge tone={outlet.status === 'Busy' ? 'orange' : 'green'}><span className="status-dot" />{outlet.status}</Badge></div>
        <div className="outlet-visual"><span className="visual-word">MH99<br /><em>{outlet.shortName}</em></span><MapPin size={18} /></div>
        <div className="outlet-card-copy"><div><h3>MH99 Burgers</h3><p>{outlet.address}</p></div><ArrowRight size={18} /></div>
        <div className="outlet-meta"><span>{outlet.hours}</span><span>{outlet.tables} tables</span></div>
      </button>)}
    </div>
  </section>;
}

function FoodCard({ item, onAdd, compact = false }: { item: MenuItem; onAdd: (item: MenuItem) => void; compact?: boolean }) {
  return <article className={`food-card ${compact ? 'compact' : ''}`}>
    <button className="food-image-wrap" onClick={() => onAdd(item)} aria-label={`View ${item.name}`}>
      <img src={item.image} alt="" loading="lazy" />
      {item.tag && <span className="food-tag">{item.tag}</span>}
      <span className="image-arrow"><ArrowRight size={15} /></span>
    </button>
    <div className="food-card-copy"><div><div className="food-category">{item.category}</div><h3>{item.name}</h3><p>{item.description}</p></div><div className="food-card-bottom"><strong>{money(item.price)}</strong><button className="add-button" onClick={() => onAdd(item)} aria-label={`Add ${item.name} to cart`}><Plus size={17} /></button></div></div>
  </article>;
}

function ItemModal({ item, onClose, onAdd }: { item: MenuItem; onClose: () => void; onAdd: (item: OrderItem) => void }) {
  const [size, setSize] = useState(item.category === 'Burgers' ? 'Single' : 'Regular');
  const [extras, setExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const extraPrice = extras.length * 30 + (size === 'Double' ? 70 : 0);
  const customization = [size !== 'Regular' ? size : '', ...extras].filter(Boolean).join(' · ');
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="item-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${item.name} customization`}>
      <button className="modal-close" onClick={onClose} aria-label="Close item details"><X size={18} /></button>
      <div className="modal-image"><img src={item.image} alt="" /></div>
      <div className="modal-content"><div className="food-category">{item.category}</div><h2>{item.name}</h2><p>{item.description}</p><div className="modal-price">{money(item.price + extraPrice)} <span>base {money(item.price)}</span></div>
        {item.category === 'Burgers' && <div className="option-group"><label>Patty size <span>Required</span></label><div className="choice-grid">{['Single', 'Double'].map(option => <button key={option} className={size === option ? 'choice active' : 'choice'} onClick={() => setSize(option)}><span>{option}</span><small>{option === 'Double' ? '+₹70' : 'Standard'}</small></button>)}</div></div>}
        <div className="option-group"><label>Make it yours <span>Optional</span></label><div className="check-list">{['Extra cheese', 'Jalapeños', 'House sauce'].map(option => <button key={option} className={`check-option ${extras.includes(option) ? 'active' : ''}`} onClick={() => setExtras(current => current.includes(option) ? current.filter(x => x !== option) : [...current, option])}><span className="check-box">{extras.includes(option) && <Check size={13} />}</span>{option}<em>+₹30</em></button>)}</div></div>
        <div className="modal-footer"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><strong>{quantity}</strong><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={15} /></button></div><Button className="grow" onClick={() => onAdd({ id: item.id, name: item.name, quantity, price: item.price + extraPrice, customization, image: item.image })}>Add to order <ArrowRight size={16} /></Button></div>
      </div>
    </div>
  </div>;
}

function CartDrawer({ items, onClose, onRemove, onUpdate, onProceed }: { items: OrderItem[]; onClose: () => void; onRemove: (id: string) => void; onUpdate: (id: string, delta: number) => void; onProceed: () => void }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <div className="drawer-backdrop" onClick={onClose}><aside className="cart-drawer" onClick={event => event.stopPropagation()}><div className="drawer-header"><div><span className="eyebrow">Your order</span><h2>Ready when you are.</h2></div><button className="modal-close" onClick={onClose} aria-label="Close cart"><X size={18} /></button></div>{items.length === 0 ? <div className="empty-state"><ShoppingBag size={32} /><h3>Your bag is quiet.</h3><p>Add something with a little crunch.</p></div> : <><div className="drawer-items">{items.map(item => <div className="drawer-item" key={`${item.id}-${item.customization}`}><img src={item.image} alt="" /><div className="drawer-item-copy"><div className="drawer-item-top"><strong>{item.name}</strong><button onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}><X size={14} /></button></div><small>{item.customization || 'Original build'}</small><div className="drawer-line"><div className="quantity compact-quantity"><button onClick={() => onUpdate(item.id, -1)} aria-label={`Decrease ${item.name}`}><Minus size={13} /></button><strong>{item.quantity}</strong><button onClick={() => onUpdate(item.id, 1)} aria-label={`Increase ${item.name}`}><Plus size={13} /></button></div><span>{money(item.price * item.quantity)}</span></div></div></div>)}</div><div className="drawer-summary"><div><span>Subtotal</span><strong>{money(total)}</strong></div><div><span>Service charge</span><strong>{money(Math.round(total * .05))}</strong></div><div className="drawer-total"><span>Total</span><strong>{money(Math.round(total * 1.05))}</strong></div><Button className="full-width" onClick={onProceed}>Proceed to order <ArrowRight size={16} /></Button><button className="continue-shopping" onClick={onClose}>Continue shopping</button></div></>}</aside></div>;
}

function CustomerView({ selectedOutlet, setSelectedOutlet, cart, setCart, cartOpen, setCartOpen, customerScreen, setCustomerScreen, order, setOrder }: { selectedOutlet: string | null; setSelectedOutlet: (id: string | null) => void; cart: OrderItem[]; setCart: React.Dispatch<React.SetStateAction<OrderItem[]>>; cartOpen: boolean; setCartOpen: (open: boolean) => void; customerScreen: 'home' | 'menu' | 'checkout' | 'confirmation' | 'tracking'; setCustomerScreen: (screen: 'home' | 'menu' | 'checkout' | 'confirmation' | 'tracking') => void; order: Order | null; setOrder: React.Dispatch<React.SetStateAction<Order | null>> }) {
  const screen = customerScreen;
  const setScreen = setCustomerScreen;
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [category, setCategory] = useState('Burgers');
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway'>('Dine-in');
  const [table, setTable] = useState('07');
  const [placing, setPlacing] = useState(false);
  const outlet = outlets.find(item => item.id === selectedOutlet);
  const filteredItems = menuItems.filter(item => item.category === category && item.enabled !== false);
  const featured = menuItems.find(item => item.featured && item.category === 'Burgers') ?? menuItems[0];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.round(subtotal * 1.05);

  const chooseOutlet = (id: string) => { setSelectedOutlet(id); setScreen('menu'); window.setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }), 30); };
  const addItem = (item: OrderItem) => { setCart(current => { const match = current.find(existing => existing.id === item.id && existing.customization === item.customization); return match ? current.map(existing => existing === match ? { ...existing, quantity: existing.quantity + item.quantity } : existing) : [...current, item]; }); setDetailItem(null); setCartOpen(true); };
  const updateCart = (id: string, delta: number) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const addMenuItem = (item: MenuItem) => setDetailItem(item);
  const placeOrder = () => { if (!selectedOutlet || cart.length === 0) return; setPlacing(true); window.setTimeout(() => { setOrder({ id: 104, outletId: selectedOutlet, orderType, table: orderType === 'Dine-in' ? table : undefined, items: cart, total, status: 'NEW', createdAt: '12:58 PM', customer: 'Demo customer' }); setPlacing(false); setScreen('confirmation'); setCartOpen(false); }, 650); };
  if (screen === 'confirmation' && order) return <div className="customer-shell"><ConfirmationScreen order={order} outlet={outlet!} onTrack={() => setScreen('tracking')} onOrderAgain={() => { setOrder(null); setScreen('menu'); }} />{detailItem && <ItemModal item={detailItem} onClose={() => setDetailItem(null)} onAdd={addItem} />}</div>;
  if (screen === 'tracking' && order) return <div className="customer-shell"><TrackingScreen order={order} outlet={outlet!} onBack={() => setScreen('menu')} />{detailItem && <ItemModal item={detailItem} onClose={() => setDetailItem(null)} onAdd={addItem} />}</div>;
  return <div className="customer-shell">
    {screen === 'home' && <><section className="hero-section"><div className="hero-grain" /><div className="hero-copy reveal"><div className="eyebrow-row"><span className="eyebrow">Small-batch. Big mood.</span><span className="eyebrow-line" /></div><h1>BURGERS<br /><span>MADE TO</span><br />HIT DIFFERENT.</h1><p>Fresh off the grill, built with intention. Three outlets across Mumbai, one very good reason to stay for another bite.</p><div className="hero-actions"><Button onClick={() => document.getElementById('outlets')?.scrollIntoView({ behavior: 'smooth' })}>Order at your outlet <ArrowRight size={16} /></Button><button className="text-button" onClick={() => { setScreen('menu'); setSelectedOutlet('outlet-2'); window.setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }), 30); }}>Explore the menu <ChevronRight size={16} /></button></div><div className="hero-note"><span className="note-icon"><Zap size={13} /></span><span>Now serving until 11:30 PM</span></div></div><div className="hero-art reveal"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-image-frame"><img src={featured.image} alt="Classic Smash Burger" /><div className="hero-image-label"><span>01 / 04</span><strong>CLASSIC<br />SMASH</strong></div></div><div className="hero-stamp"><Sparkles size={14} /><span>EST. 2019<br /><b>MUMBAI</b></span></div><span className="hero-vertical">MH99 / FLAME-GRILLED / SINCE 2019</span></div></section><div className="ticker"><div><span>MADE FRESH</span><i>✦</i><span>NO SHORTCUTS</span><i>✦</i><span>GOOD FOOD, LOUD FLAVOUR</span><i>✦</i><span>MADE FRESH</span><i>✦</i></div></div><OutletPicker selectedOutlet={selectedOutlet} onSelect={chooseOutlet} /><FeaturedSection item={featured} onAdd={addMenuItem} /></>}
    {screen === 'menu' && <><section className="menu-hero" id="menu"><div><button className="back-link" onClick={() => setScreen('home')}><ChevronLeft size={15} /> Back to home</button><span className="eyebrow">{outlet?.shortName ?? 'Andheri West'} / the menu</span><h1>Order something<br /><em>worth remembering.</em></h1><p>Built to order. Served without the ceremony.</p></div><div className="menu-hero-stat"><span>OPEN TODAY</span><strong>{outlet?.hours ?? '11:30 AM — 11:30 PM'}</strong><small><span className="status-dot" /> Taking orders now</small></div></section><section className="menu-section"><div className="menu-filter-row"><div className="category-tabs" role="tablist">{categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}<span>{menuItems.filter(menuItem => menuItem.category === item).length.toString().padStart(2, '0')}</span></button>)}</div><div className="menu-mini-meta"><span><Clock3 size={15} /> 15–20 min</span><button onClick={() => setCartOpen(true)}><ShoppingBag size={15} /> {cartCount} items</button></div></div><div className="menu-grid">{filteredItems.map((item, index) => <div className="stagger-item" style={{ '--delay': `${index * 55}ms` } as React.CSSProperties} key={item.id}><FoodCard item={item} onAdd={addMenuItem} /></div>)}</div></section><div className="menu-callout"><div><span className="eyebrow">Not sure where to start?</span><h2>Go classic.<br /><em>Trust the room.</em></h2></div><Button variant="soft" onClick={() => { setCategory('Burgers'); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); }}>See the burgers <ArrowRight size={16} /></Button></div></>}
    {screen === 'checkout' && <CheckoutScreen outlet={outlet!} items={cart} orderType={orderType} setOrderType={setOrderType} table={table} setTable={setTable} subtotal={subtotal} total={total} onBack={() => setScreen('menu')} onPlace={placeOrder} placing={placing} />}
    {detailItem && <ItemModal item={detailItem} onClose={() => setDetailItem(null)} onAdd={addItem} />}
    {cartOpen && <CartDrawer items={cart} onClose={() => setCartOpen(false)} onRemove={id => setCart(current => current.filter(item => item.id !== id))} onUpdate={updateCart} onProceed={() => { setCartOpen(false); setScreen('checkout'); }} />}
  </div>;
}

function FeaturedSection({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  return <section className="featured-section"><div className="featured-visual"><img src={item.image} alt="" /><div className="featured-overlay"><span>H&P / 01</span><span>Flame-grilled</span></div></div><div className="featured-copy"><span className="eyebrow">The house signature</span><h2>Meet the<br /><em>Classic Smash.</em></h2><p>Two beautifully crisp edges. Melted cheese. Sharp pickles. The sauce we spent six months getting right. No garnish for garnish's sake.</p><div className="featured-details"><div><span>BUILD</span><strong>Double smash<br />American cheese<br />House sauce</strong></div><div><span>FROM</span><strong>{money(item.price)}<small> / burger</small></strong></div></div><Button onClick={() => onAdd(item)}>Build your classic <ArrowRight size={16} /></Button></div></section>;
}

function CheckoutScreen({ outlet, items, orderType, setOrderType, table, setTable, subtotal, total, onBack, onPlace, placing }: { outlet: NonNullable<ReturnType<typeof outlets.find>>; items: OrderItem[]; orderType: 'Dine-in' | 'Takeaway'; setOrderType: (type: 'Dine-in' | 'Takeaway') => void; table: string; setTable: (value: string) => void; subtotal: number; total: number; onBack: () => void; onPlace: () => void; placing: boolean }) {
  const [paymentMethod, setPaymentMethod] = useState<'counter' | 'online'>('counter');
  const [demoPaid, setDemoPaid] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const canPlace = paymentMethod === 'counter' || demoPaid;
  const submitOrder = () => { if (paymentMethod === 'online' && !demoPaid) setShowPayment(true); else onPlace(); };
  return <section className="checkout-page"><div className="checkout-main"><button className="back-link" onClick={onBack}><ChevronLeft size={15} /> Back to menu</button><div className="checkout-progress"><span className="done"><Check size={13} /> Cart</span><i /><span className="current">02 / Order details</span><i /><span>03 / Review</span></div><span className="eyebrow">Order details</span><h1>How are you<br /><em>eating today?</em></h1><p className="checkout-intro">Your order will be sent straight to <strong>{outlet.shortName}</strong>. Check the details, choose a payment method, then send it to the kitchen.</p><div className="order-type-grid"><button className={orderType === 'Dine-in' ? 'visit-choice active' : 'visit-choice'} onClick={() => setOrderType('Dine-in')}><span className="choice-icon"><Utensils size={20} /></span><span><strong>Dine-in</strong><small>Find a table and stay awhile</small></span><span className="choice-check">{orderType === 'Dine-in' && <Check size={14} />}</span></button><button className={orderType === 'Takeaway' ? 'visit-choice active' : 'visit-choice'} onClick={() => setOrderType('Takeaway')}><span className="choice-icon"><ShoppingBag size={20} /></span><span><strong>Takeaway</strong><small>Hot, packed and ready to go</small></span><span className="choice-check">{orderType === 'Takeaway' && <Check size={14} />}</span></button></div>{orderType === 'Dine-in' && <div className="table-field"><label htmlFor="table">Table number <span>Required for dine-in</span></label><div className="table-input"><input id="table" maxLength={2} value={table} onChange={event => setTable(event.target.value.replace(/\D/g, '').slice(0, 2))} /><span>of {outlet.tables}</span></div><small>Look for the number printed on your table.</small></div>}<div className="payment-section"><div className="payment-heading"><span className="eyebrow">Payment method</span><span className="payment-note">Demo only</span></div><button className={`payment-choice ${paymentMethod === 'counter' ? 'active' : ''}`} onClick={() => setPaymentMethod('counter')}><span className="radio-dot">{paymentMethod === 'counter' && <i />}</span><span><strong>Pay at counter</strong><small>Pay when you arrive at the outlet</small></span><Check size={15} /></button><button className={`payment-choice ${paymentMethod === 'online' ? 'active' : ''}`} onClick={() => { setPaymentMethod('online'); setDemoPaid(false); }}><span className="radio-dot">{paymentMethod === 'online' && <i />}</span><span><strong>Online payment — Demo</strong><small>{demoPaid ? 'Demo payment completed' : 'Preview the future checkout'}</small></span>{demoPaid ? <CircleCheck size={15} /> : <span className="demo-chip">TEST</span>}</button></div><div className="checkout-note"><CircleCheck size={18} /><span><strong>15–20 min prep time</strong><br />Review the summary on the right before placing your order.</span></div></div><aside className="checkout-summary"><div className="summary-header"><span className="eyebrow">Order review</span><Badge tone="orange">{items.length} items</Badge></div><div className="summary-outlet"><div className="outlet-pin"><Store size={17} /></div><div><strong>{outlet.name}</strong><span>{outlet.address}</span></div><button onClick={onBack} aria-label="Change outlet"><Edit3 size={15} /></button></div><div className="review-details"><span>Order type <strong>{orderType}{orderType === 'Dine-in' ? ` · Table ${table || '—'}` : ''}</strong></span><span>Payment <strong>{paymentMethod === 'counter' ? 'Pay at counter' : demoPaid ? 'Online payment — Demo' : 'Online payment — pending'}</strong></span></div><div className="summary-items">{items.map(item => <div key={`${item.id}-${item.customization}`}><span><b>{item.quantity} ×</b> {item.name}<small>{item.customization || 'Original build'}</small></span><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="summary-math"><div><span>Subtotal</span><span>{money(subtotal)}</span></div><div><span>Service charge</span><span>{money(Math.round(subtotal * .05))}</span></div><div className="summary-total"><strong>Total to pay</strong><strong>{money(total)}</strong></div></div><Button className="full-width" onClick={submitOrder} disabled={placing || (orderType === 'Dine-in' && !table)}>{placing ? <><RotateCcw size={16} className="spin" /> Sending to the kitchen</> : paymentMethod === 'online' && !demoPaid ? <>Open demo payment <ArrowRight size={16} /></> : <>Place order <ArrowRight size={16} /></>}</Button><small className="demo-payment"><span className="secure-dot" /> No real payment is collected</small></aside>{showPayment && <div className="modal-backdrop" onClick={() => setShowPayment(false)}><div className="demo-payment-modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setShowPayment(false)} aria-label="Close demo payment"><X size={18} /></button><span className="eyebrow">Online payment / demo</span><h2>Test the future checkout.</h2><p>This is a simulated payment screen. No money will move and no card details are stored.</p><div className="fake-payment-card"><span>MH99 / TEST PAYMENT</span><strong>{money(total)}</strong><small>•••• 4242 · Demo wallet</small></div><Button className="full-width" onClick={() => { setDemoPaid(true); setShowPayment(false); }}>Complete demo payment <Check size={16} /></Button></div></div>}</section>;
}

function ConfirmationScreen({ order, outlet, onTrack, onOrderAgain }: { order: Order; outlet: NonNullable<ReturnType<typeof outlets.find>>; onTrack: () => void; onOrderAgain: () => void }) {
  return <section className="confirmation-page"><div className="confirmation-glow" /><div className="confirmation-card"><div className="success-icon"><Check size={28} /></div><span className="eyebrow">We heard you</span><h1>Order<br /><em>confirmed.</em></h1><p className="confirmation-copy">The good stuff is already on the grill.</p><div className="order-number"><span>ORDER NUMBER</span><strong># {order.id}</strong></div><div className="confirmation-meta"><div><span>OUTLET</span><strong>{outlet.shortName}</strong></div><div><span>{order.orderType === 'Dine-in' ? 'TABLE' : 'TYPE'}</span><strong>{order.orderType === 'Dine-in' ? order.table : 'Takeaway'}</strong></div><div><span>READY IN</span><strong>15–20 min</strong></div></div><Button onClick={onTrack}>Track your order <ArrowRight size={16} /></Button><button className="text-button" onClick={onOrderAgain}>Order something else</button></div></section>;
}

function TrackingScreen({ order, outlet, onBack }: { order: Order; outlet: NonNullable<ReturnType<typeof outlets.find>>; onBack: () => void }) {
  const activeIndex = statusSteps.indexOf(order.status);
  return <section className="tracking-page"><button className="back-link" onClick={onBack}><ChevronLeft size={15} /> Back to menu</button><div className="tracking-top"><div><span className="eyebrow">Live order tracking</span><h1>Order <em>#{order.id}</em></h1><p>{outlet.shortName} <span>·</span> {order.orderType === 'Dine-in' ? `Table ${order.table}` : 'Takeaway'} <span>·</span> {order.createdAt}</p></div><Badge tone={order.status === 'COMPLETED' ? 'green' : 'orange'}><span className="status-dot" /> {statusLabels[order.status]}</Badge></div><div className="tracking-card"><div className="tracking-card-header"><div><span className="eyebrow">Kitchen timeline</span><h2>{order.status === 'COMPLETED' ? 'That one was a good one.' : order.status === 'READY' ? 'Come and get it.' : 'Your order is in motion.'}</h2></div><div className="tracking-live"><span className="live-pulse" /> LIVE</div></div><div className="status-stepper">{statusSteps.map((step, index) => <div className={`track-step ${index < activeIndex ? 'complete' : ''} ${index === activeIndex ? 'active' : ''}`} key={step}><div className="track-marker">{index < activeIndex ? <Check size={14} /> : index === activeIndex ? <span /> : <i />}</div><div><span>{step === 'NEW' ? 'ORDER RECEIVED' : step}</span><small>{index === activeIndex ? (step === 'NEW' ? 'The counter has your order' : statusLabels[step]) : index < activeIndex ? 'Done' : 'Up next'}</small></div></div>)}</div><div className="tracking-footer"><div><span>Order total</span><strong>{money(order.total)}</strong></div><div><span>Items</span><strong>{order.items.reduce((sum, item) => sum + item.quantity, 0)} pieces</strong></div><button onClick={() => window.alert('The counter has been notified.')}><Bell size={15} /> Need help?</button></div></div><p className="tracking-demo-note"><Sparkles size={14} /> Switch to Counter Staff above to move this order through the kitchen.</p></section>;
}

function OrderCard({ order, onAdvance }: { order: Order; onAdvance: (id: number) => void }) {
  const canAdvance = Boolean(nextStatus[order.status]);
  const actionLabel: Record<string, string> = { NEW: 'Accept order', ACCEPTED: 'Start preparing', PREPARING: 'Mark ready', READY: 'Complete order' };
  return <article className="order-card"><div className="order-card-head"><div><span className="order-id">#{order.id}</span><span className="order-time"><Clock3 size={13} /> {order.createdAt}</span></div><Badge tone={order.status === 'NEW' ? 'red' : order.status === 'READY' ? 'green' : order.status === 'COMPLETED' ? 'neutral' : 'orange'}>{statusLabels[order.status]}</Badge></div><div className="order-context"><span>{order.orderType === 'Dine-in' ? <Utensils size={13} /> : <ShoppingBag size={13} />} {order.orderType}</span>{order.table && <span>Table {order.table}</span>}<span>{order.customer}</span></div><div className="order-items">{order.items.map(item => <div key={`${item.id}-${item.customization}`}><span><b>{item.quantity}×</b> {item.name}{item.customization && <small>{item.customization}</small>}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="order-card-foot"><strong>{money(order.total)}</strong>{canAdvance ? <Button variant="soft" onClick={() => onAdvance(order.id)}>{actionLabel[order.status]} <ArrowRight size={14} /></Button> : <span className="completed-mark"><Check size={14} /> Closed out</span>}</div></article>;
}

function CounterView({ orders, setOrders }: { orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const [outletId, setOutletId] = useState('outlet-2');
  const outlet = outlets.find(item => item.id === outletId)!;
  const visibleOrders = orders.filter(order => order.outletId === outletId);
  const advance = (id: number) => setOrders(current => current.map(order => order.id === id && nextStatus[order.status] ? { ...order, status: nextStatus[order.status]! } : order));
  const columns: OrderStatus[] = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
  return <div className="dashboard-shell counter-shell"><div className="dashboard-top"><div><span className="eyebrow">Counter staff / live service</span><h1>Keep the outlet moving.</h1><p>Every order, one clear next step.</p></div><div className="dashboard-actions"><button className="refresh-button" onClick={() => setOrders([...orders])}><RotateCcw size={15} /> Refresh</button><div className="select-wrap"><Store size={15} /><select value={outletId} onChange={event => setOutletId(event.target.value)}>{outlets.map(item => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select><ChevronDown size={14} /></div></div></div><div className="counter-summary"><div><span>ON SHIFT</span><strong>{outlet.shortName}</strong><small><span className="status-dot" /> {outlet.status} · {outlet.tables} tables</small></div><div><span>OPEN ORDERS</span><strong>{visibleOrders.filter(order => order.status !== 'COMPLETED').length.toString().padStart(2, '0')}</strong><small>Across the room</small></div><div><span>AVG. PREP</span><strong>14<span> min</span></strong><small>Last 20 orders</small></div><div><span>LAST ORDER</span><strong>#{Math.max(...visibleOrders.map(item => item.id), 0)}</strong><small>Just now</small></div></div><div className="board-toolbar"><div className="board-title"><LayoutDashboard size={17} /><strong>Kitchen board</strong><span>Updated a few seconds ago</span></div><div className="board-legend"><span><i className="legend-dot red" /> Needs action</span><span><i className="legend-dot orange" /> In motion</span><span><i className="legend-dot green" /> Ready</span></div></div><div className="kanban-board">{columns.map(status => { const columnOrders = visibleOrders.filter(order => order.status === status); return <section className={`kanban-column column-${status.toLowerCase()}`} key={status}><div className="column-header"><div><span className="column-kicker">{status === 'NEW' ? 'Needs action' : status === 'COMPLETED' ? 'Today' : 'In the kitchen'}</span><h2>{status}</h2></div><span className="column-count">{columnOrders.length.toString().padStart(2, '0')}</span></div><div className="column-list">{columnOrders.length === 0 ? <div className="column-empty"><Check size={16} /><span>Clear for now</span></div> : columnOrders.map(order => <OrderCard key={order.id} order={order} onAdvance={advance} />)}</div></section>; })}</div></div>;
}

function OwnerView({ orders, setOrders }: { orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const [filter, setFilter] = useState('All outlets');
  const filteredOrders = filter === 'All outlets' ? orders : orders.filter(order => outlets.find(outlet => outlet.id === order.outletId)?.shortName === filter);
  const revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = filteredOrders.filter(order => order.status !== 'COMPLETED').length;
  const avg = filteredOrders.length ? Math.round(revenue / filteredOrders.length) : 0;
  const popularItems = [menuItems[0], menuItems[4], menuItems[7], menuItems[1]].map(item => ({ item, units: orders.reduce((sum, order) => sum + order.items.filter(orderItem => orderItem.id === item.id).reduce((inner, orderItem) => inner + orderItem.quantity, 0), 0) }));
  const outletStats = outlets.map(outlet => ({ ...outlet, orders: orders.filter(order => order.outletId === outlet.id), revenue: orders.filter(order => order.outletId === outlet.id).reduce((sum, order) => sum + order.total, 0) }));
  return <div className="dashboard-shell owner-shell"><div className="dashboard-top owner-top"><div><span className="eyebrow">Owner dashboard / Sunday, 20 Sep 2026</span><h1>Good service<br /><em>is good business.</em></h1><p>A clear view of what’s happening across every outlet.</p></div><div className="owner-filter"><span>VIEWING</span><div className="select-wrap"><Store size={15} /><select value={filter} onChange={event => setFilter(event.target.value)}><option>All outlets</option>{outlets.map(item => <option key={item.id}>{item.shortName}</option>)}</select><ChevronDown size={14} /></div></div></div><div className="metric-grid"><MetricCard label="Today’s revenue" value={money(revenue)} delta="+12.4%" note="vs last Sunday" icon={<BarChart3 size={17} />} tone="orange" /><MetricCard label="Total orders" value={filteredOrders.length.toString().padStart(2, '0')} delta="+8.1%" note="across the day" icon={<ShoppingBag size={17} />} tone="red" /><MetricCard label="Average order" value={money(avg)} delta="+₹40" note="vs last Sunday" icon={<Zap size={17} />} tone="yellow" /><MetricCard label="Active now" value={activeOrders.toString().padStart(2, '0')} delta="Live" note="orders in motion" icon={<Clock3 size={17} />} tone="green" /></div><div className="owner-grid"><section className="analytics-card sales-card"><div className="analytics-head"><div><span className="eyebrow">Sales overview</span><h2>Good momentum.</h2></div><Badge tone="green"><span className="status-dot" /> Live today</Badge></div><div className="chart-wrap"><div className="chart-y"><span>₹5k</span><span>₹3k</span><span>₹1k</span><span>0</span></div><div className="chart-area"><div className="chart-gridlines"><i /><i /><i /><i /></div><svg viewBox="0 0 640 220" preserveAspectRatio="none" aria-label="Sales trend chart"><defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#F97316" stopOpacity="0.34" /><stop offset="1" stopColor="#F97316" stopOpacity="0" /></linearGradient></defs><path d="M0 185 C48 173, 64 152, 105 163 S170 132, 210 145 S280 90, 325 120 S392 83, 432 93 S482 62, 520 78 S586 32, 640 45 L640 220 L0 220 Z" fill="url(#salesFill)" /><path d="M0 185 C48 173, 64 152, 105 163 S170 132, 210 145 S280 90, 325 120 S392 83, 432 93 S482 62, 520 78 S586 32, 640 45" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-x"><span>11 AM</span><span>1 PM</span><span>3 PM</span><span>5 PM</span><span>7 PM</span><span>9 PM</span></div></div></div><div className="chart-footer"><span><i className="legend-dot orange" /> Revenue</span><strong>{money(revenue)} <small>today</small></strong></div></section><section className="analytics-card outlet-performance"><div className="analytics-head"><div><span className="eyebrow">Three outlets</span><h2>Outlet performance</h2></div><button className="icon-button" aria-label="More outlet options"><MoreHorizontal size={18} /></button></div><div className="outlet-bars">{outletStats.map(stat => <div className="outlet-bar-row" key={stat.id}><div className="bar-label"><span>{stat.shortName}</span><strong>{money(stat.revenue)}</strong></div><div className="bar-track"><i style={{ width: `${Math.max(18, (stat.revenue / Math.max(...outletStats.map(item => item.revenue))) * 100)}%`, background: stat.accent }} /></div><small>{stat.orders.length} orders · {stat.status}</small></div>)}</div><button className="text-button dark-text" onClick={() => setFilter('All outlets')}>View all outlets <ArrowRight size={15} /></button></section><section className="analytics-card popular-card"><div className="analytics-head"><div><span className="eyebrow">What people want</span><h2>Popular items</h2></div><span className="period-pill">Today <ChevronDown size={13} /></span></div><div className="popular-list">{popularItems.map(({ item, units }, index) => <div key={item.id}><span className="popular-rank">0{index + 1}</span><img src={item.image} alt="" /><span className="popular-name"><strong>{item.name}</strong><small>{units} sold</small></span><span className="popular-share">{units} units</span></div>)}</div></section><section className="analytics-card recent-card"><div className="analytics-head"><div><span className="eyebrow">Across the rooms</span><h2>Recent orders</h2></div><button className="text-button dark-text" onClick={() => setOrders([...orders])}>Refresh <RotateCcw size={14} /></button></div><div className="recent-table"><div className="table-row table-head"><span>ORDER</span><span>OUTLET</span><span>TYPE</span><span>TOTAL</span><span>STATUS</span></div>{filteredOrders.slice().sort((a, b) => b.id - a.id).slice(0, 5).map(order => <div className="table-row" key={order.id}><strong>#{order.id}</strong><span>{outlets.find(outlet => outlet.id === order.outletId)?.shortName}</span><span>{order.orderType}</span><strong>{money(order.total)}</strong><Badge tone={order.status === 'COMPLETED' ? 'neutral' : 'orange'}>{order.status}</Badge></div>)}</div></section></div></div>;
}

function MetricCard({ label, value, delta, note, icon, tone }: { label: string; value: string; delta: string; note: string; icon: React.ReactNode; tone: string }) {
  return <article className={`metric-card metric-${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><strong>{value}</strong><div><Badge tone={tone === 'green' ? 'green' : tone === 'red' ? 'red' : 'orange'}>{delta}</Badge><small>{note}</small></div></article>;
}

function RoleLogin({ role, onSuccess }: { role: 'counter' | 'owner'; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isCounter = role === 'counter';
  const submit = () => { const valid = isCounter ? email === 'counter@mh99.com' && password === 'counter123' : email === 'owner@mh99.com' && password === 'owner123'; if (valid) onSuccess(); else setError(`Use the demo ${isCounter ? 'counter@mh99.com / counter123' : 'owner@mh99.com / owner123'} credentials.`); };
  return <section className="login-page"><div className="login-card"><div className="login-brand"><Logo /><Badge tone={isCounter ? 'orange' : 'red'}>{isCounter ? 'COUNTER STAFF' : 'OWNER'}</Badge></div><span className="eyebrow">Demo access / {isCounter ? 'outlet 2' : 'all outlets'}</span><h1>{isCounter ? <>Run the<br /><em>counter.</em></> : <>See the<br /><em>whole picture.</em></>}</h1><p>{isCounter ? 'Sign in to manage live orders for MH99 Burgers — Andheri West.' : 'Sign in to view revenue, outlet performance, and order history.'}</p><label>Email<input type="email" value={email} onChange={event => { setEmail(event.target.value); setError(''); }} placeholder={isCounter ? 'counter@mh99.com' : 'owner@mh99.com'} /></label><label>Password<input type="password" value={password} onChange={event => { setPassword(event.target.value); setError(''); }} placeholder="••••••••" onKeyDown={event => event.key === 'Enter' && submit()} /></label>{error && <div className="login-error">{error}</div>}<Button className="full-width" onClick={submit}>Login <ArrowRight size={16} /></Button><div className="login-demo"><span>Demo credentials</span><strong>{isCounter ? 'counter@mh99.com · counter123' : 'owner@mh99.com · owner123'}</strong></div></div></section>;
}

export default function App() {
  const [role, setRole] = useState<Role>('customer');
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerScreen, setCustomerScreen] = useState<'home' | 'menu' | 'checkout' | 'confirmation' | 'tracking'>('home');
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [order, setOrder] = useState<Order | null>(null);
  const [counterAuthed, setCounterAuthed] = useState(false);
  const [ownerAuthed, setOwnerAuthed] = useState(false);
  const liveOrder = order ? orders.find(item => item.id === order.id) ?? order : null;
  const selectedOutletName = outlets.find(item => item.id === selectedOutlet)?.shortName;
  const switchRole = (nextRole: Role) => { setRole(nextRole); if (nextRole === 'customer' && liveOrder) { setOrder(liveOrder); setCustomerScreen('tracking'); } };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <div className="app"><Topbar role={role} setRole={switchRole} cartCount={cartCount} cartTotal={cartTotal} onCart={() => setCartOpen(true)} selectedOutlet={selectedOutletName} />{role === 'customer' && <CustomerView selectedOutlet={selectedOutlet} setSelectedOutlet={setSelectedOutlet} cart={cart} setCart={setCart} cartOpen={cartOpen} setCartOpen={setCartOpen} customerScreen={customerScreen} setCustomerScreen={setCustomerScreen} order={liveOrder} setOrder={next => { const value = typeof next === 'function' ? next(liveOrder) : next; if (value) setOrders(current => current.some(item => item.id === value.id) ? current.map(item => item.id === value.id ? value : item) : [...current, value]); setOrder(value); }} />}{role === 'counter' && (counterAuthed ? <CounterView orders={orders} setOrders={setOrders} /> : <RoleLogin role="counter" onSuccess={() => setCounterAuthed(true)} />)}{role === 'owner' && (ownerAuthed ? <OwnerView orders={orders} setOrders={setOrders} /> : <RoleLogin role="owner" onSuccess={() => setOwnerAuthed(true)} />)}<footer className="site-footer"><Logo compact /><span>MH99 Burgers · Good food, loud flavour.</span><span className="footer-right">© 2026 MH99 / Demo OS</span></footer></div>;
}
