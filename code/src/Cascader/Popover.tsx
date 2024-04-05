import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Popover.css";
import { debounce } from "./tool";

interface PopoverProps {
  anchorEl: HTMLDivElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Popover = (props: PopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [visibleShow, setVisibleShow] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hideShow, setHideShow] = useState(true);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.isDefaultPrevented();
    setTimeout(() => {
      props.onClose();
    }, 100);
  };

  const handleScroll = (event: Event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", debounce(handleWindowResize, 200));
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    if (popoverRef.current && props.anchorEl) {
      const clientRect = props.anchorEl.getBoundingClientRect();
      const top = clientRect.top + props.anchorEl.offsetHeight;
      const remainingHeight = window.innerHeight - top;
      if (remainingHeight > popoverRef.current.offsetHeight) {
        setPosition({
          top: top,
          left: clientRect.left,
        });
      } else {
        const adjustedTop =
          top - (popoverRef.current.offsetHeight - remainingHeight);
        setPosition({
          top: adjustedTop - 20,
          left: clientRect.left,
        });
      }
    }
  }, [popoverRef.current, windowWidth]);

  useEffect(() => {
    if (props.open) {
      setVisibleShow(props.open);
      setTimeout(() => {
        setHideShow(false);
      }, 100);
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      window.addEventListener("scroll", handleScroll, { passive: false });
    } else {
      setHideShow(true);
      setTimeout(() => {
        setVisibleShow(props.open);
      }, 100);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.removeEventListener("scroll", handleScroll);
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [props.open]);
  return createPortal(
    <>
      {visibleShow ? (
        <div id="popover-cascader" className="Popover">
          <div onClick={handleClick} className="Popover-invisible"></div>
          <div
            ref={popoverRef}
            className={
              (hideShow ? "Popover-root-hide" : "Popover-root-show") +
              " Popover-root"
            }
            style={{ top: position.top, left: position.left }}
          >
            {props.children}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>,
    document.body
  );
};

export default Popover;
