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
  const [tilt, setTilt] = useState({ x: 0, y: 0, isHovered: false });

  const handleMouseMove = (e: any) => {
    if (Platform.OS === 'web' && e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      setTilt({
        x: x * tiltIntensity,
        y: -y * tiltIntensity,
        isHovered: true
      });
    }
  };

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') {
      setTilt(prev => ({ ...prev, isHovered: true }));
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === 'web') {
      setTilt({ x: 0, y: 0, isHovered: false });
    }
  };

  const webTiltStyle = Platform.OS === 'web' && tilt.isHovered ? ({
    transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(${scaleOnHover})`,
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
          onMouseMove: handleMouseMove,
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
        onMouseMove: handleMouseMove,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
      } as any : {})}
    >
      {children}
    </View>
  );
};
