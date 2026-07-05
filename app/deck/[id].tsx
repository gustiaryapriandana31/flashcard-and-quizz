import { Deck, StorageHelper } from '@/utils/storage';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeckDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [deck, setDeck] = useState<Deck | null>(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    // Memuat data deck terpilih dari AsyncStorage setiap kali layar fokus
    useFocusEffect(
        useCallback(() => {
            loadDeck();
        }, [id])
    );

    const loadDeck = async () => {
        const decks = await StorageHelper.getDecks();
        const found = decks.find(d => d.id === id);
        setDeck(found || null);
    }

    // Fungsi Tambah Kartu Baru ke Deck
    const handleAddCard = async () => {
        if (!question.trim() || !answer.trim()) {
            Alert.alert('Peringatan', 'Pertanyaan dan Jawaban kuis tidak boleh kosong.');
            return;
        }
        if (deck) {
            const updatedDecks = await StorageHelper.addCard(
                deck.id,
                question.trim(),
                answer.trim()
            );
            const updatedDeck = updatedDecks.find(d => d.id === id);
            setDeck(updatedDeck || null);
            setQuestion('');
            setAnswer('');
            Alert.alert('Sukses!', 'Kartu baru berhasil ditambahkan.');
        }
    };

    // Fungsi Hapus Kartu
    const handleDeleteCard = (cardId: string) => {
        Alert.alert('Hapus Kartu', 'Apakah Anda yakin ingin menghapus kartu kuis ini?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Hapus',
                style: 'destructive',
                onPress: async () => {
                    if (deck) {
                        const updatedDecks = await StorageHelper.deleteCard(deck.id, cardId);
                        const updatedDeck = updatedDecks.find(d => d.id === id);
                        setDeck(updatedDeck || null);
                    }
                },
            },
        ]);
    };

    if (!deck) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ title: 'Loading...', headerTintColor: '#fff' }} />
                <View style={styles.container}>
                    <Text style={styles.errorText}>Kuis tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Mengatur Header Navigasi Atas secara Dinamis */}
            <Stack.Screen
                options={{
                    title: deck.title,
                    headerStyle: { backgroundColor: '#1E293B' },
                    headerTintColor: '#F8FAFC',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <View style={styles.container}>
                    {/* Header Deck Info */}
                    <View style={styles.deckInfo}>
                        <Text style={styles.deckDescription}>{deck.description || 'Tidak ada deskripsi.'}</Text>
                        <Text style={styles.cardCountText}>{deck.cards.length} kartu tersedia</Text>
                    </View>
                    {/* Tombol Mode Belajar & Main Game */}
                    {deck.cards.length > 0 ? (
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={styles.studyButton}
                                onPress={() => router.push(`/study/${deck.id}`)}
                            >
                                <Text style={styles.studyButtonText}>🎴 Flashcard</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quizButton}
                                onPress={() => router.push(`/quiz/${deck.id}`)}
                            >
                                <Text style={styles.quizButtonText}>🎮 Main Kuis</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.noCardsWarning}>
                            <Text style={styles.warningText}>⚠️ Belum ada kartu belajar di deck ini.</Text>
                            <Text style={styles.warningSubText}>Tambahkan kartu baru di bawah terlebih dahulu untuk mulai belajar.</Text>
                        </View>
                    )}
                    {/* Form Tambah Kartu Baru */}
                    <View style={styles.formContainer}>
                        <Text style={styles.formLabel}>Tambah Kartu Pengingat</Text>
                        <TextInput
                            placeholder="Pertanyaan (Sisi Depan Kartu)"
                            placeholderTextColor="#64748B"
                            value={question}
                            onChangeText={setQuestion}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Jawaban (Sisi Belakang Kartu)"
                            placeholderTextColor="#64748B"
                            value={answer}
                            onChangeText={setAnswer}
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
                            <Text style={styles.addButtonText}>➕ Tambah Kartu</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Judul List Kartu */}
                    <Text style={styles.listSectionTitle}>Daftar Kartu Kuis</Text>
                    {/* List Kartu */}
                    <FlatList
                        data={deck.cards}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        renderItem={({ item, index }) => (
                            <View style={styles.cardItem}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardNumber}>Kartu #{index + 1}</Text>
                                    <Text style={styles.cardQuestion}>Q: {item.question}</Text>
                                    <Text style={styles.cardAnswer}>A: {item.answer}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteCard(item.id)}
                                >
                                    <Text style={styles.deleteButtonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    deckInfo: {
        marginBottom: 16,
    },
    deckDescription: {
        color: '#94A3B8',
        fontSize: 15,
        lineHeight: 22,
    },
    cardCountText: {
        color: '#38BDF8',
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 6,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    studyButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    studyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    quizButton: {
        flex: 1,
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    quizButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    noCardsWarning: {
        backgroundColor: '#334155',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#475569',
    },
    warningText: {
        color: '#FBBF24',
        fontWeight: 'bold',
        fontSize: 14,
    },
    warningSubText: {
        color: '#94A3B8',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    formContainer: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    formLabel: {
        color: '#F8FAFC',
        fontWeight: 'bold',
        marginBottom: 12,
        fontSize: 15,
    },
    input: {
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
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
    listSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#94A3B8',
        marginBottom: 10,
    },
    listContainer: {
        paddingBottom: 40,
    },
    cardItem: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardContent: {
        flex: 1,
        marginRight: 12,
    },
    cardNumber: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardQuestion: {
        color: '#F8FAFC',
        fontSize: 15,
        fontWeight: 'bold',
    },
    cardAnswer: {
        color: '#10B981',
        fontSize: 14,
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#EF4444',
        borderRadius: 8,
    },
    deleteButtonText: {
        fontSize: 14,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
});

