import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const CODE_SYMBOLS = [
  '{ }', '< >', '//', '#', '( )', '[ ]', '&&', '=>', '::',
  '< />', '$ _', '/**/', '!=', '++', '...', '??', '|>',
  '{ }', '< >', '//', '( )', '[ ]', '&&', '=>', '::', '#',
];

export default function CodePattern() {
  const { colors } = useTheme();

  return (
    <View style={styles.container} pointerEvents="none">
      {CODE_SYMBOLS.map((symbol, i) => (
        <Text
          key={i}
          style={[
            styles.symbol,
            {
              color: colors.patternColor,
              fontSize: 14 + (i % 3) * 6,
              transform: [{ rotate: `${-30 + (i * 23) % 60}deg` }],
              left: `${(i * 17) % 90}%`,
              top: `${(i * 13) % 85}%`,
              opacity: 0.5 + (i % 3) * 0.15,
            },
          ]}
        >
          {symbol}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  symbol: {
    position: 'absolute',
    fontWeight: '900',
    fontFamily: 'monospace',
  },
});
