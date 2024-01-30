import { useRef, useState } from "react";
import { province } from "../data";
import {
  Cascader,
  CascaderOption,
  CascaderRefProps,
} from "react-cascader-popover";

function Default() {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [valueAllPath, setValueAllPath] = useState<CascaderOption[]>([]);
  const [value, setValue] = useState("150421");
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
    setValue(value ? value.value : "");
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

  const open = Boolean(anchorEl);
  return (
    <>
      <div style={{ width: "500px" }}>
        <h3>单选 </h3>
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
        open={open}
        anchorEl={anchorEl}
        options={province}
        onClose={() => setAnchorEl(null)}
        onChange={handleChange}
      />
    </>
  );
}

export default Default;
