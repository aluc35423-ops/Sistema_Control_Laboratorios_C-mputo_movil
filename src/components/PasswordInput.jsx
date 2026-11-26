import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

const PasswordInput = ({ value, onChangeText, placeholder, onFocus }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [peekIndex, setPeekIndex] = useState(-1);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getDisplayValue = () => {
    if (showPassword) return value;
    if (!value) return '';
    return value
      .split('')
      .map((char, idx) => (idx === peekIndex ? char : '•'))
      .join('');
  };

  const handleTextChange = (newText) => {
    if (showPassword) {
      onChangeText(newText);
      return;
    }

    const prevDisplay = getDisplayValue();
    let start = 0;
    while (
      start < prevDisplay.length &&
      start < newText.length &&
      prevDisplay[start] === newText[start]
    ) {
      start += 1;
    }

    let endPrev = prevDisplay.length;
    let endNew = newText.length;
    while (
      endPrev > start &&
      endNew > start &&
      prevDisplay[endPrev - 1] === newText[endNew - 1]
    ) {
      endPrev -= 1;
      endNew -= 1;
    }

    const inserted = newText.slice(start, endNew);
    const updatedValue = value.slice(0, start) + inserted + value.slice(endPrev);
    onChangeText(updatedValue);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (inserted.length > 0) {
      setPeekIndex(start + inserted.length - 1);
      timerRef.current = setTimeout(() => {
        setPeekIndex(-1);
      }, 1000);
    } else {
      setPeekIndex(-1);
    }
  };

  const handleToggle = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPeekIndex(-1);
    setShowPassword((prev) => !prev);
  };

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={getDisplayValue()}
        onChangeText={handleTextChange}
        onFocus={onFocus}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
      />
      <TouchableOpacity onPress={handleToggle} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {showPassword ? 'Ocultar' : 'Mostrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0F172A',
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});

export default PasswordInput;