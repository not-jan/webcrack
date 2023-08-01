import * as t from '@babel/types';
import {Transform} from './index';
import * as m from '@codemod/matchers';
import {Identifier} from '@babel/types';




export default {
  name: 'naiveInline',
  tags: ['unsafe'],
  visitor: () => ({
    'VariableDeclarator': {
      exit(path) {
        const node = path.node;

        if(!matcher.match(node)) {
          return;
        }

        const name = (path.node.id as Identifier).name;
        const binding = path.scope.getBinding(name);

        if(binding === undefined || binding.references !== 0) {
          return;
        }

        const kind = binding.kind;

        if (kind !== 'var' && kind !== 'const' && kind !== 'let') {
          return;
        }

        path.remove();
        path.skip();
        this.changes++;
      },
    },

  }),
} satisfies Transform;

const matcher: m.Matcher<t.VariableDeclarator> = m.variableDeclarator(m.identifier(), m.or(
  m.stringLiteral(),
  m.numericLiteral(),
  m.booleanLiteral(),
));