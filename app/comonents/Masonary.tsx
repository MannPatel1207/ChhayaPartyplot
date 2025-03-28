'use client';
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTransition, animated as a } from "@react-spring/web";

interface MasonryItem {
  id: string | number;
  height: number;
  image: string;
}

interface GridItem extends MasonryItem {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MasonryProps {
  data: MasonryItem[];
}

function Masonry({ data }: MasonryProps) {
  const [columns, setColumns] = useState<number>(2);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1500) setColumns(5);
      else if (window.innerWidth >= 1000) setColumns(4);
      else if (window.innerWidth >= 600) setColumns(3);
      else setColumns(1);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) setWidth(ref.current.offsetWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [heights, gridItems] = useMemo<[number[], GridItem[]]>(() => {
    const heights = new Array(columns).fill(0);
    const gridItems = data.map((child) => {
      const column = heights.indexOf(Math.min(...heights));
      const x = (width / columns) * column;
      const y = (heights[column] += child.height / 2) - child.height / 2;
      return {
        ...child,
        x,
        y,
        width: width / columns,
        height: child.height / 2,
      };
    });
    return [heights, gridItems];
  }, [columns, data, width]);

  const transitions = useTransition(gridItems, {
    keys: (item) => item.id,
    from: ({ x, y, width, height }) => ({
      x,
      y,
      width,
      height,
      opacity: 0,
    }),
    enter: ({ x, y, width, height }) => ({
      x,
      y,
      width,
      height,
      opacity: 1,
    }),
    update: ({ x, y, width, height }) => ({ x, y, width, height }),
    leave: { height: 0, opacity: 0 },
    config: { mass: 5, tension: 500, friction: 100 },
    trail: 25,
  });

  return (
    <div
      ref={ref}
      className="relative w-full h-full"
      style={{ height: Math.max(...heights) }}
    >
      {transitions((style, item) => (
        <a.div
          key={item.id}
          style={{
            transform: style.x.to((x) => `translate3d(${x}px, ${style.y.get()}px, 0)`),
            width: style.width,
            height: style.height,
            opacity: style.opacity,
          }}
          className="absolute p-[15px] [will-change:transform,width,height,opacity]"
        >
          <div
            className="relative w-full h-full overflow-hidden uppercase text-[10px] leading-[10px] rounded-[4px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] transition duration-300 ease hover:scale-110"
            style={{
              backgroundColor: "#ffffff",
              backgroundImage: `url(${item.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </a.div>
      ))}
    </div>
  );
}

export default Masonry;