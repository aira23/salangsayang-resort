// ========== GLOBAL ==========
let currentUser = null;

// ========== AUTH CHECK ==========
async function checkAuth() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  currentUser = data.user;
  if (currentUser) {
    if (document.getElementById('authButtons')) document.getElementById('authButtons').classList.add('hidden');
    if (document.getElementById('userMenu')) {
      document.getElementById('userMenu').classList.remove('hidden');
      if (document.getElementById('userName')) document.getElementById('userName').innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
    }
  } else {
    if (document.getElementById('authButtons')) document.getElementById('authButtons').classList.remove('hidden');
    if (document.getElementById('userMenu')) document.getElementById('userMenu').classList.add('hidden');
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/index.html';
}

// Modal controls
function showLoginModal() { const m = document.getElementById('loginModal'); if (m) { m.classList.remove('hidden'); m.classList.add('flex'); } }
function closeLoginModal() { const m = document.getElementById('loginModal'); if (m) { m.classList.add('hidden'); m.classList.remove('flex'); } }
function showRegisterModal() { const m = document.getElementById('registerModal'); if (m) { m.classList.remove('hidden'); m.classList.add('flex'); } }
function closeRegisterModal() { const m = document.getElementById('registerModal'); if (m) { m.classList.add('hidden'); m.classList.remove('flex'); } }

// ========== LOGIN HANDLER (with admin redirect) ==========
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user && data.user.role === 'admin') {
        // Redirect admin to admin panel
        window.location.href = '/admin.html';
      } else {
        // Redirect normal user to home page
        window.location.href = '/index.html';
      }
    } else {
      alert('Login failed');
    }
  });
}

// ========== REGISTER HANDLER ==========
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    if (password.length < 6) return alert('Password min 6 chars');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (res.ok) {
      alert('Registered! Please login');
      closeRegisterModal();
    } else {
      alert('Email already exists');
    }
  });
}

// Cancel booking function (for user)
async function cancelBooking(id) {
  if (confirm('Cancel this booking?')) {
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    window.location.reload();
  }
}

// ========== ADMIN FUNCTIONS (used by admin.html) ==========
async function loadRoomsAdmin() {
  const res = await fetch('/api/rooms');
  const rooms = await res.json();
  const container = document.getElementById('roomsList');
  if (!container) return;
  container.innerHTML = rooms.map(r => `
    <div class="bg-white rounded-2xl shadow p-4">
      <img src="${r.image}" class="h-40 w-full object-cover rounded-xl">
      <h3 class="font-bold text-lg mt-2">${r.type}</h3>
      <p class="text-teal-600 font-bold">RM${r.pricePerNight} / night</p>
      <p class="text-sm text-gray-500">Quantity: ${r.quantity} units | Max: ${r.maxGuests}</p>
      <div class="flex gap-2 mt-3">
        <button onclick="editRoom('${r.id}')" class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm"><i class="fas fa-edit"></i> Edit</button>
        <button onclick="deleteRoom('${r.id}')" class="bg-red-500 text-white px-3 py-1 rounded-full text-sm"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>
  `).join('');
}

async function loadAllBookings() {
  const res = await fetch('/api/admin/bookings');
  const bookings = await res.json();
  const container = document.getElementById('allBookingsList');
  if (!container) return;
  const filterInput = document.getElementById('filterBookings');
  const render = () => {
    const filter = filterInput?.value.toLowerCase() || '';
    const filtered = bookings.filter(b => b.roomName.toLowerCase().includes(filter) || b.userId.includes(filter));
    container.innerHTML = filtered.map(b => `
      <div class="bg-white rounded-xl shadow p-4 flex justify-between items-center flex-wrap">
        <div><p class="font-semibold">${b.roomName} (${b.roomCount || 1} rooms)</p><p class="text-sm">${b.checkIn} → ${b.checkOut} | Guests: ${b.guests} | Total: RM${b.totalPrice}</p><span class="text-xs ${b.status === 'cancelled' ? 'text-red-500' : 'text-green-600'}">${b.status}</span></div>
        ${b.status !== 'cancelled' ? `<button onclick="adminCancelBooking('${b.id}')" class="bg-red-500 text-white px-3 py-1 rounded-full text-sm">Cancel</button>` : ''}
      </div>
    `).join('');
  };
  render();
  if (filterInput) filterInput.addEventListener('input', render);
}

async function adminCancelBooking(id) {
  if (confirm('Cancel this booking?')) {
    await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    loadAllBookings();
  }
}

async function loadUsers() {
  const res = await fetch('/api/admin/users');
  const users = await res.json();
  const tbody = document.getElementById('usersTableBody');
  if (tbody) tbody.innerHTML = users.map(u => `<tr class="border-b"><td class="px-6 py-3">${u.name}</td><td class="px-6 py-3">${u.email}</td><td class="px-6 py-3">${u.role}</td></tr>`).join('');
}

async function editRoom(id) {
  const res = await fetch('/api/rooms');
  const rooms = await res.json();
  const room = rooms.find(r => r.id === id);
  if (room) openRoomModal(room);
}

async function deleteRoom(id) {
  if (confirm('Delete this room? Active bookings will be affected.')) {
    const res = await fetch(`/api/admin/rooms/${id}`, { method: 'DELETE' });
    if (res.ok) { alert('Room deleted'); loadRoomsAdmin(); } else alert('Cannot delete: active bookings exist');
  }
}

// Make functions global for admin.html
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.adminCancelBooking = adminCancelBooking;
window.showTab = function(tab) {
  const roomsTab = document.getElementById('roomsTab');
  const bookingsTab = document.getElementById('bookingsTab');
  const usersTab = document.getElementById('usersTab');
  if (roomsTab) roomsTab.classList.add('hidden');
  if (bookingsTab) bookingsTab.classList.add('hidden');
  if (usersTab) usersTab.classList.add('hidden');
  if (tab === 'rooms' && roomsTab) roomsTab.classList.remove('hidden');
  if (tab === 'bookings' && bookingsTab) { bookingsTab.classList.remove('hidden'); loadAllBookings(); }
  if (tab === 'users' && usersTab) { usersTab.classList.remove('hidden'); loadUsers(); }
  // Update button styles
  const btnRooms = document.getElementById('tabRoomsBtn');
  const btnBookings = document.getElementById('tabBookingsBtn');
  const btnUsers = document.getElementById('tabUsersBtn');
  if (btnRooms) btnRooms.classList.remove('border-teal-600', 'text-teal-600', 'border-b-2');
  if (btnBookings) btnBookings.classList.remove('border-teal-600', 'text-teal-600', 'border-b-2');
  if (btnUsers) btnUsers.classList.remove('border-teal-600', 'text-teal-600', 'border-b-2');
  if (tab === 'rooms' && btnRooms) btnRooms.classList.add('border-teal-600', 'text-teal-600', 'border-b-2');
  if (tab === 'bookings' && btnBookings) btnBookings.classList.add('border-teal-600', 'text-teal-600', 'border-b-2');
  if (tab === 'users' && btnUsers) btnUsers.classList.add('border-teal-600', 'text-teal-600', 'border-b-2');
};

// Room modal functions (admin.html will override if needed)
window.openRoomModal = window.openRoomModal || function(room) { console.log('openRoomModal not defined'); };
window.closeRoomModal = window.closeRoomModal || function() { console.log('closeRoomModal not defined'); };

// ========== RUN CHECK AUTH ON PAGE LOAD ==========
checkAuth();