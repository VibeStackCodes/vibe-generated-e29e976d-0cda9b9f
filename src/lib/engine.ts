import type { Token } from '@/types';

// Lightweight infix evaluator using Shunting-Yard algorithm
export function evaluateTokens(tokens: { id: number; type: string; value: string }[], memory?: number): number {
  // Resolve memory tokens to actual numbers
  const resolved: (string | number)[] = tokens.map(t => {
    if (t.type === 'memory') {
      if (memory == null) throw new Error('Memory not initialized');
      return memory;
    }
    return t.value;
  });

  // Build RPN using shunting-yard
  const output: (string | number)[] = [];
  const ops: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

  for (const item of resolved) {
    const v = item as string | number;
    if (typeof v === 'number' || /^[0-9]+(\.[0-9]+)?$/.test(String(v))) {
      output.push(v);
    } else if (typeof v === 'string') {
      if (v === '(') {
        ops.push(v);
      } else if (v === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          output.push(ops.pop() as string);
        }
        if (ops.length && ops[ops.length - 1] === '(') ops.pop();
      } else if (precedence[v] != null) {
        while (ops.length && precedence[ops[ops.length - 1]] >= precedence[v]) {
          output.push(ops.pop() as string);
        }
        ops.push(v);
      } else {
        throw new Error('Invalid token: ' + v);
      }
    }
  }

  while (ops.length) {
    const op = ops.pop() as string;
    if (op === '(' || op === ')') throw new Error('Mismatched parentheses');
    output.push(op);
  }

  // Evaluate RPN
  const stack: number[] = [];
  for (const t of output) {
    if (typeof t === 'number') {
      stack.push(t);
    } else {
      const b = stack.pop();
      const a = stack.pop();
      if (a == null || b == null) throw new Error('Invalid expression');
      switch (t) {
        case '+': stack.push(a + (b as number)); break;
        case '-': stack.push(a - (b as number)); break;
        case '*': stack.push(a * (b as number)); break;
        case '/': stack.push(a / (b as number)); break;
        default: throw new Error('Unknown operator');
      }
    }
  }

  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}
