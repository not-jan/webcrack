import * as t from '@babel/types';
import * as m from '@codemod/matchers';
import { Transform } from '.';

export default {
  name: 'constantEval',
  tags: ['unsafe'],
  visitor: () => ({
    'CallExpression': {
      exit(path) {
        if (matcher.match(path.node)) {
          const evaluated = path.evaluate();
          if (evaluated.confident) {
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

const matcher: m.Matcher<t.Expression> = m.callExpression(
  m.memberExpression(
    m.or(m.identifier('String'), m.identifier('Math')),
    m.identifier(),
    false
  ),
  m.arrayOf(
    m.or(
      m.numericLiteral(),
      m.stringLiteral()
    )
  )
);
