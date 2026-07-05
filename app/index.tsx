import React, {useState, useCallback} from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";
import { StorageHelper, Deck } from "@/utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Muat data dari AsyncStorage setiap kali halaman ini aktif kembali
  useFocusEffect(
    useCallback(() => {
      fetchDecks();
    }, [])
  );

  const fetchDecks = async () => {
    setLoading(true);
    const data = await StorageHelper.getDecks();
    setDecks(data);
    setLoading(false);
  }

  // Fungsi tambah deck 
  const handleAddDeck = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Peringatan', 'Judul Deck Kuis wajib diisi');
      return;
    }

    await StorageHelper.addDeck(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    fetchDecks();
    Alert.alert('Berhasil', 'Deck Kuis berhasil ditambahkan');
  }

  // Fungsi Hapus Deck
  const handleDeleteDeck = (id: string, title: string) => {
    Alert.alert(
      'Hapus Kuis',
      `Apakah Anda yakin ingin menghapus "${title}"? Seluruh kartu di dalamnya juga akan terhapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const updated = await StorageHelper.deleteDeck(id);
            setDecks(updated);
          },
        },
      ]
    );
  };

  // Fungsi Import dari DummyJSON Quotes
  const handleImportDummy = async () => {
    try {
      setImporting(true);
      const newDeck = await StorageHelper.importFromDummyJSON();
      Alert.alert('Sukses!', `Berhasil mengimpor kuis baru: "${newDeck.title}"`);
      fetchDecks();
    } catch (error) {
      Alert.alert('Gagal!', 'Terjadi kesalahan saat mengambil data dari DummyJSON.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📖 Kuis Flashcard</Text>
            <Text style={styles.headerSubtitle}>
              Belajar jadi lebih menyenangkan dengan kartu pengingat.
            </Text>
          </View>
          {/* Form Pembuatan Deck Baru */}
          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Buat Deck Baru</Text>
            <TextInput
              placeholder="Contoh: Kosakata Bahasa Jepang"
              placeholderTextColor="#64748B"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Deskripsi singkat deck kuis..."
              placeholderTextColor="#64748B"
              value={newDesc}
              onChangeText={setNewDesc}
              style={[styles.input, { height: 60 }]}
              multiline
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddDeck}>
              <Text style={styles.addButtonText}>➕ Tambah Kuis</Text>
            </TouchableOpacity>
          </View>
          {/* Tombol DummyJSON */}
          <TouchableOpacity
            style={[styles.dummyButton, importing && { opacity: 0.7 }]}
            onPress={handleImportDummy}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.dummyButtonText}>⚡ Impor Kuis dari DummyJSON (Quotes)</Text>
            )}
          </TouchableOpacity>
          {/* Judul List */}
          <Text style={styles.listSectionTitle}>Daftar Kuis Anda ({decks.length})</Text>
          {/* List Tampilan Deck */}
          {loading ? (
            <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
          ) : decks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada kuis yang dibuat.</Text>
              <Text style={styles.emptySubText}>Ayo buat kuis pertama Anda di atas!</Text>
            </View>
          ) : (
            <FlatList
              data={decks}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <View style={styles.deckCard}>
                  <TouchableOpacity
                    style={styles.deckClickArea}
                    onPress={() => router.push(`/deck/${item.id}`)}
                  >
                    <Text style={styles.deckTitle}>{item.title}</Text>
                    <Text style={styles.deckDesc} numberOfLines={2}>
                      {item.description || 'Tidak ada deskripsi.'}
                    </Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.cards.length} Kartu</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDeck(item.id, item.title)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A"
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: Platform.OS === 'android' ? 20 : 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formLabel: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  dummyButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  dummyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 40,
  },
  deckCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  deckClickArea: {
    flex: 1,
    marginRight: 12,
  },
  deckTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deckDesc: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#0284C7',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
