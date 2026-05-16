import type {
  GraphInputValidationMode,
  GraphParserOptions,
  NxGraphInput,
} from '@graph-render/types';
import { isPlainObject } from './guards';

export const assertValidGraphInput = (graph: NxGraphInput): void => {
  if (!isPlainObject(graph)) {
    throw new TypeError('Graph input must be a plain object.');
  }

  if (!isPlainObject(graph.adj)) {
    throw new TypeError('Graph input must include an adjacency map in `adj`.');
  }

  if (graph.nodes != null && !isPlainObject(graph.nodes)) {
    throw new TypeError('Graph `nodes` must be a record of node attributes when provided.');
  }

  for (const [source, neighbors] of Object.entries(graph.adj)) {
    if (!isPlainObject(neighbors)) {
      throw new TypeError(`Adjacency entry for node "${source}" must be an object.`);
    }

    for (const [target, rawAttrs] of Object.entries(neighbors)) {
      const attrsList = Array.isArray(rawAttrs) ? rawAttrs : [rawAttrs];
      if (!attrsList.length) {
        throw new TypeError(
          `Adjacency entry for edge "${source}" -> "${target}" must not be an empty array.`
        );
      }

      attrsList.forEach((attrs, index) => {
        if (attrs != null && !isPlainObject(attrs)) {
          throw new TypeError(
            `Edge attributes for "${source}" -> "${target}" at index ${index} must be an object.`
          );
        }
      });
    }
  }
};

const hasExplicitNodeDefinitions = (graph: NxGraphInput): boolean => {
  return Boolean(graph.nodes && Object.keys(graph.nodes).length > 0);
};

export const resolveInputValidationMode = (
  graph: NxGraphInput,
  options?: GraphParserOptions
): GraphInputValidationMode => {
  if (options?.inputValidationMode === 'strict') {
    return 'strict';
  }

  if (options?.inputValidationMode === 'implicit') {
    return 'implicit';
  }

  return hasExplicitNodeDefinitions(graph) ? 'strict' : 'implicit';
};
