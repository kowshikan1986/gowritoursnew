export const servicesData = [
  {
    id: 'tours',
    title: 'Tours',
    location: 'Global',
    price: 'From £—',
    shortDescription: 'Browse all tour categories and drill down to subcategories and packages.',
    fullDescription: 'Explore our complete catalogue of tours. Pick a main category, then a subcategory, to view all available packages.',
    features: [
      'Category and subcategory browsing',
      'Packages grouped by destination',
      'Fast drill-down to see all tours',
    ],
    packages: [],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    seo: {
      title: 'Tours | Luxury Travel Agency',
      description: 'Browse tour categories and packages across all destinations.',
    },
  },
  {
    id: 'uk-tours',
    title: 'UK Tours',
    location: 'United Kingdom',
    price: 'From $2,500',
    shortDescription: 'Packages: Lake District, Scotland, Cornwall, Isle of Wight, Wales, Peak District.',
    fullDescription: 'Discover the magic of the United Kingdom with our exclusive tour packages. From the bustling streets of London to the serene Highlands of Scotland, our UK tours offer a perfect blend of heritage, culture, and natural beauty. Whether you are interested in historical landmarks, royal palaces, or picturesque countryside, we have the perfect itinerary for you.',
    features: [
      'Private guided tours of London landmarks',
      'Scenic drives through the Scottish Highlands',
      'Visits to Stonehenge and Bath',
      'Luxury accommodation in historic castles',
      'Customizable itineraries'
    ],
    packages: [
      {
        id: "lake-district",
        title: "Lake District",
        code: "UKLK",
        price: "£265.00",
        duration: "3 Days",
        location: "Cumbria, England",
        description: "Experience the breathtaking scenery of the Lake District. Visit Lake Windermere and enjoy a steam train ride.",
        image: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=1470&auto=format&fit=crop",
        highlights: [
          "Peak District - Bakewell & Buxton",
          "Lake District Drive through",
          "Lake Windermere Cruise",
          "The Lakeside & Haverthwaite Railway steam train",
          "Grassemere",
          "Stratford Upon Avon"
        ],
        priceIncludes: [
          "Return Transportation by deluxe AC vehicle from selected pick up point",
          "2 Nights accomodation in a 3/4 Star Hotel",
          "1 Indian Dinner",
          "Entrance & sightseeing as mentioned in the Tour Highlights",
          "All tips and service charges",
          "Premium service of a Star Tours Representative"
        ],
        itinerary: [
          {
            day: 1,
            title: "London - Peak District - Hotel",
            description: "Depart from your selected pick-up point and travel towards the Peak District. Visit the charming towns of Bakewell and Buxton, famous for their puddings and spring water. Continue to your hotel for an overnight stay."
          },
          {
            day: 2,
            title: "Lake District Tour",
            description: "After breakfast, head to the Lake District National Park. Enjoy a scenic drive through the park, followed by a relaxing cruise on Lake Windermere. Experience a nostalgic steam train ride on the Lakeside & Haverthwaite Railway. Visit the picturesque village of Grasmere before returning to the hotel."
          },
          {
            day: 3,
            title: "Stratford Upon Avon - London",
            description: "Check out of the hotel and travel to Stratford Upon Avon, the birthplace of William Shakespeare. Explore the historic town at your leisure before commencing your journey back to London."
          }
        ],
        pickupPoints: [
          { location: "Southall, Bus Stop K, 58-78 High Street", time: "05:30 Hrs" },
          { location: "Perivale, Star Tours Office, 12-14 Aintree Road", time: "06:00 Hrs" },
          { location: "Wembley, Star Tours Office, 312 Harrow Road", time: "06:15 Hrs" },
          { location: "Travelodge Luton Hotel, 641 Dunstable Road", time: "06:45 Hrs" },
          { location: "Toddington Services - Southbound, M1", time: "07:00 Hrs" },
          { location: "Newport Pagnell Services - Northbound, M1", time: "07:20 Hrs" },
          { location: "Northampton Services - Northbound, M1", time: "07:45 Hrs" },
          { location: "Watford Gap Services - Northbound, M1", time: "08:00 Hrs" },
          { location: "Coventry, Outside Tesco, Cross Point Business Centre", time: "08:25 Hrs" }
        ]
      },
      {
        id: "scotland",
        title: "Scotland",
        price: "£385.00",
        duration: "4 Days",
        location: "Scotland, UK",
        description: "Discover the majestic Highlands of Scotland. Tour includes visits to Loch Lomond, Glencoe, and a whisky distillery.",
        image: "https://images.unsplash.com/photo-1578240747034-5ba1efe22426?q=80&w=1473&auto=format&fit=crop"
      },
      {
        id: "cornwall",
        title: "Cornwall",
        price: "£355.00",
        duration: "4 Days",
        location: "South West England",
        description: "Visit the beautiful coast of Cornwall. Highlights include Land's End, the Minack Theatre, and St Michael's Mount.",
        image: "https://images.unsplash.com/photo-1449495169669-7b118f960251?q=80&w=1471&auto=format&fit=crop"
      },
      {
        id: "isle-of-wight",
        title: "Isle of Wight",
        price: "£275.00",
        duration: "3 Days",
        location: "Isle of Wight",
        description: "A scenic tour of the Isle of Wight. Visit the Needles, Alum Bay, and Osborne House.",
        image: "https://images.unsplash.com/photo-1595842823023-455b57357416?q=80&w=1374&auto=format&fit=crop"
      },
      {
        id: "wales",
        title: "Wales",
        price: "£285.00",
        duration: "3 Days",
        location: "Wales, UK",
        description: "Explore the mountains and coastlines of Wales. Visit Snowdonia National Park and Caernarfon Castle.",
        image: "https://images.unsplash.com/photo-1605471997233-a3b092040b07?q=80&w=1374&auto=format&fit=crop"
      },
      {
        id: "peak-district",
        title: "Peak District",
        price: "£150.00",
        duration: "2 Days",
        location: "Central England",
        description: "A short break to the Peak District National Park. Visit Chatsworth House and Bakewell.",
        image: "https://images.unsplash.com/photo-1588694080031-c4d6934c21e6?q=80&w=1470&auto=format&fit=crop"
      }
    ],
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1470&auto=format&fit=crop',
    seo: {
      title: 'Luxury UK Tours | Exclusive British Travel Experiences',
      description: 'Book your dream UK tour with us. Private guided tours, luxury accommodation, and bespoke itineraries across England, Scotland, Wales, and Northern Ireland.'
    }
  },
  {
    id: 'european-tours',
    title: 'European Tours',
    location: 'Europe',
    price: 'From $3,200',
    shortDescription: 'Experience the art, culture, and cuisine of Europe\'s finest destinations.',
    fullDescription: 'Embark on a journey across Europe and immerse yourself in its diverse cultures, breathtaking landscapes, and culinary delights. From the romantic streets of Paris to the ancient ruins of Rome, our European tours are designed to provide an unforgettable experience. We offer multi-country packages as well as focused regional tours.',
    features: [
      'Skip-the-line access to major museums',
      'Wine tasting in France and Italy',
      'River cruises along the Danube and Rhine',
      'High-speed train transfers between cities',
      'Expert local guides'
    ],
    image: 'https://images.unsplash.com/photo-1471623432079-b009d30b6729?q=80&w=1470&auto=format&fit=crop',
    seo: {
      title: 'Premium European Tours | Luxury Travel Across Europe',
      description: 'Explore Europe in style. Tailor-made tours to France, Italy, Spain, Germany, and more with premium amenities and expert guides.'
    }
  },
  {
    id: 'world-tours',
    title: 'World Tours',
    location: 'Global',
    price: 'From $5,000',
    shortDescription: 'Go beyond boundaries with our curated tours to exotic global destinations.',
    fullDescription: 'For the adventurous traveler, our World Tours cover destinations across Asia, Africa, the Americas, and Oceania. Experience the wonders of the world, from the Great Wall of China to the safaris of Serengeti. We handle all the logistics so you can focus on creating memories.',
    features: [
      'Comprehensive visa assistance',
      'Round-the-world flight tickets',
      'Cultural immersion experiences',
      'Adventure activities and safaris',
      '24/7 travel support'
    ],
    image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1374&auto=format&fit=crop',
    seo: {
      title: 'Global World Tours | Exotic International Travel Packages',
      description: 'Discover the world with our global tour packages. Safaris, cultural expeditions, and luxury vacations in Asia, Africa, and the Americas.'
    }
  },

  {
    id: 'group-tours',
    title: 'Group Tours',
    location: 'Various Destinations',
    price: 'From $1,500',
    shortDescription: 'Join like-minded travelers on our expertly planned group expeditions.',
    fullDescription: 'Our Group Tours are perfect for solo travelers, couples, or friends who want to meet new people and share experiences. We keep our group sizes small to ensure a personalized experience while maintaining the social aspect of group travel. Enjoy structured itineraries with enough free time to explore on your own.',
    features: [
      'Small group sizes (max 12-15)',
      'Dedicated tour director',
      'Shared luxury accommodation',
      'Welcome and farewell dinners',
      'Cost-effective travel options'
    ],
    image: 'https://images.unsplash.com/photo-1520066391310-428f06e8e712?q=80&w=1470&auto=format&fit=crop',
    seo: {
      title: 'Small Group Tours | Shared Luxury Travel Experiences',
      description: 'Join our exclusive small group tours. Meet fellow travelers and explore the world together with expert planning and guidance.'
    }
  },

  // Removed airport-transfers - now using database category
  // Removed vehicle-hire - now using database category
  {
    id: 'cruises',
    title: 'Cruises',
    location: 'Ocean & River',
    price: 'From $2,200',
    shortDescription: 'Set sail on luxurious ocean and river cruises around the world.',
    fullDescription: 'Discover the world from a different perspective with our Cruise packages. We partner with top cruise lines to offer ocean voyages, river cruises, and expedition cruises. Enjoy all-inclusive luxury, world-class entertainment, and daily excursions to fascinating ports.',
    features: [
      'Ocean and river cruise options',
      'All-inclusive dining and beverages',
      'Onboard entertainment and spa',
      'Guided shore excursions',
      'Balcony suites with ocean views'
    ],
    image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=1564&auto=format&fit=crop',
    contentImage: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=1600&auto=format&fit=crop',
    seo: {
      title: 'Luxury Cruise Packages | Ocean & River Voyages',
      description: 'Set sail on a luxury cruise. Explore ocean and river destinations with all-inclusive amenities, shore excursions, and world-class service.'
    }
  }
];