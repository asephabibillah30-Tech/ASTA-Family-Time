import type {
  DailyIdea,
  PlannerEvent,
  JournalMoodInfo,
  JournalEntry,
  AppreciationItem,
  FamilyChallenge,
  FamilyHabit,
  FinanceTransaction,
  SavingsTarget,
  LearningTopic,
  FamilyAchievement,
  MemoryItem
} from '../types/family';

export const JOURNAL_MOODS: JournalMoodInfo[] = [
  { mood: 'happy', emoji: '😊', label: 'Bahagia', color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  { mood: 'grateful', emoji: '🥰', label: 'Bersyukur', color: 'text-rose-500', bgColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  { mood: 'neutral', emoji: '😐', label: 'Biasa Saja', color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { mood: 'sad', emoji: '😔', label: 'Sedih', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  { mood: 'angry', emoji: '😡', label: 'Kesal', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' },
];

export const DAILY_IDEAS: DailyIdea[] = [
  {
    id: 'idea-1',
    title: 'Buat Camilan Popcorn & Teh Hangat Bersama',
    description: 'Masak camilan sederhana bersama anak dan pasangan di dapur, lalu nikmati di ruang tengah sambil berbagi cerita hari ini.',
    duration: '20 Menit',
    participants: 'Seluruh Keluarga',
    cost: 'Gratis / Murah',
    emoji: '🍿',
    category: 'Kuliner & Cerita',
    steps: [
      'Ajak anak membantu mengukur biji jagung atau menyiapkan cangkir teh.',
      'Duduk melingkar dan bergantian menceritakan 1 hal paling lucu hari ini.',
      'Beri pelukan hangat sebelum mengakhiri sesi.'
    ]
  },
  {
    id: 'idea-2',
    title: 'Tenda Bantal & Senter Ruang Tamu',
    description: 'Bikin tenda darurat dari susunan selimut dan bantal sofa, lalu matikan lampu utama dan hidupkan senter HP untuk suasana berkemah!',
    duration: '30 Menit',
    participants: '3+ Orang',
    cost: 'Gratis',
    emoji: '⛺',
    category: 'Petualangan Rumah',
    steps: [
      'Gunakan kursi dan selimut tebal sebagai atap tenda.',
      'Masuk ke dalam tenda bersama-sama dengan membawa camilan.',
      'Saling menceritakan impian liburan keluarga di masa depan.'
    ]
  },
  {
    id: 'idea-3',
    title: 'Sesi Foto Keluarga Gaya Lucu & Unik',
    description: 'Pasang timer kamera HP selama 10 detik dan berposelah dengan gaya paling heboh bersama sekeluarga!',
    duration: '15 Menit',
    participants: 'Semua Anggota',
    cost: 'Gratis',
    emoji: '📸',
    category: 'Kreatif & Abadi',
    steps: [
      'Pilih 3 gaya: Gaya Formal, Gaya Robot Konyol, dan Gaya Senyum Manis.',
      'Simpan hasilnya langsung ke album Kenangan ASTA Family Time.',
      'Pilih 1 foto terbaik sebagai wallpaper HP keluarga!'
    ]
  },
  {
    id: 'idea-4',
    title: 'Malam Pijat Bahu Estafet & Doa Bersama',
    description: 'Duduk berbaris dan pijat bahu anggota keluarga di depanmu secara bergantian sambil mendoakan kesehatan satu sama lain.',
    duration: '15 Menit',
    participants: 'Semua Anggota',
    cost: 'Gratis',
    emoji: '💆',
    category: 'Relaksasi & Doa',
    steps: [
      'Buat barisan pijat estafet searah jarum jam.',
      'Bisikkan kata-kata penyemangat dan doa tulus.',
      'Tutup dengan ucapan terima kasih dan pelukan erat.'
    ]
  },
  {
    id: 'idea-5',
    title: 'Turnamen Tebak Gambar Rahasia',
    description: 'Ambil selembar kertas dan spidol, gambar benda rahasia dalam 20 detik dan biarkan anggota keluarga lainnya menebak secepat mungkin!',
    duration: '25 Menit',
    participants: '2 - 6 Orang',
    cost: 'Gratis',
    emoji: '🎨',
    category: 'Game Kreatif',
    steps: [
      'Setiap pemain mendapat giliran menggambar 1 benda di rumah.',
      'Pemain yang menebak paling cepat mendapat 1 Love Point.',
      'Pemenang berhak meminta minuman buatan anggota keluarga lain.'
    ]
  }
];

export const QUALITY_TIME_ACTIVITIES = {
  minutes10: [
    { id: 'qt-10-1', title: 'Pelukan Hangat 10 Detik Sekeluarga', emoji: '🤗', desc: 'Pelukan lingkaran bersama tanpa bicara, rasakan detak jantung dan kehangatan kasih sayang keluarga.' },
    { id: 'qt-10-2', title: 'Cerita 1 Momen Bahagia Hari Ini', emoji: '🗣️', desc: 'Bergantian menyebutkan 1 hal kecil yang membuatmu tersenyum hari ini di sekolah/kantor.' },
    { id: 'qt-10-3', title: 'Tebak-Tebakan Logika Kilat', emoji: '💡', desc: 'Lontarkan 3 teka-teki lucu dan asah tawa bersama sebelum waktu tidur.' },
    { id: 'qt-10-4', title: 'Apresiasi & Ucapan Terima Kasih Spontan', emoji: '💖', desc: 'Tatap mata anggota keluarga di sampingmu dan katakan 1 alasan kenapa kamu bangga padanya.' },
    { id: 'qt-10-5', title: 'Tos Kompak Irama Keluarga', emoji: '🤝', desc: 'Ciptakan gerakan tos rahasia 3 gerakan bersama anak dan pasangan.' }
  ],
  minutes30: [
    { id: 'qt-30-1', title: 'Membuat Minuman Hangat / Jus Favorit', emoji: '🧃', desc: 'Racik minuman lezat bersama di dapur dengan pembagian tugas yang adil dan ceria.' },
    { id: 'qt-30-2', title: 'Bermain Game Kartu ASTA / Ular Tangga', emoji: '🎲', desc: 'Ambil giliran bermain kartu ekspresi, tebak kata, atau ular tangga penuh tawa.' },
    { id: 'qt-30-3', title: 'Membaca Buku Cerita Bergantian', emoji: '📖', desc: 'Pilih 1 buku cerita inspiratif, baca 1 paragraf bergantian dengan intonasi karakter yang hidup.' },
    { id: 'qt-30-4', title: 'Beres-Beres Kilat Sambil Pasang Musik', emoji: '🧹', desc: 'Nyalakan lagu ceria dan rapikan ruang tamu bersama dalam waktu 15 menit, sisa waktu untuk bersantai.' },
    { id: 'qt-30-5', title: 'Diskusi Rencana Akhir Pekan', emoji: '🏖️', desc: 'Bahas tempat jalan-jalan atau menu makanan spesial yang ingin dinikmati akhir pekan nanti.' }
  ],
  minutes60: [
    { id: 'qt-60-1', title: 'Family Movie Night & Camilan', emoji: '🍿', desc: 'Nonton film animasi atau keluarga pilihan bersama dengan lampu temaram dan selimut hangat.' },
    { id: 'qt-60-2', title: 'Jalan Santai Malam Keliling Komplek', emoji: '🚶‍♂️', desc: 'Hirup udara malam yang sejuk sambil bergandengan tangan dan ngobrol santai tanpa memegang HP.' },
    { id: 'qt-60-3', title: 'Family Deep Talk & Refleksi Impian', emoji: '💬', desc: 'Bicara dari hati ke hati tentang cita-cita, kekhawatiran yang dirasakan, dan bagaimana saling mendukung.' },
    { id: 'qt-60-4', title: 'Memasak Makan Malam Spesial Bersama', emoji: '🍳', desc: 'Bagi tugas: memotong sayur, memasak bumbu, hingga menata meja makan dengan penuh cinta.' }
  ]
};

export const INITIAL_CHALLENGES: FamilyChallenge[] = [
  {
    id: 'ch-1',
    title: '30 Menit Bebas Gadget (No-Screen Time)',
    tagline: 'Simpan semua HP dan fokus mengobrol',
    type: 'daily',
    description: 'Kumpulkan semua smartphone dalam keranjang dan nikmati 30 menit interaksi nyata tanpa gangguan notifikasi.',
    durationText: '30 Menit',
    rewardPoints: 20,
    emoji: '🚫',
    completed: false
  },
  {
    id: 'ch-2',
    title: 'Masak & Makan Malam Bersama',
    tagline: 'Satu meja tanpa distraksi',
    type: 'daily',
    description: 'Makan malam bersama di satu meja dengan saling menceritakan kejadian menarik hari ini.',
    durationText: 'Hari Ini',
    rewardPoints: 15,
    emoji: '🍳',
    completed: true
  },
  {
    id: 'ch-3',
    title: 'Family Photo Challenge Mingguan',
    tagline: 'Abadikan 1 foto berkesan minggu ini',
    type: 'weekly',
    description: 'Ambil foto kebersamaan keluarga dan simpan di menu Kenangan untuk dikenang selamanya.',
    durationText: 'Minggu Ini',
    rewardPoints: 30,
    emoji: '📸',
    completed: false
  },
  {
    id: 'ch-4',
    title: 'Bantu Beres-Beres Tanpa Diminta',
    tagline: 'Inisiatif kebaikan di rumah',
    type: 'weekly',
    description: 'Setiap anggota keluarga melakukan 1 tugas rumah tangga secara sukarela untuk meringankan beban sesama.',
    durationText: 'Minggu Ini',
    rewardPoints: 25,
    emoji: '🧹',
    completed: false
  }
];

export const INITIAL_HABITS: FamilyHabit[] = [
  { id: 'hb-1', title: 'Makan Malam Bersama di Meja', emoji: '🍽️', completedToday: true, streakDays: 7, category: 'togetherness' },
  { id: 'hb-2', title: 'Sholat Berjamaah / Ibadah Bersama', emoji: '🕌', completedToday: true, streakDays: 5, category: 'spiritual' },
  { id: 'hb-3', title: 'Membaca Buku 15 Menit', emoji: '📖', completedToday: false, streakDays: 4, category: 'learning' },
  { id: 'hb-4', title: 'Beres-Beres Rumah Bersama', emoji: '🧹', completedToday: true, streakDays: 6, category: 'health' },
  { id: 'hb-5', title: 'Quality Time 30 Menit Tanpa HP', emoji: '❤️', completedToday: false, streakDays: 7, category: 'togetherness' },
  { id: 'hb-6', title: 'Tidur Tepat Waktu (Sebelum 21.30)', emoji: '🌙', completedToday: false, streakDays: 3, category: 'health' },
];

export const INITIAL_PLANNER_EVENTS: PlannerEvent[] = [
  { id: 'ev-1', title: 'Sholat Maghrib & Isya Berjamaah', date: '2026-09-09', time: '18:15', category: 'routine', emoji: '🕌', completed: true },
  { id: 'ev-2', title: 'Makan Malam Spesial Keluarga', date: '2026-09-09', time: '19:00', category: 'routine', emoji: '🍽️', completed: true },
  { id: 'ev-3', title: 'Family Game Time: ASTA Kartu & Ular Tangga', date: '2026-09-09', time: '20:00', category: 'family_time', emoji: '🎮', completed: false },
  { id: 'ev-4', title: 'Membaca Buku Cerita Sebelum Tidur', date: '2026-09-09', time: '20:45', category: 'routine', emoji: '📖', completed: false },
  { id: 'ev-5', title: 'Ulang Tahun Kakak Tercinta 🎂', date: '2026-09-15', time: '16:00', category: 'birthday', emoji: '🎉', completed: false },
  { id: 'ev-6', title: 'Liburan & Piknik Taman Kota', date: '2026-09-20', time: '08:00', category: 'holiday', emoji: '🏖️', completed: false },
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Malam Penuh Tawa: Suara Kambing Ayah 😂',
    date: '2026-09-09',
    caption: '“Malam ini semuanya tertawa terbahak-bahak gara-gara Ayah gagal menirukan suara kambing saat main kartu ASTA! Suasananya super hangat ❤️”',
    album: 'Family Night',
    tags: ['Ayah', 'Ibu', 'Kakak', 'Adik', 'Game Kartu'],
    likes: 12
  },
  {
    id: 'mem-2',
    title: 'Piknik & Masak Pancake Bersama di Hari Minggu',
    date: '2026-09-06',
    caption: 'Anak-anak bantu menuang adonan pancake ke wajan. Bentuknya agak miring tapi rasanya paling manis sedunia!',
    album: 'Kuliner Seru',
    tags: ['Masak', 'Pancake', 'Minggu Pagi'],
    likes: 8
  },
  {
    id: 'mem-3',
    title: 'Juara Lomba Mewarnai Adik Cilik 🎨',
    date: '2026-08-30',
    caption: 'Bangga sekali melihat kegigihan adik mewarnai pemandangan alam. Kerja keras terbayar manis!',
    album: 'Prestasi Anak',
    tags: ['Adik', 'Juara', 'Mewarnai'],
    likes: 15
  }
];

export const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: 'j-1',
    playerId: 'p-1',
    playerName: 'Ayah',
    playerAvatar: '👨‍💼',
    date: '2026-09-09',
    mood: 'grateful',
    reason: 'Sangat bersyukur bisa pulang kerja tepat waktu dan berkumpul makan malam hangat bersama keluarga tercinta.',
    createdAt: '19:30'
  },
  {
    id: 'j-2',
    playerId: 'p-2',
    playerName: 'Ibu',
    playerAvatar: '👩‍🍳',
    date: '2026-09-09',
    mood: 'happy',
    reason: 'Senang sekali anak-anak lahap makan sayur sup yang dimasak sore tadi dan rumah terasa begitu damai.',
    createdAt: '19:35'
  },
  {
    id: 'j-3',
    playerId: 'p-4',
    playerName: 'Adik',
    playerAvatar: '👧',
    date: '2026-09-09',
    mood: 'happy',
    reason: 'Tadi di sekolah dapat bintang lima dari bu guru karena bisa membaca lancar di depan kelas!',
    createdAt: '19:40'
  }
];

export const INITIAL_APPRECIATIONS: AppreciationItem[] = [
  {
    id: 'app-1',
    fromPlayerId: 'p-1',
    fromPlayerName: 'Ayah',
    fromPlayerAvatar: '👨‍💼',
    toPlayerId: 'p-2',
    toPlayerName: 'Ibu',
    toPlayerAvatar: '👩‍🍳',
    message: 'Terima kasih Ibu sudah menyiapkan makan malam yang super lezat dan selalu menjaga kehangatan rumah kita ❤️',
    lovePoints: 10,
    date: 'Hari ini',
    badge: 'Koki Terbaik 👑'
  },
  {
    id: 'app-2',
    fromPlayerId: 'p-2',
    fromPlayerName: 'Ibu',
    fromPlayerAvatar: '👩‍🍳',
    toPlayerId: 'p-3',
    toPlayerName: 'Kakak',
    toPlayerAvatar: '👦',
    message: 'Kakak hebat hari ini sudah merapikan meja belajar dan membantu adik mengerjakan PR matematika!',
    lovePoints: 10,
    date: 'Hari ini',
    badge: 'Kakak Teladan ⭐'
  },
  {
    id: 'app-3',
    fromPlayerId: 'p-4',
    fromPlayerName: 'Adik',
    fromPlayerAvatar: '👧',
    toPlayerId: 'p-1',
    toPlayerName: 'Ayah',
    toPlayerAvatar: '👨‍💼',
    message: 'Makasih Ayah sudah mau main kuda-kudaan dan mendengarkan ceritaku sepulang sekolah!',
    lovePoints: 10,
    date: 'Kemarin',
    badge: 'Ayah Pahlawan 🦸‍♂️'
  }
];

export const INITIAL_FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  { id: 'f-1', type: 'income', amount: 5000000, category: 'Alokasi Bulanan', note: 'Dana Belanja & Operasional Rumah Tangga', date: '2026-09-01' },
  { id: 'f-2', type: 'expense', amount: 450000, category: 'Belanja Dapur', note: 'Sayuran segar, buah, telur, & beras', date: '2026-09-05' },
  { id: 'f-3', type: 'expense', amount: 150000, category: 'Family Time', note: 'Bahan camilan & es krim malam keluarga', date: '2026-09-08' },
  { id: 'f-4', type: 'income', amount: 200000, category: 'Celengan Anak', note: 'Tabungan koin reward kebaikan Kakak & Adik', date: '2026-09-09' }
];

export const INITIAL_SAVINGS_TARGETS: SavingsTarget[] = [
  { id: 'st-1', title: '🏖️ Dana Liburan Pantai Akhir Tahun', targetAmount: 3000000, currentAmount: 1850000, emoji: '🏖️', deadline: 'Desember 2026' },
  { id: 'st-2', title: '🎁 Dana Hadiah Ulang Tahun Kakak', targetAmount: 500000, currentAmount: 420000, emoji: '🎁', deadline: '15 September 2026' },
  { id: 'st-3', title: '⛺ Tenda & Perlengkapan Camping', targetAmount: 800000, currentAmount: 350000, emoji: '⛺', deadline: 'Oktober 2026' }
];

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'lrn-1',
    title: 'Tata Surya & Planet-Planet Luar Angkasa 🪐',
    category: 'world',
    categoryLabel: 'Dunia & Sains',
    emoji: '🚀',
    summary: 'Mengenal 8 planet di tata surya kita dari Merkurius hingga Neptunus!',
    content: 'Matahari adalah pusat dari tata surya kita. Ada 8 planet yang mengelilinginya: Merkurius (terdekat), Venus (terpanas), Bumi (rumah kita), Mars (planet merah), Yupiter (planet terbesar), Saturnus (planet cincin megah), Uranus, dan Neptunus.',
    quiz: {
      question: 'Planet apakah yang memiliki cincin paling indah di tata surya kita?',
      options: ['Bumi', 'Mars', 'Saturnus', 'Merkurius'],
      correctIndex: 2,
      explanation: 'Benar! Saturnus terkenal dengan sistem cincin es dan debu raksasanya yang memukau!'
    }
  },
  {
    id: 'lrn-2',
    title: 'Family Members in English 🇬🇧',
    category: 'english',
    categoryLabel: 'Bahasa Inggris',
    emoji: '🗣️',
    summary: 'Belajar kosakata sebutan anggota keluarga dalam Bahasa Inggris.',
    content: 'Father = Ayah, Mother = Ibu, Brother = Saudara Laki-laki, Sister = Saudara Perempuan, Grandfather = Kakek, Grandmother = Nenek, Uncle = Paman, Aunt = Bibi.',
    quiz: {
      question: 'Apa arti kata "Grandmother" dalam bahasa Indonesia?',
      options: ['Bibi', 'Nenek', 'Ibu', 'Kakak'],
      correctIndex: 1,
      explanation: 'Tepat sekali! Grandmother berarti Nenek tercinta.'
    }
  },
  {
    id: 'lrn-3',
    title: 'Adab Makan & Minum yang Santun 🍽️',
    category: 'religion',
    categoryLabel: 'Agama & Budi Pekerti',
    emoji: '🕌',
    summary: 'Kebiasaan baik sebelum dan sesudah menyantap makanan.',
    content: '1. Mencuci tangan dengan sabun.\n2. Duduk dengan tenang (tidak berdiri atau jalan).\n3. Membaca doa sebelum makan.\n4. Menggunakan tangan kanan.\n5. Mengunyah makanan tanpa bersuara keras.\n6. Mengucapkan syukur Alhamdulillah setelah selesai.',
    quiz: {
      question: 'Tangan manakah yang dianjurkan untuk menyuap makanan secara sopan?',
      options: ['Tangan Kiri', 'Tangan Kanan', 'Bebas mana saja', 'Kedua tangan'],
      correctIndex: 1,
      explanation: 'Betul! Menggunakan tangan kanan adalah bagian dari adab makan yang baik dan santun.'
    }
  },
  {
    id: 'lrn-4',
    title: 'Belajar Uang: Kebutuhan vs Keinginan 💰',
    category: 'financial',
    categoryLabel: 'Literasi Keuangan',
    emoji: '💳',
    summary: 'Membedakan hal yang wajib dipenuhi vs hal yang sekadar diinginkan.',
    content: 'Kebutuhan (Needs) adalah hal yang wajib ada agar kita bisa hidup sehat dan belajar: Makanan pokok, air minum, seragam sekolah, obat saat sakit.\n\nKeinginan (Wants) adalah hal tambahan yang menyenangkan tetapi tidak wajib: Mainan baru, permen mahal, pakaian mewah.',
    quiz: {
      question: 'Manakah di bawah ini yang termasuk Kebutuhan pokok?',
      options: ['Buku pelajaran sekolah & nasi', 'Game console baru', 'Koleksi sepatu mahal', 'Mainan robot ke-10'],
      correctIndex: 0,
      explanation: 'Hebat! Makanan bergizi dan perlengkapan sekolah adalah kebutuhan utama kita.'
    }
  },
  {
    id: 'lrn-5',
    title: 'Trik Matematika: Penjumlahan Kilat Puluhan 🔢',
    category: 'math',
    categoryLabel: 'Matematika Asyik',
    emoji: '🧮',
    summary: 'Cara cepat menjumlahkan angka puluhan di luar kepala.',
    content: 'Untuk menjumlahkan 28 + 15, bulatkan 28 menjadi 30 (tambah 2), lalu jumlahkan 30 + 15 = 45, lalu kurangi kembali 2 = 43! Lebih cepat dan mudah dihitung di kepala.',
    quiz: {
      question: 'Berapakah hasil dari 25 + 35?',
      options: ['50', '60', '70', '55'],
      correctIndex: 1,
      explanation: '25 + 35 = 60! Sangat pintar!'
    }
  }
];

