import { memo, useEffect, useState } from "react";
import { TreeSearchList, generatePathList } from "./tool";
import Checkbox from "./svg/Checkbox";
import { IListIF } from "./Cascader";

interface SearchListIF {
  list: IListIF[];
  multipleValue: string[];
  searchValue: string;
  multiple?: boolean;
  searchEmptyText?: string;
  onChoose: (value: string) => void;
}
const SearchList = memo(
  ({
    list,
    searchValue,
    multipleValue,
    searchEmptyText,
    multiple,
    onChoose,
  }: SearchListIF) => {
    const [data, setData] = useState<TreeSearchList[]>([]);
    useEffect(() => {
      if (searchValue.length < 2) {
        return;
      }
      const delayDebounce = setTimeout(() => {
        const options = list[0].list;
        const searchList = generatePathList(options);
        setData(
          searchList.filter((item) => {
            const valueArray = item.pathValue.split("/");
            item.value = valueArray[valueArray.length - 1];
            return item.pathName
              .toLowerCase()
              .includes(searchValue.toLowerCase());
          })
        );
      }, 500);

      return () => {
        clearTimeout(delayDebounce);
      };
    }, [searchValue]);

    const handleClick = (item: TreeSearchList) => {
      const values = item.pathValue.split("/");
      onChoose(values[values.length - 1]);
    };

    return (
      <>
        {data.length ? (
          <div className="searchList">
            <div className="cascader_popover_cell">
              {data.map((item, listIndex) => (
                <div key={listIndex} onClick={() => handleClick(item)}>
                  <div className="cascader_popover_cell_label_box">
                    <div className="label">
                      {multiple ? (
                        <span className="icon">
                          <Checkbox
                            checked={
                              multipleValue.includes(item.value) ? true : false
                            }
                          />
                        </span>
                      ) : (
                        <></>
                      )}
                      {item.pathName.split("").map((e, n) => (
                        <span key={n}>
                          {e === "/" ? (
                            <span className="slash"> / </span>
                          ) : (
                            <span
                              className={
                                searchValue.split("").includes(e)
                                  ? "search_text_ac"
                                  : ""
                              }
                            >
                              {e}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty_data">{searchEmptyText}</div>
        )}
      </>
    );
  }
);
export default SearchList;
