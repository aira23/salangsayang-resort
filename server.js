const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

// Default data with enhanced room images (8 rooms, each quantity 5)
const defaultData = {
  users: [
    { id: 'admin1', name: 'Administrator', email: 'admin@salangsayang.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' }
  ],
  bookings: [],
  rooms: [
    { id: '1', type: 'Fan Room - Double Garden View', pricePerNight: 80, maxGuests: 2, quantity: 5, image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800', images: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'], description: 'Cozy fan room overlooking tropical garden.', features: ['Double Bed','Fan','Garden View','Free WiFi','Daily Housekeeping'], bedType: 'Double Bed (140cm)', roomSize: '22 m²', view: 'Garden View', bathroom: 'Private bathroom with shower', cancellationPolicy: 'Free cancellation up to 7 days before check-in.', capacityText: 'Max 2 adults' },
    { id: '2', type: 'Fan Room - Double Sea View', pricePerNight: 120, maxGuests: 2, quantity: 5, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800', images: ['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&w=800'], description: 'Enjoy sea breeze from your window.', features: ['Double Bed','Fan','Sea View','Free WiFi','Balcony'], bedType: 'Double Bed (150cm)', roomSize: '24 m²', view: 'Sea View', bathroom: 'Private bathroom with rain shower', cancellationPolicy: 'Free cancellation up to 7 days before check-in.', capacityText: 'Max 2 adults' },
    { id: '3', type: 'Fan Room - Banana Hill', pricePerNight: 100, maxGuests: 2, quantity: 5, image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800', images: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&w=800'], description: 'Quiet hill location.', features: ['Double Bed','Fan','Hill View','Free WiFi','Terrace'], bedType: 'Double Bed (140cm)', roomSize: '22 m²', view: 'Hill View', bathroom: 'Private bathroom with shower', cancellationPolicy: 'Free cancellation up to 7 days before check-in.', capacityText: 'Max 2 adults' },
    { id: '4', type: 'AC Room - Banana Hill', pricePerNight: 130, maxGuests: 2, quantity: 5, image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800', images: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&w=800'], description: 'Air-conditioned comfort.', features: ['Double Bed','Air Conditioning','Hill View','Free WiFi','Terrace'], bedType: 'Queen Bed (160cm)', roomSize: '26 m²', view: 'Hill View', bathroom: 'Private bathroom with bathtub', cancellationPolicy: 'Free cancellation up to 7 days before check-in.', capacityText: 'Max 2 adults' },
    { id: '5', type: 'AC Triple - Garden View', pricePerNight: 180, maxGuests: 3, quantity: 5, image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800', images: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'], description: 'Spacious for small groups.', features: ['3 Single Beds','Air Conditioning','Garden View','Free WiFi','Seating Area'], bedType: '3 Single Beds (90cm)', roomSize: '32 m²', view: 'Garden View', bathroom: 'Private bathroom with shower', cancellationPolicy: 'Free cancellation up to 7 days before check-in.', capacityText: 'Max 3 adults' },
    { id: '6', type: 'AC Family - Garden View', pricePerNight: 220, maxGuests: 4, quantity: 5, image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800', images: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&w=800'], description: 'Ideal for families.', features: ['Queen + Single Bed','Air Conditioning','Garden View','Free WiFi','Living Area'], bedType: 'Queen Bed + Single Bed', roomSize: '38 m²', view: 'Garden View', bathroom: 'Private bathroom with bathtub', cancellationPolicy: 'Free cancellation up to 7 days before check-in.', capacityText: 'Max 4 adults' },
    { id: '7', type: 'AC Deluxe Double - Sea View', pricePerNight: 250, maxGuests: 2, quantity: 5, image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800', images: ['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'], description: 'Deluxe room with sea view balcony.', features: ['King Bed','Air Conditioning','Sea View Balcony','Free WiFi','Mini Bar','Jacuzzi'], bedType: 'King Bed (180cm)', roomSize: '45 m²', view: 'Panoramic Sea View', bathroom: 'Private bathroom with Jacuzzi', cancellationPolicy: 'Free cancellation up to 14 days before check-in.', capacityText: 'Max 2 adults + 1 child' },
    { id: '8', type: 'AC Super Deluxe Triple - Sea View', pricePerNight: 250, maxGuests: 3, quantity: 5, image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800', images: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg?auto=compress&cs=tinysrgb&w=800'], description: 'Luxurious triple room with sea view.', features: ['King + Single Bed','Air Conditioning','Sea View Balcony','Free WiFi','Living Area'], bedType: 'King Bed + Single Bed', roomSize: '48 m²', view: 'Sea View', bathroom: 'Private bathroom with rain shower', cancellationPolicy: 'Free cancellation up to 14 days before check-in.', capacityText: 'Max 3 adults' }
  ]
};

// Database setup
const adapter = new JSONFile('db.json');
const db = new Low(adapter, defaultData);
db.read().then(async () => { if (!db.data) db.data = defaultData; await db.write(); });

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(session({ secret: 'salangsayang-secret', resave: false, saveUninitialized: false, cookie: { maxAge: 24*60*60*1000 } }));

