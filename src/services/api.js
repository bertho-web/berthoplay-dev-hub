// ============================================================================
// 🎮 BERTHOPLAY — CLIENT API UNIFIÉ (SRC/SERVICES/API.JS) [DEV HUB SANDBOX]
// ============================================================================

// 💾 Clé de stockage local pour le simulateur de base de données
const DB_STORAGE_KEY = 'BERTHOPLAY_SANDBOX_DB';

class SandboxDatabase {
  static getDB() {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return this.seedInitialData();
  }

  static saveDB(db) {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  }

  // Initialisation automatique de données réalistes
  static seedInitialData() {
    const initialDB = {
      users: [
        { id: 'usr_bertho', username: 'Bertho', phone: '+242060000001', coins: 1650, bio: 'Joueur BerthoPlay 🎮', theme_color: '#38bdf8', is_verified: 1, is_private: 0, hide_subscribers: 0 },
        { id: 'usr_gervis', username: 'Gervis', phone: '+242060000002', coins: 1200, bio: 'Champion BerthoPlay', theme_color: '#34d399', is_verified: 0, is_private: 0, hide_subscribers: 0 },
        { id: 'usr_mum', username: 'Mum', phone: '+242060000003', coins: 950, bio: 'Joueuse Pro', theme_color: '#a855f7', is_verified: 0, is_private: 0, hide_subscribers: 0 },
        { id: 'usr_saint', username: 'Saint', phone: '+242060000004', coins: 740, bio: 'Allié BerthoPlay', theme_color: '#38bdf8', is_verified: 0, is_private: 0, hide_subscribers: 0 },
        { id: 'usr_mohamed', username: 'Mohamed', phone: '+243000000005', coins: 820, bio: 'Gamer Elite', theme_color: '#ef4444', is_verified: 0, is_private: 0, hide_subscribers: 0 }
      ],
      clans: [
        { id: 'clan_1', name: 'WARRIORS 242', tag: 'W242', logo: '🛡️', total_coins: 1500, owner_id: 'usr_gervis', username: 'Gervis' },
        { id: 'clan_2', name: 'CYBER LEGENDS', tag: 'CYB', logo: '⚔️', total_coins: 1200, owner_id: 'usr_mum', username: 'Mum' },
        { id: 'clan_3', name: 'BRAZZA ELITE', tag: 'BZZ', logo: '👑', total_coins: 900, owner_id: 'usr_bertho', username: 'Bertho' }
      ],
      clan_members: [
        { clan_id: 'clan_1', user_id: 'usr_gervis', role: 'leader' },
        { clan_id: 'clan_1', user_id: 'usr_mum', role: 'member' },
        { clan_id: 'clan_2', user_id: 'usr_mum', role: 'leader' },
        { clan_id: 'clan_3', user_id: 'usr_bertho', role: 'leader' }
      ],
      messages: [
        { id: 'm1', sender_id: 'usr_gervis', receiver_id: 'usr_bertho', sender_name: 'Gervis', msg_type: 'text', message: 'Salut', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'm2', sender_id: 'usr_mum', receiver_id: 'usr_bertho', sender_name: 'Mum', msg_type: 'text', message: 'Ok', created_at: new Date(Date.now() - 172800000).toISOString() }
      ],
      clan_messages: {
        'clan_1': [
          { id: 'cm1', username: 'Gervis', msg_type: 'text', message: 'Bienvenue dans le clan WARRIORS 242 ! 🎮', created_at: new Date(Date.now() - 3600000).toISOString() }
        ]
      },
      posts: [
        { id: 'p1', user_id: 'usr_bertho', username: 'Bertho', message: "Bertho s'est abonné à Gervis !", created_at: new Date(Date.now() - 86400000).toISOString(), likes_count: 1, comments_count: 0 },
        { id: 'p2', user_id: 'usr_bertho', username: 'Bertho', message: "Bonjour, un test ça vous va ?", created_at: new Date(Date.now() - 172800000).toISOString(), likes_count: 1, comments_count: 0 }
      ],
      comments: {
        'car': [{ id: 'c1', username: 'Hermès', rating: 5, content: 'Je veux bien aimer ce jeu', created_at: new Date().toISOString() }]
      },
      feed: [
        { id: 'ev_1', event_type: 'ANNOUNCE', title: 'BIENVENUE SUR BERTHOPLAY', message: 'Découvrez notre collection de 7 jeux 2D/3D ultra fluides.', target_url: 'app://game_bubble', created_at: new Date().toISOString() },
        { id: 'ev_2', event_type: 'CLAN_CREATE', title: 'NOUVEAU CLAN', message: 'Le clan WARRIORS 242 a été créé !', user_id: 'usr_gervis', username: 'Gervis', created_at: new Date(Date.now() - 3600000).toISOString() }
      ]
    };
    this.saveDB(initialDB);
    return initialDB;
  }
}

