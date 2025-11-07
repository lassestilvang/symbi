import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Share,
  ActivityIndicator,
} from 'react-native';
import { EvolutionRecord } from '../types';
import { EvolutionSystem } from '../services';

/**
 * EvolutionGalleryScreen Component
 * 
 * Displays all past evolution forms of the Symbi.
 * Shows evolution level, date, and appearance for each record.
 * Allows viewing full-size images and sharing evolution milestones.
 * 
 * Requirements: 8.5
 */

interface EvolutionGalleryScreenProps {
  navigation: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 2 columns with padding

export const EvolutionGalleryScreen: React.FC<EvolutionGalleryScreenProps> = ({ navigation }) => {
  const [evolutionRecords, setEvolutionRecords] = useState<EvolutionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<EvolutionRecord | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvolutionHistory();
  }, []);

  /**
   * Load evolution history from storage
   */
  const loadEvolutionHistory = async () => {
    try {
      setIsLoading(true);
      const records = await EvolutionSystem.getEvolutionHistory();
      setEvolutionRecords(records);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading evolution history:', error);
      setIsLoading(false);
    }
  };

  /**
   * Handle evolution card press - show full image
   */
  const handleCardPress = (record: EvolutionRecord) => {
    setSelectedRecord(record);
    setShowFullImage(true);
  };

  /**
   * Handle share evolution milestone
   */
  const handleShare = async (record: EvolutionRecord) => {
    try {
      await Share.share({
        message: `My Symbi just evolved to Level ${record.evolutionLevel}! 🎉✨`,
        title: 'Symbi Evolution',
      });
    } catch (error) {
      console.error('Error sharing evolution:', error);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Render evolution card
   */
  const renderEvolutionCard = ({ item }: { item: EvolutionRecord }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCardPress(item)}
      accessibilityLabel={`Evolution level ${item.evolutionLevel}`}
    >
      <View style={styles.cardImageContainer}>
        {item.appearanceUrl ? (
          <Image
            source={{ uri: item.appearanceUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderEmoji}>👻</Text>
          </View>
        )}
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Lv {item.evolutionLevel}</Text>
        </View>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.cardDays}>
          {item.daysInPositiveState} days active
        </Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🌟</Text>
      <Text style={styles.emptyTitle}>No Evolutions Yet</Text>
      <Text style={styles.emptyText}>
        Keep your Symbi in Active or Vibrant states for 30 days to unlock your first evolution!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Evolution Gallery</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Loading state */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingText}>Loading evolutions...</Text>
        </View>
      ) : (
        <>
          {/* Gallery grid */}
          <FlatList
            data={evolutionRecords}
            renderItem={renderEvolutionCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />

          {/* Full image modal */}
          {selectedRecord && (
            <Modal
              visible={showFullImage}
              transparent
              animationType="fade"
              onRequestClose={() => setShowFullImage(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  {/* Close button */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowFullImage(false)}
                    accessibilityLabel="Close"
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>

                  {/* Full image */}
                  <View style={styles.fullImageContainer}>
                    {selectedRecord.appearanceUrl ? (
                      <Image
                        source={{ uri: selectedRecord.appearanceUrl }}
                        style={styles.fullImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.fullPlaceholderImage}>
                        <Text style={styles.fullPlaceholderEmoji}>👻</Text>
                      </View>
                    )}
                  </View>

                  {/* Evolution info */}
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalLevel}>
                      Evolution Level {selectedRecord.evolutionLevel}
                    </Text>
                    <Text style={styles.modalDate}>
                      {formatDate(selectedRecord.timestamp)}
                    </Text>
                    <Text style={styles.modalDays}>
                      Achieved after {selectedRecord.daysInPositiveState} days in positive states
                    </Text>
                    {selectedRecord.dominantStates.length > 0 && (
                      <Text style={styles.modalStates}>
                        Dominant states: {selectedRecord.dominantStates.join(', ')}
                      </Text>
                    )}
                  </View>

                  {/* Share button */}
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => handleShare(selectedRecord)}
                    accessibilityLabel="Share evolution"
                  >
                    <Text style={styles.shareButtonText}>📤 Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: '#9333EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  placeholder: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a78bfa',
  },
  gridContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
    marginHorizontal: 5,
    backgroundColor: '#16213e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  cardImageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 60,
    opacity: 0.5,
  },
  levelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#9333EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardInfo: {
    padding: 12,
  },
  cardDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 4,
  },
  cardDays: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 500,
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 20,
    borderWidth: 3,
    borderColor: '#9333EA',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  fullImageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  fullPlaceholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPlaceholderEmoji: {
    fontSize: 120,
    opacity: 0.5,
  },
  modalInfo: {
    marginBottom: 20,
  },
  modalLevel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9333EA',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDate: {
    fontSize: 16,
    color: '#a78bfa',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDays: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalStates: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  shareButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
