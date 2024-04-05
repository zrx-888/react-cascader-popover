import { CascaderOption, CascaderOptionMultiple } from "./Cascader";
export interface TreeSearchList {
  checked?: boolean;
  disabled?: boolean;
  pathName: string;
  pathValue: string;
  value: string;
}
const deepClone = (obj: CascaderOption[]): CascaderOption[] => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clone: any = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      clone[key] = deepClone(obj[key]);
    }
  }

  if (Array.isArray(obj)) {
    clone.length = obj.length;
  }
  return clone;
};

const findNodeLabelsByValues = (tree: CascaderOption[], values: string[]) => {
  const valueResult: string[][] = [];
  const labelResult: string[][] = [];

  const findNodeRecursive = (
    node: CascaderOption,
    path: string[],
    labels: string[]
  ) => {
    if (values.includes(node.value)) {
      valueResult.push([...path, node.value]);
      labelResult.push([...labels, node.label]);
    }

    if (node.children) {
      for (const child of node.children) {
        findNodeRecursive(
          child,
          [...path, node.value],
          [...labels, node.label]
        );
      }
    }
  };

  for (const node of tree) {
    findNodeRecursive(node, [], []);
  }

  return { valueResult, labelResult };
};

const generateIdPid = (
  options: CascaderOptionMultiple[],
  valued: string[][],
  parentId = ""
) => {
  options.forEach((option, index) => {
    const id = parentId !== "" ? `${parentId}-${index + 1}` : `${index + 1}`;
    option.cascaderNodeId = id;
    option.checked = false;
    option.indeterminateChecked = false;

    valued.forEach((item) => {
      if (item.includes(option.value)) {
        option.checked = false;
        option.indeterminateChecked = true;
      }
    });

    option.parentCascaderNodeId = parentId;
    if (option.children && option.children.length) {
      generateIdPid(option.children, valued, id);
      if (option.children?.every((e) => e.checked)) {
        option.checked = true;
        option.indeterminateChecked = false;
      }
    } else {
      valued.forEach((item) => {
        if (item.includes(option.value)) {
          option.checked = true;
          option.indeterminateChecked = false;
        }
      });
    }
  });
};
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: Parameters<T>): void {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

const generatePathList = (
  tree: CascaderOption[],
  pathName = "",
  pathValue = "",
  list: TreeSearchList[] = []
) => {
  tree.forEach((node) => {
    const newPath = pathName ? `${pathName} / ${node.label}` : node.label;
    const newValue = pathValue ? `${pathValue}/${node.value}` : node.value;

    if (node.children && node.children.length > 0 && !node.disabled) {
      generatePathList(node.children, newPath, newValue, list);
    } else if (
      !node.isLoad &&
      (!node.children || node.children?.length === 0)
    ) {
      list.push({
        value: "",
        disabled: node.disabled,
        pathName: newPath,
        pathValue: newValue,
      });
    }
  });

  return list;
};

export {
  deepClone,
  generatePathList,
  findNodeLabelsByValues,
  generateIdPid,
  debounce,
};
