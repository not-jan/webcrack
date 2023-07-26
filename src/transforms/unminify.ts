import { Visitor, visitors } from '@babel/traverse';
import { Transform, TransformState } from '.';
import blockStatement from './blockStatement';
import booleanIf from './booleanIf';
import computedProperties from './computedProperties';
import jsonParse from './jsonParse';
import mergeElseIf from './mergeElseIf';
import mergeStrings from './mergeStrings';
import numberExpressions from './numberExpressions';
import rawLiterals from './rawLiterals';
import sequence from './sequence';
import splitVariableDeclarations from './splitVariableDeclarations';
import ternaryToIf from './ternaryToIf';
import unminifyBooleans from './unminifyBooleans';
import void0ToUndefined from './void0ToUndefined';
import yoda from './yoda';
import constantEval from './constantEval';

export default {
  name: 'unminify',
  tags: ['safe'],
  visitor() {
    const traverseOptions: Visitor<TransformState>[] = [
      rawLiterals.visitor(),
      blockStatement.visitor(),
      mergeStrings.visitor(),
      computedProperties.visitor(),
      splitVariableDeclarations.visitor(),
      sequence.visitor(),
      numberExpressions.visitor(),
      constantEval.visitor(),
      unminifyBooleans.visitor(),
      booleanIf.visitor(),
      ternaryToIf.visitor(),
      mergeElseIf.visitor(),
      void0ToUndefined.visitor(),
      yoda.visitor(),
      jsonParse.visitor(),
    ];
    const visitor = visitors.merge(traverseOptions);
    // @ts-expect-error regression from https://github.com/babel/babel/pull/15702
    visitor.noScope = traverseOptions.every(t => t.noScope);
    return visitor;
  },
} satisfies Transform;
