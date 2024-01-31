import { useRef, useState } from "react";
import { CascaderOption, CascaderRefProps } from "react-cascader-popover";
import { province } from "../data";
import { Cascader } from "../Cascader/Cascader";

function Multiple() {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [valueAll, setValueAll] = useState<CascaderOption[]>([]);
  const [value, setValue] = useState("");
  const cascaderRef = useRef<CascaderRefProps>(null);
  // 打开
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleChange = (
    _: CascaderOption | null,
    valueAll: CascaderOption[]
  ) => {
    console.log(valueAll, "选中的值");
    setValue(valueAll.map((e) => e.value).join(","));
    setValueAll(valueAll);
  };
  const handleClear = () => {
    // 选择哪种方式都可以

    // cascaderRef.current?.setValue([]);
    cascaderRef.current?.clearValue();
  };
  const handleSetValue = () => {
    const data = [
      {
        value: "610802",
        label: "榆阳区",
      },
      {
        value: "610803",
        label: "横山区",
      },
      {
        value: "610822",
        label: "府谷县",
      },
      {
        value: "610824",
        label: "靖边县",
      },
      {
        value: "610825",
        label: "定边县",
      },
      {
        value: "610826",
        label: "绥德县",
      },
      {
        value: "610827",
        label: "米脂县",
      },
      {
        value: "610828",
        label: "佳县",
      },
      {
        value: "610829",
        label: "吴堡县",
      },
      {
        value: "610830",
        label: "清涧县",
      },
      {
        value: "610831",
        label: "子洲县",
      },
      {
        value: "610881",
        label: "神木市",
      },
      // {
      //   value: "11010333555",
      //   label: "东城区-3-2",
      // },
    ];

    cascaderRef.current?.setValue(data.map((e) => e.value));
  };

  const open = Boolean(anchorEl);
  return (
    <>
      <div style={{ width: "500px" }}>
        <h3>多选 </h3>
        {/* {valueAll.length ? ( */}
        <>
          <button onClick={handleClear}>清空VALUE</button>
          <div>当前选中【{valueAll.map((e) => JSON.stringify(e) + ",")}】</div>
        </>
        {/* // ) : ( */}
        <button onClick={handleSetValue}>设置VALUE选中</button>
        {/* // )} */}

        <div className="cascader">
          <div className="cascader_input_box" onClick={handleClick}>
            {valueAll.length ? (
              <div className="cascader_input">
                {valueAll.map((e) => e.label).join(" , ")}
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
        multiple
        options={province}
        onClose={() => setAnchorEl(null)}
        onChange={handleChange}
      />
    </>
  );
}

export default Multiple;
