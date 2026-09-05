import React, { useState } from 'react';
import { View, ViewStyle, Platform, StyleSheet, TouchableOpacity } from 'react-native';

interface ParallaxCardProps {
  children: React.ReactNode;
  style?: ViewStyle | (ViewStyle | false | undefined)[];
  onPress?: () => void;
  tiltIntensity?: number;
  scaleOnHover?: number;
}

export const ParallaxCard: React.FC<ParallaxCardProps> = ({
  children,
  style,
  onPress,
  tiltIntensity = 12,
  scaleOnHover = 1.025
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === 'web') {
      setIsHovered(false);
    }
  };

  const webTiltStyle = Platform.OS === 'web' && isHovered ? ({
    transform: `scale(${scaleOnHover})`,
    transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.15s ease',
    zIndex: 10
  } as any) : (Platform.OS === 'web' ? ({
    transition: 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.3s ease'
  } as any) : {});

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[style, webTiltStyle]}
        {...(Platform.OS === 'web' ? {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave
        } as any : {})}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[style, webTiltStyle]}
      {...(Platform.OS === 'web' ? {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
      } as any : {})}
    >
      {children}
    </View>
  );
};
