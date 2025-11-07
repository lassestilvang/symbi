import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WelcomeScreen } from './WelcomeScreen';
import { HealthDataExplanationScreen } from './HealthDataExplanationScreen';
import { PermissionRequestScreen } from './PermissionRequestScreen';
import { ManualEntryExplanationScreen } from './ManualEntryExplanationScreen';
import { ProgressIndicator } from './ProgressIndicator';

interface OnboardingFlowProps {
  onComplete: (dataSource: 'healthkit' | 'googlefit' | 'manual') => void;
  onRequestPermissions: () => Promise<boolean>;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onRequestPermissions,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps] = useState(4);
  const [selectedDataSource, setSelectedDataSource] = useState<
    'healthkit' | 'googlefit' | 'manual' | null
  >(null);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip to manual entry mode
    setSelectedDataSource('manual');
    setCurrentStep(3); // Go to manual entry explanation
  };

  const handleRequestPermissions = async () => {
    const granted = await onRequestPermissions();
    if (granted) {
      // Permissions granted, complete onboarding with automatic data source
      const dataSource = Platform.OS === 'ios' ? 'healthkit' : 'googlefit';
      onComplete(dataSource);
    } else {
      // Permissions denied, show manual entry option
      setSelectedDataSource('manual');
      setCurrentStep(3);
    }
  };

  const handleUseManualEntry = () => {
    setSelectedDataSource('manual');
    setCurrentStep(3);
  };

  const handleComplete = () => {
    onComplete(selectedDataSource || 'manual');
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={handleNext} onSkip={handleSkip} />;
      case 1:
        return (
          <HealthDataExplanationScreen
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <PermissionRequestScreen
            onRequestPermissions={handleRequestPermissions}
            onUseManualEntry={handleUseManualEntry}
            onBack={handleBack}
          />
        );
      case 3:
        return <ManualEntryExplanationScreen onComplete={handleComplete} onBack={handleBack} />;
      default:
        return <WelcomeScreen onNext={handleNext} onSkip={handleSkip} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {currentStep < 3 && <ProgressIndicator current={currentStep} total={3} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
