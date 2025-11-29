🚗⚡ ChargeShare – Peer-to-Peer EV Charger Sharing Platform
ChargeShare is a full-stack project inspired by the Airbnb model, designed to let private EV charger owners rent out their chargers to EV drivers.
This platform removes EV range anxiety, helps promote EV adoption, and provides a new income stream for charger owners.

🌟 Key Features
🔋 For EV Drivers
Search nearby EV chargers via interactive map (LeafletJS)

Filter chargers by type (Fast, Home, Business)

View pricing, location, and charge type

Send booking requests and view your bookings

Manage your profile and charging history

🏠 For Charger Owners
Register your private charger

Manage bookings (accept/cancel)

Track earnings and completed sessions

Manage chargers and edit profile

🗺 Interactive Map
Real-time charger markers using Leaflet + OpenStreetMap

“Locate Me” feature to find nearest chargers

Popup actions (book now / open in dashboard)

📁 Project Structure
pgsql
Copy code
project-root/
│── index.html
│── css/
│   └── styles.css
│── js/
│   └── main.js
│── auth/
│   ├── login.html
│   └── register.html
└── dashboards/
    ├── user_dashboard.html
    └── owner_dashboard.html
🧠 Tech Stack
Frontend: HTML5, CSS3, JavaScript

Map: LeafletJS + OpenStreetMap

Icons: Font Awesome

Auth (Demo): LocalStorage (can be replaced with backend API)

Planned Backend: Node.js / Express or Django
