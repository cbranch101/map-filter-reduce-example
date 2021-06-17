import { Client as Styletron } from "styletron-engine-atomic";
import { detailedDiff, diff } from "deep-object-diff";
import { renderDeclarativeRules } from "styletron-standard"; //eslint-disable-line
import { LightTheme as $theme } from "baseui";
import { resolveStyle } from "styletron-react";
const styletron = new Styletron({});

const uppercasePattern = /[A-Z]/g;
const msPattern = /^ms-/;
const cache = {};

// converts the baseweb prop form into a css format
// for example $aLongPropName becomes a-long-prop-name
export function hyphenate(prop) {
  return prop in cache
    ? cache[prop]
    : (cache[prop] = prop
        .replace(uppercasePattern, "-$&")
        .toLowerCase()
        .replace(msPattern, "-ms-"));
}

const indentLine = (text, indentedSpaces) => {
  if (!text) {
    return undefined;
  }
  return `${Array(indentedSpaces + 1).join(" ")}${text}`;
};

export const getStylesFromComponent = (Component, props) => {
  const { getInitialStyle, reducers } = Component.__STYLETRON__;
  return resolveStyle(getInitialStyle, reducers, {
    ...props,
    $theme,
  });
};

export function declarationsToBlock(style, indented) {
  let css = "";
  const write = (text) => indentLine(text, indented ? 4 : 0);
  for (const prop in style) {
    const val = style[prop];
    if (typeof val === "string" || typeof val === "number") {
      css += write(`${hyphenate(prop)}:${val};\n`);
    }
    if (typeof val === "object") {
      css += write(`${hyphenate(prop)} {\n`);
      css += declarationsToBlock(val, true);
      css += `${write("\n}\n")}`;
    }
  }
  // trim trailing semicolon
  return css.slice(0, -1);
}

export const getCssFromStyles = (styles) => {
  const fullStyles = renderDeclarativeRules(styles, styletron);
  return declarationsToBlock(fullStyles);
};

export const getCSSFromComponent = (Component, props) => {
  const styles = getStylesFromComponent(Component, props);
  return getCssFromStyles(styles);
};

export const getDifferencesBetweenStyles = (a, b) => diff(a, b);

export const convertValueToString = (value) => {
  if (value === true) {
    return "true";
  }
  if (value === false) {
    return "false";
  }
  return value;
};
export const convertStringToValue = (string) => {
  if (string === "true") {
    return true;
  }
  if (string === "false") {
    return false;
  }
  return string;
};

export const getClassNameFromProps = (componentName, props, defaultProps) => {
  const propString = Object.keys(props)
    .map((propName) => {
      if (defaultProps[propName] === props[propName]) {
        return null;
      }

      const getValue = () => {
        const baseValue = props[propName];
        if (typeof baseValue === "boolean") {
          const stringPropName = hyphenate(propName.substring(1));
          if (baseValue === true) {
            return stringPropName;
          }
          return `not-${stringPropName}`;
        }
        return baseValue;
      };

      return getValue();
    }, "")
    .filter((string) => !!string)
    .join(".");

  const finalString = propString === "" ? propString : `.${propString}`;

  return `${componentName}${finalString}`;
};

const indentLines = (lines) => {
  return lines
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
};

export const getCSSWithClassName = (
  componentName,
  props,
  styles,
  defaultProps
) => {
  const className = getClassNameFromProps(componentName, props, defaultProps);
  const cssString = indentLines(getCssFromStyles(styles));
  return [`.${className} {`, cssString, "}"].join("\n");
};
