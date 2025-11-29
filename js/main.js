// main.js
// Homepage interactivity, Leaflet map integration and demo auth using localStorage

// Sample chargers data (id, title, lat, lng, type, price, image)
const CHARGERS = [
  {id:1, title:"GreenPark Mall Charger", city:"Pune", pincode:"411001", lat:18.516726, lng:73.856255, type:"fast", price:25, img:"https://images.unsplash.com/photo-1512034704992-4f8a5c3e6f2b?auto=format&fit=crop&w=800&q=60"},
  {id:2, title:"Kothrud Home Charger", city:"Pune", pincode:"411038", lat:18.482, lng:73.818, type:"home", price:18, img:"https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=800&q=60"},
  {id:3, title:"Lavelle Road Fast Charger", city:"Bengaluru", pincode:"560001", lat:12.975, lng:77.605, type:"fast", price:45, img:"https://images.unsplash.com/photo-1542038784456-52e3c60b9d7f?auto=format&fit=crop&w=800&q=60"},
  {id:4, title:"MG Road Office Charger", city:"Bengaluru", pincode:"560001", lat:12.9755, lng:77.6055, type:"business", price:20, img:"https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=800&q=60"},
  {id:5, title:"Sea View Charger", city:"Goa", pincode:"403001", lat:15.4909, lng:73.8278, type:"home", price:35, img:"https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=60"}
];

// Utilities: DOM
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// Init elements
document.addEventListener('DOMContentLoaded', () => {
  // Year in footer
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = y;

  // Render chargers grid
  renderChargers(CHARGERS);

  // Initialize map
  initMap(CHARGERS);

  // Filter buttons
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter || 'all';
      const filtered = f === 'all' ? CHARGERS : CHARGERS.filter(c => c.type === f);
      renderChargers(filtered);
      updateMapMarkers(filtered);
    });
  });

  // Search
  $('#searchBtn').addEventListener('click', () => {
    const q = $('#searchInput').value.trim().toLowerCase();
    if(!q) { renderChargers(CHARGERS); updateMapMarkers(CHARGERS); return; }
    const filtered = CHARGERS.filter(c => (c.city + ' ' + c.pincode + ' ' + c.title).toLowerCase().includes(q));
    renderChargers(filtered);
    updateMapMarkers(filtered);
  });

  // Locate me
  $('#locateMe').addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(pos => {
      const {latitude, longitude} = pos.coords;
      map.setView([latitude, longitude], 13);
      if(userMarker) userMarker.setLatLng([latitude, longitude]);
      else userMarker = L.marker([latitude, longitude], {icon: userIcon}).addTo(map).bindPopup('You are here').openPopup();
    }, () => alert('Unable to get location.'));
  });
});

// ----------- Map Setup -------------
let map, markersLayer, userMarker;
const userIcon = L.icon({iconUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', iconSize:[25,41], iconAnchor:[12,41]});
function initMap(chargers){
  // Default center (India)
  map = L.map('map', {zoomControl:true}).setView([20.5937,78.9629], 5);

  // Tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  addMarkers(chargers);
}

function addMarkers(chargers){
  markersLayer.clearLayers();
  chargers.forEach(c => {
    const marker = L.marker([c.lat, c.lng]).bindPopup(`
      <strong>${c.title}</strong><br/>
      ${c.city} · ${c.pincode}<br/>
      <span style="font-weight:700;color:#2E8B57">₹ ${c.price}</span>
      <div style="margin-top:6px;">
        <button onclick="bookFromPopup(${c.id})" style="padding:6px 8px;border-radius:6px;border:none;background:#2E8B57;color:#fff;cursor:pointer">Request</button>
        <a href="dashboards/user_dashboard.html" style="margin-left:6px;color:#333;text-decoration:none">Open</a>
      </div>
    `);
    markersLayer.addLayer(marker);
  });
}

function updateMapMarkers(chargers){
  addMarkers(chargers);
}

// called from marker popup
window.bookFromPopup = function(id){
  const charger = CHARGERS.find(c=>c.id===id);
  if(!charger) return alert('Charger not found');
  // simple booking stored locally
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if(!user) return alert('Please login to request a booking.');
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings.push({id:Date.now(), user: user.email, chargerId:id, title:charger.title, date: new Date().toLocaleString(), status:'pending'});
  localStorage.setItem('bookings', JSON.stringify(bookings));
  alert('Booking request sent! Check your dashboard.');
};

// Render chargers list cards
function renderChargers(list){
  const container = document.getElementById('chargersGrid');
  container.innerHTML = '';
  if(!list.length) { container.innerHTML = '<p style="padding:20px">No chargers found.</p>'; return; }
  list.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'charger-card';
    el.innerHTML = `
      <div class="charger-image" style="background-image:url('${c.img}')"></div>
      <div class="charger-info">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h4 style="margin:0">${c.title}</h4>
          <span class="charger-type">${c.type}</span>
        </div>
        <div class="charger-location" style="margin-top:8px;color:${getComputedStyle(document.documentElement).getPropertyValue('--gray')}">
          <i class="fas fa-map-marker-alt"></i>&nbsp; ${c.city} · ${c.pincode}
        </div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
          <div class="charger-price">₹ ${c.price}</div>
          <div>
            <button class="btn btn-primary" onclick="jumpToMarker(${c.id})">View on Map</button>
            <button class="btn" style="margin-left:8px" onclick="handleRequest(${c.id})">Request</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(el);
  });
}

function jumpToMarker(id){
  const c = CHARGERS.find(x=>x.id===id);
  if(!c) return;
  map.setView([c.lat, c.lng], 15);
}

// request booking from card
function handleRequest(id){
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if(!user) return alert('Login required to request a booking.');
  const c = CHARGERS.find(x=>x.id===id);
  if(!c) return;
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings.push({id:Date.now(), user:user.email, chargerId:id, title:c.title, date:new Date().toLocaleString(), status:'pending'});
  localStorage.setItem('bookings', JSON.stringify(bookings));
  alert('Booking request created. Check your dashboard.');
}

// ---- Simple demo auth: register / login pages interact with localStorage ----
// The login/register pages are separate files. For convenience those pages use the same key names:
// - Users stored in localStorage under 'users' as array of {name,email,password,type}
// - currentUser stored under 'currentUser' as object

// Helper to create a default admin/demo user if none exist
(function ensureDemoUser(){
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if(!users.length){
    users.push({name:'Demo Traveler', email:'traveler@demo.com', password:'pass123', type:'traveler'});
    users.push({name:'Demo Owner', email:'owner@demo.com', password:'pass123', type:'owner'});
    localStorage.setItem('users', JSON.stringify(users));
  }
})();

// Expose updateMapMarkers globally so filter buttons work after import
window.updateMapMarkers = updateMapMarkers;
