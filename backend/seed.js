import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projects = [
  // 1. E-Commerce
  {
    name: "MegaShop - Multi-Vendor E-Commerce",
    description: "A complete Amazon-like multi-vendor marketplace where users can sell and buy products. Includes admin panel, vendor dashboard, and Stripe payments.",
    price: "₹15000",
    demoUrl: "https://google.com",
    techStacks: ["MERN Stack", "Redux", "Stripe API", "Cloudinary"],
    features: ["Vendor Dashboard", "Order Tracking", "Review System", "Admin Analytics"],
    imageUrls: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1472851294608-4155f2118c67?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 2. AI Tool
  {
    name: "AI Copywriter SaaS",
    description: "Generate marketing copy, blog posts, and emails using GPT-4. Includes subscription management via Stripe.",
    price: "₹8500",
    demoUrl: "https://google.com",
    techStacks: ["Next.js", "OpenAI API", "Tailwind CSS", "PostgreSQL"],
    features: ["AI Text Gen", "Subscription Plans", "Dark Mode", "History Export"],
    imageUrls: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 3. Healthcare
  {
    name: "MediCare - Hospital CRM",
    description: "Manage patient records, doctor appointments, and billing in one unified dashboard.",
    price: "₹12000",
    demoUrl: "https://google.com",
    techStacks: ["PHP", "Laravel", "MySQL", "Bootstrap"],
    features: ["Patient History", "Doctor Scheduling", "Invoicing", "Prescription PDF"],
    imageUrls: [
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 4. Real Estate
  {
    name: "UrbanEstate - Property Marketplace",
    description: "Buy, sell, and rent properties with interactive map search and virtual tour integration.",
    price: "₹9000",
    demoUrl: "https://google.com",
    techStacks: ["React", "Node.js", "Google Maps API", "Socket.io"],
    features: ["Map Search", "Real-time Chat", "360 View Support", "Agent Profiles"],
    imageUrls: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 5. LMS
  {
    name: "LearnPro - LMS Platform",
    description: "Udemy clone for creators to upload courses and students to learn with progress tracking.",
    price: "₹11500",
    demoUrl: "https://google.com",
    techStacks: ["Django", "Python", "React", "AWS S3"],
    features: ["Video Player", "Quiz System", "Certificate Generation", "Instructor Payouts"],
    imageUrls: [
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 6. Food Delivery
  {
    name: "FoodieX - Delivery App",
    description: "Full-stack food delivery solution with Customer App, Restaurant Panel, and Driver App.",
    price: "₹18000",
    demoUrl: "https://google.com",
    techStacks: ["Flutter", "Firebase", "Node.js"],
    features: ["Live Tracking", "Push Notifications", "Cart Management", "Wallet System"],
    imageUrls: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 7. Project Management
  {
    name: "TaskFlow - Trello Clone",
    description: "Drag-and-drop project management tool for agile teams using Kanban boards.",
    price: "₹5500",
    demoUrl: "https://google.com",
    techStacks: ["Vue.js", "Firebase", "Tailwind"],
    features: ["Kanban Board", "Team Collaboration", "Due Date Alerts", "File Attachments"],
    imageUrls: [
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 8. Fitness
  {
    name: "FitTrack - Workout App",
    description: "Track exercises, calories, and diet plans. Includes graphical progress reports.",
    price: "₹4500",
    demoUrl: "https://google.com",
    techStacks: ["React Native", "Express", "MongoDB"],
    features: ["Step Counter", "Diet Plan", "BMI Calculator", "Workout Library"],
    imageUrls: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 9. Social Media
  {
    name: "SocialConnect - Dashboard",
    description: "Manage all social media accounts (Twitter, Facebook, Instagram) from one analytics dashboard.",
    price: "₹7000",
    demoUrl: "https://google.com",
    techStacks: ["Angular", "Node.js", "Chart.js"],
    features: ["Unified Inbox", "Post Scheduling", "Audience Analytics", "Team Access"],
    imageUrls: [
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 10. Booking System
  {
    name: "HotelBooker - Reservation System",
    description: "Complete booking engine for hotels with room management and payment integration.",
    price: "₹11000",
    demoUrl: "https://google.com",
    techStacks: ["Next.js", "Prisma", "PostgreSQL"],
    features: ["Date Picking", "Room Availability", "Admin Calendar", "Email Confirmations"],
    imageUrls: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 11. Job Portal
  {
    name: "JobFinder - Recruitment Platform",
    description: "LinkedIn-style job board where companies post jobs and candidates apply with resumes.",
    price: "₹9500",
    demoUrl: "https://google.com",
    techStacks: ["MERN Stack", "AWS S3"],
    features: ["Resume Parsing", "Job Alerts", "Company Pages", "Application Tracking"],
    imageUrls: [
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 12. Inventory/ERP
  {
    name: "StockMaster - ERP System",
    description: "Inventory management for retail businesses with barcode scanning support.",
    price: "₹13500",
    demoUrl: "https://google.com",
    techStacks: ["Java Spring Boot", "React", "MySQL"],
    features: ["Stock Alerts", "Supplier Management", "Barcode Support", "Sales Reports"],
    imageUrls: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 13. Crypto
  {
    name: "CryptoTracker - Portfolio App",
    description: "Real-time cryptocurrency price tracker and portfolio management tool using CoinGecko API.",
    price: "₹6000",
    demoUrl: "https://google.com",
    techStacks: ["React", "Redux Toolkit", "Chart.js"],
    features: ["Live Prices", "Portfolio Value", "News Feed", "Price Alerts"],
    imageUrls: [
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 14. Dating App
  {
    name: "MatchMaker - Dating App",
    description: "Tinder-style swipe application with real-time matchmaking and chat.",
    price: "₹14000",
    demoUrl: "https://google.com",
    techStacks: ["Flutter", "Firebase", "Cloud Functions"],
    features: ["Swipe UI", "Geolocation", "Real-time Chat", "Profile Verification"],
    imageUrls: [
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 15. Car Rental
  {
    name: "DriveAway - Car Rental",
    description: "Platform for renting luxury and economy cars with calendar scheduling.",
    price: "₹8000",
    demoUrl: "https://google.com",
    techStacks: ["PHP", "CodeIgniter", "MySQL"],
    features: ["Fleet Management", "Date Picking", "Insurance Options", "Driver Allocation"],
    imageUrls: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 16. Event Management
  {
    name: "EventBrite Clone",
    description: "Create events, sell tickets, and manage attendees with QR code check-in.",
    price: "₹10500",
    demoUrl: "https://google.com",
    techStacks: ["MERN", "QRCode.js", "Stripe"],
    features: ["Ticket Generation", "QR Scanning", "Event Analytics", "Organizer Dashboard"],
    imageUrls: [
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 17. Weather App
  {
    name: "SkyCast - Weather Pro",
    description: "Advanced weather dashboard providing 7-day forecasts and severe weather alerts.",
    price: "₹3000",
    demoUrl: "https://google.com",
    techStacks: ["React", "OpenWeatherMap API", "SCSS"],
    features: ["Location Detection", "7-Day Forecast", "Humidity/Wind Maps", "Dark Mode"],
    imageUrls: [
      "https://images.unsplash.com/photo-1592210454132-7233c3b599c1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 18. Chat App
  {
    name: "ChatRoom - Slack Clone",
    description: "Team communication platform with channels, direct messages, and file sharing.",
    price: "₹9000",
    demoUrl: "https://google.com",
    techStacks: ["React", "Socket.io", "Express", "MongoDB"],
    features: ["Channels", "Direct Messaging", "Online Status", "File Sharing"],
    imageUrls: [
      "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1530811761207-8d9d22f0a141?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 19. Recipe Blog
  {
    name: "TastyBites - Food Blog",
    description: "Recipe sharing platform with video integration, ingredients list, and user reviews.",
    price: "₹5000",
    demoUrl: "https://google.com",
    techStacks: ["WordPress", "PHP", "Elementor"],
    features: ["Video Recipes", "User Submission", "Rating System", "SEO Optimized"],
    imageUrls: [
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // 20. Fintech
  {
    name: "PennyWise - Expense Tracker",
    description: "Personal finance manager to track income, expenses, and savings goals.",
    price: "₹6500",
    demoUrl: "https://google.com",
    techStacks: ["Vue.js", "Django", "PostgreSQL"],
    features: ["Budget Goals", "Expense Categorization", "Monthly Reports", "CSV Export"],
    imageUrls: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

async function main() {
  console.log('🌱 Starting to seed 20 projects...');

  for (const project of projects) {
    try {
      await prisma.portfolioProject.create({
        data: project,
      });
      console.log(`✅ Added: ${project.name}`);
    } catch (error) {
      console.error(`❌ Failed to add ${project.name}:`, error.message);
    }
  }

  console.log('🏁 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error("Critical Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });