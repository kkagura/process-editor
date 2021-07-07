import { Rect } from "../interface";
import { setStyle } from "./utils";

export function createEditor(
  text: string,
  onBlur: (text) => void,
  style: Record<string, string | number> = {}
) {
  const div = document.createElement("div");
  div.contentEditable = "true";
  div.innerText = text;
  setStyle(div, {
    border: "3px solid #f5ddad",
    borderRadius: "4px",
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#fff",
    fontSize: "40px",
    overflow: "hidden",
    transformOrigin: "0 0",
    boxSizing: "content-box",
    ...style,
  });
  document.body.appendChild(div);
  const range = document.createRange();
  range.selectNodeContents(div);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  div.addEventListener("blur", () => {
    const text = div.innerText;
    onBlur(text);
    document.body.removeChild(div);
  });
}
