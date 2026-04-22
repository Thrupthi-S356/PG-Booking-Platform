export const mockPGs = [
  {
    id: 1,
    title: "Sunrise Residency",
    location: { city: "Bangalore", area: "Koramangala", lat: 12.9352, lng: 77.6245 },
    price: 8500,
    type: "coed",
    rating: 4.7,
    reviews: 42,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    ],
    amenities: ["WiFi", "Meals", "AC", "Laundry", "Parking", "Security"],
    description: "A premium co-living space in the heart of Koramangala with modern amenities and a vibrant community. Walking distance to MG Road metro station.",
    owner: { name: "Rajesh Kumar", phone: "+91 98765 43210", since: "2019" },
    rooms: [
      { type: "Single", price: 8500, available: 2 },
      { type: "Double Sharing", price: 6000, available: 1 },
      { type: "Triple Sharing", price: 4500, available: 3 },
    ]
  },
  {
    id: 2,
    title: "Green Valley PG",
    location: { city: "Bangalore", area: "HSR Layout", lat: 12.9116, lng: 77.6389 },
    price: 7000,
    type: "female",
    rating: 4.5,
    reviews: 31,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    ],
    amenities: ["WiFi", "Meals", "Laundry", "Security", "CCTV"],
    description: "Safe and comfortable accommodation exclusively for working women and students. 24/7 security, home-cooked meals, and a peaceful environment.",
    owner: { name: "Sunita Sharma", phone: "+91 87654 32109", since: "2020" },
    rooms: [
      { type: "Single", price: 7000, available: 1 },
      { type: "Double Sharing", price: 5000, available: 3 },
    ]
  },
  {
    id: 3,
    title: "Urban Nest",
    location: { city: "Mumbai", area: "Andheri West", lat: 19.1364, lng: 72.8296 },
    price: 12000,
    type: "male",
    rating: 4.8,
    reviews: 67,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    ],
    amenities: ["WiFi", "AC", "Gym", "Parking", "Security", "Power Backup"],
    description: "Modern bachelor accommodation near Andheri metro station. Premium amenities with professional co-living environment for working professionals.",
    owner: { name: "Vivek Mehta", phone: "+91 76543 21098", since: "2018" },
    rooms: [
      { type: "Single", price: 12000, available: 2 },
      { type: "Double Sharing", price: 8000, available: 4 },
    ]
  },
  {
    id: 4,
    title: "Cloud Nine Stays",
    location: { city: "Hyderabad", area: "Gachibowli", lat: 17.4401, lng: 78.3489 },
    price: 9500,
    type: "coed",
    rating: 4.6,
    reviews: 55,
    available: false,
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&q=80",
    ],
    amenities: ["WiFi", "Meals", "AC", "Gym", "Laundry"],
    description: "Premium co-living near HITEC City with state-of-the-art facilities. Ideal for IT professionals with flexible lease terms.",
    owner: { name: "Anil Reddy", phone: "+91 65432 10987", since: "2021" },
    rooms: [
      { type: "Single", price: 9500, available: 0 },
      { type: "Double Sharing", price: 6500, available: 0 },
    ]
  },
  {
    id: 5,
    title: "The Cozy Corner",
    location: { city: "Pune", area: "Baner", lat: 18.5590, lng: 73.7868 },
    price: 6500,
    type: "female",
    rating: 4.3,
    reviews: 28,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    amenities: ["WiFi", "Meals", "Security", "CCTV", "Housekeeping"],
    description: "Homely and warm environment for female students and professionals near Symbiosis and Pune University.",
    owner: { name: "Priya Joshi", phone: "+91 54321 09876", since: "2020" },
    rooms: [
      { type: "Single", price: 6500, available: 2 },
      { type: "Double Sharing", price: 4800, available: 2 },
    ]
  },
  {
    id: 6,
    title: "Elite Living Spaces",
    location: { city: "Delhi", area: "Dwarka", lat: 28.5921, lng: 77.0460 },
    price: 10000,
    type: "coed",
    rating: 4.4,
    reviews: 39,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&q=80",
    ],
    amenities: ["WiFi", "AC", "Parking", "Security", "Power Backup", "Elevator"],
    description: "Luxury co-living spaces in Dwarka with metro connectivity. Spacious rooms, modern kitchen, and 24/7 support.",
    owner: { name: "Mohit Singh", phone: "+91 43210 98765", since: "2017" },
    rooms: [
      { type: "Single", price: 10000, available: 1 },
      { type: "Double Sharing", price: 7000, available: 3 },
    ]
  },
];

export const mockBookings = [
  {
    id: "BK001",
    pgId: 1,
    pgTitle: "Sunrise Residency",
    pgLocation: "Koramangala, Bangalore",
    checkIn: "2024-03-01",
    roomType: "Single",
    price: 8500,
    status: "approved",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80"
  },
  {
    id: "BK002",
    pgId: 3,
    pgTitle: "Urban Nest",
    pgLocation: "Andheri West, Mumbai",
    checkIn: "2024-04-15",
    roomType: "Double Sharing",
    price: 8000,
    status: "pending",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80"
  },
  {
    id: "BK003",
    pgId: 5,
    pgTitle: "The Cozy Corner",
    pgLocation: "Baner, Pune",
    checkIn: "2024-02-10",
    roomType: "Single",
    price: 6500,
    status: "rejected",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80"
  },
  {
    id: "BK004",
    pgId: 6,
    pgTitle: "Elite Living Spaces",
    pgLocation: "Dwarka, Delhi",
    checkIn: "2024-05-01",
    roomType: "Single",
    price: 10000,
    status: "cancelled",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&q=80"
  }
];

export const mockMessages = [
  { id: 1, sender: "them", text: "Hi! Is the single room still available?", time: "10:00 AM" },
  { id: 2, sender: "me", text: "Yes, it's available! Would you like to schedule a visit?", time: "10:02 AM" },
  { id: 3, sender: "them", text: "That would be great. How about this Sunday?", time: "10:05 AM" },
  { id: 4, sender: "me", text: "Sunday works! Come around 11 AM.", time: "10:07 AM" },
  { id: 5, sender: "them", text: "Perfect. Can you share the exact address?", time: "10:10 AM" },
  { id: 6, sender: "me", text: "Sure! 42, 5th Cross, Koramangala 5th Block, Bangalore - 560095. See you Sunday!", time: "10:12 AM" },
];

export const mockOwnerBookingRequests = [
  {
    id: "REQ001",
    tenant: "Priya Mehta",
    email: "priya@example.com",
    pgTitle: "Sunrise Residency",
    roomType: "Single",
    checkIn: "2024-05-01",
    status: "pending",
    avatar: "PM"
  },
  {
    id: "REQ002",
    tenant: "Rahul Gupta",
    email: "rahul@example.com",
    pgTitle: "Sunrise Residency",
    roomType: "Double Sharing",
    checkIn: "2024-04-20",
    status: "approved",
    avatar: "RG"
  },
  {
    id: "REQ003",
    tenant: "Ananya Singh",
    email: "ananya@example.com",
    pgTitle: "Green Valley PG",
    roomType: "Single",
    checkIn: "2024-05-10",
    status: "pending",
    avatar: "AS"
  }
];

export const cities = ["Bangalore", "Mumbai", "Hyderabad", "Pune", "Delhi", "Chennai"];
export const amenityOptions = ["WiFi", "Meals", "AC", "Laundry", "Parking", "Security", "Gym", "CCTV", "Power Backup", "Housekeeping"];
