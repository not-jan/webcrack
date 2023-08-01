import * as t from '@babel/types';
import {Transform} from './index';
import * as m from '@codemod/matchers';
import {Identifier} from '@babel/types';

/**
 * This is a naive inlining implementation, that will try to inline variables that fulfill the following conditions:
 * - The variable is never re-assigned
 * - The value of the variable is not derived from a function call
 * - The variable does not refer to a mutable object that gets modified
 * - The variable is not used in a closure or async context
 *
 *  The following code, taken from a malware sample, can be used as an example:
 *
 *  ```js
 *  function kKP() {
 *   var Rm = "charA";
 *   var iMG = "t";
 *   var ne = Rm + iMG;
 *   return ne;
 * }
 * ```
 *
 * In this code, inlining the variables is trivial and leads to the reduction of the function to:
 *
 * ```js
 * function kKP() {
 *   return "charAt";
 * }
 * ```
 *
 * The process is aided by Babels innate Scope tracking functions.
 */

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

        if(binding === undefined) {
          return;
        }

        if (!binding.constant) {
          return;
        }

        if(binding.references > 1) {
          return;
        }

        const kind = binding.kind;

        if (kind !== 'var' && kind !== 'const' && kind !== 'let') {
          return;
        }

        if(path.node.init === undefined || path.node.init === null) {
          return;
        }

        for(const otherPath of binding.referencePaths) {
          otherPath.replaceWith(t.cloneNode(path.node.init));
          binding.dereference();
          this.changes++;
        }
      },
    },

  }),
} satisfies Transform;

const matcher: m.Matcher<t.VariableDeclarator> = m.variableDeclarator(m.identifier(), m.or(
  m.stringLiteral(),
  m.numericLiteral(),
  m.booleanLiteral(),
));