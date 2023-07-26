import * as t from '@babel/types';
import * as m from '@codemod/matchers';
import { Transform } from '.';
import {BinaryExpression, UnaryExpression} from '@babel/types';

export default {
  name: 'numberExpressions',
  tags: ['safe'],
  visitor: () => ({
    'BinaryExpression|UnaryExpression': {
      exit(path) {
        if (matcher.match(path.node)) {
          const evaluated = path.evaluate();

          if (evaluated.confident) {
            if(path.node.type === 'BinaryExpression' && path.node.operator === '/') {
              // Simplifying a numeric expression that results in a non-integer probably doesn't increase readability.
              if(!Number.isInteger(evaluated.value)) {
                return;
              }
            }

            path.replaceWith(t.valueToNode(evaluated.value));
            path.skip();
            this.changes++;
          }
        }
      },
    },
    noScope: true,
  }),
} satisfies Transform;

const matcher: m.Matcher<t.Expression> = m.or(
  m.binaryExpression(
    m.or('+', '-', '*', '/'),
    m.matcher(node => matcher.match(node)),
    m.matcher(node => matcher.match(node))
  ),
  m.binaryExpression(
    '-',
    m.or(
      m.stringLiteral(),
      m.matcher(node => matcher.match(node))
    ),
    m.or(
      m.stringLiteral(),
      m.matcher(node => matcher.match(node))
    )
  ),
  m.binaryExpression(
    m.or('>', '<'),
    m.matcher(node => matcher.match(node)),
    m.matcher(node => matcher.match(node))
  ),
  m.unaryExpression(
    '-',
    m.or(
      m.stringLiteral(),
      m.matcher(node => matcher.match(node))
    )
  ),
  m.numericLiteral()
);
