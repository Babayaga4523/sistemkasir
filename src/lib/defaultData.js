export const DEFAULT_CATEGORIES = [
  { id: 'cat-kopi', name: 'Kopi & Espresso', icon: 'Coffee', sort_order: 1 },
  { id: 'cat-non-kopi', name: 'Non-Kopi & Segar', icon: 'CupSoda', sort_order: 2 },
  { id: 'cat-makanan', name: 'Makanan Warkop', icon: 'Utensils', sort_order: 3 },
  { id: 'cat-snack', name: 'Camilan & Toast', icon: 'Cookie', sort_order: 4 },
  { id: 'cat-paket', name: 'Paket Nongkrong', icon: 'Sparkles', sort_order: 5 }
];

export const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    category_id: 'cat-kopi',
    name: 'Kopi Susu Gula Aren',
    description: 'Espresso blend warkop, susu segar gurih, gula aren asli legit',
    price: 15000,
    cost_price: 7000,
    image: '☕',
    available: true,
    has_options: true,
    options: [
      {
        name: 'Suhu',
        choices: [
          { name: 'Dingin (Es)', extra: 0 },
          { name: 'Hangat / Panas', extra: 0 }
        ]
      },
      {
        name: 'Gula',
        choices: [
          { name: 'Normal Aren', extra: 0 },
          { name: 'Less Sugar', extra: 0 },
          { name: 'Tanpa Gula', extra: 0 }
        ]
      },
      {
        name: 'Extra',
        choices: [
          { name: 'Extra Shot Espresso', extra: 4000 }
        ]
      }
    ]
  },
  {
    id: 'prod-2',
    category_id: 'cat-kopi',
    name: 'Kopi Hitam Tubruk Tradisional',
    description: 'Biji robusta Lampung giling kasar dengan aroma pekat mantap',
    price: 7000,
    cost_price: 2500,
    image: '☕',
    available: true,
    has_options: true,
    options: [
      {
        name: 'Gula',
        choices: [
          { name: 'Manis Sedang', extra: 0 },
          { name: 'Manis Legit', extra: 0 },
          { name: 'Pahit / No Sugar', extra: 0 }
        ]
      }
    ]
  },
  {
    id: 'prod-3',
    category_id: 'cat-kopi',
    name: 'Kopi Vietnam Drip',
    description: 'Drip kopi robusta kental dengan susu kental manis di dasar cangkir',
    price: 14000,
    cost_price: 6000,
    image: '☕',
    available: true,
    has_options: true,
    options: [
      {
        name: 'Penyajian',
        choices: [
          { name: 'Panas', extra: 0 },
          { name: 'Pakai Es', extra: 1000 }
        ]
      }
    ]
  },
  {
    id: 'prod-4',
    category_id: 'cat-kopi',
    name: 'Ice Americano',
    description: 'Double shot espresso murni dengan air dingin segar penambah fokus',
    price: 13000,
    cost_price: 5000,
    image: '🧊',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-5',
    category_id: 'cat-non-kopi',
    name: 'Es Teh Manis Jumbo',
    description: 'Teh wangi melati racikan khas sedap manis segar porsi besar',
    price: 5000,
    cost_price: 1500,
    image: '🧋',
    available: true,
    has_options: true,
    options: [
      {
        name: 'Gula',
        choices: [
          { name: 'Manis Normal', extra: 0 },
          { name: 'Less Sweet', extra: 0 },
          { name: 'Tawar (Tanpa Gula)', extra: 0 }
        ]
      }
    ]
  },
  {
    id: 'prod-6',
    category_id: 'cat-non-kopi',
    name: 'Soda Gembira Nostalgia',
    description: 'Sirup frambozen merah, susu kental manis, soda dingin meletup',
    price: 16000,
    cost_price: 7000,
    image: '🥤',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-7',
    category_id: 'cat-non-kopi',
    name: 'Es Matcha Latte Creamy',
    description: 'Bubuk matcha premium berpadu susu creamy lembut',
    price: 18000,
    cost_price: 8000,
    image: '🍵',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-8',
    category_id: 'cat-non-kopi',
    name: 'Jeruk Peras Hangat / Es',
    description: 'Jeruk murni peras segar alami kaya vitamin C',
    price: 9000,
    cost_price: 3500,
    image: '🍊',
    available: true,
    has_options: true,
    options: [
      {
        name: 'Suhu',
        choices: [
          { name: 'Es Dingin', extra: 0 },
          { name: 'Hangat', extra: 0 }
        ]
      }
    ]
  },
  {
    id: 'prod-9',
    category_id: 'cat-makanan',
    name: 'Indomie Goreng Dobel Komplit',
    description: '2 porsi Indomie goreng legendaris + telur ceplok + kornet gurih + sawi',
    price: 22000,
    cost_price: 11000,
    image: '🍜',
    available: true,
    has_options: true,
    options: [
      {
        name: 'Tingkat Pedas',
        choices: [
          { name: 'Tidak Pedas', extra: 0 },
          { name: 'Pedas Sedang (Cabe Rawit)', extra: 0 },
          { name: 'Pedas Mampus (Cabe Rajang 10)', extra: 2000 }
        ]
      },
      {
        name: 'Kematangan Telur',
        choices: [
          { name: 'Setengah Matang (Lumer)', extra: 0 },
          { name: 'Matang Sempurna', extra: 0 }
        ]
      },
      {
        name: 'Topping Tambahan',
        choices: [
          { name: 'Keju Parut Melimpah', extra: 3000 }
        ]
      }
    ]
  },
  {
    id: 'prod-10',
    category_id: 'cat-makanan',
    name: 'Indomie Kuah Kari Ayam Spesial',
    description: 'Indomie kuah kari kental gurih disajikan panas dengan telur rebus & cabe',
    price: 16000,
    cost_price: 8000,
    image: '🍲',
    available: true,
    has_options: true,
    options: [
      {
        name: 'Kematangan Telur',
        choices: [
          { name: 'Setengah Matang', extra: 0 },
          { name: 'Matang', extra: 0 }
        ]
      },
      {
        name: 'Topping',
        choices: [
          { name: 'Kornet Sapi', extra: 4000 }
        ]
      }
    ]
  },
  {
    id: 'prod-11',
    category_id: 'cat-makanan',
    name: 'Nasi Goreng Gila Warkop',
    description: 'Nasi goreng wok aromatik dengan topping sosis, bakso, telur orak-arik',
    price: 22000,
    cost_price: 9500,
    image: '🍛',
    available: true,
    has_options: true,
    options: [
      {
        name: 'Level Pedas',
        choices: [
          { name: 'Level 1 (Biasa)', extra: 0 },
          { name: 'Level 2 (Pedas)', extra: 0 },
          { name: 'Level 3 (Gila)', extra: 1000 }
        ]
      }
    ]
  },
  {
    id: 'prod-12',
    category_id: 'cat-makanan',
    name: 'Magelangan (Nasi Ruwet)',
    description: 'Perpaduan mantap mie instan & nasi putih digoreng bumbu rempah warkop',
    price: 18000,
    cost_price: 8000,
    image: '🍳',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-13',
    category_id: 'cat-snack',
    name: 'Pisang Goreng Crispy Keju Cokelat',
    description: 'Pisang raja manis balut tepung krispi dengan taburan cokelat & parutan keju',
    price: 15000,
    cost_price: 6000,
    image: '🍌',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-14',
    category_id: 'cat-snack',
    name: 'Roti Bakar Cokelat Keju Susu',
    description: 'Roti tawar tebal dipanggang wangi mentega isi meses coklat & keju lumer',
    price: 16000,
    cost_price: 6500,
    image: '🍞',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-15',
    category_id: 'cat-snack',
    name: 'Cireng Krispi Bumbu Rujak',
    description: 'Cireng kenyal renyah di luar disajikan dengan saus rujak pedas manis',
    price: 13000,
    cost_price: 4500,
    image: '🥟',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-16',
    category_id: 'cat-snack',
    name: 'Kentang Goreng French Fries',
    description: 'Kentang goreng stik renyah gurih dengan cocolan saus sambal & mayones',
    price: 14000,
    cost_price: 5000,
    image: '🍟',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-17',
    category_id: 'cat-paket',
    name: 'Paket Begadang (Kopi + Indomie)',
    description: 'Hemat! 1 Kopi Hitam / Susu + 1 Indomie Goreng Telur',
    price: 20000,
    cost_price: 9000,
    image: '⭐',
    available: true,
    has_options: false,
    options: []
  },
  {
    id: 'prod-18',
    category_id: 'cat-paket',
    name: 'Paket Mabar (Es Teh + Cireng)',
    description: 'Hemat nongkrong santai: 1 Es Teh Manis Jumbo + 1 Porsi Cireng Rujak',
    price: 16000,
    cost_price: 6000,
    image: '🎮',
    available: true,
    has_options: false,
    options: []
  }
];