export const INITIAL_ACHIEVEMENTS: FamilyAchievement[] = [
  { id: 'ach-1', title: '🏅 First Family Game', description: 'Memainkan game kartu keluarga ASTA pertama kali.', icon: '🎴', unlocked: true, progress: 1, maxProgress: 1, rewardPoints: 50 },
  { id: 'ach-2', title: '🔥 7 Days Together', description: 'Mencapai streak kebersamaan selama 7 hari berturut-turut.', icon: '🔥', unlocked: true, progress: 7, maxProgress: 7, rewardPoints: 100 },
  { id: 'ach-3', title: '❤️ 100 Apresiasi', description: 'Keluarga telah saling mengirimkan total 100 apresiasi cinta.', icon: '💖', unlocked: false, progress: 34, maxProgress: 100, rewardPoints: 150 },
  { id: 'ach-4', title: '📸 Memory Maker', description: 'Menyimpan 50 momen kenangan berharga keluarga.', icon: '📸', unlocked: false, progress: 12, maxProgress: 50, rewardPoints: 200 },
  { id: 'ach-5', title: '👑 Game Master', description: 'Menyelesaikan 100 kartu tantangan di seluruh mode.', icon: '🏆', unlocked: false, progress: 48, maxProgress: 100, rewardPoints: 250 },
  { id: 'ach-6', title: '🌱 Habit Champion', description: 'Menyelesaikan seluruh checklist kebiasaan harian.', icon: '🌟', unlocked: false, progress: 4, maxProgress: 6, rewardPoints: 100 }
];
