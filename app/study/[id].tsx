import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StorageHelper, Deck, Card } from '@/utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function StudyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  // State Belajar
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Animasi Shared Value untuk Rotasi Kartu (0 ke 180 derajat)
  const rotate = useSharedValue(0);

  useEffect(() => {
    loadDeck();
  }, [id]);

  // Trigger animasi rotasi saat showAnswer berubah
  useEffect(() => {
    rotate.value = withTiming(showAnswer ? 180 : 0, { duration: 400 });
  }, [showAnswer]);

  const loadDeck = async () => {
    setLoading(true);
    const decks = await StorageHelper.getDecks();
    const found = decks.find(d => d.id === id);
    setDeck(found || null);
    setLoading(false);
  };

  // Fungsi membalik kartu dengan getaran ringan
  const handleFlipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAnswer(!showAnswer);
  };

  // Fungsi saat menekan "Sudah Hafal" atau "Belum Hafal"
  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount(prev => prev + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    if (deck) {
      if (currentIdx + 1 < deck.cards.length) {
        // Lanjut ke kartu berikutnya
        setCurrentIdx(prev => prev + 1);
        setShowAnswer(false);
      } else {
        // Sesi belajar selesai
        setIsFinished(true);
      }
    }
  };

  // Ulangi Sesi Belajar
  const handleRestart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentIdx(0);
    setShowAnswer(false);
    setCorrectCount(0);
    setIsFinished(false);
  };

  // Gaya Animasi untuk Sisi Depan Kartu (Pertanyaan)
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(rotate.value, [0, 180], [0, 180]);
    return {
      transform: [
        { perspective: 800 },
        { rotateY: `${spin}deg` }
      ],
      opacity: rotate.value > 90 ? 0 : 1,
    };
  });

  // Gaya Animasi untuk Sisi Belakang Kartu (Jawaban)
  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(rotate.value, [0, 180], [180, 360]);
    return {
      transform: [
        { perspective: 800 },
        { rotateY: `${spin}deg` }
      ],
      opacity: rotate.value > 90 ? 1 : 0,
    };
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Loading...', headerTintColor: '#fff' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!deck || deck.cards.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Error', headerTintColor: '#fff' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Deck kuis kosong atau tidak ditemukan.</Text>
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
    const scorePercentage = Math.round((correctCount / deck.cards.length) * 100);
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            title: 'Selesai Belajar',
            headerStyle: { backgroundColor: '#1E293B' },
            headerTintColor: '#F8FAFC',
          }}
        />
        <View style={styles.container}>
          <View style={styles.resultCard}>
            <Text style={styles.congratsText}>🎉 Selamat!</Text>
            <Text style={styles.resultSubText}>Anda telah menyelesaikan sesi belajar untuk kuis:</Text>
            <Text style={styles.resultDeckTitle}>{deck.title}</Text>

            <View style={styles.divider} />

            {/* Tampilan Nilai */}
            <Text style={styles.scoreTitle}>Skor Anda</Text>
            <Text style={styles.scoreNumber}>{scorePercentage}%</Text>
            <Text style={styles.scoreDetail}>
              {correctCount} dari {deck.cards.length} kartu berhasil dihafalkan.
            </Text>

            <View style={styles.divider} />

            {/* Tombol Aksi */}
            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Text style={styles.restartButtonText}>🔄 Belajar Lagi</Text>
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
          title: `Belajar: ${deck.title}`,
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#F8FAFC',
        }}
      />
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        {/* Progress Bar & Indikator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Kartu {currentIdx + 1} dari {deck.cards.length}
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

        {/* AREA KARTU FLASHCARD DENGAN ANIMASI 3D FLIP */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.cardTouchable}
          onPress={handleFlipCard}
        >
          <View style={styles.cardContainer}>
            {/* Sisi Depan: Pertanyaan */}
            <Animated.View style={[styles.flashcard, styles.flashcardQuestionBg, frontAnimatedStyle]}>
              <Text style={styles.cardSideLabel}>❓ PERTANYAAN</Text>
              <Text style={styles.cardMainText}>{currentCard.question}</Text>
              <Text style={styles.tapTip}>Ketuk kartu untuk melihat jawaban</Text>
            </Animated.View>

            {/* Sisi Belakang: Jawaban */}
            <Animated.View style={[styles.flashcard, styles.flashcardAnswerBg, backAnimatedStyle]}>
              <Text style={styles.cardSideLabel}>💡 JAWABAN</Text>
              <Text style={styles.cardMainText}>{currentCard.answer}</Text>
              <Text style={styles.tapTip}>Ketuk kartu untuk melihat pertanyaan</Text>
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* TOMBOL KENDALI */}
        <View style={styles.controlsContainer}>
          {!showAnswer ? (
            // Jika belum klik tampilkan jawaban
            <TouchableOpacity
              style={styles.revealButton}
              onPress={handleFlipCard}
            >
              <Text style={styles.revealButtonText}>👁️ Tampilkan Jawaban</Text>
            </TouchableOpacity>
          ) : (
            // Jika jawaban sudah terlihat, tampilkan pilihan evaluasi diri
            <View style={styles.choiceButtonsContainer}>
              <TouchableOpacity
                style={[styles.choiceButton, styles.wrongButton]}
                onPress={() => handleAnswer(false)}
              >
                <Text style={styles.choiceButtonText}>❌ Belum Hafal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choiceButton, styles.correctButton]}
                onPress={() => handleAnswer(true)}
              >
                <Text style={styles.choiceButtonText}>✅ Sudah Hafal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
    padding: 20,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  cardTouchable: {
    flex: 1,
    minHeight: 320,
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
  },
  flashcard: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
  },
  flashcardQuestionBg: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8', // Aksen biru langit
  },
  flashcardAnswerBg: {
    backgroundColor: '#0F2C22', // Tema hijau gelap sukses
    borderColor: '#10B981', // Aksen hijau neon
  },
  cardSideLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardMainText: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
  },
  tapTip: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  controlsContainer: {
    marginTop: 24,
    marginBottom: 10,
  },
  revealButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  revealButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  choiceButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrongButton: {
    backgroundColor: '#EF4444',
  },
  correctButton: {
    backgroundColor: '#10B981',
  },
  choiceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    backgroundColor: '#3B82F6',
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
});
