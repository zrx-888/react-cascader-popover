import { useEffect, useState } from "react";
import { TreeSearchList } from "./tool";

interface SearchListIF {
  list: TreeSearchList[];
  searchValue: string;
  onChoose: (value: string) => void;
}
const SearchList = ({ list, searchValue, onChoose }: SearchListIF) => {
  const [data, setData] = useState<TreeSearchList[]>([]);

  useEffect(() => {
    if (searchValue.length < 2) {
      return;
    }
    const delayDebounce = setTimeout(() => {
      setData(
        list.filter((item) => {
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
        <div className="empty_data">暂无数据</div>
      )}
    </>
  );
};
export default SearchList;
