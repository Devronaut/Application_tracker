import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 8/SE as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

// Calculate scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

// Normalize function for font sizes
export function normalize(size: number): number {
  const newSize = size * Math.min(widthScale, heightScale);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

// Responsive width
export function responsiveWidth(percentage: number): number {
  return (SCREEN_WIDTH * percentage) / 100;
}

// Responsive height
export function responsiveHeight(percentage: number): number {
  return (SCREEN_HEIGHT * percentage) / 100;
}

// Get screen dimensions
export const screenData = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  widthScale,
  heightScale,
};

// Check if device is small screen
export function isSmallScreen(): boolean {
  return SCREEN_WIDTH < 375;
}

// Check if device is large screen
export function isLargeScreen(): boolean {
  return SCREEN_WIDTH > 414;
}

// Check if device is tablet
export function isTablet(): boolean {
  return SCREEN_WIDTH >= 768;
}

// Responsive padding
export function responsivePadding(basePadding: number): number {
  if (isSmallScreen()) {
    return basePadding * 0.8;
  } else if (isLargeScreen()) {
    return basePadding * 1.2;
  }
  return basePadding;
}

// Responsive margin
export function responsiveMargin(baseMargin: number): number {
  if (isSmallScreen()) {
    return baseMargin * 0.8;
  } else if (isLargeScreen()) {
    return baseMargin * 1.2;
  }
  return baseMargin;
}
