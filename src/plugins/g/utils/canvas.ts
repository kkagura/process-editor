import { DirFlag, Point, Rect } from "../interface";
import { LineType, Points } from "../model/LinkElement";

export function paintRoundRect(
  rect: Rect,
  ctx: CanvasRenderingContext2D,
  r: number
) {
  const { x, y, width: w, height: h } = rect;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + r, y);
}

export function paintLine(
  ctx: CanvasRenderingContext2D,
  points: Points,
  lineType: LineType
) {
  ctx.beginPath();
  if (lineType === "smooth") {
  } else {
    points.forEach(({ x, y }, i) => {
      if (i > 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.moveTo(x, y);
      }
    });
  }
}

type StraightDir = "w" | "e" | "n" | "s";

export function calPolylinePoints(
  from: Point,
  to: Point,
  fromDir: DirFlag,
  toDir: DirFlag,
  fromRect: Rect,
  toRect: Rect
): Points {
  if (!toRect) {
    toRect = {
      ...to,
      width: 0,
      height: 0,
    };
  }
  const res: Points = [];
  const oppositeDirs = {
    w: "e",
    n: "s",
    e: "w",
    s: "n",
  };
  if (!toDir) {
    toDir = oppositeDirs[fromDir];
  }
  const isSameDir = (dir1, dir2) => dir1 === dir2;
  const isOppoDir = (dir1, dir2) => dir1 === oppositeDirs[dir2];
  const step = 20;
  if (fromDir === "w" || fromDir === "e") {
    if (isOppoDir(fromDir, toDir)) {
      if (from.y !== to.y) {
        res.push(
          { x: (to.x + from.x) / 2, y: from.y },
          { x: (to.x + from.x) / 2, y: to.y }
        );
      }
    } else if (isSameDir(fromDir, toDir)) {
      if (from.y !== to.y) {
        const x =
          fromDir === "w"
            ? Math.min(from.x, to.x) - step
            : Math.max(from.x, to.x) + step;
        res.push(
          {
            x,
            y: from.y,
          },
          {
            x,
            y: to.y,
          }
        );
      }
    } else {
      res.push({ x: to.x, y: from.y });
    }
  } else {
    if (isOppoDir(fromDir, toDir)) {
      if (from.x !== to.x) {
        res.push(
          { y: (to.y + from.y) / 2, x: from.x },
          { y: (to.y + from.y) / 2, x: to.x }
        );
      }
    } else if (isSameDir(fromDir, toDir)) {
      if (from.x !== to.x) {
        const y =
          fromDir === "n"
            ? Math.min(from.y, to.y) - step
            : Math.max(from.y, to.y) + step;
        res.push(
          {
            x: from.x,
            y,
          },
          {
            x: to.x,
            y,
          }
        );
      }
    } else {
      res.push({ x: from.x, y: to.y });
    }
    // if (toDir === "w" || toDir === "e") {
    //   res.push({ x: from.x, y: to.y });
    // } else {
    //   if (from.x !== to.x) {
    //     res.push(
    //       { y: (to.y + from.y) / 2, x: from.x },
    //       { y: (to.y + from.y) / 2, x: to.x }
    //     );
    //   }
    // }
  }
  // const dirs: Array<StraightDir> = ["w", "e", "n", "s"];
  // const oppositeDirs: Record<StraightDir, StraightDir> = {
  //   w: "e",
  //   n: "s",
  //   e: "w",
  //   s: "n",
  // };

  // const advance = (from: Point, dir: StraightDir): Point => {
  //   const isValid = isValidLine(from, to, fromRect);
  //   if (isValid) {
  //     if (dir === "w" || dir === "e") {
  //       return { x: to.x, y: from.y };
  //     } else {
  //       return { x: from.x, y: to.y };
  //     }
  //   }
  // };
  // const isValidLine = (from: Point, to: Point, rect: Rect): boolean => {
  //   return !(
  //     (from.x < rect.x &&
  //       to.x > rect.x &&
  //       from.y > rect.y &&
  //       from.y < rect.y + rect.height) ||
  //     (from.y < rect.y &&
  //       to.y > rect.y &&
  //       from.x > rect.x &&
  //       from.x < rect.x + rect.width)
  //   );
  // };
  // const isValidPoint = (point: Point, rect: Rect): boolean => {
  //   const { x, y, width, height } = rect;
  //   return !(
  //     point.x >= x &&
  //     point.y >= y &&
  //     point.x <= x + width &&
  //     point.y <= y + height
  //   );
  // };
  // const step = 20;
  // let prev: Point = { ...from },
  //   prevDir = oppositeDirs[fromDir as StraightDir];
  // let end = false;
  // while (!end) {
  //   const point = advance(prev, prevDir);
  //   res.push(point);
  //   end = true;
  // }
  return res;
}

let canvas = document.createElement("canvas"),
  ctx = canvas.getContext("2d");
let textSizeCache: Record<string, { width: number; height: number }> = {};
export function getTextSize(font: string, text: string) {
  canvas.height = 1;
  canvas.width = 1;
  let size = textSizeCache[`${font}-${text}`];
  if (size) {
    return size;
  }
  ctx.font = font;
  const { width } = ctx.measureText(text);
  const height = ctx.measureText("e").width * 2 + 4;
  return (textSizeCache[`${font}-${text}`] = {
    width,
    height,
  });
}

export function fillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  fillStyle: string,
  rect: Rect
) {
  const rows: Array<Array<string>> = [];
  let row: Array<string> = [],
    lineWidth = 0;
  for (let i = 0; i < text.length; i++) {
    const { width } = getTextSize(font, text[i]);
    lineWidth += width;
    if (lineWidth >= rect.width) {
      rows.push(row);
      row = [];
      lineWidth = 0;
    } else {
      row.push(text[i]);
    }
  }
  if (row.length > 0) {
    rows.push(row);
  }
  const { height } = getTextSize(font, text);
  const textHeight = height * rows.length;
  let startY = rect.y + rect.height / 2 - textHeight / 2 + height / 2;
  ctx.beginPath();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  for (let i = 0; i < rows.length; i++) {
    ctx.fillText(rows[i].join(""), rect.x + rect.width / 2, startY);
    startY += height;
  }
}

export function pixelTest(
  painter: (ctx: CanvasRenderingContext2D) => void,
  point: Point,
  rect: Rect
) {
  const { x, y, width, height } = rect;
  canvas.width = width;
  canvas.height = height;
  ctx.save();
  ctx.translate(-x, -y);
  painter(ctx);
  ctx.restore();
  const { data } = ctx.getImageData(point.x - x, point.y - y, 1, 1);
  return data[3] !== 0;
  // if (data[3] !== 0) {
  //   ctx.beginPath();
  //   ctx.arc(point.x - x, point.y - y, 5, 0, 2 * Math.PI);
  //   ctx.fillStyle = "red";
  //   ctx.fill();
  //   return true;
  // }
  // return false;
}
