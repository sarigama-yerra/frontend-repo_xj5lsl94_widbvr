import { useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND = import.meta.env.VITE_BACKEND_URL || ''

function Section({ title, children }) {
  return (
    <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-6">{title}</h2>
      {children}
    </section>
  )
}

function ProductCard({ p, onAdd }) {
  return (
    <div className="group bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur hover:border-white/20 hover:bg-white/10 transition relative">
      <div className="aspect-square w-full overflow-hidden rounded-lg mb-3 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20">
        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop'} alt={p.title} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition" />
      </div>
      <h3 className="text-white font-medium mb-1">{p.title}</h3>
      <p className="text-white/60 text-sm line-clamp-2 mb-3">{p.description || 'Premium device with smooth draw and long battery life.'}</p>
      <div className="flex items-center justify-between">
        <span className="text-cyan-300 font-semibold">${p.price?.toFixed?.(2) || '49.99'}</span>
        <button onClick={() => onAdd(p)} className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 transition">Add to Cart</button>
      </div>
    </div>
  )
}

function CartDrawer({ open, setOpen, cart, setCart, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0b0f1a]/95 border-l border-white/10 backdrop-blur-xl transition-transform duration-300 z-40 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        <h3 className="text-white text-lg font-semibold">Your Cart</h3>
        <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">Close</button>
      </div>
      <div className="p-5 space-y-4 max-h-[60vh] overflow-auto">
        {cart.length === 0 && <p className="text-white/60">Your cart is empty.</p>}
        {cart.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-center">
            <img src={item.image} className="w-16 h-16 rounded object-cover" />
            <div className="flex-1">
              <p className="text-white text-sm">{item.title}</p>
              <p className="text-white/60 text-xs">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-white/10 rounded" onClick={() => setCart(c => c.map((x,i)=> i===idx?{...x, qty: Math.max(1, x.qty-1)}:x))}>-</button>
              <span className="text-white">{item.qty}</span>
              <button className="px-2 py-1 bg-white/10 rounded" onClick={() => setCart(c => c.map((x,i)=> i===idx?{...x, qty: x.qty+1}:x))}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-5 border-t border-white/10 mt-auto">
        <div className="flex items-center justify-between text-white mb-3">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button onClick={onCheckout} className="w-full py-3 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 transition">Proceed to Checkout</button>
      </div>
    </div>
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState([])
  const [booking, setBooking] = useState({name:'',email:'',device_type:'',issue_description:'',preferred_datetime:''})
  const [contact, setContact] = useState({name:'',email:'',message:''})

  useEffect(() => {
    fetch(`${BACKEND}/api/products?limit=12`).then(r=>r.json()).then((data)=>{
      if (Array.isArray(data) && data.length>0) setProducts(data)
      else setProducts(sampleProducts)
    }).catch(()=>setProducts(sampleProducts))
  }, [])

  const addToCart = (p) => {
    setCartOpen(true)
    setCart(c => {
      const found = c.find(i => i.title===p.title)
      if (found) return c.map(i => i.title===p.title ? {...i, qty: i.qty+1} : i)
      return [...c, {title: p.title, price: p.price || 49.99, qty:1, image: p.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop'}]
    })
  }

  const checkout = async () => {
    const items = cart.map(i => ({ product_id: 'placeholder', title: i.title, price: i.price, quantity: i.qty, image: i.image }))
    const total = items.reduce((s,i)=>s+i.price*i.quantity,0)
    try{
      await fetch(`${BACKEND}/api/orders`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({user_email:'guest@example.com', items, total, shipping:{full_name:'Guest', email:'guest@example.com', line1:'', city:'', state:'', postal_code:'', country:'', phone:''}, payment_method:'placeholder'}) })
      alert('Order placed! (placeholder payment)')
      setCart([]); setCartOpen(false)
    }catch(e){ alert('Failed to place order') }
  }

  const submitBooking = async (e) => {
    e.preventDefault()
    try{
      await fetch(`${BACKEND}/api/bookings`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...booking})})
      alert('Booking received!')
      setBooking({name:'',email:'',device_type:'',issue_description:'',preferred_datetime:''})
    }catch(e){ alert('Failed to book') }
  }

  const submitContact = async (e) => {
    e.preventDefault()
    try{
      await fetch(`${BACKEND}/api/contact`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...contact})})
      alert('Message sent!')
      setContact({name:'',email:'',message:''})
    }catch(e){ alert('Failed to send message') }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* Hero with Spline */}
      <div className="relative h-[70vh] w-full">
        <Spline scene="https://prod.spline.design/7m4PRZ7kg6K1jPfF/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070b14]/30 to-[#070b14] pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-indigo-300 drop-shadow">Elevate Your Vape</h1>
            <p className="mt-4 text-white/80 max-w-2xl mx-auto">Premium devices, e-liquids, and expert repair services. Futuristic design, ultra-smooth experience.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <a href="#shop" className="px-5 py-3 rounded-xl bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 transition">Shop Vapes</a>
              <a href="#repairs" className="px-5 py-3 rounded-xl bg-fuchsia-500/20 text-fuchsia-200 hover:bg-fuchsia-500/30 transition">Book Repairs</a>
            </div>
          </div>
        </div>
      </div>

      {/* Featured/New Arrivals */}
      <Section title="Featured Products" id="shop">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0,8).map((p, idx) => (
            <ProductCard key={idx} p={p} onAdd={addToCart} />
          ))}
        </div>
      </Section>

      <Section title="New Arrivals">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(4,12).map((p, idx) => (
            <ProductCard key={idx} p={p} onAdd={addToCart} />
          ))}
        </div>
      </Section>

      {/* Repairs / Booking */}
      <Section title="Repairs & Servicing">
        <div id="repairs" className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <p className="text-white/80">We handle battery replacements, coil changes, cleaning and full maintenance. Book a slot and our technician will confirm.</p>
            <ul className="text-white/70 list-disc list-inside">
              <li>Vape repairs</li>
              <li>Battery replacement</li>
              <li>Coil change</li>
              <li>Cleaning & maintenance</li>
            </ul>
          </div>
          <form onSubmit={submitBooking} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <input required placeholder="Name" className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/50" value={booking.name} onChange={e=>setBooking({...booking, name:e.target.value})} />
            <input required type="email" placeholder="Email" className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/50" value={booking.email} onChange={e=>setBooking({...booking, email:e.target.value})} />
            <input required placeholder="Device type" className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/50" value={booking.device_type} onChange={e=>setBooking({...booking, device_type:e.target.value})} />
            <textarea required placeholder="Issue description" className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/50" value={booking.issue_description} onChange={e=>setBooking({...booking, issue_description:e.target.value})} />
            <input type="datetime-local" className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/50" value={booking.preferred_datetime} onChange={e=>setBooking({...booking, preferred_datetime:e.target.value})} />
            <button className="w-full py-2 rounded bg-fuchsia-500/20 text-fuchsia-200 hover:bg-fuchsia-500/30">Book Service</button>
          </form>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Us">
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={submitContact} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
            <input required placeholder="Name" className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/50" value={contact.name} onChange={e=>setContact({...contact, name:e.target.value})} />
            <input required type="email" placeholder="Email" className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/50" value={contact.email} onChange={e=>setContact({...contact, email:e.target.value})} />
            <textarea required placeholder="Message" className="w-full px-3 py-2 rounded bg-white/10 placeholder-white/50" value={contact.message} onChange={e=>setContact({...contact, message:e.target.value})} />
            <button className="w-full py-2 rounded bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30">Send Message</button>
          </form>
          <div className="space-y-3">
            <p className="text-white/80">Reach us via WhatsApp, email, or visit our store.</p>
            <div className="grid grid-cols-2 gap-3">
              <a className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10" href="https://wa.me/1234567890" target="_blank">WhatsApp</a>
              <a className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10" href="mailto:hello@example.com">Email</a>
              <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/70">Google Maps placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 md:px-12 text-white/70">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
          <div>
            <p className="font-semibold text-white">Vaporium</p>
            <p className="text-sm mt-2">Futuristic vape shop with premium gear and expert servicing.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Quick Links</p>
            <ul className="text-sm space-y-1 mt-2">
              <li><a href="#shop">Shop</a></li>
              <li><a href="#repairs">Repairs</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Policies</p>
            <ul className="text-sm space-y-1 mt-2">
              <li><a href="#">Refund Policy</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="md:text-right">
            <button onClick={()=>setCartOpen(true)} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">View Cart ({cart.length})</button>
          </div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} setOpen={setCartOpen} cart={cart} setCart={setCart} onCheckout={checkout} />
    </div>
  )
}

const sampleProducts = [
  { title: 'Nebula X1 Starter Kit', price: 49.99, images:['https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop'], description:'Compact starter vape with smooth draw.' },
  { title: 'Quantum Pro Pod', price: 69.99, images:['https://images.unsplash.com/photo-1511117833895-3ae29a976dc5?q=80&w=800&auto=format&fit=crop'], description:'Premium pod system with long battery.' },
  { title: 'Galaxy Coil Pack', price: 14.99, images:['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'], description:'High-performance coils.' },
  { title: 'Aurora E-liquid 60ml', price: 12.99, images:['https://images.unsplash.com/photo-1514790193030-c89d266d5a9d?q=80&w=800&auto=format&fit=crop'], description:'Velvety fruit blend.' },
]

export default App
