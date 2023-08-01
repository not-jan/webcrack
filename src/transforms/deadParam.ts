import * as t from '@babel/types';
import {Transform} from './index';

export default {
  name: 'deadParam',
  tags: ['unsafe'],
  visitor: () => ({
    'Identifier': {
      exit(path) {
        const name = path.node.name;
        const binding = path.scope.getBinding(name);

        if(binding === undefined || binding.kind !== 'param') {
          return;
        }

        if(
          path.listKey !== 'params' ||
          (path.parent.type !== 'FunctionDeclaration' && path.parent.type !== 'FunctionExpression' && path.parent.type !== 'ArrowFunctionExpression')
        ) {
          return;
        }

        if(path.key as number !== (path.parent.params.length - 1)) {
          // TODO: Rewrite this properly
          // At the moment we only remove dead parameters if they're last in the parameter list
          // With a bit more effort we could theoretically rewrite each invocation to rearrange the parameters.
          return;
        }

        // If the variable is never referenced we can somewhat safely remove it.
        // If the `arguments` built-in is accessed this assumption dies.
        // TODO: Check if the arguments built-in is accessed and disable this transformation for the function
        if(binding.references !== 0) {
          return;
        }

        path.remove();
        path.skip();
        this.changes++;
      },
    },

  }),
} satisfies Transform;