import { propMap, componentMap } from "./component-data";
import {
  getStylesFromComponent,
  getDifferencesBetweenStyles,
  convertStringToValue,
  getCSSWithClassName,
  convertValueToString,
} from "./style-helpers";

const getKeyFromPropPossibilites = (options) => options.join("_");

const addVariationToPath = (path, propName, propValue) => {
  const separator = path === undefined ? "" : "__";
  const basePath = path === undefined ? "" : path;
  return `${basePath}${separator}${propName}:${convertValueToString(
    propValue
  )}`;
};

const getPropsFromPath = (path) => {
  return path.split("__").reduce((memo, subPath) => {
    const [prop, baseValue] = subPath.split(":");
    const value = convertStringToValue(baseValue);
    return {
      ...memo,
      [prop]: value,
    };
  }, {});
};

const getPathFromProps = (props) => {
  return Object.keys(props).reduce((memo, propName) => {
    const value = props[propName];
    return addVariationToPath(memo, propName, value);
  }, undefined);
};

export const getAllPropVariations = (componentName) => {
  const variations = {};

  const addPropVariationsForComponent = (
    parentName,
    childName,
    propPossibilites,
    Component
  ) => {
    if (!variations[parentName]) {
      variations[parentName] = {};
    }
    if (!variations[parentName][childName]) {
      variations[parentName][childName] = {};
    }

    const combinationKey = getKeyFromPropPossibilites(propPossibilites);

    if (variations[parentName][childName][combinationKey]) {
      return;
    }
    variations[parentName][childName][combinationKey] = {};

    const traversePermutations = (propOptions, path) => {
      const [propName, ...remainingPropOptions] = propOptions;

      const values = propMap[propName];

      values.forEach((value) => {
        const nextPath = addVariationToPath(path, propName, value);
        if (remainingPropOptions.length === 0) {
          const props = getPropsFromPath(nextPath);
          const styles = getStylesFromComponent(Component, props);
          variations[parentName][childName][combinationKey][nextPath] = styles;
        } else {
          traversePermutations(remainingPropOptions, nextPath);
        }
      });
    };
    traversePermutations(propPossibilites);
  };

  componentMap.forEach(
    ({ name: subComponentName, concepts, component: Component }) => {
      if (concepts) {
        concepts.forEach(({ relevantProps }) => {
          addPropVariationsForComponent(
            componentName,
            subComponentName,
            relevantProps,
            Component
          );
        });
      }
    }
  );
  return variations;
};

export const allStyleVariations = getAllPropVariations("Button");

export const getStyleComparisons = (
  possibilites,
  variations,
  defaultProps,
  comparisonStyles,
  comparisonProps = {},
  depth = 1
) => {
  const [propName, ...remainingPossibilities] = possibilites;
  const values = propMap[propName];
  return values.reduce((memo, value, index) => {
    const isTopLevelDefault = depth === 1 && index === 0;
    const nextProps = {
      ...comparisonProps,
      [propName]: value,
    };
    const filledInProps = {
      ...defaultProps,
      ...nextProps,
    };
    const nextStyles = getStylesFromVariations(filledInProps, variations);

    const comparison = {
      props: filledInProps,
      diff: isTopLevelDefault
        ? getDifferencesBetweenStyles({}, comparisonStyles)
        : getDifferencesBetweenStyles(nextStyles, comparisonStyles),
      isDefault: isTopLevelDefault,
    };

    if (remainingPossibilities.length === 0) {
      return [...memo, comparison];
    }

    return [
      ...memo,
      comparison,
      ...getStyleComparisons(
        remainingPossibilities,
        variations,
        defaultProps,
        nextStyles,
        nextProps,
        depth + 1
      ),
    ];
  }, []);
};

const getStylesFromVariations = (props, variations) => {
  const path = getPathFromProps(props);
  return variations[path];
};

const getDefaultProps = (propOptions) => {
  return propOptions.reduce((memo, propName) => {
    return {
      ...memo,
      [propName]: propMap[propName][0],
    };
  }, {});
};

export const getStyleComparisonsForConcept = (
  componentName,
  subComponentName,
  concept
) => {
  const { relevantProps } = concept;
  const conceptKey = getKeyFromPropPossibilites(relevantProps);

  const variations =
    allStyleVariations[componentName][subComponentName][conceptKey];

  const defaultProps = getDefaultProps(relevantProps);

  const defaultStyles = getStylesFromVariations(defaultProps, variations);

  return getStyleComparisons(
    relevantProps,
    variations,
    defaultProps,
    defaultStyles
  );
};

const serializeComparison = (componentName, comparison, defaultProps) => {
  const { diff, props } = comparison;
  if (Object.keys(diff).length === 0) {
    return null;
  }
  return getCSSWithClassName(componentName, props, diff, defaultProps);
};

export const serializeComparisons = (
  componentName,
  comparisons,
  defaultProps
) => {
  const comparisonStrings = comparisons
    .map((comparison) => {
      return serializeComparison(componentName, comparison, defaultProps);
    })
    .filter((string) => !!string);
  return comparisonStrings.join("\n\n");
};

export const getStyleSheetForConcept = (
  componentName,
  subComponentName,
  concept
) => {
  const comparisons = getStyleComparisonsForConcept(
    componentName,
    subComponentName,
    concept
  );
  const { relevantProps } = concept;
  const defaultProps = getDefaultProps(relevantProps);
  return serializeComparisons(subComponentName, comparisons, defaultProps);
};
