import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';

interface NumpadProps {
  colors: ColorTheme;
  onDone: (amount: number) => void;
  initialValue?: string;
  onValueChange?: (val: string) => void;
}

export const Numpad: React.FC<NumpadProps> = ({ colors, onDone, initialValue = '0', onValueChange }) => {
  const [expression, setExpression] = useState(initialValue === '0' ? '' : initialValue);

  const handlePress = (key: string) => {
    let newExpression = expression;

    if (key === 'C') {
      newExpression = '';
    } else if (key === 'backspace') {
      newExpression = expression.slice(0, -1);
    } else if (key === '=') {
      newExpression = evaluateExpression(expression);
    } else if (key === 'OK') {
      const finalVal = evaluateExpression(expression);
      const numericVal = parseFloat(finalVal) || 0;
      onDone(numericVal);
      return;
    } else {
      const isOperator = ['+', '-', '*', '/'].includes(key);
      const lastChar = expression.slice(-1);
      const wasOperator = ['+', '-', '*', '/'].includes(lastChar);

      if (isOperator && (expression === '' || wasOperator)) {
        if (wasOperator) {
          newExpression = expression.slice(0, -1) + key;
        } else {
          return;
        }
      } else {
        newExpression = expression + key;
      }
    }

    setExpression(newExpression);
    if (onValueChange) {
      onValueChange(newExpression || '0');
    }
  };

  const evaluateExpression = (expr: string): string => {
    if (!expr) return '0';
    try {
      let san = expr.replace(/×/g, '*').replace(/÷/g, '/');
      if (['+', '-', '*', '/'].includes(san.slice(-1))) {
        san = san.slice(0, -1);
      }
      if (/^[0-9.+\-*/\s()]+$/.test(san)) {
        // eslint-disable-next-line no-eval
        const res = eval(san);
        const rounded = Math.round((res + Number.EPSILON) * 100) / 100;
        return rounded.toString();
      }
      return '0';
    } catch (e) {
      return 'Error';
    }
  };

  const renderButton = (key: string, label: string | React.ReactNode, isAction = false, isEquals = false) => {
    const isOperator = ['+', '-', '×', '÷'].includes(key);
    
    let btnStyle: any = styles.btn;
    let txtStyle: any = styles.btnText;

    if (isEquals || key === 'OK') {
      btnStyle = [styles.btn, { backgroundColor: colors.primary }];
      txtStyle = [styles.btnText, { color: colors.onPrimary }];
    } else if (isAction || isOperator) {
      btnStyle = [styles.btn, { backgroundColor: colors.secondaryContainer }];
      txtStyle = [styles.btnText, { color: colors.onSecondaryContainer }];
    } else {
      btnStyle = [styles.btn, { backgroundColor: colors.surfaceVariant }];
      txtStyle = [styles.btnText, { color: colors.onSurfaceVariant }];
    }

    return (
      <TouchableOpacity
        key={key}
        style={[btnStyle, styles.gridItem]}
        onPress={() => handlePress(key)}
        activeOpacity={0.7}
      >
        {typeof label === 'string' ? <Text style={txtStyle}>{label}</Text> : label}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.row}>
        {renderButton('7', '7')}
        {renderButton('8', '8')}
        {renderButton('9', '9')}
        {renderButton('backspace', <MaterialIcons name="backspace" size={24} color={colors.onSurfaceVariant} />, true)}
      </View>
      <View style={styles.row}>
        {renderButton('4', '4')}
        {renderButton('5', '5')}
        {renderButton('6', '6')}
        {renderButton('+', '+', true)}
      </View>
      <View style={styles.row}>
        {renderButton('1', '1')}
        {renderButton('2', '2')}
        {renderButton('3', '3')}
        {renderButton('-', '-', true)}
      </View>
      <View style={styles.row}>
        {renderButton('.', '.')}
        {renderButton('0', '0')}
        {renderButton('00', '00')}
        {renderButton('×', '×', true)}
      </View>
      <View style={styles.row}>
        {renderButton('C', 'C', true)}
        {renderButton('÷', '÷', true)}
        {renderButton('=', '=')}
        {renderButton('OK', 'OK', false, true)}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 40) / 4;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  btn: {
    width: BUTTON_SIZE - 6,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItem: {
    margin: 3,
  },
  btnText: {
    fontSize: 20,
    fontWeight: '600',
  },
});