export const INITIAL_SAMPLE_ORDERS = [
  {
    id: 'ord-1001',
    order_number: 'ORD-001',
    customer_name: 'Mas Dimas',
    table_number: '04',
    order_type: 'dine_in',
    status: 'completed',
    subtotal: 37000,
    discount: 0,
    tax: 0,
    total: 37000,
    payment_method: 'qris',
    amount_paid: 37000,
    change_amount: 0,
    cashier_name: 'Budi (Kasir 1)',
    notes: 'Wifi password ditanyakan',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    items: [
      {
        id: 1,
        product_id: 'prod-1',
        product_name: 'Kopi Susu Gula Aren',
        price: 15000,
        quantity: 1,
        selected_options: { Suhu: 'Dingin (Es)', Gula: 'Less Sugar' },
        notes: '',
        subtotal: 15000
      },
      {
        id: 2,
        product_id: 'prod-9',
        product_name: 'Indomie Goreng Dobel Komplit',
        price: 22000,
        quantity: 1,
        selected_options: { 'Tingkat Pedas': 'Pedas Sedang (Cabe Rawit)', 'Kematangan Telur': 'Setengah Matang (Lumer)' },
        notes: 'Sawi agak banyakan',
        subtotal: 22000
      }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 'ORD-002',
    customer_name: 'Mbak Sarah',
    table_number: '02',
    order_type: 'dine_in',
    status: 'ready',
    subtotal: 31000,
    discount: 0,
    tax: 0,
    total: 31000,
    payment_method: 'cash',
    amount_paid: 50000,
    change_amount: 19000,
    cashier_name: 'Budi (Kasir 1)',
    notes: '',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    completed_at: null,
    items: [
      {
        id: 3,
        product_id: 'prod-14',
        product_name: 'Roti Bakar Cokelat Keju Susu',
        price: 16000,
        quantity: 1,
        selected_options: {},
        notes: 'Mentega agak garing',
        subtotal: 16000
      },
      {
        id: 4,
        product_id: 'prod-13',
        product_name: 'Pisang Goreng Crispy Keju Cokelat',
        price: 15000,
        quantity: 1,
        selected_options: {},
        notes: '',
        subtotal: 15000
      }
    ]
  },
  {
    id: 'ord-1003',
    order_number: 'ORD-003',
    customer_name: 'Rian & Teman',
    table_number: '07',
    order_type: 'dine_in',
    status: 'brewing',
    subtotal: 47000,
    discount: 5000,
    tax: 0,
    total: 42000,
    payment_method: 'cash',
    amount_paid: 50000,
    change_amount: 8000,
    cashier_name: 'Budi (Kasir 1)',
    notes: '',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    completed_at: null,
    items: [
      {
        id: 5,
        product_id: 'prod-1',
        product_name: 'Kopi Susu Gula Aren',
        price: 15000,
        quantity: 2,
        selected_options: { Suhu: 'Dingin (Es)' },
        notes: '',
        subtotal: 30000
      },
      {
        id: 6,
        product_id: 'prod-15',
        product_name: 'Cireng Krispi Bumbu Rujak',
        price: 13000,
        quantity: 1,
        selected_options: {},
        notes: 'Bumbu rujak dipisah',
        subtotal: 13000
      },
      {
        id: 7,
        product_id: 'prod-4',
        product_name: 'Ice Americano',
        price: 13000,
        quantity: 1,
        selected_options: {},
        notes: '',
        subtotal: 13000
      }
    ]
  }
];

export const STORE_INFO = {
  name: 'WARKOP KOPI KITA',
  tagline: 'Tempat Nongkrong, Ngobrol & Ngopi Santai',
  address: 'Jl. Merdeka No. 45, Jakarta Selatan',
  phone: '0812-3456-7890',
  wifiSSID: 'WarkopKita_FreeWifi',
  wifiPass: 'kopisusu123',
  taxRate: 0, // PB1 / pajak warkop default 0% (bisa diaktifkan 10%)
  currency: 'IDR'
};