// Helper functions
function requireAuth(req,res,next) { if(req.session.userId) next(); else res.status(401).json({error:'Login required'}); }
function requireAdmin(req,res,next) { const u = db.data.users.find(u=>u.id===req.session.userId); if(u && u.role==='admin') next(); else res.status(403).json({error:'Admin only'}); }
function getBookedCount(roomId, checkIn, checkOut, excludeId=null) {
  const ci = new Date(checkIn), co = new Date(checkOut);
  return db.data.bookings.filter(b => b.roomId===roomId && b.status!=='cancelled' && (excludeId!==b.id) && (ci < new Date(b.checkOut) && co > new Date(b.checkIn))).reduce((s,b)=>s+(b.roomCount||1),0);
}
function checkAvailability(roomId, checkIn, checkOut, roomCount, excludeId=null) {
  const room = db.data.rooms.find(r=>r.id===roomId);
  if(!room) return false;
  const booked = getBookedCount(roomId, checkIn, checkOut, excludeId);
  return (room.quantity - booked) >= roomCount;
}

// Auth routes
app.post('/api/auth/register', async (req,res)=>{
  const {name,email,password}=req.body;
  if(db.data.users.find(u=>u.email===email)) return res.status(400).json({error:'Email exists'});
  const hashed=await bcrypt.hash(password,10);
  const user={id:Date.now().toString(),name,email,password:hashed,role:'user'};
  db.data.users.push(user); await db.write();
  req.session.userId=user.id;
  res.json({success:true,user:{id:user.id,name,email,role:'user'}});
});
app.post('/api/auth/login', async (req,res)=>{
  const {email,password}=req.body;
  const user=db.data.users.find(u=>u.email===email);
  if(!user || !(await bcrypt.compare(password,user.password))) return res.status(401).json({error:'Invalid'});
  req.session.userId=user.id;
  res.json({success:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
});
app.get('/api/auth/me', (req,res)=>{
  const user=db.data.users.find(u=>u.id===req.session.userId);
  res.json({user:user?{id:user.id,name:user.name,email:user.email,role:user.role}:null});
});
app.post('/api/auth/logout', (req,res)=>{ req.session.destroy(); res.json({success:true}); });

// Room routes
app.get('/api/rooms', (req,res)=>res.json(db.data.rooms));
app.post('/api/check-availability', (req,res)=>{
  const {roomId,checkIn,checkOut,roomCount=1}=req.body;
  const room=db.data.rooms.find(r=>r.id===roomId);
  const booked=getBookedCount(roomId,checkIn,checkOut);
  const remaining=room?room.quantity-booked:0;
  res.json({available:remaining>=roomCount,remaining,total:room?room.quantity:0});
});

// User bookings - GET
app.get('/api/bookings', requireAuth, (req,res)=>{
  res.json(db.data.bookings.filter(b=>b.userId===req.session.userId));
});

// User bookings - POST (with guest details)
app.post('/api/bookings', requireAuth, async (req,res)=>{
  const {
    roomId, roomName, checkIn, checkOut, guests, roomCount, totalPrice,
    guestFullName, guestPhone, guestEmail, specialRequests
  } = req.body;
  
  if(!checkAvailability(roomId, checkIn, checkOut, roomCount)) {
    return res.status(409).json({error:'Not enough rooms available'});
  }
  
  const user = db.data.users.find(u => u.id === req.session.userId);
  const userName = user ? user.name : 'Unknown';
  const userEmail = user ? user.email : '';
  
  const booking = {
    id: Date.now().toString(),
    userId: req.session.userId,
    userName: userName,
    roomId, roomName, checkIn, checkOut,
    guests: parseInt(guests),
    roomCount: parseInt(roomCount),
    totalPrice: parseFloat(totalPrice),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    // Guest details for admin reference
    guestFullName: guestFullName || userName,
    guestPhone: guestPhone || '',
    guestEmail: guestEmail || userEmail,
    specialRequests: specialRequests || ''
  };
  
  db.data.bookings.push(booking);
  await db.write();
  res.json({ success: true, booking });
});

// Cancel booking (user)
app.delete('/api/bookings/:id', requireAuth, async (req,res)=>{
  const b = db.data.bookings.find(b=>b.id===req.params.id);
  if(b && b.userId===req.session.userId) {
    b.status = 'cancelled';
    await db.write();
    res.json({success:true});
  } else {
    res.status(404).json({error:'Not found'});
  }
});

// Contact
app.post('/api/contact', async (req,res)=>res.json({success:true}));

// Admin routes
app.get('/api/admin/bookings', requireAuth, requireAdmin, (req,res)=>res.json(db.data.bookings));
app.delete('/api/admin/bookings/:id', requireAuth, requireAdmin, async (req,res)=>{
  const b=db.data.bookings.find(b=>b.id===req.params.id);
  if(b) { b.status='cancelled'; await db.write(); }
  res.json({success:true});
});
app.get('/api/admin/users', requireAuth, requireAdmin, (req,res)=>{
  res.json(db.data.users.map(u=>({id:u.id,name:u.name,email:u.email,role:u.role})));
});
app.post('/api/admin/rooms', requireAuth, requireAdmin, async (req,res)=>{
  const newRoom={id:Date.now().toString(),...req.body,pricePerNight:parseFloat(req.body.pricePerNight),quantity:parseInt(req.body.quantity)};
  db.data.rooms.push(newRoom); await db.write(); res.json({success:true});
});
app.put('/api/admin/rooms/:id', requireAuth, requireAdmin, async (req,res)=>{
  const room=db.data.rooms.find(r=>r.id===req.params.id);
  if(room) Object.assign(room,req.body); await db.write(); res.json({success:true});
});
app.delete('/api/admin/rooms/:id', requireAuth, requireAdmin, async (req,res)=>{
  db.data.rooms=db.data.rooms.filter(r=>r.id!==req.params.id); await db.write(); res.json({success:true});
});

const PORT=3000;
app.listen(PORT,()=>console.log(`✨ SalangSayang Resort running at http://localhost:${PORT}`));