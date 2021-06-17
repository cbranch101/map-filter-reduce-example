import { StyledBaseButton } from "baseui/button";
import {
  getStylesFromComponent,
  getCssFromStyles,
  getCSSFromComponent,
} from "./style-helpers";
import { getStyleSheetForConcept } from "./functions-to-make";

import { defaultProps, componentMap } from "./component-data";
const defaultStyles = getStylesFromComponent(StyledBaseButton, defaultProps);

describe("style-helpers", () => {
  describe("getStylesFromComponent", () => {
    test("should return a style object given a component and props", () => {
      const styles = getStylesFromComponent(StyledBaseButton, defaultProps);
      expect(styles).toMatchSnapshot();
    });
  });
  describe("getCssFromStyles", () => {
    test("should return a valid css style string for the provided styles", () => {
      const css = getCssFromStyles(defaultStyles);
      expect(css).toMatchSnapshot();
    });
  });
  describe("getCSSFromComponent", () => {
    test("should return valid css given a component and props", () => {
      const css = getCSSFromComponent(StyledBaseButton, defaultProps);
      expect(css).toMatchSnapshot();
    });
  });
});

describe("Functions to make", () => {
  describe("getStyleSheetForConcept", () => {
    test("should generate a readable stylesheet, based on all prop variations", () => {
      const sheet = getStyleSheetForConcept(
        "Button",
        "base-button",
        componentMap[0].concepts[0]
      );
      expect(sheet).toMatchSnapshot();
    });
  });
});
