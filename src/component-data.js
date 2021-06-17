import {
  StyledBaseButton,
  StyledLoadingSpinner,
  StyledLoadingSpinnerContainer,
  StyledStartEnhancer,
  StyledEndEnhancer,
  KIND,
} from "baseui/button";

// important details
// the first option is always the default

export const $kind = {
  prop: "$kind",
  defaultOption: "primary",
  options: Object.values(KIND),
  label: "Kind",
};

export const $shape = {
  prop: "$shape",
  defaultOption: "default",
  options: ["default", "pill", "round", "circle", "square"],
  label: "Shape",
};

export const propMap = {
  $isFocusVisible: [false, true],
  $disabled: [false, true],
  $isSelected: [false, true],
  $kind: ["primary", "secondary", "tertiary", "minimal"],
  $size: ["default", "compact", "mini", "large"],
  $shape: ["default", "pill", "round", "circle", "square"],
};

export const defaultProps = Object.keys(propMap).reduce((memo, propName) => {
  return {
    ...memo,
    [propName]: propMap[propName][0],
  };
}, {});

export const componentMap = [
  {
    name: "base-button",
    component: StyledBaseButton,
    concepts: [
      {
        name: "Color States",
        relevantProps: ["$kind", "$isSelected"],
      },
      {
        name: "Container Shape / Size",
        relevantProps: ["$size", "$shape"],
      },
      {
        name: "Focus",
        relevantProps: ["$isFocusVisible"],
      },
    ],
  },
  {
    name: "loading-spinner",
    component: StyledLoadingSpinner,
    concepts: [
      {
        name: "Color States",
        relevantProps: ["$kind", "$disabled", "$isSelected"],
      },
    ],
  },
  {
    name: "loading-spinner-container",
    component: StyledLoadingSpinnerContainer,
    concepts: [
      {
        name: "Color States",
        relevantProps: ["$kind", "$disabled", "$isSelected"],
      },
    ],
  },
  {
    name: "start-enhancer",
    component: StyledStartEnhancer,
  },
  {
    name: "end-enhancer",
    component: StyledEndEnhancer,
  },
];

export default componentMap;
