import AsyncStorage from '@react-native-async-storage/async-storage';

// Deklarasi Tipe Data
export interface Card {
  id: string;
  question: string;
  answer: string;
  learned: boolean; // untuk menandakan apakah user sudah hafal belum kartu ini
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
  createdAt: string;
}
                        
const STORAGE_KEY = '@flashcards_decks_key';

const DEFAULT_DECKS: Deck[] = [
  {
    id: 'card-deck-1',
    title: 'Grammar Bahasa Inggris',
    description: 'Kumpulan Grammar (Tenses) dalam Bahasa Inggris',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'gc1',
        question: 'I am learning React Native',
        answer: 'Present Continuous Tense',
        learned: false,
      },
      {
        id: 'gc2',
        question: 'I have learned React Native',
        answer: 'Present Perfect Tense',
        learned: false,
      },
      {
        id: 'gc3',
        question: 'I learned React Native yesterday',
        answer: 'Simple Past Tense',
        learned: false,
      },
      {
        id: 'gc4',
        question: 'I will learn React Native tomorrow',
        answer: 'Simple Future Tense',
        learned: false,
      },
      {
        id: 'gc5',
        question: 'I have learned React Native for 2 days',
        answer: 'Present Perfect Continuous Tense',
        learned: false,
      },
    ],
  },
  {
    id: 'card-deck-2',
    title: 'Passive Voice Grammar',
    description: 'Kumpulan Passive Voice dalam Bahasa Inggris',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'pv1',
        question: 'The book was written by him',
        answer: 'Simple Past Passive',
        learned: false,
      },
      {
        id: 'pv2',
        question: 'The book was written by him',
        answer: 'Simple Past Passive',
        learned: false,
      },
      {
        id: 'pv3',
        question: 'The book was written by him',
        answer: 'Simple Past Passive',
        learned: false,
      },
      {
        id: 'pv4',
        question: 'The book was written by him',
        answer: 'Simple Past Passive',
        learned: false,
      },
      {
        id: 'pv5',
        question: 'The book was written by him',
        answer: 'Simple Past Passive',
        learned: false,
      },
    ],
  },
];

// Fungsi Helper CRUD untuk Deck
export const StorageHelper = {
  // Mengambil semua Decks
  getDecks: async (): Promise<Deck[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }

      // Jika kosong, simpan data default dan kembalikan data default tersebut
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DECKS));
      return DEFAULT_DECKS;
    } catch (error) {
      console.error('Error getting decks:', error);
      return DEFAULT_DECKS;
    }
  },

  // Menyimpan seluruh Decks (Overwrites)
  saveDecks: async (decks: Deck[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    } catch (error) {
      console.error('Error saving decks:', error);
    }
  },

  // Menambah Deck Baru
  addDeck: async (title: string, description: string): Promise<Deck> => {
    const decks = await StorageHelper.getDecks();
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      title,
      description,
      cards: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newDeck, ...decks];
    await StorageHelper.saveDecks(updated);
    return newDeck;
  },

  // Mengubah Deck
  updateDeck: async (id: string, title: string, description: string): Promise<Deck[]> => {
    const decks = await StorageHelper.getDecks();
    const updated = decks.map(d => (d.id === id ? { ...d, title, description } : d));
    await StorageHelper.saveDecks(updated);
    return updated;
  },

  // Menghapus Deck
  deleteDeck: async (id: string): Promise<Deck[]> => {
    const decks = await StorageHelper.getDecks();
    const updated = decks.filter(d => d.id !== id);
    await StorageHelper.saveDecks(updated);
    return updated;
  },

  // Menambah Kartu ke Deck tertentu
  addCard: async (deckId: string, question: string, answer: string): Promise<Deck[]> => {
    const decks = await StorageHelper.getDecks();
    const newCard: Card = {
      id: `card-${Date.now()}`,
      question,
      answer,
      learned: false,
    };
    const updated = decks.map(deck => {
      if (deck.id === deckId) {
        return { ...deck, cards: [...deck.cards, newCard] };
      }
      return deck;
    });
    await StorageHelper.saveDecks(updated);
    return updated;
  },

  // Mengubah Kartu di Deck tertentu
  updateCard: async (
    deckId: string,
    cardId: string,
    question: string,
    answer: string,
    learned?: boolean
  ): Promise<Deck[]> => {
    const decks = await StorageHelper.getDecks();
    const updated = decks.map(deck => {
      if (deck.id === deckId) {
        const updatedCards = deck.cards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              question,
              answer,
              learned: learned !== undefined ? learned : card.learned,
            };
          }
          return card;
        });
        return { ...deck, cards: updatedCards };
      }
      return deck;
    });
    await StorageHelper.saveDecks(updated);
    return updated;
  },

  // Menghapus Kartu dari Deck tertentu
  deleteCard: async (deckId: string, cardId: string): Promise<Deck[]> => {
    const decks = await StorageHelper.getDecks();
    const updated = decks.map(deck => {
      if (deck.id === deckId) {
        return { ...deck, cards: deck.cards.filter(c => c.id !== cardId) };
      }
      return deck;
    });
    await StorageHelper.saveDecks(updated);
    return updated;
  },

};