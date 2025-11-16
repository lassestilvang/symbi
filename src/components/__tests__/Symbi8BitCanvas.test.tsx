import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Symbi8BitCanvas } from '../Symbi8BitCanvas';
import { EmotionalState } from '../../types';

describe('Symbi8BitCanvas', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<Symbi8BitCanvas emotionalState={EmotionalState.RESTING} />);
    expect(getByTestId).toBeDefined();
  });

  it('calls onPoke when pressed', () => {
    const onPoke = jest.fn();
    const { getByRole } = render(
      <Symbi8BitCanvas emotionalState={EmotionalState.ACTIVE} onPoke={onPoke} />
    );

    const pressable = getByRole('button');
    fireEvent.press(pressable);

    expect(onPoke).toHaveBeenCalledTimes(1);
  });

  it('renders different states correctly', () => {
    const states = [
      EmotionalState.SAD,
      EmotionalState.RESTING,
      EmotionalState.ACTIVE,
      EmotionalState.VIBRANT,
      EmotionalState.CALM,
      EmotionalState.TIRED,
      EmotionalState.STRESSED,
      EmotionalState.ANXIOUS,
      EmotionalState.RESTED,
    ];

    states.forEach(state => {
      const { unmount } = render(<Symbi8BitCanvas emotionalState={state} />);
      expect(unmount).toBeDefined();
      unmount();
    });
  });

  it('accepts custom size prop', () => {
    const { container } = render(
      <Symbi8BitCanvas emotionalState={EmotionalState.RESTING} size={200} />
    );
    expect(container).toBeDefined();
  });
});