// ============================================================================
// 🌐 CONTRAT D'API UNIFIÉ (FONCTIONNE DE FAÇON TRANSPARENTE POUR TOUS LES DEVS)
// ============================================================================

export const API = {

  // --- 1. AUTHENTIFICATION & UTILISATEURS ---
  auth: {
    async login(phone, password) {
      const db = SandboxDatabase.getDB();
      let user = db.users.find(u => u.phone === phone);
      if (!user) {
        user = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          username: 'Joueur_' + phone.slice(-4),
          phone: phone,
          coins: 500,
          bio: 'Joueur BerthoPlay 🎮',
          theme_color: '#38bdf8',
          is_verified: 0,
          is_private: 0,
          hide_subscribers: 0
        };
        db.users.push(user);
        SandboxDatabase.saveDB(db);
      }
      return { success: true, user: user };
    },

    async register(username, phone, password) {
      const db = SandboxDatabase.getDB();
      const existing = db.users.find(u => u.phone === phone || u.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        return { success: false, error: "Pseudonyme ou numéro déjà utilisé." };
      }
      const newUser = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        username: username,
        phone: phone,
        coins: 500,
        bio: 'Joueur BerthoPlay 🎮',
        theme_color: '#38bdf8',
        is_verified: 0,
        is_private: 0,
        hide_subscribers: 0
      };
      db.users.push(newUser);
      SandboxDatabase.saveDB(db);
      return { success: true, user: newUser };
    },

    async updateProfile(userId, updates) {
      const db = SandboxDatabase.getDB();
      const userIndex = db.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        db.users[userIndex] = { ...db.users[userIndex], ...updates };
        SandboxDatabase.saveDB(db);
        return { success: true, user: db.users[userIndex] };
      }
      return { success: false, error: "Utilisateur non trouvé." };
    },

    async search(query) {
      const db = SandboxDatabase.getDB();
      const found = db.users.filter(u => u.username.toLowerCase().includes(query.toLowerCase()));
      return { success: true, users: found };
    }
  },

  // --- 2. MESSAGERIE ET CAUSERIES ---
  chat: {
    async getConversations(userId) {
      const db = SandboxDatabase.getDB();
      const conversationsMap = {};

      db.messages.forEach(m => {
        const isSender = m.sender_id === userId;
        const isReceiver = m.receiver_id === userId;

        if (isSender || isReceiver) {
          const peerId = isSender ? m.receiver_id : m.sender_id;
          const peerUser = db.users.find(u => u.id === peerId) || { username: 'Allié' };

          if (!conversationsMap[peerId] || new Date(m.created_at) > new Date(conversationsMap[peerId].last_time)) {
            conversationsMap[peerId] = {
              peer_id: peerId,
              peer_name: peerUser.username,
              last_message: m.message,
              last_time: m.created_at,
              unread_count: 0
            };
          }
        }
      });

      return { success: true, conversations: Object.values(conversationsMap) };
    },

    async getHistory(userId, peerId) {
      const db = SandboxDatabase.getDB();
      const messages = db.messages.filter(m => 
        (m.sender_id === userId && m.receiver_id === peerId) ||
        (m.sender_id === peerId && m.receiver_id === userId)
      );
      return { success: true, messages: messages };
    },

    async sendMessage(senderId, receiverId, senderName, message, msgType = 'text', mediaUrl = null) {
      const db = SandboxDatabase.getDB();
      const newMsg = {
        id: 'msg_' + Date.now(),
        sender_id: senderId,
        receiver_id: receiverId,
        sender_name: senderName,
        msg_type: msgType,
        message: message,
        media_url: mediaUrl,
        created_at: new Date().toISOString()
      };
      db.messages.push(newMsg);
      SandboxDatabase.saveDB(db);
      return { success: true, message: newMsg };
    },

    async deleteMessage(msgId) {
      const db = SandboxDatabase.getDB();
      db.messages = db.messages.filter(m => m.id !== msgId);
      SandboxDatabase.saveDB(db);
      return { success: true };
    }
  },

  // --- 3. CLANS & GROUPES ---
  clans: {
    async list() {
      const db = SandboxDatabase.getDB();
      return { success: true, clans: db.clans };
    },

    async create(name, tag, userId, username) {
      const db = SandboxDatabase.getDB();
      const newClan = {
        id: 'clan_' + Date.now(),
        name: name,
        tag: tag.toUpperCase(),
        logo: '🛡️',
        total_coins: 500,
        owner_id: userId,
        username: username
      };
      db.clans.unshift(newClan);
      db.clan_members.push({ clan_id: newClan.id, user_id: userId, role: 'leader' });
      SandboxDatabase.saveDB(db);
      return { success: true, clan: newClan };
    },

    async getMembers(clanId) {
      const db = SandboxDatabase.getDB();
      const clanMemberships = db.clan_members.filter(cm => cm.clan_id === clanId);
      const members = clanMemberships.map(cm => {
        const u = db.users.find(user => user.id === cm.user_id) || { username: 'Membre', coins: 0 };
        return { ...u, role: cm.role };
      });
      return { success: true, members: members };
    },

    async join(clanId, userId) {
      const db = SandboxDatabase.getDB();
      if (!db.clan_members.some(cm => cm.clan_id === clanId && cm.user_id === userId)) {
        db.clan_members.push({ clan_id: clanId, user_id: userId, role: 'member' });
        SandboxDatabase.saveDB(db);
      }
      return { success: true };
    },

    async leave(clanId, userId) {
      const db = SandboxDatabase.getDB();
      db.clan_members = db.clan_members.filter(cm => !(cm.clan_id === clanId && cm.user_id === userId));
      SandboxDatabase.saveDB(db);
      return { success: true };
    },

    async getWallMessages(clanId) {
      const db = SandboxDatabase.getDB();
      const msgs = db.clan_messages[clanId] || [];
      return { success: true, messages: msgs };
    },

    async sendWallMessage(clanId, username, message, msgType = 'text', mediaUrl = null) {
      const db = SandboxDatabase.getDB();
      if (!db.clan_messages[clanId]) db.clan_messages[clanId] = [];
      const newMsg = {
        id: 'cm_' + Date.now(),
        username: username,
        msg_type: msgType,
        message: message,
        media_url: mediaUrl,
        created_at: new Date().toISOString()
      };
      db.clan_messages[clanId].push(newMsg);
      SandboxDatabase.saveDB(db);
      return { success: true, message: newMsg };
    }
  },

  // --- 4. CLASSEMENTS (LEADERBOARD) & SCORES ---
  leaderboard: {
    async getGlobal() {
      const db = SandboxDatabase.getDB();
      const sortedUsers = [...db.users].sort((a, b) => (b.coins || 0) - (a.coins || 0));
      return { success: true, leaderboard: sortedUsers };
    }
  },

  scores: {
    async submit(userId, gameId, score, stars = 1, level = 1, coinsEarned = 0) {
      const db = SandboxDatabase.getDB();
      const user = db.users.find(u => u.id === userId);
      if (user) {
        user.coins = (user.coins || 0) + coinsEarned;
        SandboxDatabase.saveDB(db);
      }
      return { success: true, newCoins: user ? user.coins : 0 };
    }
  },

  // --- 5. AVIS & COMMENTAIRES ---
  comments: {
    async getForGame(gameId) {
      const db = SandboxDatabase.getDB();
      const list = db.comments[gameId] || [];
      return { success: true, comments: list };
    },

    async add(userId, username, gameId, rating, content) {
      const db = SandboxDatabase.getDB();
      if (!db.comments[gameId]) db.comments[gameId] = [];
      const newCmt = {
        id: 'cmt_' + Date.now(),
        user_id: userId,
        username: username,
        rating: rating,
        content: content,
        created_at: new Date().toISOString()
      };
      db.comments[gameId].unshift(newCmt);
      SandboxDatabase.saveDB(db);
      return { success: true, comment: newCmt };
    }
  },

  // --- 6. FIL D'ACTUALITÉS & PUBLICATIONS ---
  feed: {
    async list() {
      const db = SandboxDatabase.getDB();
      return { success: true, events: db.feed };
    }
  },

  posts: {
    async list(userId) {
      const db = SandboxDatabase.getDB();
      const userPosts = db.posts.filter(p => !userId || p.user_id === userId);
      return { success: true, posts: userPosts };
    },

    async create(userId, username, title, message) {
      const db = SandboxDatabase.getDB();
      const newPost = {
        id: 'post_' + Date.now(),
        user_id: userId,
        username: username,
        title: title,
        message: message,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0
      };
      db.posts.unshift(newPost);
      SandboxDatabase.saveDB(db);
      return { success: true, post: newPost };
    },

    async delete(postId) {
      const db = SandboxDatabase.getDB();
      db.posts = db.posts.filter(p => p.id !== postId);
      SandboxDatabase.saveDB(db);
      return { success: true };
    }
  }
};