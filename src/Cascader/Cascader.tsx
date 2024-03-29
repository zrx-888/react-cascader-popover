import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Popover from "./Popover";
import Arrow from "./svg/Arrow/Arrow";
import Checkbox from "./svg/Checkbox";
import Load from "./svg/Load";
import SearchList from "./SearchList";
import { deepClone, findNodeLabelsByValues, generateIdPid } from "./tool";
import "./cascader.css";
import "./search.css";

interface IFindParentItemWithIndexIF {
  parentItems: CascaderOptionMultiple[];
  parentIndexes: number[];
}
export interface CascaderOption {
  label: string;
  value: string;
  /**
   * 禁用
   */
  disabled?: boolean;
  /**
   * 是否有下级  true=有下级  false=无下级
   */
  isLoad?: boolean;
  children?: CascaderOption[];
}
export interface CascaderOptionMultiple extends CascaderOption {
  checked?: boolean;
  indeterminateChecked?: boolean;
  children?: CascaderOptionMultiple[];
  isLoading?: boolean;
  cascaderNodeId?: string;
  parentCascaderNodeId?: string;
}
export interface IListIF {
  list: CascaderOptionMultiple[];
  index: number;
  checked?: boolean;
  indeterminateChecked?: boolean;
}

interface CascaderProps {
  /**
   * 选中项ID
   */
  value?: string;
  /**
   * 是否打开
   */
  open: boolean;
  /**
   * 目标元素的DOM
   */
  anchorEl: HTMLDivElement | null;
  /**
   * {label: string;
   * value: string;
   * children:[]}
   */
  options: CascaderOption[];
  /**
   * 选中项ID
   */
  onChange: (value: CascaderOption | null, valueAll: CascaderOption[]) => void;
  onClose: () => void;
  /**
   * 多选
   */
  multiple?: boolean;
  /**
   * 是否开启搜索
   */
  search?: boolean;
  /**
   * 搜索输入框的placeholder
   */
  searchPlaceholder?: string;
  /**
   * 搜索空提示信息
   */
  searchEmptyText?: string;
  /**
   *动态加载数据
   */
  loadData?: (value: CascaderOption) => Promise<CascaderOption[]>;
}
export interface CascaderRefProps {
  setValue: (value: string[]) => void;
  clearValue: () => void;
}
const Cascader = forwardRef(
  (
    {
      searchPlaceholder = "请输入关键词",
      searchEmptyText = "暂无数据",
      ...props
    }: CascaderProps,
    ref: React.ForwardedRef<CascaderRefProps>
  ) => {
    const [list, setList] = useState<IListIF[]>([]);
    const [searchValue, setSearchValue] = useState("");
    // 记录已经选中的值（多选）
    const [multipleValue, setMultipleValue] = useState<string[]>([]);
    // 记录已经选中的值（单选）
    const [radioValue, setRadioValue] = useState("");
    // 记录已经请求过的数据
    const [loadDataObj, setLoadDataObj] = useState<{
      [key: string]: CascaderOption[];
    }>({});
    const [isLoad, setIsLoad] = useState(true);

    useImperativeHandle(ref, () => ({
      setValue,
      clearValue,
    }));
    // 清除当前选中的值
    const clearValue = () => {
      const newList = [...list];
      function recursion(arr: CascaderOptionMultiple[]) {
        arr.forEach((item) => {
          item.checked = false;
          item.indeterminateChecked = false;
          if (item.children && item.children.length) {
            recursion(item.children);
          }
        });
      }
      if (props.multiple) {
        recursion(newList[0].list);
      } else {
        newList.forEach((item) => {
          item.index = -1;
        });
      }
      setList(newList);
      setRadioValue("");
      setMultipleValue([]);
      props.onChange(null, []);
    };
    // 动态加载数据
    const handleLoad = async (
      item: CascaderOptionMultiple,
      listIndex: number,
      index: number
    ) => {
      // 当前选择的value跟上次value相同  || 禁用 ||  没有下级 && 不是多选,多选需要点击前面的icon选中
      if (
        item.value === radioValue ||
        item.disabled ||
        (!item.isLoad && props.multiple)
      ) {
        return;
      }

      const newList = [...list];
      if (!item.isLoad) {
        newList[listIndex].index = index;
        const allPath: CascaderOptionMultiple[] = [];
        newList.forEach((item, n) => {
          if (n <= listIndex) {
            allPath.push(item.list[item.index]);
          }
        });
        setRadioValue(item.value);
        props.onChange(item, allPath);
        props.onClose();
        return;
      }
      if (props.loadData && isLoad) {
        setIsLoad(false);
        newList[listIndex].index = index;
        for (let i = newList.length - 1; i >= 0; i--) {
          if (i > listIndex) {
            newList.splice(i, 1);
          }
        }
        if (loadDataObj[item.value]) {
          newList[listIndex + 1] = {
            list: loadDataObj[item.value],
            index: -1,
          };
          setList(newList);
          setIsLoad(true);
        } else {
          if (item.isLoad) {
            newList[listIndex].list[index].isLoading = true;
            setList(newList);
          }
          const res = await props.loadData(item);
          setLoadDataObj({
            ...loadDataObj,
            [item.value]: res,
          });
          newList[listIndex].list[index].isLoading = false;
          newList[listIndex].list[index].children = res;
          newList[listIndex + 1] = {
            list: res,
            index: -1,
          };
          setList(() => [...newList]);
          setIsLoad(true);
        }
      }
    };
    // 单选点击
    const handlePopoverClick = (
      item: CascaderOptionMultiple,
      listIndex: number,
      index: number
    ) => {
      if (item.value === radioValue || item.disabled) {
        return;
      }
      const newList = [...list];
      if (!item.children || item.children.length === 0) {
        newList[listIndex].index = index;
        if (!props.multiple) {
          const allPath: CascaderOptionMultiple[] = [];
          newList.forEach((item, n) => {
            if (n <= listIndex) {
              allPath.push(item.list[item.index]);
            }
          });
          setList(newList);
          setRadioValue(item.value);
          props.onChange(item, allPath);
          props.onClose();
        }
      }

      for (let i = newList.length - 1; i >= 0; i--) {
        if (i > listIndex && i != listIndex) {
          newList.splice(i, 1);
        }
      }
      if (item.children?.length) {
        newList[listIndex + 1] = {
          list: item.children,
          index: item.children.findIndex((e) => e.value === radioValue),
        };
        newList[listIndex].index = index;
        setList(newList);
      }
    };

    // 获取选中的值
    const getSelelctValue = (list: CascaderOptionMultiple[]) => {
      const selectValue: CascaderOptionMultiple[] = [];
      function recursion(arr: CascaderOptionMultiple[]) {
        arr.forEach((item) => {
          if (item.checked && !item.children?.length) {
            const itemd = { ...item };
            delete itemd["cascaderNodeId"];
            delete itemd["parentCascaderNodeId"];
            delete itemd["checked"];
            delete itemd["indeterminateChecked"];
            delete itemd["isLoading"];
            selectValue.push(itemd);
          }
          if (item.children && item.children.length) {
            recursion(item.children);
          }
        });
      }
      recursion(list);
      setMultipleValue(selectValue.map((e) => e.value));
      props.onChange(null, selectValue);
    };

    // 多选点击选中按钮
    const handleChecked = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      listIndex: number,
      index: number
    ) => {
      if (list[listIndex].list[index].disabled) {
        return;
      }
      event.stopPropagation();
      const newList = [...list];
      newList[listIndex].list[index].checked =
        !newList[listIndex].list[index].checked;

      const children = newList[listIndex].list[index].children;
      function recursion(arr: CascaderOptionMultiple[]) {
        arr.forEach((item) => {
          if (newList[listIndex].list[index].checked) {
            item.checked = true;
          } else {
            item.checked = false;
          }
          item.indeterminateChecked = false;
          if (item.children) {
            recursion(item.children);
          }
        });
      }
      if (children && children.length) {
        newList[listIndex].list[index].indeterminateChecked = false;
        recursion(children);
      } else {
        newList[listIndex].index = -1;
        for (let i = newList.length - 1; i >= 0; i--) {
          if (i > listIndex) {
            newList.splice(i, 1);
          }
        }
      }

      for (let i = listIndex; i > 0; i--) {
        const checked = newList[i].list.every((e) => e.checked);
        const checkedSome = newList[i].list.some(
          (e) => e.indeterminateChecked || e.checked
        );
        newList[i - 1].list[newList[i - 1].index].checked = checked;
        if (checkedSome) {
          newList[i - 1].list[newList[i - 1].index].indeterminateChecked = true;
          if (newList[i].list[newList[i].index]) {
            newList[i].list[newList[i].index].indeterminateChecked = true;
          }
        } else {
          newList[i - 1].list[newList[i - 1].index].indeterminateChecked =
            false;
        }
      }
      for (let i = 0; i < newList.length; i++) {
        if (newList[i].list[newList[i].index]) {
          newList[i].list[newList[i].index].indeterminateChecked = newList[
            i
          ].list[newList[i].index].children?.some(
            (e) => e.indeterminateChecked || e.checked
          );
          if (
            newList[i].list[newList[i].index].children?.every((e) => e.checked)
          ) {
            newList[i].list[newList[i].index].indeterminateChecked = false;
          }
        }
      }
      getSelelctValue(newList[0].list);
      setList(newList);
    };

    // 单选查找数据
    const findParentItemWithIndex = (
      options: CascaderOptionMultiple[],
      targetValue: string,
      parentItems: CascaderOptionMultiple[],
      parentIndexes: number[]
    ): IFindParentItemWithIndexIF | null => {
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.value === targetValue) {
          return {
            parentItems: [...parentItems, option],
            parentIndexes: [...parentIndexes, i],
          };
        }
        if (option.children) {
          const result = findParentItemWithIndex(
            option.children,
            targetValue,
            [...parentItems, option],
            [...parentIndexes, i]
          );
          if (result) {
            return result;
          }
        }
      }
      return null;
    };

    //单选 获取选中数据
    const initSelectValue = (targetValue: string) => {
      if (radioValue === targetValue) {
        return;
      }
      const newOptions = deepClone(props.options);

      const parent = findParentItemWithIndex(
        props.loadData ? list[0].list : newOptions,
        targetValue,
        [],
        []
      );
      if (parent) {
        const newList: IListIF[] = [];
        parent.parentItems.forEach((item, index) => {
          if (item.children && item.children.length) {
            newList.push({
              list: item.children,
              index: parent.parentIndexes[index + 1],
            });
          }
        });
        const selectValueOption = newList.length
          ? newList[newList.length - 1].list.filter(
              (item) => item.value === targetValue
            )
          : [];
        if (selectValueOption.length) {
          setRadioValue(selectValueOption[0].value + "");
          props.onChange(selectValueOption[0], parent.parentItems);
        }
        setList([
          {
            list: props.loadData ? list[0].list : props.options,
            index: parent.parentIndexes[0],
          },
          ...newList,
        ]);
      }
    };

    useEffect(() => {
      if (props.anchorEl) {
        setSearchValue("");
        // 滚动 当前选中第一个
        setTimeout(() => {
          const listDom = document.getElementsByClassName(
            "cascader_popover_cell"
          );
          if (listDom.length) {
            list.forEach((_, index) => {
              const dom = listDom[index].querySelector(
                ".cascader_popover_cell_label_box_ac"
              ) as HTMLElement;
              const parentElementRect =
                dom?.parentElement?.getBoundingClientRect();
              const offsetTop = parentElementRect
                ? dom.getBoundingClientRect().top - parentElementRect.top
                : 0;
              if (dom) {
                listDom[index].scrollTop = offsetTop - 5 || 0;
              } else {
                listDom[index].scrollTop = 0;
              }
            });
          }
        });
      }
      // if (props.search) {
      //   const list = generatePathList(props.options);
      //   setSearchList(list);
      // }
    }, [props.anchorEl]);

    // 多选设置选中
    const setValue = (value: string[]) => {
      if (value.length === 0) {
        props.onChange(null, []);
        setMultipleValue([]);
        return;
      }
      if (multipleValue.join(",") === value.join(",")) {
        return;
      }
      const newOptions = deepClone(props.options);
      let newList = [...list];
      const newOptionsList: IListIF[] = [];

      if (newList.length) {
        // 当只有一级的时候 改成false
        if (newList.length === 1) {
          newList.forEach((item) => {
            item.list.forEach((e) => {
              e.checked = false;
              e.indeterminateChecked = false;
            });
          });
        } else {
          // 多级的时候 递归修改所有的值是false
          const recursion = (arr: CascaderOptionMultiple[]) => {
            arr.forEach((item) => {
              item.checked = false;
              item.indeterminateChecked = false;
              if (item.children && item.children.length) {
                recursion(item.children);
              }
            });
          };
          recursion(newList[0].list);
        }
      }

      const { valueResult, labelResult } = findNodeLabelsByValues(
        list.length ? list[0].list : newOptions,
        value
      );

      generateIdPid(list.length ? list[0].list : newOptions, valueResult);

      if (valueResult.length) {
        const firstTermList = newList.length
          ? newList[0].list.filter((e) => e.value === valueResult[0][0])
          : newOptions.filter((e) => e.value === valueResult[0][0]);
        const recursion = (arr: CascaderOption[], index: number) => {
          arr.forEach((item, itemIndex) => {
            if (item.value === valueResult[0][index]) {
              list.length
                ? (newList[index] = {
                    list: arr,
                    index: itemIndex,
                  })
                : (newOptionsList[index] = {
                    list: arr,
                    index: itemIndex,
                  });
              index++;
            }
            if (item.children && item.children.length) {
              recursion(item.children, index);
            }
          });
        };
        if (firstTermList.length && firstTermList[0].children) {
          recursion(firstTermList[0].children, 1);
        }
      }
      const selectValue: CascaderOptionMultiple[] = labelResult.map(
        (item, index) => {
          return {
            label: item[item.length - 1],
            value: valueResult[index][valueResult[index].length - 1],
          };
        }
      );
      setMultipleValue(selectValue.map((e) => e.value));
      props.onChange(null, selectValue);

      // list 中有数据的时候 保持原来的数据结构
      if (newList.length) {
        const length = valueResult[0].length;
        // 如果list 有4级 默认选中第一个只有3级 只获取前三级
        if (newList.length > length) {
          newList = newList.slice(0, length);
        }
        newList[0] = {
          list: newList[0].list,
          index: newList[0].list.findIndex(
            (e) => e.value === valueResult[0][0]
          ),
        };
        setList(newList);
      } else {
        newOptionsList[0] = {
          list: newOptions,
          index: newOptions.findIndex((e) => e.value === valueResult[0][0]),
        };
        setList(newOptionsList);
      }
    };

    useEffect(() => {
      const newOptions = deepClone(props.options);
      if (props.multiple) {
        if (props.value == "") {
          setList([{ list: newOptions, index: -1 }]);
        } else {
          setValue(props.value ? props.value.split(",") : []);
        }
      } else {
        if (props.value) {
          initSelectValue(props.value);
        } else {
          setList([{ list: newOptions, index: -1 }]);
        }
      }
    }, [props.value]);
    const handleClose = () => {
      props.onClose && props.onClose();
    };
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
    };
    const handleOnChoose = (value: string) => {
      // 单选
      if (!props.multiple) {
        setRadioValue(value);
        initSelectValue(value);
        props.onClose();
      } else {
        // 多选
        const newMultipleValue = multipleValue.includes(value)
          ? multipleValue.filter((item) => item !== value)
          : [...multipleValue, value];
        setValue(newMultipleValue);
      }
    };

    return (
      <>
        <Popover
          anchorEl={props.anchorEl}
          open={props.open}
          onClose={handleClose}
        >
          {props.search ? (
            <div className="cascader_search_box">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearch}
                className="cascader_search_input"
              />
            </div>
          ) : (
            <></>
          )}
          {searchValue === "" ? (
            <div className="cascader_popover">
              {list.map((listItem, listIndex) => (
                <div key={listIndex} className="cascader_popover_cell">
                  {listItem.list.map((item, index) => (
                    <div
                      key={item.value}
                      data-ischeckedall={item.children?.every((e) => e.checked)}
                      className={
                        item.disabled
                          ? "cascader_popover_cell_label_box_disabled"
                          : listItem.index === index ||
                            (!item.children && item.checked)
                          ? "cascader_popover_cell_label_box cascader_popover_cell_label_box_ac"
                          : "cascader_popover_cell_label_box"
                      }
                      onClick={() => {
                        if (props.loadData) {
                          handleLoad(item, listIndex, index);
                        } else {
                          handlePopoverClick(item, listIndex, index);
                        }
                      }}
                    >
                      <div className="label">
                        {props.multiple ? (
                          <>
                            <span className="icon">
                              <Checkbox
                                onClick={(e) => {
                                  if (
                                    !item.isLoad ||
                                    (item.children && item.children.length)
                                  ) {
                                    handleChecked(e, listIndex, index);
                                  }
                                }}
                                checked={item.checked ? true : false}
                                indeterminate={item.indeterminateChecked}
                              />
                            </span>
                            <div>{item.label}</div>
                          </>
                        ) : (
                          <div>{item.label}</div>
                        )}
                      </div>
                      {(item.children && item.children.length > 0) ||
                      props.loadData ? (
                        <div className="cascader_popover_cell_label_box_icon">
                          {props.loadData && item.isLoading && item.isLoad ? (
                            <div className="cascader_popover_cell_label_box_arrow">
                              <Load />
                            </div>
                          ) : (item.children && item.children.length > 0) ||
                            item.isLoad ? (
                            <div className="cascader_popover_cell_label_box_arrow">
                              <Arrow />
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <SearchList
              searchEmptyText={searchEmptyText}
              multiple={props.multiple}
              multipleValue={multipleValue}
              list={list}
              searchValue={searchValue}
              onChoose={handleOnChoose}
            />
          )}
        </Popover>
      </>
    );
  }
);
export { Cascader };
