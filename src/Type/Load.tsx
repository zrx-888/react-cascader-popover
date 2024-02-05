import { useRef, useState } from "react";
import { province } from "../data";
import {
  Cascader,
  CascaderOption,
  CascaderRefProps,
} from "../Cascader/Cascader";

console.log(province);

function Default() {
  const options = [
    {
      value: "120000",
      label: "天津市",
      isLoad: true,
    },
    {
      value: "110000",
      label: "北京市",
      isLoad: true,
    },
  ];

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [valueAllPath, setValueAllPath] = useState<CascaderOption[]>([]);
  const [value, setValue] = useState("");
  const [num, setNum] = useState(0);
  const [valueItem, setValueItem] = useState<CascaderOption | null>(null);
  const cascaderRef = useRef<CascaderRefProps>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleChange = (
    value: CascaderOption | null,
    valueAll: CascaderOption[]
  ) => {
    console.log(value, valueAll);

    setValueItem(value);
    // setValue(value ? value.value : "");
    setValueAllPath(valueAll);
  };
  const handleClear = () => {
    setValueItem(null);
    setValueAllPath([]);
    // 两种都可以清空
    // setValue("");
    cascaderRef.current?.clearValue();
  };
  const handleSet = () => {
    setValue("11010333555");
  };

  // 模拟接口返回数据
  const getServiceData = (item: CascaderOption) => {
    return new Promise<CascaderOption[]>((resolve) => {
      setTimeout(() => {
        const count = num + 1;
        setNum(count);

        resolve([
          {
            label: `${item.label}-1 `,
            value: item.value + 1,
            isLoad: count >= 2 ? false : true,
          },
          {
            label: `${item.label}-2 `,
            value: item.value + 222,
            isLoad: count >= 2 ? false : true,
          },
        ]);
      }, 1000);
    });
  };

  const loadData = async (item: CascaderOption) => {
    const data = await getServiceData(item);
    return data;
  };

  const open = Boolean(anchorEl);
  return (
    <>
      <div style={{ width: "500px" }}>
        <h3>动态加载 </h3>
        {value ? (
          <button onClick={handleClear}>清空VALUE</button>
        ) : (
          <>
            <button onClick={handleSet}>设置value</button>
          </>
        )}
        <h6>value：{value}</h6>
        {valueItem ? (
          <h6>
            valueItem：{valueItem.value}/{valueItem.label}
          </h6>
        ) : (
          <></>
        )}
        {valueAllPath.length ? (
          <h6>全路径：{valueAllPath.map((e) => e.label).join(" - ")}</h6>
        ) : (
          <></>
        )}
        <div className="cascader">
          <div className="cascader_input_box" onClick={handleClick}>
            {valueAllPath.length ? (
              <div className="cascader_input">
                {valueAllPath.map((e) => e.label).join(" - ")}
              </div>
            ) : (
              <div className="placeholder">请选择</div>
            )}
          </div>
        </div>
      </div>

      <Cascader
        search
        ref={cascaderRef}
        value={value}
        multiple
        open={open}
        anchorEl={anchorEl}
        options={options}
        onClose={() => setAnchorEl(null)}
        onChange={handleChange}
        loadData={loadData}
      />
    </>
  );
}

export default Default;
