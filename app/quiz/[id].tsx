import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageHelper, Deck, Card } from '@/utils/storage';
import * as Haptics from 'expo-haptics';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  // State Kuis Pilihan Ganda
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    loadDeck();
  }, [id]);

  const loadDeck = async () => {
    setLoading(true);
    const decks = await StorageHelper.getDecks();
    const found = decks.find(d => d.id === id);
    setDeck(found || null);
    setLoading(false);
  };

  // Setiap kali indeks kartu berubah, buat pilihan ganda baru
  useEffect(() => {
    if (deck && deck.cards.length > 0) {
      const card = deck.cards[currentIdx];
      const generatedOptions = generateOptions(card, deck.cards);
      setOptions(generatedOptions);
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  }, [deck, currentIdx]);

  // Fungsi menghasilkan 4 pilihan jawaban acak
  const generateOptions = (currentCard: Card, allCards: Card[]) => {
    const correct = currentCard.answer;

    // Ambil jawaban dari kartu lain di deck yang sama
    const wrongAnswers = allCards
      .filter(c => c.id !== currentCard.id)
      .map(c => c.answer);

    // Acak jawaban salah
    const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5);
    const selectedWrong = shuffledWrong.slice(0, 3);

    // Jika jumlah kartu di deck kurang dari 4, buat pengecoh buatan
    const fallbacks = ['Salah', 'Bukan Jawaban Ini', 'Kurang Tepat', 'Jawaban Alternatif'];
    let fallbackIdx = 0;
    while (selectedWrong.length < 3) {
      const dummy = fallbacks[fallbackIdx % fallbacks.length];
      if (!selectedWrong.includes(dummy) && dummy !== correct) {
        selectedWrong.push(dummy);
      }
      fallbackIdx++;
    }

    // Gabungkan jawaban benar dengan 3 jawaban salah, lalu acak urutannya
    const mixed = [correct, ...selectedWrong];
    return mixed.sort(() => Math.random() - 0.5);
  };

  // Aksi saat pengguna memilih jawaban
  const handleSelectAnswer = (option: string) => {
    if (hasAnswered) return; // Kunci jika sudah menjawab

    setSelectedAnswer(option);
    setHasAnswered(true);

    if (deck) {
      const correctAnswer = deck.cards[currentIdx].answer;
      if (option === correctAnswer) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScore(prev => prev + 1);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // Lanjut ke soal berikutnya
  const handleNext = () => {
    if (deck) {
      if (currentIdx + 1 < deck.cards.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }
  };

  // Ulangi Kuis
  const handleRestart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setHasAnswered(false);
    loadDeck();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Loading...', headerTintColor: '#fff' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  if (!deck || deck.cards.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Error', headerTintColor: '#fff' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Kuis kosong atau tidak ditemukan.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentCard = deck.cards[currentIdx];

  // Render Halaman Ringkasan Hasil Belajar
  if (isFinished) {
    const scorePercentage = Math.round((score / deck.cards.length) * 100);
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            title: 'Hasil Game Kuis',
            headerStyle: { backgroundColor: '#1E293B' },
            headerTintColor: '#F8FAFC',
          }}
        />
        <View style={styles.container}>
          <View style={styles.resultCard}>
            <Text style={styles.congratsText}>🎮 Game Selesai!</Text>
            <Text style={styles.resultSubText}>Hasil tebak-tebakan kuis Anda untuk deck:</Text>
            <Text style={styles.resultDeckTitle}>{deck.title}</Text>

            <View style={styles.divider} />

            <Text style={styles.scoreTitle}>Skor Game Kuis</Text>
            <Text style={styles.scoreNumber}>{scorePercentage}%</Text>
            <Text style={styles.scoreDetail}>
              Berhasil menjawab benar {score} dari {deck.cards.length} pertanyaan.
            </Text>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Text style={styles.restartButtonText}>🔁 Main Lagi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.finishBackButton} onPress={() => router.back()}>
              <Text style={styles.finishBackButtonText}>⬅️ Kembali ke Detail Kuis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: `Game: ${deck.title}`,
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#F8FAFC',
        }}
      />
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollStyle}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Soal {currentIdx + 1} dari {deck.cards.length}
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentIdx + 1) / deck.cards.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Tampilan Soal Pertanyaan */}
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>PERTANYAAN</Text>
          <Text style={styles.questionText}>{currentCard.question}</Text>
        </View>

        {/* Tampilan 4 Pilihan Jawaban */}
        <View style={styles.optionsContainer}>
          {options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === currentCard.answer;

            // Logika pewarnaan tombol setelah dijawab
            let buttonStyle = styles.optionButton;
            let textStyle = styles.optionText;

            if (hasAnswered) {
              if (isCorrectAnswer) {
                buttonStyle = [styles.optionButton, styles.correctOption];
                textStyle = [styles.optionText, styles.correctOptionText];
              } else if (isSelected) {
                buttonStyle = [styles.optionButton, styles.wrongOption];
                textStyle = [styles.optionText, styles.wrongOptionText];
              } else {
                buttonStyle = [styles.optionButton, styles.disabledOption];
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={buttonStyle}
                onPress={() => handleSelectAnswer(option)}
                disabled={hasAnswered}
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tombol Lanjut */}
        <View style={styles.footer}>
          {hasAnswered && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentIdx + 1 === deck.cards.length ? '🏁 Lihat Hasil' : '➡️ Soal Berikutnya'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  scrollStyle: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981', // Hijau untuk membedakan dengan mode belajar biasa
    borderRadius: 4,
  },
  questionBox: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 150,
    justifyContent: 'center',
  },
  questionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    marginVertical: 24,
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  optionText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  correctOption: {
    backgroundColor: '#0F2C22',
    borderColor: '#10B981',
  },
  correctOptionText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  wrongOption: {
    backgroundColor: '#3B1E1E',
    borderColor: '#EF4444',
  },
  wrongOptionText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  disabledOption: {
    opacity: 0.4,
  },
  footer: {
    height: 60,
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 'auto',
  },
  congratsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FBBF24',
    marginBottom: 10,
  },
  resultSubText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  resultDeckTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    width: '100%',
    marginVertical: 20,
  },
  scoreTitle: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreNumber: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#10B981',
    marginVertical: 10,
  },
  scoreDetail: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  restartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  finishBackButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  finishBackButtonText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 15,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
